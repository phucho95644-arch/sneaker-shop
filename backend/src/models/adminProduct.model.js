const {
    pool,
} = require(
    "../config/db"
);

const getDb = (
    connection
) =>
    connection ||
    pool;

// ============================================================
// LIST
// ============================================================

const getProducts = async ({
    search,
    status,
    categoryId,
    brandId,
    limit = 100,
}) => {
    const conditions = [
        "1 = 1",
    ];

    const params = [];

    if (search) {
        conditions.push(
            `
            (
                p.name LIKE ?
                OR p.sku LIKE ?
                OR p.slug LIKE ?
            )
            `
        );

        const keyword =
            `%${search}%`;

        params.push(
            keyword,
            keyword,
            keyword
        );
    }

    if (status) {
        conditions.push(
            "p.status = ?"
        );

        params.push(
            status
        );
    }

    if (categoryId) {
        conditions.push(
            "p.category_id = ?"
        );

        params.push(
            categoryId
        );
    }

    if (brandId) {
        conditions.push(
            "p.brand_id = ?"
        );

        params.push(
            brandId
        );
    }

    params.push(
        Number(limit)
    );

    const [
        rows,
    ] =
        await pool.query(
            `
            SELECT
                p.id,
                p.category_id,
                p.brand_id,

                p.name,
                p.slug,
                p.sku,

                p.price,
                p.sale_price,

                p.thumbnail,
                p.gender,
                p.status,
                p.is_featured,

                p.created_at,
                p.updated_at,

                c.name
                    AS category_name,

                b.name
                    AS brand_name,

                (
                    SELECT COUNT(*)
                    FROM product_variants pv_count
                    WHERE pv_count.product_id = p.id
                ) AS variant_count,

                (
                    SELECT
                        COALESCE(
                            SUM(
                                pv_stock.stock_quantity
                            ),
                            0
                        )

                    FROM product_variants pv_stock

                    WHERE
                        pv_stock.product_id = p.id
                        AND pv_stock.status = 'active'
                ) AS total_stock

            FROM products p

            LEFT JOIN categories c
                ON c.id = p.category_id

            LEFT JOIN brands b
                ON b.id = p.brand_id

            WHERE
                ${conditions.join(
                    " AND "
                )}

            ORDER BY
                p.id DESC

            LIMIT ?
            `,
            params
        );

    return rows;
};

// ============================================================
// PRODUCT
// ============================================================

const findById = async (
    productId,
    connection
) => {
    const db =
        getDb(
            connection
        );

    const [
        rows,
    ] =
        await db.query(
            `
            SELECT
                p.*,

                c.name
                    AS category_name,

                b.name
                    AS brand_name

            FROM products p

            LEFT JOIN categories c
                ON c.id = p.category_id

            LEFT JOIN brands b
                ON b.id = p.brand_id

            WHERE
                p.id = ?

            LIMIT 1
            `,
            [
                productId,
            ]
        );

    return (
        rows[0] ||
        null
    );
};

// ============================================================
// IMAGES
// ============================================================

const getImages = async (
    productId,
    connection
) => {
    const db =
        getDb(
            connection
        );

    const [
        rows,
    ] =
        await db.query(
            `
            SELECT
                id,
                product_id,
                image_url,
                is_main,
                sort_order,
                created_at

            FROM product_images

            WHERE
                product_id = ?

            ORDER BY
                is_main DESC,
                sort_order ASC,
                id ASC
            `,
            [
                productId,
            ]
        );

    return rows;
};

// ============================================================
// VARIANTS
// ============================================================

const getVariants = async (
    productId,
    connection
) => {
    const db =
        getDb(
            connection
        );

    const [
        rows,
    ] =
        await db.query(
            `
            SELECT
                pv.id,
                pv.product_id,

                pv.size_id,
                s.size_name,

                pv.color_id,
                c.name
                    AS color_name,

                c.hex_code
                    AS color_hex_code,

                pv.sku,
                pv.price_adjustment,
                pv.stock_quantity,
                pv.status,

                pv.created_at,
                pv.updated_at

            FROM product_variants pv

            LEFT JOIN sizes s
                ON s.id = pv.size_id

            LEFT JOIN colors c
                ON c.id = pv.color_id

            WHERE
                pv.product_id = ?

            ORDER BY
                s.sort_order ASC,
                s.size_name ASC,
                c.name ASC,
                pv.id ASC
            `,
            [
                productId,
            ]
        );

    return rows;
};

