const {
    param,
} = require(
    "express-validator"
);

const validate =
    require(
        "../middleware/validate.middleware"
    );

// ============================================================
// PRODUCT ID PARAM
// ============================================================

const productIdParam = [
    param("productId")
        .isInt({
            min: 1,
        })
        .withMessage(
            "productId must be a positive integer"
        )
        .toInt(),

    validate,
];

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    productIdParam,
};