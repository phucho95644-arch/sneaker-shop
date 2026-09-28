const mysql = require("mysql2/promise");

// ============================================================
// DATABASE POOL
//
// .env đã được load một lần duy nhất trong server.js.
// Không gọi dotenv.config() tại đây.
// ============================================================

const pool = mysql.createPool({
    host: process.env.DB_HOST,

    port: Number(
        process.env.DB_PORT || 3306
    ),

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME,

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0,

    charset: "utf8mb4",
});

// ============================================================
// TEST DATABASE CONNECTION
// ============================================================

const testConnection = async () => {
    let connection;

    try {
        connection =
            await pool.getConnection();

        await connection.ping();

        if (
            process.env.NODE_ENV ===
            "production"
        ) {
            console.log(
                "✅ Database connection established"
            );
        } else {
            console.log(
                "=========================================="
            );

            console.log(
                "✅ MySQL connected successfully"
            );

            console.log(
                `📦 Database: ${process.env.DB_NAME}`
            );

            console.log(
                `🖥️ Host: ${process.env.DB_HOST}`
            );

            console.log(
                "=========================================="
            );
        }

        return true;
    } catch (error) {
        console.error(
            "❌ MySQL connection failed"
        );

        // Development có thể xem message chi tiết.
        if (
            process.env.NODE_ENV !==
            "production"
        ) {
            console.error(
                error.message
            );
        }

        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    pool,
    testConnection,
};