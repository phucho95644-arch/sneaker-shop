const express = require(
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

const colorController =
    require(
        "../controllers/color.controller"
    );

const colorValidator =
    require(
        "../validators/adminColor.validator"
    );

// ============================================================
// SECURITY
// ============================================================

router.use(
    authMiddleware,
    adminMiddleware
);

// ============================================================
// GET COLORS
//
// GET /api/admin/colors
// ============================================================

router.get(
    "/",

    colorValidator.list,

    validateMiddleware,

    colorController.getColors
);

// ============================================================
// GET COLOR DETAIL
//
// GET /api/admin/colors/:id
// ============================================================

router.get(
    "/:id",

    colorValidator.idParam,

    validateMiddleware,

    colorController.getColor
);

// ============================================================
// CREATE COLOR
//
// POST /api/admin/colors
// ============================================================

router.post(
    "/",

    colorValidator.create,

    validateMiddleware,

    colorController.createColor
);

// ============================================================
// UPDATE COLOR
//
// PUT /api/admin/colors/:id
// ============================================================

router.put(
    "/:id",

    colorValidator.update,

    validateMiddleware,

    colorController.updateColor
);

// ============================================================
// UPDATE STATUS
//
// PATCH /api/admin/colors/:id/status
// ============================================================

router.patch(
    "/:id/status",

    colorValidator.status,

    validateMiddleware,

    colorController.updateStatus
);

// ============================================================
// DELETE COLOR
//
// DELETE /api/admin/colors/:id
// ============================================================

router.delete(
    "/:id",

    colorValidator.idParam,

    validateMiddleware,

    colorController.deleteColor
);

// ============================================================
// EXPORT
// ============================================================

module.exports =
    router;