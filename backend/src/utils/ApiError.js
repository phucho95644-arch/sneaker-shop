class ApiError extends Error {
    constructor(
        statusCode,
        message,
        errors = null
    ) {
        super(message);

        this.name = "ApiError";

        this.statusCode =
            Number(statusCode);

        this.errors =
            errors ?? null;

        this.isOperational =
            true;

        Error.captureStackTrace(
            this,
            this.constructor
        );
    }
}

module.exports = ApiError;