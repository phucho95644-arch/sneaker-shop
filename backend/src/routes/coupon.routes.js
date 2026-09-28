const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const { validateCouponCreate, validateCouponUpdate, validateCouponStatus } = require('../validators/coupon.validator');

// Customer route - validate coupon for current cart
router.post('/validate', authMiddleware, couponController.validateCoupon);

// Admin routes
router.get('/admin', authMiddleware, adminMiddleware, couponController.adminGetCoupons);
router.post('/admin', authMiddleware, adminMiddleware, validateCouponCreate, couponController.adminCreateCoupon);
router.get('/admin/:id', authMiddleware, adminMiddleware, couponController.adminGetCoupon);
router.put('/admin/:id', authMiddleware, adminMiddleware, validateCouponUpdate, couponController.adminUpdateCoupon);
router.patch('/admin/:id/status', authMiddleware, adminMiddleware, validateCouponStatus, couponController.adminUpdateStatus);
router.delete('/admin/:id', authMiddleware, adminMiddleware, couponController.adminDeleteCoupon);
router.get('/admin/:id/statistics', authMiddleware, adminMiddleware, couponController.adminGetStatistics);

module.exports = router;
