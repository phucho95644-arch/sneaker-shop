const { pool } = require(
    "../config/db"
);

// ============================================================
// DATE FILTER
// ============================================================
const buildDateFilter = (
    column,
    fromDate,
    toDate
) => {
    const conditions = [];
    const params = [];

    if (fromDate) {
        conditions.push(
            `${column} >= ?`
        );

        params.push(
            `${fromDate} 00:00:00`
        );
    }

    if (toDate) {
        conditions.push(
            `${column} < DATE_ADD(?, INTERVAL 1 DAY)`
        );

        params.push(
            `${toDate} 00:00:00`
        );
    }

    return {
        conditions,
        params,
    };
};

// ============================================================
// DASHBOARD USERS
// ============================================================
exports.getUserOverview = async () => {
    const [rows] = await pool.query(`
        SELECT
            COUNT(
                CASE
                    WHEN role = 'customer'
                    THEN 1
                END
            ) AS total_customers,

            COUNT(
                CASE
                    WHEN role = 'customer'
                    AND status = 'active'
                    THEN 1
                END
            ) AS active_customers,

            COUNT(
                CASE
                    WHEN role = 'customer'
                    AND status = 'inactive'
                    THEN 1
                END
            ) AS inactive_customers,

            COUNT(
                CASE
                    WHEN role = 'customer'
                    AND status = 'blocked'
                    THEN 1
                END
            ) AS blocked_customers,

            COUNT(
                CASE
                    WHEN role = 'customer'
                    AND DATE(created_at) = CURDATE()
                    THEN 1
                END
            ) AS new_today,

            COUNT(
                CASE
                    WHEN role = 'customer'
                    AND YEAR(created_at) = YEAR(CURDATE())
                    AND WEEK(created_at, 1) = WEEK(CURDATE(), 1)
                    THEN 1
                END
            ) AS new_this_week,

            COUNT(
                CASE
                    WHEN role = 'customer'
                    AND YEAR(created_at) = YEAR(CURDATE())
                    AND MONTH(created_at) = MONTH(CURDATE())
                    THEN 1
                END
            ) AS new_this_month

        FROM users
    `);

    return rows[0];
};

// ============================================================
// DASHBOARD PRODUCTS
// ============================================================
exports.getProductOverview = async (
    lowStockThreshold = 5
) => {
    const [productRows] =
        await pool.query(`
            SELECT
                COUNT(*) AS total_products,

                COUNT(
                    CASE
                        WHEN status = 'active'
                        THEN 1
                    END
                ) AS active_products,

                COUNT(
                    CASE
                        WHEN status = 'inactive'
                        THEN 1
                    END
                ) AS inactive_products,

                COUNT(
                    CASE
                        WHEN status = 'draft'
                        THEN 1
                    END
                ) AS draft_products

            FROM products
        `);

    const [variantRows] =
        await pool.query(
            `
            SELECT
                COUNT(*) AS total_variants,

                COALESCE(
                    SUM(stock_quantity),
                    0
                ) AS total_stock,

                COUNT(
                    CASE
                        WHEN stock_quantity > 0
                        AND stock_quantity <= ?
                        THEN 1
                    END
                ) AS low_stock_variants,

                COUNT(
                    CASE
                        WHEN stock_quantity = 0
                        THEN 1
                    END
                ) AS out_of_stock_variants

            FROM product_variants
            `,
            [lowStockThreshold]
        );

    return {
        ...productRows[0],
        ...variantRows[0],
    };
};

// ============================================================
// DASHBOARD ORDERS
// ============================================================
exports.getOrderOverview = async () => {
    const [rows] = await pool.query(`
        SELECT
            COUNT(*) AS total_orders,

            COUNT(
                CASE
                    WHEN order_status = 'pending'
                    THEN 1
                END
            ) AS pending,

            COUNT(
                CASE
                    WHEN order_status = 'confirmed'
                    THEN 1
                END
            ) AS confirmed,

            COUNT(
                CASE
                    WHEN order_status = 'processing'
                    THEN 1
                END
            ) AS processing,

            COUNT(
                CASE
                    WHEN order_status = 'shipping'
                    THEN 1
                END
            ) AS shipping,

            COUNT(
                CASE
                    WHEN order_status = 'delivered'
                    THEN 1
                END
            ) AS delivered,

            COUNT(
                CASE
                    WHEN order_status = 'cancelled'
                    THEN 1
                END
            ) AS cancelled

        FROM orders
    `);

    return rows[0];
};

