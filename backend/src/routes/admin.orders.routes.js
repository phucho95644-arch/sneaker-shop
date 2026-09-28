const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const orderModel = require('../models/order.model');
const paymentModel = require('../models/payment.model');
const orderService = require('../services/order.service');
const { adminStatusValidation, adminPaymentStatusValidation } = require('../validators/order.validator');

router.use(authMiddleware, adminMiddleware);

router.get('/', async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const status = req.query.status || null;
        const params = [];
        let where = 'WHERE 1=1';
        if (status) { where += ' AND o.order_status = ?'; params.push(status); }
        if (req.query.search) { where += " AND (o.order_code LIKE ? OR o.receiver_name LIKE ? OR o.receiver_phone LIKE ?)"; params.push('%'+req.query.search+'%','%'+req.query.search+'%','%'+req.query.search+'%'); }

        const q = `SELECT SQL_CALC_FOUND_ROWS o.id, o.order_code, o.total_amount, o.payment_method, o.payment_status, o.order_status, o.created_at,
                   (SELECT IFNULL(SUM(quantity),0) FROM order_items oi WHERE oi.order_id = o.id) AS totalItems
                   FROM orders o ${where} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        const [rows] = await require('../config/db').pool.query(q, params);
        const [countRows] = await require('../config/db').pool.query('SELECT FOUND_ROWS() as total');
        res.json({ success: true, data: { items: rows, total: countRows[0].total } });
    } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const order = await orderModel.findOrderByIdForAdmin(id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        const items = await orderModel.getOrderItems(id);
        const payments = await paymentModel.findByOrderId(id);
        res.json({ success: true, data: { order, items, payments } });
    } catch (err) { next(err); }
});

router.patch('/:id/status', adminStatusValidation, async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const status = req.body.status;
        // basic transition enforcement
        const transitions = {
            pending: ['confirmed','cancelled'],
            confirmed: ['processing','cancelled'],
            processing: ['shipping'],
            shipping: ['delivered'],
            delivered: [],
            cancelled: []
        };
        const order = await orderModel.findOrderByIdForAdmin(id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        const allowed = transitions[order.order_status] || [];
        if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status transition' });

        // if transitioning to cancelled, restore stock
        if (status === 'cancelled') {
            await orderService.adminCancelOrder({ orderId: id });
            return res.json({ success: true, message: 'Order cancelled' });
        }

        await orderModel.updateOrderStatus(id, status);

        // delivered + cod => mark payment paid
        if (status === 'delivered' && order.payment_method === 'cod') {
            await orderModel.updatePaymentStatus(id, 'paid');
            const payments = await paymentModel.findByOrderId(id);
            if (payments && payments[0]) {
                await paymentModel.updatePaymentStatus(payments[0].id, 'success', 'COD_DELIVERED', new Date());
            }
        }

        res.json({ success: true, message: 'Order status updated' });
    } catch (err) { next(err); }
});

router.patch('/:id/payment-status', adminPaymentStatusValidation, async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const paymentStatus = req.body.paymentStatus;
        const transactionCode = req.body.transactionCode || null;
        const payments = await paymentModel.findByOrderId(id);
        if (!payments || payments.length === 0) return res.status(404).json({ success: false, message: 'Payment not found' });
        const payment = payments[0];

        if (paymentStatus === 'paid') {
            await paymentModel.updatePaymentStatus(payment.id, 'success', transactionCode, new Date());
            await orderModel.updatePaymentStatus(id, 'paid');
        } else if (paymentStatus === 'failed') {
            await paymentModel.updatePaymentStatus(payment.id, 'failed', transactionCode, null);
            await orderModel.updatePaymentStatus(id, 'unpaid');
        } else if (paymentStatus === 'refunded') {
            await paymentModel.updatePaymentStatus(payment.id, 'refunded', transactionCode, null);
            await orderModel.updatePaymentStatus(id, 'unpaid');
        } else if (paymentStatus === 'unpaid') {
            await paymentModel.updatePaymentStatus(payment.id, 'pending', transactionCode, null);
            await orderModel.updatePaymentStatus(id, 'unpaid');
        }

        res.json({ success: true, message: 'Payment status updated' });
    } catch (err) { next(err); }
});

module.exports = router;
