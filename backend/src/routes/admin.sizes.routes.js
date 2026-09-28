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

const controller =
    require(
        "../controllers/adminSize.controller"
    );

const validator =
    require(
        "../validators/adminSize.validator"
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
// ============================================================

router.get(
    "/",
    validator.list,
    validateMiddleware,
    controller.getSizes
);

// ============================================================
// DETAIL
// ============================================================

router.get(
    "/:id",
    validator.idParam,
    validateMiddleware,
    controller.getSize
);

// ============================================================
// CREATE
// ============================================================

router.post(
    "/",
    validator.create,
    validateMiddleware,
    controller.createSize
);

// ============================================================
// UPDATE
// ============================================================

router.put(
    "/:id",
    validator.update,
    validateMiddleware,
    controller.updateSize
);

// ============================================================
// STATUS
// ============================================================

router.patch(
    "/:id/status",
    validator.status,
    validateMiddleware,
    controller.updateStatus
);

// ============================================================
// DELETE
// ============================================================

router.delete(
    "/:id",
    validator.idParam,
    validateMiddleware,
    controller.deleteSize
);

module.exports =
    router;