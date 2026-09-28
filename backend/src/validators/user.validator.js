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
// UPDATE PROFILE
// ============================================================

const profileUpdateValidation = [
    body("fullName")
        .isString()
        .withMessage(
            "fullName must be a string"
        )
        .trim()
        .notEmpty()
        .withMessage(
            "fullName is required"
        )
        .isLength({
            min: 2,
            max: 100,
        })
        .withMessage(
            "fullName must be between 2 and 100 characters"
        ),

    body("phone")
        .optional({
            checkFalsy: true,
        })
        .isString()
        .withMessage(
            "phone must be a string"
        )
        .trim()
        .matches(
            /^[0-9]{10,11}$/
        )
        .withMessage(
            "Invalid phone number"
        ),

    validate,
];

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    profileUpdateValidation,
};