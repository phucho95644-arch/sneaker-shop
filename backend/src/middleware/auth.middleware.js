const jwt = require(
    "jsonwebtoken"
);

const ApiError =
    require(
        "../utils/ApiError"
    );

const {
    findById,
} = require(
    "../models/user.model"
);

// ============================================================
// AUTH MIDDLEWARE
// ============================================================

module.exports =
    async (
        req,
        res,
        next
    ) => {
        try {
            // =================================================
            // AUTHORIZATION HEADER
            // =================================================

            const authHeader =
                req.headers.authorization;

            if (
                typeof authHeader !==
                "string"
            ) {
                return next(
                    new ApiError(
                        401,
                        "Authentication required"
                    )
                );
            }

            // Chỉ chấp nhận đúng:
            // Authorization: Bearer <token>
            const match =
                authHeader.match(
                    /^Bearer\s+(.+)$/i
                );

            if (
                !match ||
                !match[1]
            ) {
                return next(
                    new ApiError(
                        401,
                        "Authentication required"
                    )
                );
            }

            const token =
                match[1].trim();

            if (!token) {
                return next(
                    new ApiError(
                        401,
                        "Authentication required"
                    )
                );
            }

            // =================================================
            // VERIFY JWT
            // =================================================

            let payload;

            try {
                payload =
                    jwt.verify(
                        token,
                        process.env.JWT_SECRET,
                        {
                            algorithms: [
                                "HS256",
                            ],
                        }
                    );
            } catch (error) {
                if (
                    error.name ===
                    "TokenExpiredError"
                ) {
                    return next(
                        new ApiError(
                            401,
                            "Token expired"
                        )
                    );
                }

                if (
                    error.name ===
                        "JsonWebTokenError" ||
                    error.name ===
                        "NotBeforeError"
                ) {
                    return next(
                        new ApiError(
                            401,
                            "Invalid token"
                        )
                    );
                }

                throw error;
            }

            // =================================================
            // PAYLOAD VALIDATION
            // =================================================

            const userId =
                Number(
                    payload?.id
                );

            if (
                !Number.isInteger(
                    userId
                ) ||
                userId <= 0
            ) {
                return next(
                    new ApiError(
                        401,
                        "Invalid token"
                    )
                );
            }

            // =================================================
            // LOAD CURRENT USER FROM DATABASE
            //
            // Quan trọng:
            // Không tin role/status từ JWT.
            // =================================================

            const user =
                await findById(
                    userId,
                    {
                        withPassword:
                            false,
                    }
                );

            if (!user) {
                return next(
                    new ApiError(
                        401,
                        "Invalid token"
                    )
                );
            }

            // =================================================
            // ACCOUNT STATUS
            // =================================================

            if (
                user.status !==
                "active"
            ) {
                return next(
                    new ApiError(
                        403,
                        "Account is not active"
                    )
                );
            }

            // =================================================
            // ATTACH CURRENT USER
            // =================================================

            req.user =
                user;

            return next();
        } catch (error) {
            return next(
                error
            );
        }
    };