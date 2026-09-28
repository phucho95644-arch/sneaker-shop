const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

router.get('/', async (req, res, next) => {
    try {
        const [rows] = await pool.query("SELECT id, size_name FROM sizes WHERE status='active' ORDER BY sort_order ASC");
        res.json({ success: true, data: rows });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
