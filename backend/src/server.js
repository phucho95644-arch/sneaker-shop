require("dotenv").config();

const {
    validateEnv,
} = require("./config/env");

// ============================================================
// ENV VALIDATION
// ============================================================

let environment;

try {
    environment =
        validateEnv();
} catch (error) {
    console.error(
        "❌ Invalid environment configuration"
    );

    console.error(
        error.message
    );

    process.exit(1);
}

// ============================================================
// LOAD APP + DATABASE
// ============================================================

const app =
    require("./app");

const {
    pool,
    testConnection,
} = require("./config/db");

const PORT =
    environment.port;

let server =
    null;

let shuttingDown =
    false;

// ============================================================
// START SERVER
// ============================================================

const startServer =
    async () => {
        try {
            // ====================================================
            // TEST DATABASE CONNECTION
            // ====================================================

            await testConnection();

            // ====================================================
            // START HTTP SERVER
            // ====================================================

            server =
                app.listen(
                    PORT,
                    () => {
                        console.log(
                            "=========================================="
                        );

                        console.log(
                            "🚀 Sneaker Shop Backend started"
                        );

                        console.log(
                            `🌐 Server: http://localhost:${PORT}`
                        );

                        console.log(
                            `❤️ Health: http://localhost:${PORT}/api/health`
                        );

                        console.log(
                            `⚙️ Environment: ${environment.nodeEnv}`
                        );

                        console.log(
                            "=========================================="
                        );
                    }
                );

            // ====================================================
            // HTTP SECURITY / STABILITY TIMEOUTS
            // ====================================================

            server.requestTimeout =
                30_000;

            server.headersTimeout =
                15_000;

            server.keepAliveTimeout =
                5_000;
        } catch (error) {
            console.error(
                "❌ Cannot start server"
            );

            if (
                environment.nodeEnv !==
                "production"
            ) {
                console.error(
                    error
                );
            } else {
                console.error(
                    error.message
                );
            }

            // ====================================================
            // CLOSE DATABASE POOL IF STARTUP FAILS
            // ====================================================

            try {
                await pool.end();
            } catch (
                poolError
            ) {
                if (
                    environment.nodeEnv !==
                    "production"
                ) {
                    console.error(
                        "❌ Error closing database pool:",
                        poolError
                    );
                }
            }

            process.exit(1);
        }
    };

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

const gracefulShutdown =
    async (
        signal,
        exitCode = 0
    ) => {
        // Không shutdown nhiều lần
        if (
            shuttingDown
        ) {
            return;
        }

        shuttingDown =
            true;

        console.log(
            `⚠️ ${signal} received. Shutting down...`
        );

        // ====================================================
        // FORCE EXIT AFTER 10 SECONDS
        // ====================================================

        const forceExitTimer =
            setTimeout(
                () => {
                    console.error(
                        "❌ Forced shutdown"
                    );

                    process.exit(1);
                },
                10_000
            );

        // Timer này không giữ Node process sống
        forceExitTimer.unref();

        try {
            // ====================================================
            // CLOSE HTTP SERVER
            // ====================================================

            if (
                server
            ) {
                await new Promise(
                    (
                        resolve
                    ) => {
                        server.close(
                            () => {
                                resolve();
                            }
                        );

                        // Node hỗ trợ đóng idle connections
                        if (
                            typeof server.closeIdleConnections ===
                            "function"
                        ) {
                            server.closeIdleConnections();
                        }
                    }
                );
            }

            // ====================================================
            // CLOSE DATABASE CONNECTION POOL
            // ====================================================

            await pool.end();

            // ====================================================
            // CLEAR FORCE TIMER
            // ====================================================

            clearTimeout(
                forceExitTimer
            );

            console.log(
                "✅ Server shutdown completed"
            );

            process.exit(
                exitCode
            );
        } catch (error) {
            console.error(
                "❌ Error during shutdown"
            );

            if (
                environment.nodeEnv !==
                "production"
            ) {
                console.error(
                    error
                );
            } else {
                console.error(
                    error.message
                );
            }

            process.exit(1);
        }
    };

// ============================================================
// PROCESS SIGNALS
// ============================================================

// Ctrl + C
process.on(
    "SIGINT",
    () => {
        gracefulShutdown(
            "SIGINT",
            0
        );
    }
);

// Hosting / Docker / Render shutdown
process.on(
    "SIGTERM",
    () => {
        gracefulShutdown(
            "SIGTERM",
            0
        );
    }
);

// ============================================================
// UNHANDLED PROMISE REJECTION
// ============================================================

process.on(
    "unhandledRejection",
    (
        reason
    ) => {
        console.error(
            "❌ Unhandled Promise Rejection"
        );

        if (
            environment.nodeEnv !==
            "production"
        ) {
            console.error(
                reason
            );
        }

        gracefulShutdown(
            "UNHANDLED_REJECTION",
            1
        );
    }
);

// ============================================================
// UNCAUGHT EXCEPTION
// ============================================================

process.on(
    "uncaughtException",
    (
        error
    ) => {
        console.error(
            "❌ Uncaught Exception"
        );

        if (
            environment.nodeEnv !==
            "production"
        ) {
            console.error(
                error
            );
        } else {
            console.error(
                error.message
            );
        }

        gracefulShutdown(
            "UNCAUGHT_EXCEPTION",
            1
        );
    }
);

// ============================================================
// START APPLICATION
// ============================================================

startServer();