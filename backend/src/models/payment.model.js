const { pool } = require('../config/db');

const createPayment = async (connection, data) => {
    const conn = connection || pool;
    const { orderId, paymentMethod, transactionCode, amount, status } = data;
    const [result] = await conn.query(
        `INSERT INTO payments (order_id, payment_method, transaction_code, amount, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [orderId, paymentMethod, transactionCode || null, amount, status]
    );

    const [rows] = await conn.query('SELECT * FROM payments WHERE id = ?', [result.insertId]);
    return rows[0];
};

const updatePaymentStatus = async (id, status, transactionCode, paidAt, connection) => {
    const conn = connection || pool;
    await conn.query(
        `UPDATE payments SET status = ?, transaction_code = ?, paid_at = ?, updated_at = NOW() WHERE id = ?`,
        [status, transactionCode || null, paidAt || null, id]
    );
};

const findByOrderId = async (orderId) => {
    const [rows] = await pool.query('SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC', [orderId]);
    return rows;
};

module.exports = {
    createPayment,
    updatePaymentStatus,
    findByOrderId
};
