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
// PASSWORD RULES
// ============================================================

const passwordRules =
    body("password")
        .isString()
        .withMessage(
            "Password must be a string"
        )
        .isLength({
            min: 8,
            max: 128,
        })
        .withMessage(
            "Password must be between 8 and 128 characters"
        )
        .matches(
            /^(?=.*[A-Za-z])(?=.*\d).+$/
        )
        .withMessage(
            "Password must contain letters and numbers"
        );

// ============================================================
// REGISTER
// ============================================================

const registerValidation = [
    body("fullName")
        .isString()
        .withMessage(
            "fullName must be a string"
        )
        .trim()
        .isLength({
            min: 2,
            max: 100,
        })
        .withMessage(
            "fullName must be between 2 and 100 characters"
        ),

    body("email")
        .isString()
        .withMessage(
            "Email must be a string"
        )
        .trim()
        .isLength({
            max: 254,
        })
        .withMessage(
            "Email is too long"
        )
        .isEmail()
        .withMessage(
            "Invalid email address"
        )
        .normalizeEmail({
            all_lowercase: true,
        }),

    passwordRules,

    body("confirmPassword")
        .notEmpty()
        .withMessage(
            "confirmPassword is required"
        )
        .custom(
            (
                value,
                { req }
            ) =>
                value ===
                req.body.password
        )
        .withMessage(
            "confirmPassword must match password"
        ),

    body("phone")
        .optional({
            checkFalsy: true,
        })
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
// LOGIN
// ============================================================

const loginValidation = [
    body("email")
        .isString()
        .withMessage(
            "Email must be a string"
        )
        .trim()
        .isLength({
            max: 254,
        })
        .withMessage(
            "Email is too long"
        )
        .isEmail()
        .withMessage(
            "Invalid email address"
        )
        .normalizeEmail({
            all_lowercase: true,
        }),

    body("password")
        .isString()
        .withMessage(
            "Password must be a string"
        )
        .notEmpty()
        .withMessage(
            "Password is required"
        )
        .isLength({
            max: 128,
        })
        .withMessage(
            "Password is too long"
        ),

    validate,
];

// ============================================================
// CHANGE PASSWORD
// ============================================================

const changePasswordValidation = [
    body("currentPassword")
        .isString()
        .withMessage(
            "currentPassword must be a string"
        )
        .notEmpty()
        .withMessage(
            "currentPassword is required"
        )
        .isLength({
            max: 128,
        })
        .withMessage(
            "currentPassword is too long"
        ),

    body("newPassword")
        .isString()
        .withMessage(
            "newPassword must be a string"
        )
        .isLength({
            min: 8,
            max: 128,
        })
        .withMessage(
            "newPassword must be between 8 and 128 characters"
        )
        .matches(
            /^(?=.*[A-Za-z])(?=.*\d).+$/
        )
        .withMessage(
            "newPassword must contain letters and numbers"
        )
        .custom(
            (
                value,
                { req }
            ) =>
                value !==
                req.body.currentPassword
        )
        .withMessage(
            "newPassword must differ from currentPassword"
        ),

    body("confirmNewPassword")
        .notEmpty()
        .withMessage(
            "confirmNewPassword is required"
        )
        .custom(
            (
                value,
                { req }
            ) =>
                value ===
                req.body.newPassword
        )
        .withMessage(
            "confirmNewPassword must match newPassword"
        ),

    validate,
];

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    registerValidation,
    loginValidation,
    changePasswordValidation,
};