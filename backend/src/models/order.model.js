const { pool } = require('../config/db');

const createOrder = async (connection, data) => {
	const conn = connection || pool;
	const {
		userId,
		orderCode,
		receiverName,
		receiverPhone,
		shippingAddress,
		subtotal,
		discountAmount,
		shippingFee,
		totalAmount,
		couponId,
		paymentMethod,
		paymentStatus,
		orderStatus,
		note
	} = data;

	const [result] = await conn.query(
		`INSERT INTO orders (user_id, order_code, receiver_name, receiver_phone, shipping_address, subtotal, discount_amount, shipping_fee, total_amount, coupon_id, payment_method, payment_status, order_status, note, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
		[userId, orderCode, receiverName, receiverPhone, shippingAddress, subtotal, discountAmount, shippingFee, totalAmount, couponId || null, paymentMethod, paymentStatus, orderStatus, note || null]
	);

	const [rows] = await conn.query('SELECT * FROM orders WHERE id = ?', [result.insertId]);
	return rows[0];
};

const createOrderItems = async (connection, items, orderId) => {
	const conn = connection || pool;
	const queries = [];
	for (const it of items) {
		queries.push(conn.query(
			`INSERT INTO order_items (order_id, product_id, product_variant_id, product_name, variant_name, price, quantity, subtotal, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
			[orderId, it.productId, it.variantId, it.productName, it.variantName, it.price, it.quantity, it.subtotal]
		));
	}

	await Promise.all(queries);
};

const findOrdersByUser = async (userId, page = 1, limit = 10, status) => {
	const offset = (page - 1) * limit;
	const params = [userId];
	let where = 'AND o.user_id = ?';
	if (status) {
		where += ' AND o.order_status = ?';
		params.push(status);
	}
	params.push(limit, offset);

	const query = `SELECT SQL_CALC_FOUND_ROWS o.id, o.order_code, o.total_amount, o.payment_method, o.payment_status, o.order_status, o.created_at,
				   (SELECT IFNULL(SUM(quantity),0) FROM order_items oi WHERE oi.order_id = o.id) AS totalItems
				   FROM orders o WHERE o.user_id = ? ${status ? 'AND o.order_status = ?' : ''} ORDER BY o.created_at DESC LIMIT ?, ?`;

	const [rows] = await pool.query(query, params);
	const [countRows] = await pool.query('SELECT FOUND_ROWS() as total');
	return { items: rows, total: countRows[0].total };
};

const findOrderByIdForUser = async (orderId, userId) => {
	const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ? LIMIT 1', [orderId, userId]);
	return rows[0] || null;
};

const findOrderByIdForAdmin = async (orderId) => {
	const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? LIMIT 1', [orderId]);
	return rows[0] || null;
};

const updateOrderStatus = async (orderId, status, connection) => {
	const conn = connection || pool;
	await conn.query('UPDATE orders SET order_status = ?, updated_at = NOW() WHERE id = ?', [status, orderId]);
};

const updatePaymentStatus = async (orderId, status, connection) => {
	const conn = connection || pool;
	await conn.query('UPDATE orders SET payment_status = ?, updated_at = NOW() WHERE id = ?', [status, orderId]);
};

const lockOrderById = async (connection, orderId) => {
	const conn = connection || pool;
	const [rows] = await conn.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [orderId]);
	return rows[0] || null;
};

const getOrderItems = async (orderId) => {
	const [rows] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
	return rows;
};

module.exports = {
	createOrder,
	createOrderItems,
	findOrdersByUser,
	findOrderByIdForUser,
	findOrderByIdForAdmin,
	updateOrderStatus,
	updatePaymentStatus,
	lockOrderById,
	getOrderItems
};

