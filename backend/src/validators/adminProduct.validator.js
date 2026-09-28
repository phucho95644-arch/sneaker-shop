const {
    body,
    param,
    query,
} = require(
    "express-validator"
);

const PRODUCT_STATUSES = [
    "active",
    "inactive",
    "draft",
];

const PRODUCT_GENDERS = [
    "men",
    "women",
    "unisex",
    "kids",
];

const VARIANT_STATUSES = [
    "active",
    "inactive",
];

const productId = [
    param("id")
        .isInt({
            min: 1,
        })
        .withMessage(
            "Product ID không hợp lệ"
        )
        .toInt(),
];

const list = [
    query("status")
        .optional()
        .isIn(
            PRODUCT_STATUSES
        )
        .withMessage(
            "Trạng thái sản phẩm không hợp lệ"
        ),

    query("categoryId")
        .optional()
        .isInt({
            min: 1,
        })
        .toInt(),

    query("brandId")
        .optional()
        .isInt({
            min: 1,
        })
        .toInt(),

    query("limit")
        .optional()
        .isInt({
            min: 1,
            max: 500,
        })
        .toInt(),
];

const save = [
    body("name")
        .isString()
        .trim()
        .isLength({
            min: 2,
            max: 255,
        })
        .withMessage(
            "Tên sản phẩm từ 2 đến 255 ký tự"
        ),

    body("sku")
        .isString()
        .trim()
        .isLength({
            min: 1,
            max: 100,
        })
        .withMessage(
            "SKU sản phẩm không hợp lệ"
        ),

    body("slug")
        .optional({
            checkFalsy: true,
        })
        .isString()
        .isLength({
            max: 255,
        }),

    body("categoryId")
        .optional({
            nullable: true,
            checkFalsy: true,
        })
        .isInt({
            min: 1,
        })
        .toInt(),

    body("brandId")
        .optional({
            nullable: true,
            checkFalsy: true,
        })
        .isInt({
            min: 1,
        })
        .toInt(),

    body("price")
        .isFloat({
            min: 0,
        })
        .withMessage(
            "Giá sản phẩm không hợp lệ"
        )
        .toFloat(),

    body("salePrice")
        .optional({
            nullable: true,
            checkFalsy: true,
        })
        .isFloat({
            min: 0,
        })
        .toFloat(),

    body("gender")
        .optional()
        .isIn(
            PRODUCT_GENDERS
        ),

    body("status")
        .optional()
        .isIn(
            PRODUCT_STATUSES
        ),

    body("isFeatured")
        .optional()
        .isBoolean()
        .toBoolean(),

    body("thumbnail")
        .optional({
            nullable: true,
        })
        .isString()
        .isLength({
            max: 500,
        }),

    body("images")
        .optional()
        .isArray({
            max: 20,
        }),

    body(
        "images.*.imageUrl"
    )
        .optional()
        .isString()
        .isLength({
            min: 1,
            max: 500,
        }),

    body(
        "images.*.isMain"
    )
        .optional()
        .isBoolean()
        .toBoolean(),

    body(
        "images.*.sortOrder"
    )
        .optional()
        .isInt(),

    body("variants")
        .optional()
        .isArray({
            max: 100,
        }),

    body(
        "variants.*.id"
    )
        .optional({
            nullable: true,
        })
        .isInt({
            min: 1,
        })
        .toInt(),

    body(
        "variants.*.sizeId"
    )
        .optional()
        .isInt({
            min: 1,
        })
        .toInt(),

    body(
        "variants.*.colorId"
    )
        .optional()
        .isInt({
            min: 1,
        })
        .toInt(),

    body(
        "variants.*.sku"
    )
        .optional()
        .isString()
        .trim()
        .isLength({
            min: 1,
            max: 150,
        }),

    body(
        "variants.*.priceAdjustment"
    )
        .optional()
        .isFloat()
        .toFloat(),

    body(
        "variants.*.stockQuantity"
    )
        .optional()
        .isInt({
            min: 0,
        })
        .toInt(),

    body(
        "variants.*.status"
    )
        .optional()
        .isIn(
            VARIANT_STATUSES
        ),
];

const update = [
    ...productId,
    ...save,
];

const status = [
    ...productId,

    body("status")
        .isIn(
            PRODUCT_STATUSES
        )
        .withMessage(
            "Trạng thái sản phẩm không hợp lệ"
        ),
];

module.exports = {
    list,
    productId,
    save,
    update,
    status,
};