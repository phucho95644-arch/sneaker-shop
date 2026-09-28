const express =
    require(
        "express"
    );

const router =
    express.Router();

const authMiddleware =
    require(
        "../middleware/auth.middleware"
    );

const adminMiddleware =
    require(
        "../middleware/admin.middleware"
    );

const validateMiddleware =
    require(
        "../middleware/validate.middleware"
    );

const adminProductController =
    require(
        "../controllers/adminProduct.controller"
    );

const adminProductValidator =
    require(
        "../validators/adminProduct.validator"
    );

// ============================================================
// SECURITY
// ============================================================

router.use(
    authMiddleware,
    adminMiddleware
);

// ============================================================
// LIST
//
// GET /api/admin/products
// ============================================================

router.get(
    "/",

    adminProductValidator.list,

    validateMiddleware,

    adminProductController
        .getProducts
);

// ============================================================
// DETAIL
//
// GET /api/admin/products/:id
// ============================================================

router.get(
    "/:id",

    adminProductValidator
        .productId,

    validateMiddleware,

    adminProductController
        .getProductDetail
);

// ============================================================
// CREATE
//
// POST /api/admin/products
// ============================================================

router.post(
    "/",

    adminProductValidator.save,

    validateMiddleware,

    adminProductController
        .createProduct
);

// ============================================================
// UPDATE
//
// PUT /api/admin/products/:id
// ============================================================

router.put(
    "/:id",

    adminProductValidator.update,

    validateMiddleware,

    adminProductController
        .updateProduct
);

// ============================================================
// UPDATE STATUS
//
// PATCH /api/admin/products/:id/status
// ============================================================

router.patch(
    "/:id/status",

    adminProductValidator.status,

    validateMiddleware,

    adminProductController
        .updateStatus
);

module.exports =
    router;