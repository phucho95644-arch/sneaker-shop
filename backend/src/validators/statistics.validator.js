const {
    query,
} = require(
    "express-validator"
);

// ============================================================
// DATE RANGE HELPER
// ============================================================

const validateDateRange = (
    value,
    { req }
) => {
    if (
        !value ||
        !req.query.fromDate
    ) {
        return true;
    }

    const from =
        new Date(
            req.query.fromDate
        );

    const to =
        new Date(value);

    if (
        to < from
    ) {
        throw new Error(
            "toDate phải lớn hơn hoặc bằng fromDate"
        );
    }

    return true;
};

// ============================================================
// COMMON PERIOD
// ============================================================

exports.period = [
    query("period")
        .optional()
        .isIn([
            "day",
            "week",
            "month",
            "year",
        ])
        .withMessage(
            "period không hợp lệ"
        ),

    query("fromDate")
        .optional({
            checkFalsy: true,
        })
        .isISO8601({
            strict: true,
        })
        .withMessage(
            "fromDate không hợp lệ"
        ),

    query("toDate")
        .optional({
            checkFalsy: true,
        })
        .isISO8601({
            strict: true,
        })
        .withMessage(
            "toDate không hợp lệ"
        )
        .custom(
            validateDateRange
        ),
];

// ============================================================
// TOP LIST
// ============================================================

exports.topList = [
    query("limit")
        .optional()
        .isInt({
            min: 1,
            max: 100,
        })
        .withMessage(
            "limit phải từ 1 đến 100"
        )
        .toInt(),

    query("fromDate")
        .optional({
            checkFalsy: true,
        })
        .isISO8601({
            strict: true,
        })
        .withMessage(
            "fromDate không hợp lệ"
        ),

    query("toDate")
        .optional({
            checkFalsy: true,
        })
        .isISO8601({
            strict: true,
        })
        .withMessage(
            "toDate không hợp lệ"
        )
        .custom(
            validateDateRange
        ),
];

// ============================================================
// RECENT ORDERS
// ============================================================

exports.recentOrders = [
    query("limit")
        .optional()
        .isInt({
            min: 1,
            max: 50,
        })
        .withMessage(
            "limit phải từ 1 đến 50"
        )
        .toInt(),
];

// ============================================================
// LOW STOCK
// ============================================================

exports.lowStock = [
    query("threshold")
        .optional()
        .isInt({
            min: 0,
            max: 100000,
        })
        .withMessage(
            "threshold không hợp lệ"
        )
        .toInt(),

    query("limit")
        .optional()
        .isInt({
            min: 1,
            max: 100,
        })
        .withMessage(
            "limit phải từ 1 đến 100"
        )
        .toInt(),
];