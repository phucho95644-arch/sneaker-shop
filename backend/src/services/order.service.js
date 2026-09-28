const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');
const addressModel = require('../models/address.model');
const cartModel = require('../models/cart.model');
const orderModel = require('../models/order.model');
const paymentModel = require('../models/payment.model');
const couponModel = require('../models/coupon.model');

const toCents = (value) => {
    // Accept number or decimal string
    const n = typeof value === 'string' ? parseFloat(value) : Number(value || 0);
    return Math.round(n * 100);
};

const centsToDecimal = (cents) => (cents / 100).toFixed(2);

const generateOrderCode = async () => {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const prefix = `ORD-${y}${m}${d}`;
    const rand = () => Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${rand()}`;
};

const computeShippingFeeCents = (subtotalCents) => {
    const threshold = 3000000; // VND
    const thresholdCents = threshold * 100;
    const fee = 30000; // VND
    const feeCents = fee * 100;
    return subtotalCents >= thresholdCents ? 0 : feeCents;
};

const checkout = async ({ userId, addressId, paymentMethod, couponCode, note }) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // user address
        const address = await addressModel.findByIdAndUserId(addressId, userId);
        if (!address) {
            throw new ApiError(400, 'Address not found');
        }

        // cart
        const cart = await cartModel.findCartByUserId(userId);
        if (!cart) {
            throw new ApiError(400, 'Cart not found');
        }
        const cartItems = await cartModel.getCartItems(cart.id);
        if (!cartItems || cartItems.length === 0) {
            throw new ApiError(400, 'Cart is empty');
        }

        // lock variants
        const variantIds = cartItems.map((ci) => ci.variant_id);
        const [variants] = await connection.query(
            `SELECT pv.*, p.price AS product_price, p.sale_price AS product_sale_price, p.name AS product_name, p.status AS product_status
             FROM product_variants pv
             JOIN products p ON p.id = pv.product_id
             WHERE pv.id IN (${variantIds.map(() => '?').join(',')})
             FOR UPDATE`,
            variantIds
        );

        const variantMap = new Map();
        for (const v of variants) variantMap.set(v.id, v);

        // validate and compute
        let subtotalCents = 0;
        const itemsToInsert = [];

        for (const ci of cartItems) {
            const variant = variantMap.get(ci.variant_id);
            if (!variant) {
                throw new ApiError(400, `Variant ${ci.variant_id} not found`);
            }

            if (variant.status !== 'active') {
                throw new ApiError(400, `${variant.sku} is not available`);
            }

            if (variant.product_status !== 'active' && variant.product_status !== undefined) {
                throw new ApiError(400, `${variant.product_name} is not available`);
            }

            const available = Number(variant.stock_quantity || 0);
            const qty = Number(ci.quantity);
            if (available < qty) {
                throw new ApiError(400, `${variant.product_name} - ${ci.color_name || ''} - ${ci.size_name || ''} chỉ còn ${available} sản phẩm`);
            }

            const basePrice = variant.product_sale_price !== null ? variant.product_sale_price : variant.product_price;
            const unitPriceCents = toCents(basePrice) + toCents(variant.price_adjustment || 0);
            const subtotalItem = unitPriceCents * qty;
            subtotalCents += subtotalItem;

            const variantName = `${ci.color_name || ''}${ci.color_name && ci.size_name ? ' - ' : ''}${ci.size_name || ''}`.trim();

            itemsToInsert.push({
                productId: variant.product_id,
                variantId: variant.id,
                productName: variant.product_name,
                variantName,
                price: centsToDecimal(unitPriceCents),
                quantity: qty,
                subtotal: centsToDecimal(subtotalItem)
            });
        }

        // coupon
        let coupon = null;
        let discountCents = 0;
        if (couponCode) {
            const code = couponCode.trim().toUpperCase();
            coupon = await couponModel.findByCode(code);
            if (!coupon) throw new ApiError(400, 'Coupon not found');
            if (coupon.status !== 'active') throw new ApiError(400, 'Coupon not active');
            const now = new Date();
            if (coupon.start_date && new Date(coupon.start_date) > now) throw new ApiError(400, 'Coupon not started yet');
            if (coupon.end_date && new Date(coupon.end_date) < now) throw new ApiError(400, 'Coupon expired');
            const minOrder = coupon.minimum_order ? toCents(coupon.minimum_order) : 0;
            if (subtotalCents < minOrder) throw new ApiError(400, 'Cart does not meet minimum order for coupon');
            if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) throw new ApiError(400, 'Coupon usage limit reached');

            if (coupon.discount_type === 'percent') {
                const pct = Number(coupon.discount_value || 0);
                discountCents = Math.floor(subtotalCents * pct / 100);
                if (coupon.maximum_discount) {
                    const maxCents = toCents(coupon.maximum_discount);
                    if (discountCents > maxCents) discountCents = maxCents;
                }
            } else if (coupon.discount_type === 'fixed') {
                discountCents = toCents(coupon.discount_value || 0);
            }

            if (discountCents > subtotalCents) discountCents = subtotalCents;
        }

        const shippingFeeCents = computeShippingFeeCents(subtotalCents);
        const totalCents = subtotalCents - discountCents + shippingFeeCents;

        // generate order code and insert with retry on duplicate
        const shippingAddressSnapshot = `${address.addressDetail || ''}${address.addressDetail ? ', ' : ''}${address.ward || ''}${address.ward ? ', ' : ''}${address.district || ''}${address.district ? ', ' : ''}${address.province || ''}`.trim();

        let order = null;
        let attempts = 0;
        const maxAttempts = 3;
        while (attempts < maxAttempts) {
            attempts += 1;
            const orderCode = await generateOrderCode();
            try {
                order = await orderModel.createOrder(connection, {
                    userId,
                    orderCode,
                    receiverName: address.receiverName,
                    receiverPhone: address.receiverPhone,
                    shippingAddress: shippingAddressSnapshot,
                    subtotal: centsToDecimal(subtotalCents),
                    discountAmount: centsToDecimal(discountCents),
                    shippingFee: centsToDecimal(shippingFeeCents),
                    totalAmount: centsToDecimal(totalCents),
                    couponId: coupon ? coupon.id : null,
                    paymentMethod,
                    paymentStatus: 'unpaid',
                    orderStatus: 'pending',
                    note
                });
                break;
            } catch (err) {
                // Retry on duplicate order_code only
                if (err && err.code === 'ER_DUP_ENTRY' && attempts < maxAttempts) {
                    continue;
                }
                throw err;
            }
        }
        if (!order) throw new ApiError(500, 'Failed to generate unique order code');

        // insert items
        await orderModel.createOrderItems(connection, itemsToInsert, order.id);

        // decrease stock atomically to prevent oversell (ensure affectedRows === 1)
        for (const ci of cartItems) {
            const qty = Number(ci.quantity);
            const variant = variantMap.get(ci.variant_id);
            const [res] = await connection.query('UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?', [qty, variant.id, qty]);
            const affected = res && (res.affectedRows || res.affectedRows === 0 ? res.affectedRows : (res[0] && res[0].affectedRows));
            if (!affected || Number(affected) === 0) {
                throw new ApiError(400, `${variant.product_name} - ${ci.color_name || ''} - ${ci.size_name || ''} insufficient stock`);
            }
        }

        // create payment record
        await paymentModel.createPayment(connection, {
            orderId: order.id,
            paymentMethod,
            transactionCode: null,
            amount: centsToDecimal(totalCents),
            status: 'pending'
        });

        // coupon usage
        if (coupon) {
            await couponModel.createUsage(connection, { couponId: coupon.id, userId, orderId: order.id });
            await couponModel.incrementUsage(coupon.id, connection);
        }

        // clear cart items using transaction connection
        await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);

        await connection.commit();

        return {
            id: order.id,
            orderCode: order.order_code,
            subtotal: Number(order.subtotal),
            discountAmount: Number(order.discount_amount),
            shippingFee: Number(order.shipping_fee),
            totalAmount: Number(order.total_amount),
            paymentMethod: order.payment_method,
            paymentStatus: order.payment_status,
            orderStatus: order.order_status,
            createdAt: order.created_at
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const cancelOrder = async ({ userId, orderId, reason }) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [orderRows] = await connection.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [orderId]);
        const order = orderRows[0];
        if (!order) throw new ApiError(404, 'Order not found');
        if (order.user_id !== userId) throw new ApiError(404, 'Order not found');
        if (order.order_status !== 'pending') throw new ApiError(400, 'Only pending orders can be cancelled');

        const [items] = await connection.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

        // restore stock
        for (const it of items) {
            await connection.query('UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?', [it.quantity, it.product_variant_id]);
        }

        // update order
        await connection.query('UPDATE orders SET order_status = ?, cancelled_reason = ?, updated_at = NOW() WHERE id = ?', ['cancelled', reason || null, orderId]);

        // coupon usage
        if (order.coupon_id) {
            await couponModel.decrementUsage(order.coupon_id, connection);
            await couponModel.deleteUsageForOrder(order.coupon_id, orderId, connection);
        }

        await connection.commit();
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

module.exports = {
    checkout
    , cancelOrder
    , adminCancelOrder: async ({ orderId }) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [orderRows] = await connection.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [orderId]);
            const order = orderRows[0];
            if (!order) throw new ApiError(404, 'Order not found');
            if (order.order_status === 'cancelled') return;

            const [items] = await connection.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
            for (const it of items) {
                await connection.query('UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?', [it.quantity, it.product_variant_id]);
            }

            await connection.query('UPDATE orders SET order_status = ?, cancelled_reason = ?, updated_at = NOW() WHERE id = ?', ['cancelled', 'Cancelled by admin', orderId]);

            if (order.coupon_id) {
                await couponModel.decrementUsage(order.coupon_id, connection);
                await couponModel.deleteUsageForOrder(order.coupon_id, orderId, connection);
            }

            await connection.commit();
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }
};
