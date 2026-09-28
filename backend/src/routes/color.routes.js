const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

router.get('/', async (req, res, next) => {
    try {
        const [rows] = await pool.query("SELECT id, name, hex_code FROM colors WHERE status='active' ORDER BY name ASC");
        res.json({ success: true, data: rows });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
