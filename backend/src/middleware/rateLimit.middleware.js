const {
    rateLimit,
} = require(
    "express-rate-limit"
);

// ============================================================
// RESPONSE HANDLER
// ============================================================

const createHandler =
    (message) =>
    (req, res) => {
        return res
            .status(429)
            .json({
                success: false,
                message,
                errors: null,
            });
    };

// ============================================================
// GENERAL API RATE LIMIT
//
// 1000 request / 15 phút / IP
// ============================================================

const apiLimiter =
    rateLimit({
        windowMs:
            15 * 60 * 1000,

        limit:
            Number(
                process.env
                    .API_RATE_LIMIT
            ) || 1000,

        standardHeaders:
            "draft-8",

        legacyHeaders:
            false,

        handler:
            createHandler(
                "Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau."
            ),
    });

// ============================================================
// LOGIN RATE LIMIT
//
// Chống brute-force.
// Chỉ giữ lại request đăng nhập thất bại.
// ============================================================

const loginLimiter =
    rateLimit({
        windowMs:
            15 * 60 * 1000,

        limit:
            Number(
                process.env
                    .LOGIN_RATE_LIMIT
            ) || 10,

        standardHeaders:
            "draft-8",

        legacyHeaders:
            false,

        skipSuccessfulRequests:
            true,

        handler:
            createHandler(
                "Có quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau."
            ),
    });

// ============================================================
// REGISTER RATE LIMIT
//
// Hạn chế spam tạo tài khoản.
// ============================================================

const registerLimiter =
    rateLimit({
        windowMs:
            60 * 60 * 1000,

        limit:
            Number(
                process.env
                    .REGISTER_RATE_LIMIT
            ) || 20,

        standardHeaders:
            "draft-8",

        legacyHeaders:
            false,

        handler:
            createHandler(
                "Có quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau."
            ),
    });

module.exports = {
    apiLimiter,
    loginLimiter,
    registerLimiter,
};