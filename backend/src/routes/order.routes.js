const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const orderController = require('../controllers/order.controller');
const { checkoutValidation, paginationValidation, orderIdParam, cancelValidation } = require('../validators/order.validator');

router.post('/checkout', authMiddleware, checkoutValidation, orderController.checkout);
router.get('/', authMiddleware, paginationValidation, orderController.getOrders);
router.get('/:id', authMiddleware, orderIdParam, orderController.getOrderDetail);
router.patch('/:id/cancel', authMiddleware, cancelValidation, orderController.cancelOrder);

module.exports = router;
