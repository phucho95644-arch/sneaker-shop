const { pool } = require("../config/db");

// ============================================================
// GET APPROVED REVIEWS BY PRODUCT
// ============================================================

const findApprovedByProduct = async (
    productId,
    page = 1,
    limit = 10,
    rating = null,
    sort = "newest"
) => {
    const safePage = Math.max(
        1,
        parseInt(page, 10) || 1
    );

    const safeLimit = Math.max(
        1,
        Math.min(
            100,
            parseInt(limit, 10) || 10
        )
    );

    const offset =
        (safePage - 1) * safeLimit;

    let orderBy =
        "r.created_at DESC";

    if (sort === "oldest") {
        orderBy =
            "r.created_at ASC";
    }

    if (sort === "rating_high") {
        orderBy =
            "r.rating DESC, r.created_at DESC";
    }

    if (sort === "rating_low") {
        orderBy =
            "r.rating ASC, r.created_at DESC";
    }

    let where =
        `
        r.product_id = ?
        AND r.status = "approved"
        `;

    const params = [
        Number(productId),
    ];

    if (
        rating !== null &&
        rating !== undefined
    ) {
        where +=
            " AND r.rating = ?";

        params.push(
            Number(rating)
        );
    }

    const [reviews] =
        await pool.query(
            `
            SELECT
                r.id,
                r.user_id,
                r.product_id,
                r.order_id,
                r.rating,
                r.comment,
                r.created_at,

                u.full_name,
                u.avatar,

                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM order_items oi

                        INNER JOIN product_variants pv
                            ON pv.id = oi.product_variant_id

                        WHERE oi.order_id = r.order_id
                          AND pv.product_id = r.product_id
                    )
                    THEN 1
                    ELSE 0
                END AS verifiedPurchase

            FROM reviews r

            INNER JOIN users u
                ON u.id = r.user_id

            WHERE ${where}

            ORDER BY ${orderBy}

            LIMIT ? OFFSET ?
            `,
            [
                ...params,
                safeLimit,
                offset,
            ]
        );

    return reviews;
};

// ============================================================
// COUNT APPROVED REVIEWS
// ============================================================

const countApprovedByProduct = async (
    productId,
    rating = null
) => {
    let where =
        `
        product_id = ?
        AND status = "approved"
        `;

    const params = [
        Number(productId),
    ];

    if (
        rating !== null &&
        rating !== undefined
    ) {
        where +=
            " AND rating = ?";

        params.push(
            Number(rating)
        );
    }

    const [rows] =
        await pool.query(
            `
            SELECT
                COUNT(*) AS count

            FROM reviews

            WHERE ${where}
            `,
            params
        );

    return Number(
        rows[0]?.count || 0
    );
};

// ============================================================
// RATING SUMMARY
// ============================================================

const getRatingSummary = async (
    productId
) => {
    const [rows] =
        await pool.query(
            `
            SELECT
                AVG(rating) AS averageRating,
                COUNT(*) AS totalReviews,

                SUM(
                    CASE
                        WHEN rating = 5
                        THEN 1
                        ELSE 0
                    END
                ) AS rating_5,

                SUM(
                    CASE
                        WHEN rating = 4
                        THEN 1
                        ELSE 0
                    END
                ) AS rating_4,

                SUM(
                    CASE
                        WHEN rating = 3
                        THEN 1
                        ELSE 0
                    END
                ) AS rating_3,

                SUM(
                    CASE
                        WHEN rating = 2
                        THEN 1
                        ELSE 0
                    END
                ) AS rating_2,

                SUM(
                    CASE
                        WHEN rating = 1
                        THEN 1
                        ELSE 0
                    END
                ) AS rating_1

            FROM reviews

            WHERE product_id = ?
              AND status = "approved"
            `,
            [
                Number(productId),
            ]
        );

    const row =
        rows[0] || {};

    return {
        averageRating:
            row.averageRating
                ? Number(
                      row.averageRating
                  ).toFixed(1)
                : 0,

        totalReviews:
            Number(
                row.totalReviews || 0
            ),

        distribution: {
            5:
                Number(
                    row.rating_5 || 0
                ),

            4:
                Number(
                    row.rating_4 || 0
                ),

            3:
                Number(
                    row.rating_3 || 0
                ),

            2:
                Number(
                    row.rating_2 || 0
                ),

            1:
                Number(
                    row.rating_1 || 0
                ),
        },
    };
};

// ============================================================
// FIND BY ID
// ============================================================

