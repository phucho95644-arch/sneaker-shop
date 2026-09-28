const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

router.get('/', async (req, res, next) => {
    try {
        const [rows] = await pool.query("SELECT id, name, slug FROM categories WHERE status='active' ORDER BY name ASC");
        res.json({ success: true, data: rows });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
