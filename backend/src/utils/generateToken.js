const jwt = require(
    "jsonwebtoken"
);

// ============================================================
// GENERATE JWT
//
// JWT chỉ chứa ID người dùng.
//
// Không lưu:
// - password
// - email
// - role
// - status
// - dữ liệu nhạy cảm
//
// role/status luôn lấy lại từ database ở auth.middleware.js.
// ============================================================

const generateToken = (
    user
) => {
    if (
        !process.env.JWT_SECRET
    ) {
        throw new Error(
            "JWT_SECRET is not defined"
        );
    }

    const userId =
        Number(
            user?.id
        );

    if (
        !Number.isInteger(
            userId
        ) ||
        userId <= 0
    ) {
        throw new Error(
            "Cannot generate token for invalid user"
        );
    }

    return jwt.sign(
        {
            id: userId,
        },

        process.env.JWT_SECRET,

        {
            algorithm:
                "HS256",

            expiresIn:
                process.env.JWT_EXPIRES_IN ||
                "7d",
        }
    );
};

module.exports =
    generateToken;