// ============================================================
// UNIQUE
// ============================================================

const findBySlug = async (
    slug,
    excludeId = null,
    connection
) => {
    const db =
        getDb(
            connection
        );

    let sql = `
        SELECT id
        FROM products
        WHERE slug = ?
    `;

    const params = [
        slug,
    ];

    if (excludeId) {
        sql +=
            " AND id <> ?";

        params.push(
            excludeId
        );
    }

    sql +=
        " LIMIT 1";

    const [
        rows,
    ] =
        await db.query(
            sql,
            params
        );

    return (
        rows[0] ||
        null
    );
};

const findBySku = async (
    sku,
    excludeId = null,
    connection
) => {
    const db =
        getDb(
            connection
        );

    let sql = `
        SELECT id
        FROM products
        WHERE sku = ?
    `;

    const params = [
        sku,
    ];

    if (excludeId) {
        sql +=
            " AND id <> ?";

        params.push(
            excludeId
        );
    }

    sql +=
        " LIMIT 1";

    const [
        rows,
    ] =
        await db.query(
            sql,
            params
        );

    return (
        rows[0] ||
        null
    );
};

// ============================================================
// REFERENCES
// ============================================================

const referenceExists =
    async (
        table,
        id,
        connection
    ) => {
        const allowedTables =
            new Set([
                "categories",
                "brands",
                "sizes",
                "colors",
            ]);

        if (
            !allowedTables.has(
                table
            )
        ) {
            throw new Error(
                "Invalid reference table"
            );
        }

        const db =
            getDb(
                connection
            );

        const [
            rows,
        ] =
            await db.query(
                `
                SELECT id
                FROM ${table}
                WHERE id = ?
                LIMIT 1
                `,
                [
                    id,
                ]
            );

        return (
            rows.length >
            0
        );
    };

// ============================================================
// INSERT PRODUCT
// ============================================================

const createProduct =
    async (
        data,
        connection
    ) => {
        const db =
            getDb(
                connection
            );

        const [
            result,
        ] =
            await db.query(
                `
                INSERT INTO products
                (
                    category_id,
                    brand_id,

                    name,
                    slug,
                    sku,

                    description,
                    short_description,

                    price,
                    sale_price,

                    thumbnail,

                    gender,
                    status,
                    is_featured
                )

                VALUES
                (
                    ?, ?,
                    ?, ?, ?,
                    ?, ?,
                    ?, ?,
                    ?,
                    ?, ?, ?
                )
                `,
                [
                    data.categoryId,
                    data.brandId,

                    data.name,
                    data.slug,
                    data.sku,

                    data.description,
                    data.shortDescription,

                    data.price,
                    data.salePrice,

                    data.thumbnail,

                    data.gender,
                    data.status,
                    data.isFeatured
                        ? 1
                        : 0,
                ]
            );

        return (
            result.insertId
        );
    };

// ============================================================
// UPDATE PRODUCT
// ============================================================

const updateProduct =
    async (
        productId,
        data,
        connection
    ) => {
        const db =
            getDb(
                connection
            );

        await db.query(
            `
            UPDATE products

            SET
                category_id = ?,
                brand_id = ?,

                name = ?,
                slug = ?,
                sku = ?,

                description = ?,
                short_description = ?,

                price = ?,
                sale_price = ?,

                thumbnail = ?,

                gender = ?,
                status = ?,
                is_featured = ?,

                updated_at = CURRENT_TIMESTAMP

            WHERE
                id = ?
            `,
            [
                data.categoryId,
                data.brandId,

                data.name,
                data.slug,
                data.sku,

                data.description,
                data.shortDescription,

                data.price,
                data.salePrice,

                data.thumbnail,

                data.gender,
                data.status,
                data.isFeatured
                    ? 1
                    : 0,

                productId,
            ]
        );
    };

