const {
    body,
} = require(
    "express-validator"
);

const validate =
    require(
        "../middleware/validate.middleware"
    );

// ============================================================
// CREATE REVIEW
// ============================================================

const validateReview = [
    body("productId")
        .isInt({
            min: 1,
        })
        .withMessage(
            "Product ID must be a positive integer"
        )
        .toInt(),

    body("orderId")
        .isInt({
            min: 1,
        })
        .withMessage(
            "Order ID must be a positive integer"
        )
        .toInt(),

    body("rating")
        .isInt({
            min: 1,
            max: 5,
        })
        .withMessage(
            "Rating must be between 1 and 5"
        )
        .toInt(),

    body("comment")
        .isString()
        .withMessage(
            "Comment must be a string"
        )
        .trim()
        .isLength({
            min: 1,
            max: 2000,
        })
        .withMessage(
            "Comment must be between 1 and 2000 characters"
        ),

    validate,
];

// ============================================================
// UPDATE REVIEW
// ============================================================

const validateReviewUpdate = [
    body("rating")
        .optional()
        .isInt({
            min: 1,
            max: 5,
        })
        .withMessage(
            "Rating must be between 1 and 5"
        )
        .toInt(),

    body("comment")
        .optional()
        .isString()
        .withMessage(
            "Comment must be a string"
        )
        .trim()
        .isLength({
            min: 1,
            max: 2000,
        })
        .withMessage(
            "Comment must be between 1 and 2000 characters"
        ),

    validate,
];

// ============================================================
// REVIEW STATUS
// ============================================================

const validateReviewStatus = [
    body("status")
        .isIn([
            "pending",
            "approved",
            "hidden",
        ])
        .withMessage(
            "Status must be pending, approved, or hidden"
        ),

    validate,
];

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    validateReview,
    validateReviewUpdate,
    validateReviewStatus,
};