const ApiError = require('../utils/ApiError');
const favoriteModel = require('../models/favorite.model');
const { pool } = require('../config/db');

const getFavorites = async (userId, page = 1, limit = 12) => {
    return await favoriteModel.findByUser(userId, page, limit);
};

const addFavorite = async (userId, productId) => {
    // validate product exists and active via direct query
    const [rows] = await pool.query('SELECT id, status FROM products WHERE id = ? LIMIT 1', [productId]);
    const product = rows && rows[0] ? rows[0] : null;
    if (!product) throw new ApiError(404, 'Product not found');
    if (product.status !== 'active') throw new ApiError(400, 'Product is not active');

    const existing = await favoriteModel.findOne(userId, productId);

    if (existing) {
        return { id: existing.id, already: true };
    }

    try {
        const id = await favoriteModel.create(userId, productId);
        return { id, already: false };
    } catch (err) {
        if (err && err.code === 'ER_DUP_ENTRY') {
            const reloaded = await favoriteModel.findOne(userId, productId);
            return { id: reloaded ? reloaded.id : null, already: true };
        }
        throw err;
    }
};

const removeFavorite = async (userId, productId) => {
    const existing = await favoriteModel.findOne(userId, productId);

    if (!existing) {
        // idempotent: treat as success
        return;
    }

    await favoriteModel.remove(userId, productId);
};

const checkFavorite = async (userId, productId) => {
    const exists = await favoriteModel.exists(userId, productId);
    return exists;
};

module.exports = {
    getFavorites,
    addFavorite,
    removeFavorite,
    checkFavorite
};
