const { pool } = require('../config/db');

const mapAddress = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    receiverName: row.receiver_name,
    receiverPhone: row.receiver_phone,
    province: row.province,
    district: row.district,
    ward: row.ward,
    addressDetail: row.address_detail,
    isDefault: row.is_default === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const findByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, updated_at DESC`,
    [userId]
  );

  return rows.map(mapAddress);
};

const findByIdAndUserId = async (addressId, userId) => {
  const [rows] = await pool.query(
    `SELECT * FROM addresses WHERE id = ? AND user_id = ?`,
    [addressId, userId]
  );

  return mapAddress(rows[0]);
};

const createAddress = async (userId, data, connection) => {
  const conn = connection || pool;
  const [result] = await conn.query(
    `INSERT INTO addresses (user_id, receiver_name, receiver_phone, province, district, ward, address_detail, is_default, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      userId,
      data.receiverName,
      data.receiverPhone,
      data.province,
      data.district,
      data.ward,
      data.addressDetail,
      data.isDefault ? 1 : 0
    ]
  );

  const [rows] = await conn.query(`SELECT * FROM addresses WHERE id = ?`, [result.insertId]);
  return mapAddress(rows[0]);
};

const updateAddress = async (addressId, userId, data, connection) => {
  const conn = connection || pool;
  const fields = [];
  const values = [];

  if (data.receiverName !== undefined) {
    fields.push('receiver_name = ?');
    values.push(data.receiverName);
  }
  if (data.receiverPhone !== undefined) {
    fields.push('receiver_phone = ?');
    values.push(data.receiverPhone);
  }
  if (data.province !== undefined) {
    fields.push('province = ?');
    values.push(data.province);
  }
  if (data.district !== undefined) {
    fields.push('district = ?');
    values.push(data.district);
  }
  if (data.ward !== undefined) {
    fields.push('ward = ?');
    values.push(data.ward);
  }
  if (data.addressDetail !== undefined) {
    fields.push('address_detail = ?');
    values.push(data.addressDetail);
  }
  if (data.isDefault !== undefined) {
    fields.push('is_default = ?');
    values.push(data.isDefault ? 1 : 0);
  }

  if (fields.length === 0) {
    return findByIdAndUserId(addressId, userId);
  }

  values.push(addressId, userId);

  await conn.query(
    `UPDATE addresses SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ? AND user_id = ?`,
    values
  );

  return findByIdAndUserId(addressId, userId);
};

const deleteAddress = async (addressId, userId, connection) => {
  const conn = connection || pool;
  await conn.query(`DELETE FROM addresses WHERE id = ? AND user_id = ?`, [addressId, userId]);
};

const unsetDefaultAddresses = async (userId, connection) => {
  const conn = connection || pool;
  await conn.query(`UPDATE addresses SET is_default = 0 WHERE user_id = ?`, [userId]);
};

const setDefaultAddress = async (addressId, userId, connection) => {
  const conn = connection || pool;
  await conn.query(
    `UPDATE addresses SET is_default = 1, updated_at = NOW() WHERE id = ? AND user_id = ?`,
    [addressId, userId]
  );
};

const countByUserId = async (userId) => {
  const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM addresses WHERE user_id = ?`, [userId]);
  return rows[0]?.count || 0;
};

module.exports = {
  findByUserId,
  findByIdAndUserId,
  createAddress,
  updateAddress,
  deleteAddress,
  unsetDefaultAddresses,
  setDefaultAddress,
  countByUserId
};
