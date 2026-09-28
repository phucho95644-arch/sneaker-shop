const {
    body,
    param,
    query,
} = require(
    "express-validator"
);

const validate =
    require(
        "../middleware/validate.middleware"
    );

const ORDER_STATUSES = [
    "pending",
    "confirmed",
    "processing",
    "shipping",
    "delivered",
    "cancelled",
];

const PAYMENT_STATUSES = [
    "unpaid",
    "paid",
    "failed",
    "refunded",
];

// ============================================================
// CHECKOUT
// ============================================================

const checkoutValidation = [
    body("addressId")
        .isInt({
            min: 1,
        })
        .withMessage(
            "addressId must be a positive integer"
        )
        .toInt(),

    body("paymentMethod")
        .isIn([
            "cod",
            "banking",
        ])
        .withMessage(
            "paymentMethod must be cod or banking"
        ),

    body("couponCode")
        .optional({
            checkFalsy: true,
        })
        .isString()
        .withMessage(
            "couponCode must be a string"
        )
        .trim()
        .isLength({
            min: 1,
            max: 50,
        })
        .withMessage(
            "couponCode must be between 1 and 50 characters"
        ),

    body("note")
        .optional({
            checkFalsy: true,
        })
        .isString()
        .withMessage(
            "note must be a string"
        )
        .trim()
        .isLength({
            max: 500,
        })
        .withMessage(
            "note must not exceed 500 characters"
        ),

    validate,
];

// ============================================================
// ORDER LIST
// ============================================================

const paginationValidation = [
    query("page")
        .optional()
        .isInt({
            min: 1,
        })
        .withMessage(
            "page must be positive"
        )
        .toInt(),

    query("limit")
        .optional()
        .isInt({
            min: 1,
            max: 100,
        })
        .withMessage(
            "limit must be between 1 and 100"
        )
        .toInt(),

    query("status")
        .optional()
        .isIn(
            ORDER_STATUSES
        )
        .withMessage(
            "Invalid order status"
        ),

    validate,
];

// ============================================================
// ORDER ID
// ============================================================

const orderIdParam = [
    param("id")
        .isInt({
            min: 1,
        })
        .withMessage(
            "id must be a positive integer"
        )
        .toInt(),

    validate,
];

// ============================================================
// CANCEL ORDER
// ============================================================

const cancelValidation = [
    param("id")
        .isInt({
            min: 1,
        })
        .withMessage(
            "id must be a positive integer"
        )
        .toInt(),

    body("reason")
        .isString()
        .withMessage(
            "reason must be a string"
        )
        .trim()
        .isLength({
            min: 5,
            max: 500,
        })
        .withMessage(
            "reason must be between 5 and 500 characters"
        ),

    validate,
];

// ============================================================
// ADMIN ORDER STATUS
// ============================================================

const adminStatusValidation = [
    param("id")
        .isInt({
            min: 1,
        })
        .withMessage(
            "id must be positive"
        )
        .toInt(),

    body("status")
        .isIn(
            ORDER_STATUSES
        )
        .withMessage(
            "invalid status"
        ),

    validate,
];

// ============================================================
// ADMIN PAYMENT STATUS
// ============================================================

const adminPaymentStatusValidation = [
    param("id")
        .isInt({
            min: 1,
        })
        .withMessage(
            "id must be positive"
        )
        .toInt(),

    body("paymentStatus")
        .isIn(
            PAYMENT_STATUSES
        )
        .withMessage(
            "invalid paymentStatus"
        ),

    body("transactionCode")
        .optional({
            checkFalsy: true,
        })
        .isString()
        .withMessage(
            "transactionCode must be a string"
        )
        .trim()
        .isLength({
            max: 100,
        })
        .withMessage(
            "transactionCode must not exceed 100 characters"
        ),

    validate,
];

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    checkoutValidation,
    paginationValidation,
    orderIdParam,
    cancelValidation,
    adminStatusValidation,
    adminPaymentStatusValidation,
};