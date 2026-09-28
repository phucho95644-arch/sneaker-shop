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
    param(
        "id"
    )
        .isInt({
            min: 1,
        })
        .withMessage(
            "ID màu sắc không hợp lệ."
        ),
];

// ============================================================
// LIST
// ============================================================

const list = [
    query(
        "search"
    )
        .optional()
        .isString()
        .withMessage(
            "Từ khóa tìm kiếm không hợp lệ."
        ),

    query(
        "status"
    )
        .optional({
            checkFalsy:
                true,
        })
        .isIn([
            "active",
            "inactive",
        ])
        .withMessage(
            "Trạng thái phải là active hoặc inactive."
        ),
];

// ============================================================
// CREATE
// ============================================================

const create = [
    body(
        "name"
    )
        .trim()
        .notEmpty()
        .withMessage(
            "Tên màu sắc là bắt buộc."
        )
        .isLength({
            max: 100,
        })
        .withMessage(
            "Tên màu sắc tối đa 100 ký tự."
        ),

    body(
        "hex_code"
    )
        .optional({
            nullable:
                true,
            checkFalsy:
                true,
        })
        .matches(
            /^#?[0-9A-Fa-f]{6}$/
        )
        .withMessage(
            "Mã màu phải có dạng #RRGGBB."
        ),

    body(
        "status"
    )
        .optional()
        .isIn([
            "active",
            "inactive",
        ])
        .withMessage(
            "Trạng thái phải là active hoặc inactive."
        ),
];

// ============================================================
// UPDATE
// ============================================================

const update = [
    ...idParam,

    body(
        "name"
    )
        .optional()
        .trim()
        .notEmpty()
        .withMessage(
            "Tên màu sắc không được để trống."
        )
        .isLength({
            max: 100,
        })
        .withMessage(
            "Tên màu sắc tối đa 100 ký tự."
        ),

    body(
        "hex_code"
    )
        .optional({
            nullable:
                true,
            checkFalsy:
                true,
        })
        .matches(
            /^#?[0-9A-Fa-f]{6}$/
        )
        .withMessage(
            "Mã màu phải có dạng #RRGGBB."
        ),

    body(
        "status"
    )
        .optional()
        .isIn([
            "active",
            "inactive",
        ])
        .withMessage(
            "Trạng thái phải là active hoặc inactive."
        ),
];

// ============================================================
// STATUS
// ============================================================

const status = [
    ...idParam,

    body(
        "status"
    )
        .isIn([
            "active",
            "inactive",
        ])
        .withMessage(
            "Trạng thái phải là active hoặc inactive."
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