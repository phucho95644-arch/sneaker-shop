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
// HELPERS
// ============================================================

const validatePercentDiscount = (
    value,
    { req }
) => {
    if (
        req.body.discountType ===
            "percent" &&
        Number(value) > 100
    ) {
        throw new Error(
            "Percent discount cannot exceed 100"
        );
    }

    return true;
};

const validateDateRange = (
    value,
    { req }
) => {
    if (
        !value ||
        !req.body.startDate
    ) {
        return true;
    }

    const startDate =
        new Date(
            req.body.startDate
        );

    const endDate =
        new Date(value);

    if (
        endDate <
        startDate
    ) {
        throw new Error(
            "endDate must be greater than or equal to startDate"
        );
    }

    return true;
};

// ============================================================
// CREATE COUPON
// ============================================================

const validateCouponCreate = [
    body("code")
        .isString()
        .withMessage(
            "Code must be a string"
        )
        .trim()
        .customSanitizer(
            (value) =>
                value.toUpperCase()
        )
        .matches(
            /^[A-Z0-9_-]{3,50}$/
        )
        .withMessage(
            "Code must be 3-50 characters (A-Z, 0-9, -, _)"
        ),

    body("description")
        .optional()
        .isString()
        .withMessage(
            "Description must be a string"
        )
        .trim()
        .isLength({
            max: 1000,
        })
        .withMessage(
            "Description must not exceed 1000 characters"
        ),

    body("discountType")
        .isIn([
            "percent",
            "fixed",
        ])
        .withMessage(
            "Discount type must be percent or fixed"
        ),

    body("discountValue")
        .isFloat({
            min: 0.01,
        })
        .withMessage(
            "Discount value must be positive"
        )
        .custom(
            validatePercentDiscount
        )
        .toFloat(),

    body("minimumOrder")
        .optional()
        .isFloat({
            min: 0,
        })
        .withMessage(
            "Minimum order must be non-negative"
        )
        .toFloat(),

    body("maximumDiscount")
        .optional()
        .isFloat({
            min: 0,
        })
        .withMessage(
            "Maximum discount must be non-negative"
        )
        .toFloat(),

    body("startDate")
        .optional()
        .isISO8601()
        .withMessage(
            "Start date must be valid ISO date"
        ),

    body("endDate")
        .optional()
        .isISO8601()
        .withMessage(
            "End date must be valid ISO date"
        )
        .custom(
            validateDateRange
        ),

    body("usageLimit")
        .optional()
        .isInt({
            min: 1,
        })
        .withMessage(
            "Usage limit must be positive integer"
        )
        .toInt(),

    body("status")
        .optional()
        .isIn([
            "active",
            "inactive",
            "expired",
        ])
        .withMessage(
            "Status must be active, inactive, or expired"
        ),

    validate,
];

// ============================================================
// UPDATE COUPON
// ============================================================

const validateCouponUpdate = [
    body("description")
        .optional()
        .isString()
        .withMessage(
            "Description must be a string"
        )
        .trim()
        .isLength({
            max: 1000,
        })
        .withMessage(
            "Description must not exceed 1000 characters"
        ),

    body("discountType")
        .optional()
        .isIn([
            "percent",
            "fixed",
        ])
        .withMessage(
            "Discount type must be percent or fixed"
        ),

    body("discountValue")
        .optional()
        .isFloat({
            min: 0.01,
        })
        .withMessage(
            "Discount value must be positive"
        )
        .custom(
            validatePercentDiscount
        )
        .toFloat(),

    body("minimumOrder")
        .optional()
        .isFloat({
            min: 0,
        })
        .withMessage(
            "Minimum order must be non-negative"
        )
        .toFloat(),

    body("maximumDiscount")
        .optional()
        .isFloat({
            min: 0,
        })
        .withMessage(
            "Maximum discount must be non-negative"
        )
        .toFloat(),

    body("startDate")
        .optional()
        .isISO8601()
        .withMessage(
            "Start date must be valid ISO date"
        ),

    body("endDate")
        .optional()
        .isISO8601()
        .withMessage(
            "End date must be valid ISO date"
        )
        .custom(
            validateDateRange
        ),

    body("usageLimit")
        .optional()
        .isInt({
            min: 1,
        })
        .withMessage(
            "Usage limit must be positive integer"
        )
        .toInt(),

    validate,
];

// ============================================================
// UPDATE STATUS
// ============================================================

const validateCouponStatus = [
    body("status")
        .isIn([
            "active",
            "inactive",
            "expired",
        ])
        .withMessage(
            "Status must be active, inactive, or expired"
        ),

    validate,
];

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    validateCouponCreate,
    validateCouponUpdate,
    validateCouponStatus,
};