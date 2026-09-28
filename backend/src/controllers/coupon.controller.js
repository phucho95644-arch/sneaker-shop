const asyncHandler = require('../utils/asyncHandler');
const couponService = require('../services/coupon.service');

const validateCoupon = asyncHandler(async (req, res) => {
    const { code } = req.body;
    
    if (!code) {
        return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const data = await couponService.validateForCurrentCart(req.user.id, code);

    res.status(200).json({ success: true, data });
});

const adminGetCoupons = asyncHandler(async (req, res) => {
    const filters = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        status: req.query.status,
        discountType: req.query.discountType,
        search: req.query.search,
        activeNow: req.query.activeNow,
        sort: req.query.sort || 'newest'
    };

    const data = await couponService.adminGetCoupons(filters);

    res.status(200).json({ success: true, data });
});

const adminGetCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const data = await couponService.adminGetCoupon(id);

    res.status(200).json({ success: true, data });
});

const adminCreateCoupon = asyncHandler(async (req, res) => {
    const { code, description, discountType, discountValue, minimumOrder, maximumDiscount, startDate, endDate, usageLimit, status } = req.body;

    const couponId = await couponService.adminCreateCoupon({
        code,
        description,
        discountType,
        discountValue,
        minimumOrder,
        maximumDiscount,
        startDate,
        endDate,
        usageLimit,
        status
    });

    res.status(201).json({ success: true, message: 'Coupon created', data: { id: couponId } });
});

const adminUpdateCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { description, discountType, discountValue, minimumOrder, maximumDiscount, startDate, endDate, usageLimit } = req.body;

    await couponService.adminUpdateCoupon(id, {
        description,
        discountType,
        discountValue,
        minimumOrder,
        maximumDiscount,
        startDate,
        endDate,
        usageLimit
    });

    res.status(200).json({ success: true, message: 'Coupon updated' });
});

const adminUpdateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    await couponService.adminUpdateStatus(id, status);

    res.status(200).json({ success: true, message: 'Coupon status updated' });
});

const adminDeleteCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await couponService.adminDeleteCoupon(id);

    res.status(200).json({ success: true, message: 'Coupon deleted or deactivated' });
});

const adminGetStatistics = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const stats = await couponService.getStatistics(id);

    res.status(200).json({ success: true, data: stats });
});

module.exports = {
    validateCoupon,
    adminGetCoupons,
    adminGetCoupon,
    adminCreateCoupon,
    adminUpdateCoupon,
    adminUpdateStatus,
    adminDeleteCoupon,
    adminGetStatistics
};