// ============================================================
// DASHBOARD REVENUE
// ============================================================
exports.getRevenueOverview = async () => {
    const [rows] = await pool.query(`
        SELECT
            COALESCE(
                SUM(
                    CASE
                        WHEN DATE(created_at) = CURDATE()
                        THEN total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS today,

            COALESCE(
                SUM(
                    CASE
                        WHEN
                            YEAR(created_at) = YEAR(CURDATE())
                            AND MONTH(created_at) = MONTH(CURDATE())
                        THEN total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS this_month,

            COALESCE(
                SUM(
                    CASE
                        WHEN YEAR(created_at) = YEAR(CURDATE())
                        THEN total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS this_year

        FROM orders

        WHERE
            order_status = 'delivered'
            AND payment_status = 'paid'
    `);

    return rows[0];
};

// ============================================================
// REVIEW OVERVIEW
// ============================================================
exports.getReviewOverview = async () => {
    const [rows] = await pool.query(`
        SELECT
            COUNT(*) AS total,

            COUNT(
                CASE
                    WHEN status = 'pending'
                    THEN 1
                END
            ) AS pending,

            COUNT(
                CASE
                    WHEN status = 'approved'
                    THEN 1
                END
            ) AS approved,

            COUNT(
                CASE
                    WHEN status = 'hidden'
                    THEN 1
                END
            ) AS hidden

        FROM reviews
    `);

    return rows[0];
};

// ============================================================
// RECENT ORDERS
// ============================================================
exports.getRecentOrders = async (
    limit = 10
) => {
    const safeLimit = Math.min(
        Math.max(
            Number(limit) || 10,
            1
        ),
        50
    );

    const [rows] = await pool.query(`
        SELECT
            o.id,
            o.order_code,
            o.receiver_name,
            o.receiver_phone,
            o.total_amount,
            o.payment_method,
            o.payment_status,
            o.order_status,
            o.created_at,

            u.id AS user_id,
            u.full_name,
            u.email,
            u.avatar

        FROM orders o

        LEFT JOIN users u
            ON o.user_id = u.id

        ORDER BY
            o.created_at DESC

        LIMIT ${safeLimit}
    `);

    return rows;
};

// ============================================================
// LOW STOCK
// ============================================================
exports.getLowStock = async (
    threshold = 5,
    limit = 10
) => {
    const safeThreshold =
        Math.max(
            Number(threshold) || 5,
            0
        );

    const safeLimit =
        Math.min(
            Math.max(
                Number(limit) || 10,
                1
            ),
            100
        );

    const [rows] = await pool.query(
        `
        SELECT
            pv.id AS variant_id,
            pv.sku,
            pv.stock_quantity,
            pv.status AS variant_status,

            p.id AS product_id,
            p.name AS product_name,
            p.thumbnail,

            s.id AS size_id,
            s.size_name,

            c.id AS color_id,
            c.name AS color_name,
            c.hex_code

        FROM product_variants pv

        INNER JOIN products p
            ON pv.product_id = p.id

        INNER JOIN sizes s
            ON pv.size_id = s.id

        INNER JOIN colors c
            ON pv.color_id = c.id

        WHERE
            pv.stock_quantity <= ?

        ORDER BY
            pv.stock_quantity ASC,
            p.name ASC

        LIMIT ${safeLimit}
        `,
        [safeThreshold]
    );

    return rows;
};

// ============================================================
// REVENUE STATISTICS
// ============================================================
exports.getRevenueStatistics = async ({
    period = "day",
    fromDate,
    toDate,
}) => {
    // ========================================================
    // PERIOD EXPRESSION
    //
    // QUAN TRỌNG:
    // SELECT và GROUP BY dùng CHÍNH XÁC cùng một expression
    // để tương thích MySQL ONLY_FULL_GROUP_BY.
    // ========================================================

    const PERIOD_MAP = {
        day:
            "DATE(o.created_at)",

        week: `
            CONCAT(
                YEARWEEK(o.created_at, 3) DIV 100,
                '-W',
                LPAD(
                    YEARWEEK(o.created_at, 3) % 100,
                    2,
                    '0'
                )
            )
        `,

        month:
            "DATE_FORMAT(o.created_at, '%Y-%m')",

        year:
            "DATE_FORMAT(o.created_at, '%Y')",
    };

    const expression =
        PERIOD_MAP[period] ||
        PERIOD_MAP.day;

    // ========================================================
    // DATE FILTER
    // ========================================================

    const dateFilter =
        buildDateFilter(
            "o.created_at",
            fromDate,
            toDate
        );

    // ========================================================
    // WHERE
    // ========================================================

    const whereParts = [
        "o.order_status = 'delivered'",
        "o.payment_status = 'paid'",
        ...dateFilter.conditions,
    ];

    // ========================================================
    // QUERY
    // ========================================================

    const [rows] =
        await pool.query(
            `
            SELECT
                ${expression} AS label,

                COUNT(
                    DISTINCT o.id
                ) AS orders,

                COALESCE(
                    SUM(
                        o.total_amount
                    ),
                    0
                ) AS revenue

            FROM orders o

            WHERE
                ${whereParts.join(
                    " AND "
                )}

            GROUP BY
                ${expression}

            ORDER BY
                MIN(
                    o.created_at
                ) ASC
            `,
            dateFilter.params
        );

    return rows;
};

