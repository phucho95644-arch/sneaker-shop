const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const { validateReview, validateReviewUpdate, validateReviewStatus } = require('../validators/review.validator');

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);

// Customer routes (protected)
router.post('/', authMiddleware, validateReview, reviewController.createReview);
router.get('/my', authMiddleware, reviewController.getMyReviews);
router.put('/:id', authMiddleware, validateReviewUpdate, reviewController.updateReview);
router.delete('/:id', authMiddleware, reviewController.deleteReview);

// Admin routes (protected)
router.get('/admin/all', authMiddleware, adminMiddleware, reviewController.adminGetReviews);
router.get('/admin/:id', authMiddleware, adminMiddleware, reviewController.adminGetReview);
router.patch('/admin/:id/status', authMiddleware, adminMiddleware, validateReviewStatus, reviewController.adminUpdateStatus);
router.delete('/admin/:id', authMiddleware, adminMiddleware, reviewController.adminDeleteReview);

module.exports = router;
