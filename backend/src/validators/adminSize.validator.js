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
            "ID size không hợp lệ."
        ),
];

const list = [
    query("search")
        .optional()
        .trim()
        .isLength({
            max: 50,
        }),

    query("status")
        .optional()
        .isIn([
            "active",
            "inactive",
        ])
        .withMessage(
            "Trạng thái không hợp lệ."
        ),
];

const create = [
    body("sizeName")
        .trim()
        .notEmpty()
        .withMessage(
            "Tên size là bắt buộc."
        )
        .isLength({
            max: 20,
        })
        .withMessage(
            "Tên size tối đa 20 ký tự."
        ),

    body("sortOrder")
        .optional()
        .isInt({
            min: 0,
        })
        .withMessage(
            "Thứ tự hiển thị không hợp lệ."
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

    body("sizeName")
        .optional()
        .trim()
        .notEmpty()
        .isLength({
            max: 20,
        }),

    body("sortOrder")
        .optional()
        .isInt({
            min: 0,
        }),

    body("status")
        .optional()
        .isIn([
            "active",
            "inactive",
        ]),
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