const mysql = require('mysql2/promise');
const fetch = global.fetch || ((...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)));
require('dotenv').config();

const BASE = `http://localhost:${process.env.PORT || 5000}/api`;

const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

const results = [];
const pass = (name) => { results.push({ name, status: 'PASS' }); console.log(`✓ ${name}`); };
const fail = (name, msg) => { results.push({ name, status: 'FAIL', msg }); console.log(`✗ ${name}: ${msg}`); };

const http = async (method, path, body, token) => {
    try {
        const opts = { method, headers: { 'Content-Type': 'application/json' } };
        if (body) opts.body = JSON.stringify(body);
        if (token) opts.headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${BASE}${path}`, opts);
        const text = await res.text();
        let json = null;
        try { json = text ? JSON.parse(text) : null; } catch (e) { json = text; }
        return { status: res.status, ok: res.ok, body: json };
    } catch (error) {
        return { status: 0, ok: false, error };
    }
};

const run = async () => {
    let pool;
    try {
        pool = await mysql.createPool(DB_CONFIG);
        const conn = await pool.getConnection();
        await conn.ping();
        conn.release();
        pass('DB connection');
    } catch (err) {
        fail('DB connection', err.message);
        return;
    }

    // Health check
    const h = await http('GET', '/health');
    if (h.status === 200) pass('Health check');
    else { fail('Health check', `status ${h.status}`); return; }

    // Setup admin
    let adminToken = null;
    try {
        const lg = await http('POST', '/auth/login', { 
            email: process.env.ADMIN_EMAIL || 'admin@sneakershop.com', 
            password: process.env.ADMIN_PASSWORD || 'Admin@123456' 
        });
        if (lg.status === 200) {
            adminToken = lg.body.data.token;
            pass('Admin ready');
        }
    } catch (e) {
        console.log('Admin login optional');
    }

    // ===== REVIEW TESTS (API FOCUS) =====

    // 1. Public reviews endpoint
    try {
        const [product] = await pool.query('SELECT id FROM products LIMIT 1');
        const res = await http('GET', `/reviews/product/${product[0].id}`, null);
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        if (!res.body.data.items) throw new Error('No items');
        if (!res.body.data.summary) throw new Error('No summary');
        if (!res.body.data.pagination) throw new Error('No pagination');
        pass('Review - Public list');
    } catch (e) { fail('Review - Public list', e.message); }

    // 2. Public reviews with filters
    try {
        const [product] = await pool.query('SELECT id FROM products LIMIT 1');
        const res = await http('GET', `/reviews/product/${product[0].id}?page=1&limit=5&rating=5&sort=newest`, null);
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        pass('Review - Filters');
    } catch (e) { fail('Review - Filters', e.message); }

    // 3. Admin reviews list
    if (adminToken) {
        try {
            const res = await http('GET', '/reviews/admin/all', null, adminToken);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
            if (!Array.isArray(res.body.data.items)) throw new Error('Items not array');
            pass('Review - Admin list');
        } catch (e) { fail('Review - Admin list', e.message); }
    }

    // 4. Admin reviews with filters
    if (adminToken) {
        try {
            const res = await http('GET', '/reviews/admin/all?status=pending&page=1&limit=10', null, adminToken);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
            pass('Review - Admin filters');
        } catch (e) { fail('Review - Admin filters', e.message); }
    }

    // ===== COUPON TESTS =====

    // 5. Create coupon
    let couponId = null;
    if (adminToken) {
        try {
            const code = `TEST${Math.random().toString(36).substring(7).toUpperCase()}`;
            const res = await http('POST', '/coupons/admin', {
                code,
                description: 'Test coupon',
                discountType: 'percent',
                discountValue: 20,
                minimumOrder: 100000,
                usageLimit: 100,
                status: 'active'
            }, adminToken);
            if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
            couponId = res.body.data.id;
            pass('Coupon - Create');
        } catch (e) { fail('Coupon - Create', e.message); }
    }

    // 6. Validate coupon code format
    if (adminToken) {
        try {
            const res = await http('POST', '/coupons/admin', {
                code: 'invalid code',  // Invalid - has space
                description: 'Test',
                discountType: 'percent',
                discountValue: 10,
                status: 'active'
            }, adminToken);
            if (res.status !== 400) throw new Error(`Expected 400 for invalid code, got ${res.status}`);
            pass('Coupon - Code validation');
        } catch (e) { fail('Coupon - Code validation', e.message); }
    }

    // 7. Validate discount type
    if (adminToken) {
        try {
            const res = await http('POST', '/coupons/admin', {
                code: 'VALID123',
                description: 'Test',
                discountType: 'invalid',
                discountValue: 10,
                status: 'active'
            }, adminToken);
            if (res.status !== 400) throw new Error(`Expected 400 for invalid type`);
            pass('Coupon - Discount type validation');
        } catch (e) { fail('Coupon - Discount type validation', e.message); }
    }

    // 8. Validate percent > 100
    if (adminToken) {
        try {
            const res = await http('POST', '/coupons/admin', {
                code: `PERC${Math.random().toString(36).substring(7).toUpperCase()}`,
                description: 'Test',
                discountType: 'percent',
                discountValue: 150,
                status: 'active'
            }, adminToken);
            if (res.status !== 400) throw new Error(`Expected 400 for percent > 100`);
            pass('Coupon - Percent validation');
        } catch (e) { fail('Coupon - Percent validation', e.message); }
    }

    // 9. List coupons
    if (adminToken) {
        try {
            const res = await http('GET', '/coupons/admin', null, adminToken);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
            if (!Array.isArray(res.body.data.items)) throw new Error('Items not array');
            pass('Coupon - List');
        } catch (e) { fail('Coupon - List', e.message); }
    }

    // 10. List coupons with filters
    if (adminToken) {
        try {
            const res = await http('GET', '/coupons/admin?status=active&page=1&limit=10&sort=newest', null, adminToken);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
            pass('Coupon - List filters');
        } catch (e) { fail('Coupon - List filters', e.message); }
    }

    // 11. Get coupon detail
    if (adminToken && couponId) {
        try {
            const res = await http('GET', `/coupons/admin/${couponId}`, null, adminToken);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
            if (!res.body.data.id) throw new Error('No coupon data');
            pass('Coupon - Get detail');
        } catch (e) { fail('Coupon - Get detail', e.message); }
    }

    // 12. Update coupon
    if (adminToken && couponId) {
        try {
            const res = await http('PUT', `/coupons/admin/${couponId}`, {
                description: 'Updated description'
            }, adminToken);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
            pass('Coupon - Update');
        } catch (e) { fail('Coupon - Update', e.message); }
    }

    // 13. Update coupon status
    if (adminToken && couponId) {
        try {
            const res = await http('PATCH', `/coupons/admin/${couponId}/status`, {
                status: 'inactive'
            }, adminToken);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
            pass('Coupon - Status update');
        } catch (e) { fail('Coupon - Status update', e.message); }
    }

    // 14. Get statistics
    if (adminToken && couponId) {
        try {
            const res = await http('GET', `/coupons/admin/${couponId}/statistics`, null, adminToken);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
            if (res.body.data.usedCount === undefined) throw new Error('No stats');
            pass('Coupon - Statistics');
        } catch (e) { fail('Coupon - Statistics', e.message); }
    }

    // 15. Delete coupon
    if (adminToken && couponId) {
        try {
            const res = await http('DELETE', `/coupons/admin/${couponId}`, null, adminToken);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
            pass('Coupon - Delete');
        } catch (e) { fail('Coupon - Delete', e.message); }
    }

    // ===== REGRESSION =====

    // 16. Auth me (4.1)
    if (adminToken) {
        try {
            const res = await http('GET', '/auth/me', null, adminToken);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
            pass('Regression - 4.1 Auth');
        } catch (e) { fail('Regression - 4.1 Auth', e.message); }
    }

    // 17. Products (4.3)
    try {
        const res = await http('GET', '/products', null);
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        pass('Regression - 4.3 Products');
    } catch (e) { fail('Regression - 4.3 Products', e.message); }

    // 18. Cart (4.4)
    if (adminToken) {
        try {
            const res = await http('GET', '/cart', null, adminToken);
            if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
            pass('Regression - 4.4 Cart');
        } catch (e) { fail('Regression - 4.4 Cart', e.message); }
    }

    // Cleanup
    try {
        await pool.query('DELETE FROM coupons WHERE code LIKE ?', ['TEST%']);
        pass('Cleanup test coupons');
    } catch (e) {
        console.log('Cleanup note:', e.message);
    }

    pool.end();

    // Print summary
    console.log('\n' + '='.repeat(70));
    console.log('TEST SUMMARY');
    console.log('='.repeat(70));
    console.table(results);

    const passCount = results.filter(r => r.status === 'PASS').length;
    const failCount = results.filter(r => r.status === 'FAIL').length;

    console.log(`\nTotal: ${results.length} | Passed: ${passCount} | Failed: ${failCount}`);

    if (failCount === 0) {
        console.log('\n✓ Backend Reviews + Coupon Management 4.6 Completed\n');
    } else {
        console.log(`\n✗ ${failCount} tests failed - see above\n`);
    }
};

run().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
