const { pool } = require("../config/db");

// ============================================================
// LIST
// ============================================================

const getSizes = async ({
    search = "",
    status = "",
} = {}) => {
    const conditions = [];
    const params = [];

    if (search) {
        conditions.push(
            "s.size_name LIKE ?"
        );

        params.push(
            `%${search}%`
        );
    }

    if (
        status === "active" ||
        status === "inactive"
    ) {
        conditions.push(
            "s.status = ?"
        );

        params.push(status);
    }

    const where =
        conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

    const [rows] =
        await pool.query(
            `
            SELECT
                s.id,
                s.size_name,
                s.sort_order,
                s.status,
                COUNT(pv.id) AS variant_count

            FROM sizes s

            LEFT JOIN product_variants pv
                ON pv.size_id = s.id

            ${where}

            GROUP BY
                s.id,
                s.size_name,
                s.sort_order,
                s.status

            ORDER BY
                s.sort_order ASC,
                s.id ASC
            `,
            params
        );

    return rows;
};

// ============================================================
// DETAIL
// ============================================================

const getSizeById =
    async (id) => {
        const [rows] =
            await pool.query(
                `
                SELECT
                    s.id,
                    s.size_name,
                    s.sort_order,
                    s.status,
                    COUNT(pv.id) AS variant_count

                FROM sizes s

                LEFT JOIN product_variants pv
                    ON pv.size_id = s.id

                WHERE s.id = ?

                GROUP BY
                    s.id,
                    s.size_name,
                    s.sort_order,
                    s.status

                LIMIT 1
                `,
                [id]
            );

        return rows[0] || null;
    };

// ============================================================
// FIND NAME
// ============================================================

const findByName =
    async (
        sizeName,
        excludeId = null
    ) => {
        let sql = `
            SELECT id
            FROM sizes
            WHERE size_name = ?
        `;

        const params = [
            sizeName,
        ];

        if (excludeId) {
            sql += `
                AND id <> ?
            `;

            params.push(
                excludeId
            );
        }

        sql += " LIMIT 1";

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

const createSize =
    async ({
        sizeName,
        sortOrder,
        status,
    }) => {
        const [result] =
            await pool.query(
                `
                INSERT INTO sizes
                (
                    size_name,
                    sort_order,
                    status
                )
                VALUES (?, ?, ?)
                `,
                [
                    sizeName,
                    sortOrder,
                    status,
                ]
            );

        return result.insertId;
    };

// ============================================================
// UPDATE
// ============================================================

const updateSize =
    async (
        id,
        {
            sizeName,
            sortOrder,
            status,
        }
    ) => {
        const [result] =
            await pool.query(
                `
                UPDATE sizes

                SET
                    size_name = ?,
                    sort_order = ?,
                    status = ?

                WHERE id = ?
                `,
                [
                    sizeName,
                    sortOrder,
                    status,
                    id,
                ]
            );

        return (
            result.affectedRows >
            0
        );
    };

// ============================================================
// STATUS
// ============================================================

const updateStatus =
    async (
        id,
        status
    ) => {
        const [result] =
            await pool.query(
                `
                UPDATE sizes
                SET status = ?
                WHERE id = ?
                `,
                [
                    status,
                    id,
                ]
            );

        return (
            result.affectedRows >
            0
        );
    };

// ============================================================
// DEPENDENCIES
// ============================================================

const countVariants =
    async (sizeId) => {
        const [rows] =
            await pool.query(
                `
                SELECT
                    COUNT(*) AS total

                FROM product_variants

                WHERE size_id = ?
                `,
                [sizeId]
            );

        return Number(
            rows[0]?.total || 0
        );
    };

// ============================================================
// DELETE
// ============================================================

const deleteSize =
    async (id) => {
        const [result] =
            await pool.query(
                `
                DELETE FROM sizes
                WHERE id = ?
                `,
                [id]
            );

        return (
            result.affectedRows >
            0
        );
    };

module.exports = {
    getSizes,
    getSizeById,
    findByName,
    createSize,
    updateSize,
    updateStatus,
    countVariants,
    deleteSize,
};