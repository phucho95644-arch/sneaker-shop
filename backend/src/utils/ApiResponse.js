const ApiResponse = {
    success(res, message, data = null, statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    },

    error(res, message, errors = null, statusCode = 400) {
        const payload = {
            success: false,
            message
        };

        if (errors) {
            payload.errors = errors;
        }

        return res.status(statusCode).json(payload);
    }
};

module.exports = ApiResponse;