const findById = async (
    id
) => {
    const [rows] =
        await pool.query(
            `
            SELECT *
            FROM reviews
            WHERE id = ?
            LIMIT 1
            `,
            [
                Number(id),
            ]
        );

    return rows[0] || null;
};

// ============================================================
// FIND BY ID + USER
// ============================================================

const findByIdAndUser = async (
    id,
    userId
) => {
    const [rows] =
        await pool.query(
            `
            SELECT *
            FROM reviews

            WHERE id = ?
              AND user_id = ?

            LIMIT 1
            `,
            [
                Number(id),
                Number(userId),
            ]
        );

    return rows[0] || null;
};

// ============================================================
// FIND EXISTING REVIEW
// ============================================================

const findExistingReview = async (
    userId,
    productId,
    orderId
) => {
    const [rows] =
        await pool.query(
            `
            SELECT *
            FROM reviews

            WHERE user_id = ?
              AND product_id = ?
              AND order_id = ?

            LIMIT 1
            `,
            [
                Number(userId),
                Number(productId),
                Number(orderId),
            ]
        );

    return rows[0] || null;
};

// ============================================================
// VERIFY PURCHASE
//
// order_items KHÔNG có product_id.
// Phải đi:
//
// order_items.variant_id
// -> product_variants.id
// -> product_variants.product_id
// ============================================================

const verifyPurchasedProduct = async (
    userId,
    productId,
    orderId
) => {
    const [rows] =
        await pool.query(
            `
            SELECT
                o.id

            FROM orders o

            INNER JOIN order_items oi
                ON oi.order_id = o.id

            INNER JOIN product_variants pv
                ON pv.id = oi.product_variant_id

            WHERE o.id = ?
              AND o.user_id = ?
              AND pv.product_id = ?
              AND o.status = "delivered"

            LIMIT 1
            `,
            [
                Number(orderId),
                Number(userId),
                Number(productId),
            ]
        );

    return rows.length > 0;
};

// ============================================================
// CREATE REVIEW
// ============================================================

const create = async (
    data
) => {
    const {
        userId,
        productId,
        orderId,
        rating,
        comment,
    } = data;

    const [result] =
        await pool.query(
            `
            INSERT INTO reviews
            (
                user_id,
                product_id,
                order_id,
                rating,
                comment,
                status,
                created_at,
                updated_at
            )

            VALUES
            (
                ?,
                ?,
                ?,
                ?,
                ?,
                "pending",
                NOW(),
                NOW()
            )
            `,
            [
                Number(userId),
                Number(productId),
                Number(orderId),
                Number(rating),
                comment,
            ]
        );

    return result.insertId;
};

// ============================================================
// UPDATE REVIEW
// ============================================================

const update = async (
    id,
    data
) => {
    const {
        rating,
        comment,
        status,
    } = data;

    const fields = [];
    const values = [];

    if (
        rating !== undefined
    ) {
        fields.push(
            "rating = ?"
        );

        values.push(
            Number(rating)
        );
    }

    if (
        comment !== undefined
    ) {
        fields.push(
            "comment = ?"
        );

        values.push(
            comment
        );
    }

    if (
        status !== undefined
    ) {
        fields.push(
            "status = ?"
        );

        values.push(
            status
        );
    }

    if (
        fields.length === 0
    ) {
        return;
    }

    fields.push(
        "updated_at = NOW()"
    );

    values.push(
        Number(id)
    );

    await pool.query(
        `
        UPDATE reviews

        SET ${fields.join(", ")}

        WHERE id = ?
        `,
        values
    );
};

// ============================================================
// DELETE REVIEW
// ============================================================

const deleteReview = async (
    id
) => {
    await pool.query(
        `
        DELETE FROM reviews
        WHERE id = ?
        `,
        [
            Number(id),
        ]
    );
};

// ============================================================
// MY REVIEWS
// ============================================================

const findByUser = async (
    userId,
    page = 1,
    limit = 10
) => {
    const safePage = Math.max(
        1,
        parseInt(page, 10) || 1
    );

    const safeLimit = Math.max(
        1,
        Math.min(
            100,
            parseInt(limit, 10) || 10
        )
    );

    const offset =
        (safePage - 1) * safeLimit;

    const [reviews] =
        await pool.query(
            `
            SELECT
                r.id,
                r.product_id,
                r.order_id,
                r.rating,
                r.comment,
                r.status,
                r.created_at,
                r.updated_at,

                p.name AS productName,

                o.order_code

            FROM reviews r

            INNER JOIN products p
                ON p.id = r.product_id

            INNER JOIN orders o
                ON o.id = r.order_id

            WHERE r.user_id = ?

            ORDER BY r.created_at DESC

            LIMIT ? OFFSET ?
            `,
            [
                Number(userId),
                safeLimit,
                offset,
            ]
        );

    return reviews;
};

