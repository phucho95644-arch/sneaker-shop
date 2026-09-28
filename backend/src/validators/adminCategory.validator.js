const {
    body,
    param,
    query,
} = require(
    "express-validator"
);

const idParam = [
    param("id")
        .isInt({
            min: 1,
        })
        .withMessage(
            "ID danh mục không hợp lệ."
        ),
];

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

const create = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage(
            "Tên danh mục là bắt buộc."
        )
        .isLength({
            max: 100,
        })
        .withMessage(
            "Tên danh mục tối đa 100 ký tự."
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

    body("image")
        .optional({
            nullable: true,
            checkFalsy: true,
        })
        .trim()
        .isLength({
            max: 500,
        })
        .withMessage(
            "Đường dẫn hình ảnh quá dài."
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

const update = [
    ...idParam,

    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage(
            "Tên danh mục không được để trống."
        )
        .isLength({
            max: 100,
        })
        .withMessage(
            "Tên danh mục tối đa 100 ký tự."
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

    body("image")
        .optional({
            nullable: true,
            checkFalsy: true,
        })
        .trim()
        .isLength({
            max: 500,
        })
        .withMessage(
            "Đường dẫn hình ảnh quá dài."
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

module.exports = {
    idParam,
    list,
    create,
    update,
    status,
};