const { pool } = require('../config/db');

const findByCode = async (code) => {
    const [rows] = await pool.query('SELECT * FROM coupons WHERE UPPER(code) = ? LIMIT 1', [code.toUpperCase()]);
    return rows[0] || null;
};

const incrementUsage = async (couponId, connection) => {
    const conn = connection || pool;
    await conn.query('UPDATE coupons SET used_count = IFNULL(used_count,0) + 1 WHERE id = ?', [couponId]);
};

const decrementUsage = async (couponId, connection) => {
    const conn = connection || pool;
    await conn.query('UPDATE coupons SET used_count = IFNULL(used_count,0) - 1 WHERE id = ? AND used_count > 0', [couponId]);
};

const createUsage = async (connection, data) => {
    const conn = connection || pool;
    const { couponId, userId, orderId } = data;
    await conn.query('INSERT INTO coupon_usages (coupon_id, user_id, order_id, used_at) VALUES (?, ?, ?, NOW())', [couponId, userId, orderId]);
};

const deleteUsageForOrder = async (couponId, orderId, connection) => {
    const conn = connection || pool;
    await conn.query('DELETE FROM coupon_usages WHERE coupon_id = ? AND order_id = ?', [couponId, orderId]);
};

// Admin CRUD operations

const findById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM coupons WHERE id = ?', [id]);
    return rows[0] || null;
};

const checkCodeExists = async (code, excludeId = null) => {
    let query = 'SELECT COUNT(*) as count FROM coupons WHERE UPPER(code) = ?';
    let params = [code.toUpperCase()];
    
    if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
    }
    
    const [rows] = await pool.query(query, params);
    return rows[0].count > 0;
};

const findAll = async (filters = {}) => {
    const { page = 1, limit = 10, status, discountType, search, activeNow, sort = 'newest' } = filters;
    const offset = (page - 1) * limit;
    
    let where = '1=1';
    let params = [];
    
    if (status) {
        where += ' AND status = ?';
        params.push(status);
    }
    if (discountType) {
        where += ' AND discount_type = ?';
        params.push(discountType);
    }
    if (activeNow === 'true' || activeNow === true) {
        where += ' AND status = "active" AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW())';
    }
    if (search) {
        where += ' AND (code LIKE ? OR description LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
    }

    let orderBy = 'created_at DESC';
    if (sort === 'oldest') orderBy = 'created_at ASC';
    else if (sort === 'code_asc') orderBy = 'code ASC';
    else if (sort === 'code_desc') orderBy = 'code DESC';
    else if (sort === 'usage_high') orderBy = 'used_count DESC';

    const [rows] = await pool.query(
        `SELECT * FROM coupons WHERE ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), parseInt(offset)]
    );
    
    return rows;
};

const countAll = async (filters = {}) => {
    const { status, discountType, search, activeNow } = filters;
    let where = '1=1';
    let params = [];
    
    if (status) {
        where += ' AND status = ?';
        params.push(status);
    }
    if (discountType) {
        where += ' AND discount_type = ?';
        params.push(discountType);
    }
    if (activeNow === 'true' || activeNow === true) {
        where += ' AND status = "active" AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW())';
    }
    if (search) {
        where += ' AND (code LIKE ? OR description LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
    }

    const [rows] = await pool.query(`SELECT COUNT(*) as count FROM coupons WHERE ${where}`, params);
    return rows[0].count;
};

const create = async (data) => {
    const { code, description, discountType, discountValue, minimumOrder, maximumDiscount, startDate, endDate, usageLimit, status } = data;
    
    const [result] = await pool.query(
        `INSERT INTO coupons (code, description, discount_type, discount_value, minimum_order, maximum_discount, start_date, end_date, usage_limit, used_count, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, NOW(), NOW())`,
        [code.toUpperCase().trim(), description, discountType, discountValue, minimumOrder || null, maximumDiscount || null, startDate || null, endDate || null, usageLimit || null, status]
    );
    
    return result.insertId;
};

const update = async (id, data) => {
    const { description, discountType, discountValue, minimumOrder, maximumDiscount, startDate, endDate, usageLimit } = data;
    
    const fields = [];
    const values = [];
    
    if (description !== undefined) {
        fields.push('description = ?');
        values.push(description);
    }
    if (discountType !== undefined) {
        fields.push('discount_type = ?');
        values.push(discountType);
    }
    if (discountValue !== undefined) {
        fields.push('discount_value = ?');
        values.push(discountValue);
    }
    if (minimumOrder !== undefined) {
        fields.push('minimum_order = ?');
        values.push(minimumOrder || null);
    }
    if (maximumDiscount !== undefined) {
        fields.push('maximum_discount = ?');
        values.push(maximumDiscount || null);
    }
    if (startDate !== undefined) {
        fields.push('start_date = ?');
        values.push(startDate || null);
    }
    if (endDate !== undefined) {
        fields.push('end_date = ?');
        values.push(endDate || null);
    }
    if (usageLimit !== undefined) {
        fields.push('usage_limit = ?');
        values.push(usageLimit || null);
    }
    
    if (fields.length === 0) return;
    
    fields.push('updated_at = NOW()');
    values.push(id);
    
    await pool.query(`UPDATE coupons SET ${fields.join(', ')} WHERE id = ?`, values);
};

const updateStatus = async (id, status) => {
    await pool.query('UPDATE coupons SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
};

const deleteById = async (id) => {
    await pool.query('DELETE FROM coupons WHERE id = ?', [id]);
};

const getStatistics = async (id) => {
    const [rows] = await pool.query(
        `SELECT 
            IFNULL(used_count, 0) as usedCount,
            usage_limit as usageLimit,
            COALESCE(usage_limit - IFNULL(used_count, 0), NULL) as remainingUses,
            COALESCE(SUM(o.total_amount - IFNULL(o.discount_amount, 0)), 0) as totalDiscountGiven
         FROM coupons c
         LEFT JOIN coupon_usages cu ON cu.coupon_id = c.id
         LEFT JOIN orders o ON o.id = cu.order_id AND o.order_status != "cancelled"
         WHERE c.id = ?
         GROUP BY c.id`,
        [id]
    );
    
    return rows[0] || {};
};

module.exports = {
    findByCode,
    incrementUsage,
    decrementUsage,
    createUsage,
    deleteUsageForOrder,
    findById,
    checkCodeExists,
    findAll,
    countAll,
    create,
    update,
    updateStatus,
    deleteById,
    getStatistics
};
