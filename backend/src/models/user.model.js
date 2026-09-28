const { pool } = require('../config/db');

const mapUser = (row, includePassword = false) => {
    if (!row) {
        return null;
    }

    const user = {
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone,
        avatar: row.avatar,
        role: row.role,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };

    if (includePassword) {
        user.password = row.password;
    }

    return user;
};

const findByEmail = async (email, options = {}) => {
    const query = options.withPassword
        ? `SELECT id, full_name, email, phone, avatar, role, status, created_at, updated_at, password FROM users WHERE email = ?`
        : `SELECT id, full_name, email, phone, avatar, role, status, created_at, updated_at FROM users WHERE email = ?`;

    const [rows] = await pool.query(query, [email]);
    return mapUser(rows[0], options.withPassword);
};

const findById = async (id, options = {}) => {
    const query = options.withPassword
        ? `SELECT id, full_name, email, phone, avatar, role, status, created_at, updated_at, password FROM users WHERE id = ?`
        : `SELECT id, full_name, email, phone, avatar, role, status, created_at, updated_at FROM users WHERE id = ?`;

    const [rows] = await pool.query(query, [id]);
    return mapUser(rows[0], options.withPassword);
};

const createUser = async (data) => {
    const { fullName, email, passwordHash, phone } = data;
    const [result] = await pool.query(
        `INSERT INTO users (full_name, email, password, phone, role, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'customer', 'active', NOW(), NOW())`,
        [fullName, email, passwordHash, phone || null]
    );

    return result.insertId;
};

const updatePassword = async (id, passwordHash) => {
    await pool.query(
        `UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?`,
        [passwordHash, id]
    );
};

const getProfileById = async (id) => {
    return await findById(id, { withPassword: false });
};

const updateProfile = async (id, data) => {
    const fields = [];
    const values = [];

    if (data.fullName !== undefined) {
        fields.push('full_name = ?');
        values.push(data.fullName);
    }

    if (data.phone !== undefined) {
        fields.push('phone = ?');
        values.push(data.phone || null);
    }

    if (fields.length === 0) {
        return await getProfileById(id);
    }

    values.push(id);

    await pool.query(
        `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        values
    );

    return await getProfileById(id);
};

const updateAvatar = async (id, avatarUrl) => {
    await pool.query(
        `UPDATE users SET avatar = ?, updated_at = NOW() WHERE id = ?`,
        [avatarUrl, id]
    );
};

module.exports = {
    findByEmail,
    findById,
    createUser,
    updatePassword,
    getProfileById,
    updateProfile,
    updateAvatar
};
