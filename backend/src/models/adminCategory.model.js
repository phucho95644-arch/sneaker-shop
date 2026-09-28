const { pool } = require("../config/db");

// ============================================================
// GET CATEGORIES
// ============================================================

const getCategories = async ({
    search = "",
    status = "",
} = {}) => {
    const conditions = [];
    const params = [];

    if (search) {
        conditions.push(
            "(c.name LIKE ? OR c.slug LIKE ?)"
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
            "c.status = ?"
        );

        params.push(status);
    }

    const whereClause =
        conditions.length > 0
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

    const [rows] =
        await pool.query(
            `
            SELECT
                c.id,
                c.name,
                c.slug,
                c.description,
                c.image,
                c.status,
                c.created_at,
                c.updated_at,

                COUNT(p.id) AS product_count

            FROM categories c

            LEFT JOIN products p
                ON p.category_id = c.id

            ${whereClause}

            GROUP BY
                c.id,
                c.name,
                c.slug,
                c.description,
                c.image,
                c.status,
                c.created_at,
                c.updated_at

            ORDER BY
                c.id DESC
            `,
            params
        );

    return rows;
};

// ============================================================
// GET BY ID
// ============================================================

const getCategoryById =
    async (id) => {
        const [rows] =
            await pool.query(
                `
                SELECT
                    c.id,
                    c.name,
                    c.slug,
                    c.description,
                    c.image,
                    c.status,
                    c.created_at,
                    c.updated_at,

                    COUNT(p.id) AS product_count

                FROM categories c

                LEFT JOIN products p
                    ON p.category_id = c.id

                WHERE c.id = ?

                GROUP BY
                    c.id,
                    c.name,
                    c.slug,
                    c.description,
                    c.image,
                    c.status,
                    c.created_at,
                    c.updated_at

                LIMIT 1
                `,
                [id]
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

            FROM categories

            WHERE slug = ?
        `;

        const params = [slug];

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

const createCategory =
    async ({
        name,
        slug,
        description,
        image,
        status,
    }) => {
        const [result] =
            await pool.query(
                `
                INSERT INTO categories
                (
                    name,
                    slug,
                    description,
                    image,
                    status
                )

                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    name,
                    slug,
                    description,
                    image,
                    status,
                ]
            );

        return result.insertId;
    };

// ============================================================
// UPDATE
// ============================================================

const updateCategory =
    async (
        id,
        {
            name,
            slug,
            description,
            image,
            status,
        }
    ) => {
        const [result] =
            await pool.query(
                `
                UPDATE categories

                SET
                    name = ?,
                    slug = ?,
                    description = ?,
                    image = ?,
                    status = ?,
                    updated_at = CURRENT_TIMESTAMP

                WHERE id = ?
                `,
                [
                    name,
                    slug,
                    description,
                    image,
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
                UPDATE categories

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
    async (categoryId) => {
        const [rows] =
            await pool.query(
                `
                SELECT
                    COUNT(*) AS total

                FROM products

                WHERE category_id = ?
                `,
                [categoryId]
            );

        return Number(
            rows[0]?.total || 0
        );
    };

// ============================================================
// DELETE
// ============================================================

const deleteCategory =
    async (id) => {
        const [result] =
            await pool.query(
                `
                DELETE FROM categories
                WHERE id = ?
                `,
                [id]
            );

        return result.affectedRows > 0;
    };

module.exports = {
    getCategories,
    getCategoryById,
    findBySlug,
    createCategory,
    updateCategory,
    updateStatus,
    countProducts,
    deleteCategory,
};