// ============================================================
// COUNT MY REVIEWS
// ============================================================

const countByUser = async (
    userId
) => {
    const [rows] =
        await pool.query(
            `
            SELECT
                COUNT(*) AS count

            FROM reviews

            WHERE user_id = ?
            `,
            [
                Number(userId),
            ]
        );

    return Number(
        rows[0]?.count || 0
    );
};

// ============================================================
// ADMIN FIND ALL
// ============================================================

const adminFindAll = async (
    filters = {}
) => {
    const {
        page = 1,
        limit = 10,
        status,
        rating,
        productId,
        userId,
        search,
    } = filters;

    const safePage = Math.max(
        1,
        parseInt(page, 10) || 1
    );

    const safeLimit = Math.max(
        1,
        Math.min(
            100,
            parseInt(limit, 10) || 10
        )
    );

    const offset =
        (safePage - 1) * safeLimit;

    let where =
        "1 = 1";

    const params = [];

    if (status) {
        where +=
            " AND r.status = ?";

        params.push(
            status
        );
    }

    if (rating) {
        where +=
            " AND r.rating = ?";

        params.push(
            Number(rating)
        );
    }

    if (productId) {
        where +=
            " AND r.product_id = ?";

        params.push(
            Number(productId)
        );
    }

    if (userId) {
        where +=
            " AND r.user_id = ?";

        params.push(
            Number(userId)
        );
    }

    if (search) {
        where +=
            `
            AND
            (
                u.full_name LIKE ?
                OR p.name LIKE ?
                OR r.comment LIKE ?
            )
            `;

        const term =
            `%${search}%`;

        params.push(
            term,
            term,
            term
        );
    }

    const [reviews] =
        await pool.query(
            `
            SELECT
                r.id,
                r.user_id,
                r.product_id,
                r.order_id,
                r.rating,
                r.comment,
                r.status,
                r.created_at,
                r.updated_at,

                u.full_name AS userName,
                u.email AS userEmail,

                p.name AS productName,

                o.order_code

            FROM reviews r

            INNER JOIN users u
                ON u.id = r.user_id

            INNER JOIN products p
                ON p.id = r.product_id

            INNER JOIN orders o
                ON o.id = r.order_id

            WHERE ${where}

            ORDER BY r.created_at DESC

            LIMIT ? OFFSET ?
            `,
            [
                ...params,
                safeLimit,
                offset,
            ]
        );

    return reviews;
};

// ============================================================
// ADMIN COUNT
// ============================================================

const adminCountAll = async (
    filters = {}
) => {
    const {
        status,
        rating,
        productId,
        userId,
        search,
    } = filters;

    let where =
        "1 = 1";

    const params = [];

    if (status) {
        where +=
            " AND r.status = ?";

        params.push(
            status
        );
    }

    if (rating) {
        where +=
            " AND r.rating = ?";

        params.push(
            Number(rating)
        );
    }

    if (productId) {
        where +=
            " AND r.product_id = ?";

        params.push(
            Number(productId)
        );
    }

    if (userId) {
        where +=
            " AND r.user_id = ?";

        params.push(
            Number(userId)
        );
    }

    if (search) {
        where +=
            `
            AND
            (
                u.full_name LIKE ?
                OR p.name LIKE ?
                OR r.comment LIKE ?
            )
            `;

        const term =
            `%${search}%`;

        params.push(
            term,
            term,
            term
        );
    }

    const [rows] =
        await pool.query(
            `
            SELECT
                COUNT(*) AS count

            FROM reviews r

            INNER JOIN users u
                ON u.id = r.user_id

            INNER JOIN products p
                ON p.id = r.product_id

            WHERE ${where}
            `,
            params
        );

    return Number(
        rows[0]?.count || 0
    );
};

// ============================================================
// ADMIN UPDATE STATUS
// ============================================================

const updateStatus = async (
    id,
    status
) => {
    await pool.query(
        `
        UPDATE reviews

        SET
            status = ?,
            updated_at = NOW()

        WHERE id = ?
        `,
        [
            status,
            Number(id),
        ]
    );
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
    findApprovedByProduct,
    countApprovedByProduct,
    getRatingSummary,

    findById,
    findByIdAndUser,
    findExistingReview,

    verifyPurchasedProduct,

    create,
    update,
    deleteReview,

    findByUser,
    countByUser,

    adminFindAll,
    adminCountAll,

    updateStatus,
};
