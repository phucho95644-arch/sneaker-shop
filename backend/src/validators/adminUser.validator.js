const {
    param,
    body,
    query,
} = require(
    "express-validator"
);

// ============================================================
// USER ID
// ============================================================

exports.userId = [
    param("id")
        .isInt({
            min: 1,
        })
        .withMessage(
            "ID người dùng không hợp lệ"
        )
        .toInt(),
];

// ============================================================
// USER LIST
// ============================================================

exports.listUsers = [
    query("page")
        .optional()
        .isInt({
            min: 1,
        })
        .withMessage(
            "page không hợp lệ"
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

    query("search")
        .optional()
        .isString()
        .withMessage(
            "search phải là chuỗi"
        )
        .trim()
        .isLength({
            max: 150,
        })
        .withMessage(
            "Từ khóa tìm kiếm quá dài"
        ),

    query("role")
        .optional()
        .isIn([
            "customer",
            "admin",
        ])
        .withMessage(
            "role không hợp lệ"
        ),

    query("status")
        .optional()
        .isIn([
            "active",
            "inactive",
            "blocked",
        ])
        .withMessage(
            "status không hợp lệ"
        ),

    query("sort")
        .optional()
        .isIn([
            "newest",
            "oldest",
            "name_asc",
            "name_desc",
            "email_asc",
            "email_desc",
        ])
        .withMessage(
            "sort không hợp lệ"
        ),
];

// ============================================================
// UPDATE STATUS
// ============================================================

exports.updateStatus = [
    param("id")
        .isInt({
            min: 1,
        })
        .withMessage(
            "ID người dùng không hợp lệ"
        )
        .toInt(),

    body("status")
        .isIn([
            "active",
            "inactive",
            "blocked",
        ])
        .withMessage(
            "Trạng thái không hợp lệ"
        ),
];

// ============================================================
// UPDATE ROLE
// ============================================================

exports.updateRole = [
    param("id")
        .isInt({
            min: 1,
        })
        .withMessage(
            "ID người dùng không hợp lệ"
        )
        .toInt(),

    body("role")
        .isIn([
            "customer",
            "admin",
        ])
        .withMessage(
            "Quyền người dùng không hợp lệ"
        ),
];