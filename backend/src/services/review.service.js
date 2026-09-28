const reviewModel = require('../models/review.model');
const ApiError = require('../utils/ApiError');

// Get product reviews (public - approved only)
const getProductReviews = async (productId, page = 1, limit = 10, rating = null, sort = 'newest') => {
    // Validate sort
    const validSorts = ['newest', 'oldest', 'rating_high', 'rating_low'];
    if (!validSorts.includes(sort)) sort = 'newest';

    const [reviews, summary] = await Promise.all([
        reviewModel.findApprovedByProduct(productId, page, limit, rating, sort),
        reviewModel.getRatingSummary(productId)
    ]);

    const totalItems = await reviewModel.countApprovedByProduct(productId, rating);
    const totalPages = Math.ceil(totalItems / limit);

    return {
        items: reviews,
        summary,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            totalItems,
            totalPages
        }
    };
};

// Create review with verification
const createReview = async (userId, data) => {
    const { productId, orderId, rating, comment } = data;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
        throw new ApiError(400, 'Rating must be between 1 and 5');
    }

    // Validate comment
    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
        throw new ApiError(400, 'Comment is required');
    }
    const trimmedComment = comment.trim();
    if (trimmedComment.length > 2000) {
        throw new ApiError(400, 'Comment must not exceed 2000 characters');
    }

    // Verify purchase
    const isPurchased = await reviewModel.verifyPurchasedProduct(userId, productId, orderId);
    if (!isPurchased) {
        throw new ApiError(400, 'You can only review products you have purchased and received');
    }

    // Check duplicate
    const existing = await reviewModel.findExistingReview(userId, productId, orderId);
    if (existing) {
        throw new ApiError(400, 'You have already reviewed this product');
    }

    // Create review
    const reviewId = await reviewModel.create({
        userId,
        productId,
        orderId,
        rating: parseInt(rating),
        comment: trimmedComment
    });

    return reviewId;
};

// Update review
const updateReview = async (reviewId, userId, data) => {
    const review = await reviewModel.findByIdAndUser(reviewId, userId);
    if (!review) {
        throw new ApiError(404, 'Review not found');
    }

    const { rating, comment } = data;

    if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
            throw new ApiError(400, 'Rating must be between 1 and 5');
        }
    }

    if (comment !== undefined) {
        if (comment && comment.trim().length > 2000) {
            throw new ApiError(400, 'Comment must not exceed 2000 characters');
        }
    }

    // Update with status reset to pending
    await reviewModel.update(reviewId, {
        rating: rating !== undefined ? parseInt(rating) : undefined,
        comment: comment !== undefined ? comment.trim() : undefined,
        status: 'pending'  // Reset to pending for re-moderation
    });
};

// Delete review
const deleteReview = async (reviewId, userId) => {
    const review = await reviewModel.findByIdAndUser(reviewId, userId);
    if (!review) {
        throw new ApiError(404, 'Review not found');
    }

    await reviewModel.deleteReview(reviewId);
};

// Get user's reviews
const getMyReviews = async (userId, page = 1, limit = 10) => {
    const reviews = await reviewModel.findByUser(userId, page, limit);
    const totalItems = await reviewModel.countByUser(userId);
    const totalPages = Math.ceil(totalItems / limit);

    return {
        items: reviews,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            totalItems,
            totalPages
        }
    };
};

// Admin get all reviews
const adminGetReviews = async (filters = {}) => {
    const reviews = await reviewModel.adminFindAll(filters);
    const totalItems = await reviewModel.adminCountAll(filters);
    const { page = 1, limit = 10 } = filters;
    const totalPages = Math.ceil(totalItems / limit);

    return {
        items: reviews,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            totalItems,
            totalPages
        }
    };
};

// Admin update status
const adminUpdateStatus = async (reviewId, status) => {
    const validStatuses = ['pending', 'approved', 'hidden'];
    if (!validStatuses.includes(status)) {
        throw new ApiError(400, 'Invalid status');
    }

    const review = await reviewModel.findById(reviewId);
    if (!review) {
        throw new ApiError(404, 'Review not found');
    }

    await reviewModel.updateStatus(reviewId, status);
};

// Admin delete review
const adminDeleteReview = async (reviewId) => {
    const review = await reviewModel.findById(reviewId);
    if (!review) {
        throw new ApiError(404, 'Review not found');
    }

    await reviewModel.deleteReview(reviewId);
};

// Admin get single review
const adminGetReviewById = async (reviewId) => {
    const review = await reviewModel.findById(reviewId);
    if (!review) {
        throw new ApiError(404, 'Review not found');
    }
    return review;
};

module.exports = {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview,
    getMyReviews,
    adminGetReviews,
    adminUpdateStatus,
    adminDeleteReview,
    adminGetReviewById
};
