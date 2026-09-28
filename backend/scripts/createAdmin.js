const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load file backend/.env
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const {
    ADMIN_NAME,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME
} = process.env;

// Kiểm tra cấu hình Admin
if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error(
        'ADMIN_NAME, ADMIN_EMAIL và ADMIN_PASSWORD phải được khai báo trong backend/.env'
    );
    process.exit(1);
}

// Kiểm tra cấu hình database
if (!DB_HOST || !DB_USER || !DB_NAME) {
    console.error(
        'DB_HOST, DB_USER và DB_NAME phải được khai báo trong backend/.env'
    );
    process.exit(1);
}

const start = async () => {
    let pool;

    try {
        pool = mysql.createPool({
            host: DB_HOST,
            port: Number(DB_PORT || 3306),
            user: DB_USER,
            password: DB_PASSWORD || '',
            database: DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            charset: 'utf8mb4'
        });

        // Kiểm tra kết nối database
        const connection = await pool.getConnection();
        console.log('Kết nối MySQL thành công');
        connection.release();

        // Hash mật khẩu Admin
        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

        // Kiểm tra Admin đã tồn tại hay chưa
        const [rows] = await pool.query(
            'SELECT id FROM users WHERE email = ? LIMIT 1',
            [ADMIN_EMAIL]
        );

        if (rows.length > 0) {
            await pool.query(
                `
                UPDATE users
                SET
                    full_name = ?,
                    password = ?,
                    role = 'admin',
                    status = 'active',
                    updated_at = NOW()
                WHERE id = ?
                `,
                [
                    ADMIN_NAME,
                    passwordHash,
                    rows[0].id
                ]
            );

            console.log(`Admin ${ADMIN_EMAIL} đã được cập nhật thành công`);
        } else {
            await pool.query(
                `
                INSERT INTO users (
                    full_name,
                    email,
                    password,
                    phone,
                    role,
                    status,
                    created_at,
                    updated_at
                )
                VALUES (?, ?, ?, NULL, 'admin', 'active', NOW(), NOW())
                `,
                [
                    ADMIN_NAME,
                    ADMIN_EMAIL,
                    passwordHash
                ]
            );

            console.log(`Admin ${ADMIN_EMAIL} đã được tạo thành công`);
        }
    } catch (error) {
        console.error(
            'Không thể tạo hoặc cập nhật tài khoản Admin:',
            error.message
        );

        process.exitCode = 1;
    } finally {
        if (pool) {
            await pool.end();
        }
    }
};

start();