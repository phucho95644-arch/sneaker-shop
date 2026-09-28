const {
    body,
    param,
} = require(
    "express-validator"
);

const validate =
    require(
        "../middleware/validate.middleware"
    );

// ============================================================
// CREATE ADDRESS
// ============================================================

const addressCreateValidation = [
    body("receiverName")
        .isString()
        .withMessage(
            "receiverName must be a string"
        )
        .trim()
        .notEmpty()
        .withMessage(
            "receiverName is required"
        )
        .isLength({
            min: 2,
            max: 100,
        })
        .withMessage(
            "receiverName must be between 2 and 100 characters"
        ),

    body("receiverPhone")
        .isString()
        .withMessage(
            "receiverPhone must be a string"
        )
        .trim()
        .notEmpty()
        .withMessage(
            "receiverPhone is required"
        )
        .matches(
            /^[0-9]{10,11}$/
        )
        .withMessage(
            "Invalid receiverPhone"
        ),

    body("province")
        .isString()
        .withMessage(
            "province must be a string"
        )
        .trim()
        .notEmpty()
        .withMessage(
            "province is required"
        )
        .isLength({
            max: 100,
        })
        .withMessage(
            "province must not exceed 100 characters"
        ),

    body("district")
        .isString()
        .withMessage(
            "district must be a string"
        )
        .trim()
        .notEmpty()
        .withMessage(
            "district is required"
        )
        .isLength({
            max: 100,
        })
        .withMessage(
            "district must not exceed 100 characters"
        ),

    body("ward")
        .isString()
        .withMessage(
            "ward must be a string"
        )
        .trim()
        .notEmpty()
        .withMessage(
            "ward is required"
        )
        .isLength({
            max: 100,
        })
        .withMessage(
            "ward must not exceed 100 characters"
        ),

    body("addressDetail")
        .isString()
        .withMessage(
            "addressDetail must be a string"
        )
        .trim()
        .notEmpty()
        .withMessage(
            "addressDetail is required"
        )
        .isLength({
            max: 255,
        })
        .withMessage(
            "addressDetail must not exceed 255 characters"
        ),

    body("isDefault")
        .optional()
        .isBoolean()
        .withMessage(
            "isDefault must be a boolean"
        ),

    validate,
];

// ============================================================
// UPDATE ADDRESS
// ============================================================

const addressUpdateValidation = [
    param("id")
        .isInt({
            min: 1,
        })
        .withMessage(
            "Address id must be a positive integer"
        )
        .toInt(),

    body("receiverName")
        .optional()
        .isString()
        .withMessage(
            "receiverName must be a string"
        )
        .trim()
        .isLength({
            min: 2,
            max: 100,
        })
        .withMessage(
            "receiverName must be between 2 and 100 characters"
        ),

    body("receiverPhone")
        .optional()
        .isString()
        .withMessage(
            "receiverPhone must be a string"
        )
        .trim()
        .matches(
            /^[0-9]{10,11}$/
        )
        .withMessage(
            "Invalid receiverPhone"
        ),

    body("province")
        .optional()
        .isString()
        .withMessage(
            "province must be a string"
        )
        .trim()
        .notEmpty()
        .withMessage(
            "province cannot be empty"
        )
        .isLength({
            max: 100,
        })
        .withMessage(
            "province must not exceed 100 characters"
        ),

    body("district")
        .optional()
        .isString()
        .withMessage(
            "district must be a string"
        )
        .trim()
        .notEmpty()
        .withMessage(
            "district cannot be empty"
        )
        .isLength({
            max: 100,
        })
        .withMessage(
            "district must not exceed 100 characters"
        ),

    body("ward")
        .optional()
        .isString()
        .withMessage(
            "ward must be a string"
        )
        .trim()
        .notEmpty()
        .withMessage(
            "ward cannot be empty"
        )
        .isLength({
            max: 100,
        })
        .withMessage(
            "ward must not exceed 100 characters"
        ),

    body("addressDetail")
        .optional()
        .isString()
        .withMessage(
            "addressDetail must be a string"
        )
        .trim()
        .notEmpty()
        .withMessage(
            "addressDetail cannot be empty"
        )
        .isLength({
            max: 255,
        })
        .withMessage(
            "addressDetail must not exceed 255 characters"
        ),

    body("isDefault")
        .optional()
        .isBoolean()
        .withMessage(
            "isDefault must be a boolean"
        ),

    validate,
];

// ============================================================
// ADDRESS ID
// ============================================================

const addressIdValidation = [
    param("id")
        .isInt({
            min: 1,
        })
        .withMessage(
            "Address id must be a positive integer"
        )
        .toInt(),

    validate,
];

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    addressCreateValidation,
    addressUpdateValidation,
    addressIdValidation,
};