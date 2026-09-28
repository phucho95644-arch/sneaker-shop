const express =
    require("express");

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

const categoryController =
    require(
        "../controllers/category.controller"
    );

const validator =
    require(
        "../validators/adminCategory.validator"
    );

// ============================================================
// SECURITY
// ============================================================

router.use(
    authMiddleware,
    adminMiddleware
);

// ============================================================
// GET /api/admin/categories
// ============================================================

router.get(
    "/",

    validator.list,

    validateMiddleware,

    categoryController
        .getCategories
);

// ============================================================
// GET /api/admin/categories/:id
// ============================================================

router.get(
    "/:id",

    validator.idParam,

    validateMiddleware,

    categoryController
        .getCategory
);

// ============================================================
// POST /api/admin/categories
// ============================================================

router.post(
    "/",

    validator.create,

    validateMiddleware,

    categoryController
        .createCategory
);

// ============================================================
// PUT /api/admin/categories/:id
// ============================================================

router.put(
    "/:id",

    validator.update,

    validateMiddleware,

    categoryController
        .updateCategory
);

// ============================================================
// PATCH /api/admin/categories/:id/status
// ============================================================

router.patch(
    "/:id/status",

    validator.status,

    validateMiddleware,

    categoryController
        .updateStatus
);

// ============================================================
// DELETE /api/admin/categories/:id
// ============================================================

router.delete(
    "/:id",

    validator.idParam,

    validateMiddleware,

    categoryController
        .deleteCategory
);

module.exports =
    router;