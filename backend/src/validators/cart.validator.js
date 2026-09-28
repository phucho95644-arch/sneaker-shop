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

// ============================================================
// ADD ITEM
// ============================================================

const addItemValidation = [
    body("productVariantId")
        .isInt({
            min: 1,
        })
        .withMessage(
            "productVariantId must be a positive integer"
        )
        .toInt(),

    body("quantity")
        .isInt({
            min: 1,
            max: 1000,
        })
        .withMessage(
            "quantity must be an integer between 1 and 1000"
        )
        .toInt(),

    validate,
];

// ============================================================
// UPDATE ITEM
// ============================================================

const updateItemValidation = [
    param("id")
        .isInt({
            min: 1,
        })
        .withMessage(
            "id must be a positive integer"
        )
        .toInt(),

    body("quantity")
        .isInt({
            min: 1,
            max: 1000,
        })
        .withMessage(
            "quantity must be an integer between 1 and 1000"
        )
        .toInt(),

    validate,
];

// ============================================================
// ITEM ID
// ============================================================

const itemIdParam = [
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
// PAGINATION
// ============================================================

const pagination = [
    query("page")
        .optional()
        .isInt({
            min: 1,
        })
        .withMessage(
            "page must be a positive integer"
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

    validate,
];

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    addItemValidation,
    updateItemValidation,
    itemIdParam,
    pagination,
};