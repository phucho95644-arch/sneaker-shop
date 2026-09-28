const asyncHandler = require('../utils/asyncHandler');
const reviewService = require('../services/review.service');

const getProductReviews = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { page = 1, limit = 10, rating, sort = 'newest' } = req.query;

    const data = await reviewService.getProductReviews(
        productId,
        page,
        limit,
        rating ? parseInt(rating) : null,
        sort
    );

    res.status(200).json({ success: true, data });
});

const createReview = asyncHandler(async (req, res) => {
    const { productId, orderId, rating, comment } = req.body;
    
    const reviewId = await reviewService.createReview(req.user.id, {
        productId,
        orderId,
        rating,
        comment
    });

    res.status(201).json({ success: true, message: 'Review created', data: { id: reviewId } });
});

const updateReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    await reviewService.updateReview(id, req.user.id, { rating, comment });

    res.status(200).json({ success: true, message: 'Review updated' });
});

const deleteReview = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await reviewService.deleteReview(id, req.user.id);

    res.status(200).json({ success: true, message: 'Review deleted' });
});

const getMyReviews = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const data = await reviewService.getMyReviews(req.user.id, page, limit);

    res.status(200).json({ success: true, data });
});

const adminGetReviews = asyncHandler(async (req, res) => {
    const filters = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        status: req.query.status,
        rating: req.query.rating ? parseInt(req.query.rating) : null,
        productId: req.query.productId,
        userId: req.query.userId,
        search: req.query.search
    };

    const data = await reviewService.adminGetReviews(filters);

    res.status(200).json({ success: true, data });
});

const adminGetReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const review = await reviewService.adminGetReviewById(id);
    res.status(200).json({ success: true, data: review });
});

const adminUpdateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    await reviewService.adminUpdateStatus(id, status);

    res.status(200).json({ success: true, message: 'Review status updated' });
});

const adminDeleteReview = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await reviewService.adminDeleteReview(id);

    res.status(200).json({ success: true, message: 'Review deleted' });
});

module.exports = {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview,
    getMyReviews,
    adminGetReviews,
    adminGetReview,
    adminUpdateStatus,
    adminDeleteReview
};
