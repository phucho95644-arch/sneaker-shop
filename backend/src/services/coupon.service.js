const { pool } = require('../config/db');
const couponModel = require('../models/coupon.model');
const cartModel = require('../models/cart.model');
const ApiError = require('../utils/ApiError');

const toCents = (value) => {
    const n = typeof value === 'string' ? parseFloat(value) : Number(value || 0);
    return Math.round(n * 100);
};

const centsToDecimal = (cents) => (cents / 100).toFixed(2);

// Validate coupon for current user's cart
const validateForCurrentCart = async (userId, code) => {
    const coupon = await couponModel.findByCode(code);
    if (!coupon) {
        throw new ApiError(400, 'Coupon not found');
    }

    if (coupon.status !== 'active') {
        throw new ApiError(400, 'Coupon is not active');
    }

    // Check dates
    const now = new Date();
    if (coupon.start_date && new Date(coupon.start_date) > now) {
        throw new ApiError(400, 'Coupon is not yet available');
    }
    if (coupon.end_date && new Date(coupon.end_date) < now) {
        throw new ApiError(400, 'Coupon has expired');
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        throw new ApiError(400, 'Coupon usage limit reached');
    }

    // Get user's cart and calculate subtotal
    const cart = await cartModel.findCartByUserId(userId);
    if (!cart) {
        throw new ApiError(400, 'Cart not found');
    }

    const cartItems = await cartModel.getCartItems(cart.id);
    if (!cartItems || cartItems.length === 0) {
        throw new ApiError(400, 'Cart is empty');
    }

    // Calculate subtotal from cart items (server-side)
    let subtotalCents = 0;
    for (const item of cartItems) {
        const itemTotal = toCents(item.subtotal || 0);
        subtotalCents += itemTotal;
    }

    // Check minimum order
    const minOrderCents = coupon.minimum_order ? toCents(coupon.minimum_order) : 0;
    if (subtotalCents < minOrderCents) {
        throw new ApiError(400, `Cart must reach minimum ${centsToDecimal(minOrderCents)} for this coupon`);
    }

    // Calculate discount
    let discountCents = 0;
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

    return {
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        discountAmount: Number(centsToDecimal(discountCents)),
        subtotal: Number(centsToDecimal(subtotalCents)),
        estimatedTotal: Number(centsToDecimal(subtotalCents - discountCents))
    };
};

// Admin get all coupons
const adminGetCoupons = async (filters = {}) => {
    const coupons = await couponModel.findAll(filters);
    const totalItems = await couponModel.countAll(filters);
    const { page = 1, limit = 10 } = filters;
    const totalPages = Math.ceil(totalItems / limit);

    return {
        items: coupons,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            totalItems,
            totalPages
        }
    };
};

// Admin get single coupon
const adminGetCoupon = async (id) => {
    const coupon = await couponModel.findById(id);
    if (!coupon) {
        throw new ApiError(404, 'Coupon not found');
    }

    const stats = await couponModel.getStatistics(id);

    return {
        ...coupon,
        statistics: stats
    };
};

