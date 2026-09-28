const express = require("express");

const router =
    express.Router();

const couponController =
    require("../controllers/coupon.controller");

const authMiddleware =
    require("../middleware/auth.middleware");

const adminMiddleware =
    require("../middleware/admin.middleware");

const {
    validateCouponCreate,
    validateCouponUpdate,
    validateCouponStatus,
} = require(
    "../validators/coupon.validator"
);

// ============================================================
// TẤT CẢ ROUTE TRONG FILE NÀY:
// /api/admin/coupons
// ============================================================

router.use(
    authMiddleware,
    adminMiddleware
);

// ============================================================
// GET ALL COUPONS
// GET /api/admin/coupons
// ============================================================

router.get(
    "/",
    couponController.adminGetCoupons
);

// ============================================================
// CREATE COUPON
// POST /api/admin/coupons
// ============================================================

router.post(
    "/",
    validateCouponCreate,
    couponController.adminCreateCoupon
);

// ============================================================
// GET COUPON DETAIL
// GET /api/admin/coupons/:id
// ============================================================

router.get(
    "/:id",
    couponController.adminGetCoupon
);

// ============================================================
// UPDATE COUPON
// PUT /api/admin/coupons/:id
// ============================================================

router.put(
    "/:id",
    validateCouponUpdate,
    couponController.adminUpdateCoupon
);

// ============================================================
// UPDATE STATUS
// PATCH /api/admin/coupons/:id/status
// ============================================================

router.patch(
    "/:id/status",
    validateCouponStatus,
    couponController.adminUpdateStatus
);

// ============================================================
// DELETE COUPON
// DELETE /api/admin/coupons/:id
// ============================================================

router.delete(
    "/:id",
    couponController.adminDeleteCoupon
);

// ============================================================
// COUPON STATISTICS
// GET /api/admin/coupons/:id/statistics
// ============================================================

router.get(
    "/:id/statistics",
    couponController.adminGetStatistics
);

module.exports = router;