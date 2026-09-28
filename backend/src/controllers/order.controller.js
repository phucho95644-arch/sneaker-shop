const asyncHandler = require('../utils/asyncHandler');
const orderService = require('../services/order.service');
const orderModel = require('../models/order.model');

const checkout = asyncHandler(async (req, res) => {
    const { addressId, paymentMethod, couponCode, note } = req.body;
    const result = await orderService.checkout({ userId: req.user.id, addressId, paymentMethod, couponCode, note });

    res.status(201).json({ success: true, message: 'Đặt hàng thành công', data: { order: result } });
});

const getOrders = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status || null;

    const result = await orderModel.findOrdersByUser(req.user.id, page, limit, status);
    res.json({ success: true, data: result });
});

const getOrderDetail = asyncHandler(async (req, res) => {
    const orderId = Number(req.params.id);
    const order = await orderModel.findOrderByIdForUser(orderId, req.user.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const items = await orderModel.getOrderItems(orderId);
    const payments = require('../models/payment.model').findByOrderId(orderId);
    res.json({ success: true, data: { order, items, payments } });
});

const cancelOrder = asyncHandler(async (req, res) => {
    const orderId = Number(req.params.id);
    const reason = req.body.reason;
    // implement cancellation in service later; for now check ownership and status
    // We'll perform a simple transaction: lock order, check status pending, restore stock, mark cancelled
    const orderServiceModule = require('../services/order.service');
    await orderServiceModule.cancelOrder({ userId: req.user.id, orderId, reason });

    res.json({ success: true, message: 'Order cancelled' });
});

module.exports = {
    checkout,
    getOrders,
    getOrderDetail,
    cancelOrder
};
