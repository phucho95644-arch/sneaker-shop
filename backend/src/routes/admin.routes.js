const express = require(
    "express"
);

const {
    pool,
} = require(
    "../config/db"
);

const authMiddleware =
    require(
        "../middleware/auth.middleware"
    );

const adminMiddleware =
    require(
        "../middleware/admin.middleware"
    );

const asyncHandler =
    require(
        "../utils/asyncHandler"
    );

const router =
    express.Router();

// ============================================================
// ADMIN SECURITY
//
// TẤT CẢ route bên dưới bắt buộc:
// 1. Có JWT hợp lệ
// 2. User có role = admin
// ============================================================

router.use(
    authMiddleware,
    adminMiddleware
);

// ============================================================
// ADMIN PRODUCTS
//
// GET /api/admin/products
// ============================================================

router.get(
    "/products",

    asyncHandler(
        async (
            req,
            res
        ) => {
            const [
                rows,
            ] =
                await pool.query(
                    `
                    SELECT
                        id,
                        name,
                        sku,
                        status
                    FROM products
                    ORDER BY id DESC
                    LIMIT 100
                    `
                );

            return res
                .status(200)
                .json({
                    success:
                        true,

                    data:
                        rows,
                });
        }
    )
);

// ============================================================
// ADMIN INVENTORY
//
// GET /api/admin/inventory
// ============================================================

router.get(
    "/inventory",

    asyncHandler(
        async (
            req,
            res
        ) => {
            const [
                rows,
            ] =
                await pool.query(
                    `
                    SELECT
                        pv.id,
                        pv.sku,
                        pv.stock_quantity AS stock_quantity
                    FROM product_variants pv
                    ORDER BY pv.id DESC
                    LIMIT 200
                    `
                );

            return res
                .status(200)
                .json({
                    success:
                        true,

                    data:
                        rows,
                });
        }
    )
);

// ============================================================
// EXPORT
// ============================================================

module.exports =
    router;