// ============================================================
// ORDER STATISTICS
// ============================================================
exports.getOrderStatistics = async ({
    fromDate,
    toDate,
}) => {
    const dateFilter =
        buildDateFilter(
            "created_at",
            fromDate,
            toDate
        );

    const where =
        dateFilter.conditions.length
            ? `WHERE ${dateFilter.conditions.join(
                  " AND "
              )}`
            : "";

    const [rows] = await pool.query(
        `
        SELECT
            COUNT(*) AS total,

            COUNT(
                CASE
                    WHEN order_status = 'pending'
                    THEN 1
                END
            ) AS pending,

            COUNT(
                CASE
                    WHEN order_status = 'confirmed'
                    THEN 1
                END
            ) AS confirmed,

            COUNT(
                CASE
                    WHEN order_status = 'processing'
                    THEN 1
                END
            ) AS processing,

            COUNT(
                CASE
                    WHEN order_status = 'shipping'
                    THEN 1
                END
            ) AS shipping,

            COUNT(
                CASE
                    WHEN order_status = 'delivered'
                    THEN 1
                END
            ) AS delivered,

            COUNT(
                CASE
                    WHEN order_status = 'cancelled'
                    THEN 1
                END
            ) AS cancelled

        FROM orders

        ${where}
        `,
        dateFilter.params
    );

    return rows[0];
};

// ============================================================
// TOP SELLING PRODUCTS
// ============================================================
exports.getTopProducts = async ({
    limit = 10,
    fromDate,
    toDate,
}) => {
    const safeLimit =
        Math.min(
            Math.max(
                Number(limit) || 10,
                1
            ),
            100
        );

    const dateFilter =
        buildDateFilter(
            "o.created_at",
            fromDate,
            toDate
        );

    const whereParts = [
        "o.order_status = 'delivered'",
        "o.payment_status = 'paid'",
        ...dateFilter.conditions,
    ];

    const [rows] = await pool.query(
        `
        SELECT
            oi.product_id,

            MAX(
                oi.product_name
            ) AS product_name,

            MAX(
                p.thumbnail
            ) AS thumbnail,

            SUM(
                oi.quantity
            ) AS quantity_sold,

            COALESCE(
                SUM(
                    oi.subtotal
                ),
                0
            ) AS revenue

        FROM order_items oi

        INNER JOIN orders o
            ON oi.order_id = o.id

        LEFT JOIN products p
            ON oi.product_id = p.id

        WHERE
            ${whereParts.join(" AND ")}

        GROUP BY
            oi.product_id

        ORDER BY
            quantity_sold DESC,
            revenue DESC

        LIMIT ${safeLimit}
        `,
        dateFilter.params
    );

    return rows;
};

// ============================================================
// TOP CUSTOMERS
// ============================================================
exports.getTopCustomers = async (
    limit = 10
) => {
    const safeLimit =
        Math.min(
            Math.max(
                Number(limit) || 10,
                1
            ),
            100
        );

    const [rows] = await pool.query(`
        SELECT
            u.id,
            u.full_name,
            u.email,
            u.avatar,

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

        WHERE
            u.role = 'customer'

        GROUP BY
            u.id,
            u.full_name,
            u.email,
            u.avatar

        ORDER BY
            total_spent DESC,
            delivered_orders DESC

        LIMIT ${safeLimit}
    `);

    return rows;
};