// Admin create coupon
const adminCreateCoupon = async (data) => {
    const { code, description, discountType, discountValue, minimumOrder, maximumDiscount, startDate, endDate, usageLimit, status } = data;

    // Validate code format
    const codePattern = /^[A-Z0-9_-]{3,50}$/;
    const normalizedCode = code.toUpperCase().trim();
    if (!codePattern.test(normalizedCode)) {
        throw new ApiError(400, 'Code must be 3-50 characters (A-Z, 0-9, -, _)');
    }

    // Check duplicate code
    const exists = await couponModel.checkCodeExists(normalizedCode);
    if (exists) {
        throw new ApiError(400, 'Coupon code already exists');
    }

    // Validate discount type and value
    if (!['percent', 'fixed'].includes(discountType)) {
        throw new ApiError(400, 'Discount type must be percent or fixed');
    }

    if (discountValue <= 0) {
        throw new ApiError(400, 'Discount value must be positive');
    }

    if (discountType === 'percent' && discountValue > 100) {
        throw new ApiError(400, 'Percent discount cannot exceed 100');
    }

    // Validate dates
    if (startDate && endDate) {
        if (new Date(endDate) <= new Date(startDate)) {
            throw new ApiError(400, 'End date must be after start date');
        }
    }

    // Validate usage limit
    if (usageLimit !== null && usageLimit !== undefined) {
        if (usageLimit <= 0) {
            throw new ApiError(400, 'Usage limit must be positive');
        }
    }

    const couponId = await couponModel.create({
        code: normalizedCode,
        description: description || '',
        discountType,
        discountValue,
        minimumOrder: minimumOrder || null,
        maximumDiscount: maximumDiscount || null,
        startDate: startDate || null,
        endDate: endDate || null,
        usageLimit: usageLimit || null,
        status: status || 'active'
    });

    return couponId;
};

// Admin update coupon
const adminUpdateCoupon = async (id, data) => {
    const coupon = await couponModel.findById(id);
    if (!coupon) {
        throw new ApiError(404, 'Coupon not found');
    }

    const { description, discountType, discountValue, minimumOrder, maximumDiscount, startDate, endDate, usageLimit } = data;

    // Validate if providing discount type and value
    if (discountType || discountValue !== undefined) {
        const newType = discountType || coupon.discount_type;
        const newValue = discountValue !== undefined ? discountValue : coupon.discount_value;

        if (!['percent', 'fixed'].includes(newType)) {
            throw new ApiError(400, 'Discount type must be percent or fixed');
        }

        if (newValue <= 0) {
            throw new ApiError(400, 'Discount value must be positive');
        }

        if (newType === 'percent' && newValue > 100) {
            throw new ApiError(400, 'Percent discount cannot exceed 100');
        }
    }

    // Validate dates
    const newStart = startDate !== undefined ? startDate : coupon.start_date;
    const newEnd = endDate !== undefined ? endDate : coupon.end_date;
    if (newStart && newEnd && new Date(newEnd) <= new Date(newStart)) {
        throw new ApiError(400, 'End date must be after start date');
    }

    // Note: DO NOT allow updating used_count via API

    await couponModel.update(id, {
        description,
        discountType,
        discountValue,
        minimumOrder,
        maximumDiscount,
        startDate,
        endDate,
        usageLimit
    });
};

// Admin update status
const adminUpdateStatus = async (id, status) => {
    const validStatuses = ['active', 'inactive', 'expired'];
    if (!validStatuses.includes(status)) {
        throw new ApiError(400, 'Invalid status');
    }

    const coupon = await couponModel.findById(id);
    if (!coupon) {
        throw new ApiError(404, 'Coupon not found');
    }

    await couponModel.updateStatus(id, status);
};

// Admin delete coupon
const adminDeleteCoupon = async (id) => {
    const coupon = await couponModel.findById(id);
    if (!coupon) {
        throw new ApiError(404, 'Coupon not found');
    }

    // Check if coupon has been used
    const [usages] = await pool.query('SELECT COUNT(*) as count FROM coupon_usages WHERE coupon_id = ?', [id]);
    const usageCount = usages[0].count;

    if (usageCount > 0) {
        // Don't delete, mark as inactive to preserve history
        await couponModel.updateStatus(id, 'inactive');
    } else {
        // Safe to delete if never used
        await couponModel.deleteById(id);
    }
};

// Admin get statistics
const getStatistics = async (id) => {
    const stats = await couponModel.getStatistics(id);
    return stats;
};

module.exports = {
    validateForCurrentCart,
    adminGetCoupons,
    adminGetCoupon,
    adminCreateCoupon,
    adminUpdateCoupon,
    adminUpdateStatus,
    adminDeleteCoupon,
    getStatistics
};
