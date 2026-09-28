const {
    pool,
} = require(
    "../config/db"
);

// ============================================================
// GET COLORS
// ============================================================

const getColors =
    async ({
        search = "",
        status = "",
    } = {}) => {
        const conditions = [];
        const params = [];

        if (search) {
            conditions.push(
                "c.name LIKE ?"
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
                "c.status = ?"
            );

            params.push(
                status
            );
        }

        const where =
            conditions.length
                ? `WHERE ${conditions.join(
                      " AND "
                  )}`
                : "";

        const [rows] =
            await pool.query(
                `
                SELECT
                    c.id,
                    c.name,
                    c.hex_code,
                    c.status,
                    COUNT(pv.id) AS variant_count

                FROM colors c

                LEFT JOIN product_variants pv
                    ON pv.color_id = c.id

                ${where}

                GROUP BY
                    c.id,
                    c.name,
                    c.hex_code,
                    c.status

                ORDER BY c.name ASC
                `,
                params
            );

        return rows;
    };

// ============================================================
// GET BY ID
// ============================================================

const getColorById =
    async (
        id
    ) => {
        const [rows] =
            await pool.query(
                `
                SELECT
                    c.id,
                    c.name,
                    c.hex_code,
                    c.status,
                    COUNT(pv.id) AS variant_count

                FROM colors c

                LEFT JOIN product_variants pv
                    ON pv.color_id = c.id

                WHERE c.id = ?

                GROUP BY
                    c.id,
                    c.name,
                    c.hex_code,
                    c.status

                LIMIT 1
                `,
                [
                    id,
                ]
            );

        return (
            rows[0] ||
            null
        );
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
            SELECT id
            FROM colors
            WHERE name = ?
        `;

        const params = [
            name,
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

        const [rows] =
            await pool.query(
                sql,
                params
            );

        return (
            rows[0] ||
            null
        );
    };

// ============================================================
// CREATE
// ============================================================

const createColor =
    async ({
        name,
        hex_code,
        status,
    }) => {
        const [result] =
            await pool.query(
                `
                INSERT INTO colors
                (
                    name,
                    hex_code,
                    status
                )
                VALUES (?, ?, ?)
                `,
                [
                    name,
                    hex_code,
                    status,
                ]
            );

        return result.insertId;
    };

// ============================================================
// UPDATE
// ============================================================

const updateColor =
    async (
        id,
        {
            name,
            hex_code,
            status,
        }
    ) => {
        await pool.query(
            `
            UPDATE colors

            SET
                name = ?,
                hex_code = ?,
                status = ?

            WHERE id = ?
            `,
            [
                name,
                hex_code,
                status,
                id,
            ]
        );
    };

// ============================================================
// UPDATE STATUS
// ============================================================

const updateStatus =
    async (
        id,
        status
    ) => {
        await pool.query(
            `
            UPDATE colors
            SET status = ?
            WHERE id = ?
            `,
            [
                status,
                id,
            ]
        );
    };

// ============================================================
// COUNT VARIANTS
// ============================================================

const countVariants =
    async (
        id
    ) => {
        const [rows] =
            await pool.query(
                `
                SELECT COUNT(*) AS total

                FROM product_variants

                WHERE color_id = ?
                `,
                [
                    id,
                ]
            );

        return Number(
            rows[0]
                ?.total || 0
        );
    };

// ============================================================
// DELETE
// ============================================================

const deleteColor =
    async (
        id
    ) => {
        await pool.query(
            `
            DELETE FROM colors
            WHERE id = ?
            `,
            [
                id,
            ]
        );
    };

// ============================================================
// EXPORT
// ============================================================

module.exports = {
    getColors,
    getColorById,
    findByName,
    createColor,
    updateColor,
    updateStatus,
    countVariants,
    deleteColor,
};