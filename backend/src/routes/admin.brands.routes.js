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

const brandController =
    require(
        "../controllers/brand.controller"
    );

const validator =
    require(
        "../validators/adminBrand.validator"
    );

// ============================================================
// SECURITY
// ============================================================

router.use(
    authMiddleware,
    adminMiddleware
);

// ============================================================
// GET /api/admin/brands
// ============================================================

router.get(
    "/",

    validator.list,

    validateMiddleware,

    brandController
        .getBrands
);

// ============================================================
// GET /api/admin/brands/:id
// ============================================================

router.get(
    "/:id",

    validator.idParam,

    validateMiddleware,

    brandController
        .getBrand
);

// ============================================================
// POST /api/admin/brands
// ============================================================

router.post(
    "/",

    validator.create,

    validateMiddleware,

    brandController
        .createBrand
);

// ============================================================
// PUT /api/admin/brands/:id
// ============================================================

router.put(
    "/:id",

    validator.update,

    validateMiddleware,

    brandController
        .updateBrand
);

// ============================================================
// PATCH /api/admin/brands/:id/status
// ============================================================

router.patch(
    "/:id/status",

    validator.status,

    validateMiddleware,

    brandController
        .updateStatus
);

// ============================================================
// DELETE /api/admin/brands/:id
// ============================================================

router.delete(
    "/:id",

    validator.idParam,

    validateMiddleware,

    brandController
        .deleteBrand
);

// ============================================================
// EXPORT
// ============================================================

module.exports =
    router;