// ============================================================
// STATUS
// ============================================================

const updateStatus =
    async (
        productId,
        status,
        connection
    ) => {
        const db =
            getDb(
                connection
            );

        await db.query(
            `
            UPDATE products

            SET
                status = ?,
                updated_at =
                    CURRENT_TIMESTAMP

            WHERE
                id = ?
            `,
            [
                status,
                productId,
            ]
        );
    };

// ============================================================
// IMAGES
// ============================================================

const replaceImages =
    async (
        productId,
        images,
        connection
    ) => {
        const db =
            getDb(
                connection
            );

        await db.query(
            `
            DELETE FROM product_images
            WHERE product_id = ?
            `,
            [
                productId,
            ]
        );

        for (
            const image
            of images
        ) {
            await db.query(
                `
                INSERT INTO product_images
                (
                    product_id,
                    image_url,
                    is_main,
                    sort_order
                )

                VALUES (?, ?, ?, ?)
                `,
                [
                    productId,
                    image.imageUrl,
                    image.isMain
                        ? 1
                        : 0,
                    image.sortOrder,
                ]
            );
        }
    };

// ============================================================
// VARIANT
// ============================================================

const findVariantById =
    async (
        variantId,
        connection
    ) => {
        const db =
            getDb(
                connection
            );

        const [
            rows,
        ] =
            await db.query(
                `
                SELECT *
                FROM product_variants

                WHERE id = ?

                LIMIT 1
                `,
                [
                    variantId,
                ]
            );

        return (
            rows[0] ||
            null
        );
    };

const createVariant =
    async (
        productId,
        variant,
        connection
    ) => {
        const db =
            getDb(
                connection
            );

        const [
            result,
        ] =
            await db.query(
                `
                INSERT INTO product_variants
                (
                    product_id,
                    size_id,
                    color_id,

                    sku,
                    price_adjustment,
                    stock_quantity,

                    status
                )

                VALUES
                (
                    ?, ?, ?,
                    ?, ?, ?,
                    ?
                )
                `,
                [
                    productId,

                    variant.sizeId,
                    variant.colorId,

                    variant.sku,
                    variant.priceAdjustment,
                    variant.stockQuantity,

                    variant.status,
                ]
            );

        return (
            result.insertId
        );
    };

const updateVariant =
    async (
        variantId,
        variant,
        connection
    ) => {
        const db =
            getDb(
                connection
            );

        await db.query(
            `
            UPDATE product_variants

            SET
                size_id = ?,
                color_id = ?,

                sku = ?,
                price_adjustment = ?,
                stock_quantity = ?,

                status = ?,

                updated_at =
                    CURRENT_TIMESTAMP

            WHERE
                id = ?
            `,
            [
                variant.sizeId,
                variant.colorId,

                variant.sku,
                variant.priceAdjustment,
                variant.stockQuantity,

                variant.status,

                variantId,
            ]
        );
    };

const deactivateVariantsExcept =
    async (
        productId,
        keepIds,
        connection
    ) => {
        const db =
            getDb(
                connection
            );

        if (
            keepIds.length ===
            0
        ) {
            await db.query(
                `
                UPDATE product_variants

                SET
                    status = 'inactive'

                WHERE
                    product_id = ?
                `,
                [
                    productId,
                ]
            );

            return;
        }

        const placeholders =
            keepIds
                .map(
                    () => "?"
                )
                .join(
                    ", "
                );

        await db.query(
            `
            UPDATE product_variants

            SET
                status = 'inactive'

            WHERE
                product_id = ?

                AND id NOT IN
                (
                    ${placeholders}
                )
            `,
            [
                productId,
                ...keepIds,
            ]
        );
    };

// ============================================================
// EXPORT
// ============================================================

module.exports = {
    getProducts,

    findById,
    getImages,
    getVariants,

    findBySlug,
    findBySku,

    referenceExists,

    createProduct,
    updateProduct,
    updateStatus,

    replaceImages,

    findVariantById,
    createVariant,
    updateVariant,
    deactivateVariantsExcept,
};