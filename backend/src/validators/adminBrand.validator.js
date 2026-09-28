const {
    body,
    param,
    query,
} = require(
    "express-validator"
);

// ============================================================
// ID
// ============================================================

const idParam = [
    param("id")
        .isInt({
            min: 1,
        })
        .withMessage(
            "ID thương hiệu không hợp lệ."
        ),
];

// ============================================================
// LIST
// ============================================================

const list = [
    query("search")
        .optional()
        .trim()
        .isLength({
            max: 100,
        })
        .withMessage(
            "Từ khóa tìm kiếm quá dài."
        ),

    query("status")
        .optional()
        .isIn([
            "active",
            "inactive",
        ])
        .withMessage(
            "Trạng thái lọc không hợp lệ."
        ),
];

// ============================================================
// CREATE
// ============================================================

const create = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage(
            "Tên thương hiệu là bắt buộc."
        )
        .isLength({
            max: 100,
        })
        .withMessage(
            "Tên thương hiệu tối đa 100 ký tự."
        ),

    body("slug")
        .optional({
            checkFalsy: true,
        })
        .trim()
        .isLength({
            max: 150,
        })
        .withMessage(
            "Slug tối đa 150 ký tự."
        ),

    body("logo")
        .optional({
            nullable: true,
            checkFalsy: true,
        })
        .trim()
        .isLength({
            max: 500,
        })
        .withMessage(
            "Đường dẫn logo quá dài."
        ),

    body("description")
        .optional({
            nullable: true,
        })
        .isLength({
            max: 5000,
        })
        .withMessage(
            "Mô tả quá dài."
        ),

    body("status")
        .optional()
        .isIn([
            "active",
            "inactive",
        ])
        .withMessage(
            "Trạng thái không hợp lệ."
        ),
];

// ============================================================
// UPDATE
// ============================================================

const update = [
    ...idParam,

    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage(
            "Tên thương hiệu không được để trống."
        )
        .isLength({
            max: 100,
        })
        .withMessage(
            "Tên thương hiệu tối đa 100 ký tự."
        ),

    body("slug")
        .optional({
            checkFalsy: true,
        })
        .trim()
        .isLength({
            max: 150,
        })
        .withMessage(
            "Slug tối đa 150 ký tự."
        ),

    body("logo")
        .optional({
            nullable: true,
            checkFalsy: true,
        })
        .trim()
        .isLength({
            max: 500,
        })
        .withMessage(
            "Đường dẫn logo quá dài."
        ),

    body("description")
        .optional({
            nullable: true,
        })
        .isLength({
            max: 5000,
        })
        .withMessage(
            "Mô tả quá dài."
        ),

    body("status")
        .optional()
        .isIn([
            "active",
            "inactive",
        ])
        .withMessage(
            "Trạng thái không hợp lệ."
        ),
];

// ============================================================
// STATUS
// ============================================================

const status = [
    ...idParam,

    body("status")
        .isIn([
            "active",
            "inactive",
        ])
        .withMessage(
            "Trạng thái không hợp lệ."
        ),
];

// ============================================================
// EXPORT
// ============================================================

module.exports = {
    idParam,
    list,
    create,
    update,
    status,
};