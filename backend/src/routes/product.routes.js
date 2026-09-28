const express =
    require("express");

const router =
    express.Router();

const {
    pool,
} = require(
    "../config/db"
);

// ============================================================
// GET PRODUCT LIST
// GET /api/products
// ============================================================

router.get(
    "/",
    async (
        req,
        res,
        next
    ) => {
        try {
            const [
                rows,
            ] =
                await pool.query(
                    `
                    SELECT
                        p.id,
                        p.name,
                        p.slug,
                        p.price,
                        p.sale_price,
                        p.thumbnail

                    FROM products p

                    WHERE p.status = 'active'

                    ORDER BY p.id DESC

                    LIMIT 100
                    `
                );

            res.status(
                200
            ).json({
                success:
                    true,

                data:
                    rows,
            });
        } catch (
            error
        ) {
            next(
                error
            );
        }
    }
);

// ============================================================
// GET PRODUCT DETAIL
// GET /api/products/:id
// ============================================================

router.get(
    "/:id",
    async (
        req,
        res,
        next
    ) => {
        try {
            // ====================================================
            // PRODUCT ID
            // ====================================================

            const productId =
                Number(
                    req.params.id
                );

            if (
                !Number.isInteger(
                    productId
                ) ||
                productId <=
                    0
            ) {
                return res
                    .status(
                        400
                    )
                    .json({
                        success:
                            false,

                        message:
                            "Product ID không hợp lệ",
                    });
            }

            // ====================================================
            // PRODUCT
            // ====================================================

            const [
                productRows,
            ] =
                await pool.query(
                    `
                    SELECT
                        p.*

                    FROM products p

                    WHERE p.id = ?
                      AND p.status = 'active'

                    LIMIT 1
                    `,
                    [
                        productId,
                    ]
                );

            const product =
                productRows[0];

            if (
                !product
            ) {
                return res
                    .status(
                        404
                    )
                    .json({
                        success:
                            false,

                        message:
                            "Không tìm thấy sản phẩm",
                    });
            }

            // ====================================================
            // PRODUCT IMAGES
            // ====================================================

            const [
                imageRows,
            ] =
                await pool.query(
                    `
                    SELECT
                        pi.id,
                        pi.product_id,
                        pi.image_url

                    FROM product_images pi

                    WHERE pi.product_id = ?

                    ORDER BY pi.id ASC
                    `,
                    [
                        productId,
                    ]
                );

            // ====================================================
            // PRODUCT VARIANTS
            //
            // Schema hiện tại:
            //
            // product_variants
            // -> sizes
            // -> colors
            //
            // Đây cũng là cấu trúc Cart backend đang sử dụng.
            // ====================================================

            const [
                variantRows,
            ] =
                await pool.query(
                    `
                    SELECT
                        pv.id,
                        pv.product_id,

                        pv.size_id,
                        s.size_name,

                        pv.color_id,
                        c.name AS color_name,

                        c.hex_code AS color_hex,
                        c.hex_code AS color_hex_code,

                        pv.sku,

                        pv.price_adjustment,

                        pv.stock_quantity,
                        pv.stock_quantity AS stock,

                        pv.status

                    FROM product_variants pv

                    LEFT JOIN sizes s
                        ON s.id = pv.size_id

                    LEFT JOIN colors c
                        ON c.id = pv.color_id

                    WHERE pv.product_id = ?
                      AND pv.status = 'active'

                    ORDER BY
                        s.size_name ASC,
                        c.name ASC,
                        pv.id ASC
                    `,
                    [
                        productId,
                    ]
                );

            // ====================================================
            // RESPONSE
            // ====================================================

            return res
                .status(
                    200
                )
                .json({
                    success:
                        true,

                    data: {
                        ...product,

                        images:
                            imageRows,

                        variants:
                            variantRows,
                    },
                });
        } catch (
            error
        ) {
            next(
                error
            );
        }
    }
);

module.exports =
    router;