const { pool } = require("../config/db");

// ============================================================
// GET BRANDS
// ============================================================

const getBrands = async ({
    search = "",
    status = "",
} = {}) => {
    const conditions = [];
    const params = [];

    if (search) {
        conditions.push(
            "(b.name LIKE ? OR b.slug LIKE ?)"
        );

        const keyword = `%${search}%`;

        params.push(
            keyword,
            keyword
        );
    }

    if (
        status === "active" ||
        status === "inactive"
    ) {
        conditions.push(
            "b.status = ?"
        );

        params.push(status);
    }

    const whereClause =
        conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

    const [rows] =
        await pool.query(
            `
            SELECT
                b.id,
                b.name,
                b.slug,
                b.logo,
                b.description,
                b.status,
                b.created_at,
                b.updated_at,

                COUNT(p.id) AS product_count

            FROM brands b

            LEFT JOIN products p
                ON p.brand_id = b.id

            ${whereClause}

            GROUP BY
                b.id,
                b.name,
                b.slug,
                b.logo,
                b.description,
                b.status,
                b.created_at,
                b.updated_at

            ORDER BY
                b.id DESC
            `,
            params
        );

    return rows;
};

// ============================================================
// GET BY ID
// ============================================================

const getBrandById =
    async (id) => {
        const [rows] =
            await pool.query(
                `
                SELECT
                    b.id,
                    b.name,
                    b.slug,
                    b.logo,
                    b.description,
                    b.status,
                    b.created_at,
                    b.updated_at,

                    COUNT(p.id) AS product_count

                FROM brands b

                LEFT JOIN products p
                    ON p.brand_id = b.id

                WHERE b.id = ?

                GROUP BY
                    b.id,
                    b.name,
                    b.slug,
                    b.logo,
                    b.description,
                    b.status,
                    b.created_at,
                    b.updated_at

                LIMIT 1
                `,
                [id]
            );

        return rows[0] || null;
    };

// ============================================================
// FIND BY NAME
// ============================================================

const findByName =
    async (
        name,
        excludeId = null
    ) => {
        let sql = `
            SELECT
                id,
                name,
                slug

            FROM brands

            WHERE name = ?
        `;

        const params = [
            name,
        ];

        if (excludeId) {
            sql += `
                AND id <> ?
            `;

            params.push(
                excludeId
            );
        }

        sql += `
            LIMIT 1
        `;

        const [rows] =
            await pool.query(
                sql,
                params
            );

        return rows[0] || null;
    };

// ============================================================
// FIND BY SLUG
// ============================================================

const findBySlug =
    async (
        slug,
        excludeId = null
    ) => {
        let sql = `
            SELECT
                id,
                name,
                slug

            FROM brands

            WHERE slug = ?
        `;

        const params = [
            slug,
        ];

        if (excludeId) {
            sql += `
                AND id <> ?
            `;

            params.push(
                excludeId
            );
        }

        sql += `
            LIMIT 1
        `;

        const [rows] =
            await pool.query(
                sql,
                params
            );

        return rows[0] || null;
    };

// ============================================================
// CREATE
// ============================================================

const createBrand =
    async ({
        name,
        slug,
        logo,
        description,
        status,
    }) => {
        const [result] =
            await pool.query(
                `
                INSERT INTO brands
                (
                    name,
                    slug,
                    logo,
                    description,
                    status
                )

                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    name,
                    slug,
                    logo,
                    description,
                    status,
                ]
            );

        return result.insertId;
    };

// ============================================================
// UPDATE
// ============================================================

const updateBrand =
    async (
        id,
        {
            name,
            slug,
            logo,
            description,
            status,
        }
    ) => {
        const [result] =
            await pool.query(
                `
                UPDATE brands

                SET
                    name = ?,
                    slug = ?,
                    logo = ?,
                    description = ?,
                    status = ?,
                    updated_at = CURRENT_TIMESTAMP

                WHERE id = ?
                `,
                [
                    name,
                    slug,
                    logo,
                    description,
                    status,
                    id,
                ]
            );

        return result.affectedRows > 0;
    };

// ============================================================
// UPDATE STATUS
// ============================================================

const updateStatus =
    async (
        id,
        status
    ) => {
        const [result] =
            await pool.query(
                `
                UPDATE brands

                SET
                    status = ?,
                    updated_at = CURRENT_TIMESTAMP

                WHERE id = ?
                `,
                [
                    status,
                    id,
                ]
            );

        return result.affectedRows > 0;
    };

// ============================================================
// PRODUCT COUNT
// ============================================================

const countProducts =
    async (brandId) => {
        const [rows] =
            await pool.query(
                `
                SELECT
                    COUNT(*) AS total

                FROM products

                WHERE brand_id = ?
                `,
                [brandId]
            );

        return Number(
            rows[0]?.total || 0
        );
    };

// ============================================================
// DELETE
// ============================================================

const deleteBrand =
    async (id) => {
        const [result] =
            await pool.query(
                `
                DELETE FROM brands
                WHERE id = ?
                `,
                [id]
            );

        return result.affectedRows > 0;
    };

module.exports = {
    getBrands,
    getBrandById,

    findByName,
    findBySlug,

    createBrand,
    updateBrand,
    updateStatus,

    countProducts,
    deleteBrand,
};