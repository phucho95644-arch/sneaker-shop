const ApiError =
    require(
        "../utils/ApiError"
    );

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

module.exports = (
    err,
    req,
    res,
    next
) => {
    const isProduction =
        process.env.NODE_ENV ===
        "production";

    // ========================================================
    // DEFAULT RESPONSE
    // ========================================================

    let statusCode =
        Number(
            err.statusCode ||
            err.status ||
            500
        );

    if (
        !Number.isInteger(
            statusCode
        ) ||
        statusCode < 400 ||
        statusCode > 599
    ) {
        statusCode = 500;
    }

    let message =
        err.message ||
        "Internal Server Error";

    let errors =
        err.errors ??
        null;

    // ========================================================
    // API ERROR
    // ========================================================

    if (
        err instanceof ApiError
    ) {
        return res
            .status(
                statusCode
            )
            .json({
                success:
                    false,

                message,

                errors,
            });
    }

    // ========================================================
    // EXPRESS / JSON PARSE ERROR
    //
    // Ví dụ:
    // { "email": "abc"
    // thiếu dấu }
    // ========================================================

    if (
        err instanceof SyntaxError &&
        err.status === 400 &&
        "body" in err
    ) {
        return res
            .status(400)
            .json({
                success:
                    false,

                message:
                    "Invalid JSON body",

                errors:
                    null,
            });
    }

    // ========================================================
    // REQUEST BODY TOO LARGE
    // express.json({ limit: "1mb" })
    // ========================================================

    if (
        err.type ===
            "entity.too.large" ||
        err.status === 413
    ) {
        return res
            .status(413)
            .json({
                success:
                    false,

                message:
                    "Request payload is too large",

                errors:
                    null,
            });
    }

    // ========================================================
    // VALIDATION ERROR
    // ========================================================

    if (
        err.name ===
        "ValidationError"
    ) {
        return res
            .status(400)
            .json({
                success:
                    false,

                message:
                    "Validation error",

                errors:
                    err.errors ??
                    err.details ??
                    null,
            });
    }

    // ========================================================
    // JWT - INVALID
    // ========================================================

    if (
        err.name ===
        "JsonWebTokenError"
    ) {
        return res
            .status(401)
            .json({
                success:
                    false,

                message:
                    "Invalid token",

                errors:
                    null,
            });
    }

    // ========================================================
    // JWT - EXPIRED
    // ========================================================

    if (
        err.name ===
        "TokenExpiredError"
    ) {
        return res
            .status(401)
            .json({
                success:
                    false,

                message:
                    "Token expired",

                errors:
                    null,
            });
    }

    // ========================================================
    // MYSQL DUPLICATE
    //
    // Không trả sqlMessage / index name về client.
    // ========================================================

    if (
        err.code ===
        "ER_DUP_ENTRY"
    ) {
        return res
            .status(409)
            .json({
                success:
                    false,

                message:
                    "Duplicate entry",

                errors:
                    null,
            });
    }

    // ========================================================
    // MYSQL FOREIGN KEY ERROR
    // ========================================================

    if (
        err.code ===
            "ER_NO_REFERENCED_ROW_2" ||
        err.code ===
            "ER_ROW_IS_REFERENCED_2"
    ) {
        return res
            .status(409)
            .json({
                success:
                    false,

                message:
                    "Operation conflicts with existing data",

                errors:
                    null,
            });
    }

    // ========================================================
    // MULTER
    // ========================================================

    if (
        err.name ===
        "MulterError"
    ) {
        let uploadMessage =
            "File upload error";

        if (
            err.code ===
            "LIMIT_FILE_SIZE"
        ) {
            uploadMessage =
                "Uploaded file is too large";
        }

        if (
            err.code ===
            "LIMIT_FILE_COUNT"
        ) {
            uploadMessage =
                "Too many files uploaded";
        }

        if (
            err.code ===
            "LIMIT_UNEXPECTED_FILE"
        ) {
            uploadMessage =
                "Unexpected upload field";
        }

        return res
            .status(400)
            .json({
                success:
                    false,

                message:
                    uploadMessage,

                errors:
                    null,
            });
    }

    // ========================================================
    // INTERNAL SERVER ERROR LOGGING
    //
    // Log nội bộ nhưng KHÔNG trả stack/sql ra client.
    // ========================================================

    if (
        statusCode >= 500 &&
        process.env.NODE_ENV !==
            "test"
    ) {
        console.error(
            "=========================================="
        );

        console.error(
            "❌ Internal Server Error"
        );

        console.error(
            `${req.method} ${req.originalUrl}`
        );

        console.error(
            err.stack ||
            err.message
        );

        console.error(
            "=========================================="
        );
    }

    // ========================================================
    // PRODUCTION RESPONSE SECURITY
    // ========================================================

    if (
        isProduction &&
        statusCode >= 500
    ) {
        message =
            "Internal Server Error";

        errors =
            null;
    }

    // ========================================================
    // FINAL RESPONSE
    // ========================================================

    return res
        .status(
            statusCode
        )
        .json({
            success:
                false,

            message,

            errors,
        });
};