const { pool } = require('../config/db');

const mapProductRow = (row) => {
    if (!row) return null;

    return {
        id: row.product_id,
        name: row.product_name,
        slug: row.product_slug,
        thumbnail: row.product_thumbnail,
        price: row.product_price != null ? Number(row.product_price) : null,
        salePrice: row.product_sale_price != null ? Number(row.product_sale_price) : null,
        finalPrice: row.product_final_price != null ? Number(row.product_final_price) : null,
        brand: row.brand_id ? { id: row.brand_id, name: row.brand_name } : null,
        totalStock: row.total_stock != null ? Number(row.total_stock) : 0
    };
};

const findByUser = async (userId, page = 1, limit = 12) => {
    const offset = (page - 1) * limit;

    const itemsQuery = `
        SELECT f.id AS favorite_id,
               f.created_at AS created_at,
               p.id AS product_id,
               p.name AS product_name,
               p.slug AS product_slug,
               p.thumbnail AS product_thumbnail,
               p.price AS product_price,
               p.sale_price AS product_sale_price,
               (CASE WHEN p.sale_price IS NOT NULL AND p.sale_price >= 0 THEN p.sale_price ELSE p.price END) AS product_final_price,
               b.id AS brand_id,
               b.name AS brand_name,
               IFNULL(SUM(pv.stock_quantity),0) AS total_stock
        FROM favorites f
        JOIN products p ON p.id = f.product_id
        LEFT JOIN brands b ON b.id = p.brand_id
        LEFT JOIN product_variants pv ON pv.product_id = p.id
        WHERE f.user_id = ?
          AND p.status = 'active'
        GROUP BY f.id, p.id
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?
    `;

    const countQuery = `SELECT COUNT(*) AS total FROM favorites f JOIN products p ON p.id = f.product_id WHERE f.user_id = ? AND p.status = 'active'`;

    const [[countRows]] = await pool.query(countQuery, [userId]);
    const totalItems = countRows ? Number(countRows.total) : 0;

    const [rows] = await pool.query(itemsQuery, [userId, Number(limit), Number(offset)]);

    const items = rows.map((r) => ({
        favoriteId: r.favorite_id,
        product: mapProductRow(r),
        createdAt: r.created_at
    }));

    return {
        items,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            totalItems,
            totalPages: Math.ceil(totalItems / Number(limit) || 1)
        }
    };
};

const findOne = async (userId, productId) => {
    const [rows] = await pool.query('SELECT * FROM favorites WHERE user_id = ? AND product_id = ?', [userId, productId]);
    return rows[0] || null;
};

const create = async (userId, productId) => {
    const [result] = await pool.query('INSERT INTO favorites (user_id, product_id, created_at) VALUES (?, ?, NOW())', [userId, productId]);
    return result.insertId;
};

const remove = async (userId, productId) => {
    await pool.query('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', [userId, productId]);
};

const exists = async (userId, productId) => {
    const row = await findOne(userId, productId);
    return !!row;
};

module.exports = {
    findByUser,
    findOne,
    create,
    remove,
    exists
};
