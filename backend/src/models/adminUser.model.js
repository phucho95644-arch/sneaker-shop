const { pool } = require("../config/db");

const SORT_MAP = {
    newest: "u.created_at DESC",
    oldest: "u.created_at ASC",
    name_asc: "u.full_name ASC",
    name_desc: "u.full_name DESC",
    email_asc: "u.email ASC",
    email_desc: "u.email DESC",
};

const getExecutor = (connection) => connection || pool;

// ============================================================
// GET USERS
// ============================================================
exports.findAll = async ({
    page = 1,
    limit = 20,
    search = "",
    role = "",
    status = "",
    sort = "newest",
}) => {
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    if (search) {
        conditions.push(`
            (
                u.full_name LIKE ?
                OR u.email LIKE ?
                OR u.phone LIKE ?
            )
        `);

        const keyword = `%${search}%`;

        params.push(
            keyword,
            keyword,
            keyword
        );
    }

    if (role) {
        conditions.push("u.role = ?");
        params.push(role);
    }

    if (status) {
        conditions.push("u.status = ?");
        params.push(status);
    }

    const whereClause =
        conditions.length > 0
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

    const orderBy =
        SORT_MAP[sort] ||
        SORT_MAP.newest;

    const safeLimit = Math.min(
        Math.max(Number(limit) || 20, 1),
        100
    );

    const safeOffset = Math.max(
        Number(offset) || 0,
        0
    );

    const [rows] = await pool.query(
        `
        SELECT
            u.id,
            u.full_name,
            u.email,
            u.phone,
            u.avatar,
            u.role,
            u.status,
            u.created_at,
            u.updated_at,

            COUNT(o.id) AS total_orders,

            COUNT(
                CASE
                    WHEN o.order_status = 'delivered'
                    THEN 1
                END
            ) AS delivered_orders,

            COALESCE(
                SUM(
                    CASE
                        WHEN
                            o.order_status = 'delivered'
                            AND o.payment_status = 'paid'
                        THEN o.total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_spent

        FROM users u

        LEFT JOIN orders o
            ON o.user_id = u.id

        ${whereClause}

        GROUP BY
            u.id,
            u.full_name,
            u.email,
            u.phone,
            u.avatar,
            u.role,
            u.status,
            u.created_at,
            u.updated_at

        ORDER BY ${orderBy}

        LIMIT ${safeLimit}
        OFFSET ${safeOffset}
        `,
        params
    );

    const [countRows] = await pool.query(
        `
        SELECT
            COUNT(*) AS total

        FROM users u

        ${whereClause}
        `,
        params
    );

    return {
        rows,
        total: Number(
            countRows[0]?.total || 0
        ),
    };
};

// ============================================================
// FIND USER BY ID
// ============================================================
exports.findById = async (
    userId,
    connection = null
) => {
    const executor =
        getExecutor(connection);

    const [rows] = await executor.query(
        `
        SELECT
            id,
            full_name,
            email,
            phone,
            avatar,
            role,
            status,
            created_at,
            updated_at

        FROM users

        WHERE id = ?

        LIMIT 1
        `,
        [userId]
    );

    return rows[0] || null;
};

// ============================================================
// LOCK USER
// ============================================================
exports.lockById = async (
    userId,
    connection
) => {
    const [rows] = await connection.query(
        `
        SELECT
            id,
            full_name,
            email,
            phone,
            avatar,
            role,
            status,
            created_at,
            updated_at

        FROM users

        WHERE id = ?

        LIMIT 1

        FOR UPDATE
        `,
        [userId]
    );

    return rows[0] || null;
};

// ============================================================
// LOCK ACTIVE ADMINS
// ============================================================
exports.lockActiveAdmins = async (
    connection
) => {
    const [rows] = await connection.query(
        `
        SELECT id

        FROM users

        WHERE
            role = 'admin'
            AND status = 'active'

        FOR UPDATE
        `
    );

    return rows;
};

// ============================================================
// ADDRESSES
// ============================================================
exports.getAddresses = async (
    userId
) => {
    const [rows] = await pool.query(
        `
        SELECT
            id,
            receiver_name,
            receiver_phone,
            province,
            district,
            ward,
            address_detail,
            is_default,
            created_at,
            updated_at

        FROM addresses

        WHERE user_id = ?

        ORDER BY
            is_default DESC,
            created_at DESC
        `,
        [userId]
    );

    return rows;
};

// ============================================================
// ORDER STATISTICS BY USER
// ============================================================
exports.getOrderStatistics = async (
    userId
) => {
    const [rows] = await pool.query(
        `
        SELECT
            COUNT(*) AS total_orders,

            COUNT(
                CASE
                    WHEN order_status = 'delivered'
                    THEN 1
                END
            ) AS delivered_orders,

            COUNT(
                CASE
                    WHEN order_status = 'cancelled'
                    THEN 1
                END
            ) AS cancelled_orders,

            COALESCE(
                SUM(
                    CASE
                        WHEN
                            order_status = 'delivered'
                            AND payment_status = 'paid'
                        THEN total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_spent

        FROM orders

        WHERE user_id = ?
        `,
        [userId]
    );

    return rows[0];
};

// ============================================================
// RECENT ORDERS BY USER
// ============================================================
exports.getRecentOrders = async (
    userId,
    limit = 5
) => {
    const safeLimit = Math.min(
        Math.max(Number(limit) || 5, 1),
        20
    );

    const [rows] = await pool.query(
        `
        SELECT
            id,
            order_code,
            total_amount,
            payment_method,
            payment_status,
            order_status,
            created_at

        FROM orders

        WHERE user_id = ?

        ORDER BY created_at DESC

        LIMIT ${safeLimit}
        `,
        [userId]
    );

    return rows;
};

// ============================================================
// REVIEW STATISTICS
// ============================================================
exports.getReviewStatistics = async (
    userId
) => {
    const [rows] = await pool.query(
        `
        SELECT
            COUNT(*) AS total_reviews,

            COUNT(
                CASE
                    WHEN status = 'approved'
                    THEN 1
                END
            ) AS approved_reviews,

            COUNT(
                CASE
                    WHEN status = 'pending'
                    THEN 1
                END
            ) AS pending_reviews,

            COUNT(
                CASE
                    WHEN status = 'hidden'
                    THEN 1
                END
            ) AS hidden_reviews

        FROM reviews

        WHERE user_id = ?
        `,
        [userId]
    );

    return rows[0];
};

// ============================================================
// FAVORITE COUNT
// ============================================================
exports.getFavoriteCount = async (
    userId
) => {
    const [rows] = await pool.query(
        `
        SELECT
            COUNT(*) AS total

        FROM favorites

        WHERE user_id = ?
        `,
        [userId]
    );

    return Number(
        rows[0]?.total || 0
    );
};

// ============================================================
// UPDATE USER STATUS
// ============================================================
exports.updateStatus = async (
    userId,
    status,
    connection = null
) => {
    const executor =
        getExecutor(connection);

    const [result] = await executor.query(
        `
        UPDATE users

        SET status = ?

        WHERE id = ?
        `,
        [
            status,
            userId,
        ]
    );

    return result.affectedRows;
};

// ============================================================
// UPDATE USER ROLE
// ============================================================
exports.updateRole = async (
    userId,
    role,
    connection = null
) => {
    const executor =
        getExecutor(connection);

    const [result] = await executor.query(
        `
        UPDATE users

        SET role = ?

        WHERE id = ?
        `,
        [
            role,
            userId,
        ]
    );

    return result.affectedRows;
};