// ============================================================
// CUSTOMER STATISTICS
// ============================================================
exports.getCustomerStatistics =
    async () => {
        const [rows] =
            await pool.query(`
                SELECT
                    COUNT(
                        CASE
                            WHEN role = 'customer'
                            THEN 1
                        END
                    ) AS total,

                    COUNT(
                        CASE
                            WHEN
                                role = 'customer'
                                AND status = 'active'
                            THEN 1
                        END
                    ) AS active,

                    COUNT(
                        CASE
                            WHEN
                                role = 'customer'
                                AND status = 'inactive'
                            THEN 1
                        END
                    ) AS inactive,

                    COUNT(
                        CASE
                            WHEN
                                role = 'customer'
                                AND status = 'blocked'
                            THEN 1
                        END
                    ) AS blocked,

                    COUNT(
                        CASE
                            WHEN
                                role = 'customer'
                                AND DATE(created_at) = CURDATE()
                            THEN 1
                        END
                    ) AS new_today,

                    COUNT(
                        CASE
                            WHEN
                                role = 'customer'
                                AND YEAR(created_at) = YEAR(CURDATE())
                                AND WEEK(created_at, 1) = WEEK(CURDATE(), 1)
                            THEN 1
                        END
                    ) AS new_this_week,

                    COUNT(
                        CASE
                            WHEN
                                role = 'customer'
                                AND YEAR(created_at) = YEAR(CURDATE())
                                AND MONTH(created_at) = MONTH(CURDATE())
                            THEN 1
                        END
                    ) AS new_this_month

                FROM users
            `);

        return rows[0];
    };

// ============================================================
// CUSTOMER GROWTH
// ============================================================
exports.getCustomerGrowth = async (
    period = "month"
) => {
    const PERIOD_MAP = {
        day:
            "DATE_FORMAT(created_at, '%Y-%m-%d')",

        week: `
            CONCAT(
                YEARWEEK(created_at, 3) DIV 100,
                '-W',
                LPAD(
                    YEARWEEK(created_at, 3) % 100,
                    2,
                    '0'
                )
            )
        `,

        month:
            "DATE_FORMAT(created_at, '%Y-%m')",

        year:
            "DATE_FORMAT(created_at, '%Y')",
    };

    const expression =
        PERIOD_MAP[period] ||
        PERIOD_MAP.month;

    const [rows] =
        await pool.query(`
            SELECT
                growth.label,
                COUNT(*) AS new_customers

            FROM (
                SELECT
                    ${expression} AS label

                FROM users

                WHERE
                    role = 'customer'
            ) AS growth

            GROUP BY
                growth.label

            ORDER BY
                growth.label ASC
        `);

    return rows;
};

// ============================================================
// SALES STATISTICS
// ============================================================
exports.getSalesStatistics = async ({
    period = "day",
    fromDate,
    toDate,
}) => {
    // ========================================================
    // PERIOD
    //
    // SELECT và GROUP BY dùng cùng một expression.
    // ========================================================

    const PERIOD_MAP = {
        day:
            "DATE(o.created_at)",

        week: `
            CONCAT(
                YEARWEEK(o.created_at, 3) DIV 100,
                '-W',
                LPAD(
                    YEARWEEK(o.created_at, 3) % 100,
                    2,
                    '0'
                )
            )
        `,

        month:
            "DATE_FORMAT(o.created_at, '%Y-%m')",

        year:
            "DATE_FORMAT(o.created_at, '%Y')",
    };

    const expression =
        PERIOD_MAP[period] ||
        PERIOD_MAP.day;

    // ========================================================
    // DATE FILTER
    // ========================================================

    const dateFilter =
        buildDateFilter(
            "o.created_at",
            fromDate,
            toDate
        );

    // ========================================================
    // CONDITIONS
    // ========================================================

    const whereParts = [
        "o.order_status = 'delivered'",
        "o.payment_status = 'paid'",
        ...dateFilter.conditions,
    ];

    // ========================================================
    // QUERY
    // ========================================================

    const [rows] =
        await pool.query(
            `
            SELECT
                ${expression} AS label,

                COUNT(
                    DISTINCT o.id
                ) AS orders,

                COALESCE(
                    SUM(
                        oi.quantity
                    ),
                    0
                ) AS items_sold,

                COALESCE(
                    SUM(
                        oi.subtotal
                    ),
                    0
                ) AS revenue

            FROM orders o

            INNER JOIN order_items oi
                ON oi.order_id = o.id

            WHERE
                ${whereParts.join(
                    " AND "
                )}

            GROUP BY
                ${expression}

            ORDER BY
                MIN(
                    o.created_at
                ) ASC
            `,
            dateFilter.params
        );

    return rows;
};