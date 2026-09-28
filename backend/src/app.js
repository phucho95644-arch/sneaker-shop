const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

// ============================================================
// ROUTES
// ============================================================

const router =
    require("./routes/index");

// ============================================================
// RATE LIMIT
// ============================================================

const {
    apiLimiter,
} = require(
    "./middleware/rateLimit.middleware"
);

// ============================================================
// ERROR MIDDLEWARE
// ============================================================

const errorMiddleware =
    require("./middleware/error.middleware");

// ============================================================
// APP
// ============================================================

const app =
    express();

// ============================================================
// TRUST PROXY
//
// Render / Railway / các hosting khác thường chạy sau proxy.
// ============================================================

if (
    process.env.NODE_ENV ===
    "production"
) {
    app.set(
        "trust proxy",
        1
    );
}

// ============================================================
// BASIC SECURITY
// ============================================================

app.disable(
    "x-powered-by"
);

app.use(
    helmet()
);

// ============================================================
// CORS CONFIG
// ============================================================

const developmentOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
];

const configuredOrigins =
    String(
        process.env.CLIENT_URL ||
        ""
    )
        .split(",")
        .map(
            (origin) =>
                origin.trim()
        )
        .filter(Boolean);

const allowedOrigins =
    process.env.NODE_ENV ===
    "production"
        ? configuredOrigins
        : [
              ...new Set([
                  ...developmentOrigins,
                  ...configuredOrigins,
              ]),
          ];

// ============================================================
// ORIGIN GUARD
// ============================================================

app.use(
    (
        req,
        res,
        next
    ) => {
        const origin =
            req.headers.origin;

        // ====================================================
        // Không có Origin:
        //
        // - PowerShell
        // - Postman
        // - Automated test
        // - Server-to-server
        // ====================================================

        if (
            !origin
        ) {
            return next();
        }

        if (
            allowedOrigins.includes(
                origin
            )
        ) {
            return next();
        }

        return res
            .status(403)
            .json({
                success:
                    false,

                message:
                    "Origin not allowed by CORS",

                errors:
                    null,
            });
    }
);

// ============================================================
// CORS HEADERS
// ============================================================

const corsOptions = {
    origin:
        (
            origin,
            callback
        ) => {
            if (
                !origin
            ) {
                return callback(
                    null,
                    true
                );
            }

            if (
                allowedOrigins.includes(
                    origin
                )
            ) {
                return callback(
                    null,
                    true
                );
            }

            return callback(
                null,
                false
            );
        },

    credentials:
        true,

    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization",
    ],

    optionsSuccessStatus:
        204,
};

app.use(
    cors(
        corsOptions
    )
);

// ============================================================
// BODY PARSER
// ============================================================

app.use(
    express.json({
        limit:
            "1mb",
    })
);

app.use(
    express.urlencoded({
        extended:
            true,

        limit:
            "1mb",
    })
);

// ============================================================
// LOGGER
// ============================================================

if (
    process.env.NODE_ENV !==
    "test"
) {
    app.use(
        morgan(
            "dev"
        )
    );
}

// ============================================================
// STATIC UPLOADS
//
// URL:
// http://localhost:5000/uploads/...
//
// Ví dụ:
// http://localhost:5000/uploads/products/nike-air-max-270.jpg
//
// File tương ứng:
// backend/uploads/products/nike-air-max-270.jpg
// ============================================================

const uploadsDirectory =
    path.join(
        __dirname,
        "..",
        "uploads"
    );

app.use(
    "/uploads",
    express.static(
        uploadsDirectory,
        {
            // Không cho truy cập file ẩn
            dotfiles:
                "deny",

            // Không render index.html
            index:
                false,

            // Không redirect folder
            redirect:
                false,

            // Nếu không thấy file thì đi middleware tiếp theo
            fallthrough:
                true,

            // Production cache ảnh 1 ngày
            maxAge:
                process.env.NODE_ENV ===
                "production"
                    ? "1d"
                    : 0,

            setHeaders:
                (
                    res
                ) => {
                    // Cho frontend khác origin hiển thị ảnh
                    res.setHeader(
                        "Cross-Origin-Resource-Policy",
                        "cross-origin"
                    );

                    // Chống MIME sniffing
                    res.setHeader(
                        "X-Content-Type-Options",
                        "nosniff"
                    );
                },
        }
    )
);

// ============================================================
// UPLOAD FILE NOT FOUND
//
// Nếu URL bắt đầu /uploads nhưng file vật lý không tồn tại,
// trả 404 riêng, không báo "API Not Found".
// ============================================================

app.use(
    "/uploads",
    (
        req,
        res
    ) => {
        return res
            .status(404)
            .json({
                success:
                    false,

                message:
                    `File not found: /uploads${req.path}`,

                errors:
                    null,
            });
    }
);

// ============================================================
// HEALTH CHECK
//
// Không áp dụng rate limit.
//
// GET /api/health
// ============================================================

app.get(
    "/api/health",
    (
        req,
        res
    ) => {
        return res
            .status(200)
            .json({
                success:
                    true,

                message:
                    "Sneaker Shop API is running",
            });
    }
);

// ============================================================
// MAIN API ROUTES
//
// Tất cả API bên dưới:
//
// /api/auth
// /api/products
// /api/cart
// /api/orders
// /api/reviews
// /api/favorites
// /api/admin
// ...
//
// được quản lý trong routes/index.js
// ============================================================

app.use(
    "/api",
    apiLimiter,
    router
);

// ============================================================
// 404 - API NOT FOUND
// ============================================================

app.use(
    (
        req,
        res
    ) => {
        return res
            .status(404)
            .json({
                success:
                    false,

                message:
                    `API Not Found: ${req.originalUrl}`,

                errors:
                    null,
            });
    }
);

// ============================================================
// GLOBAL ERROR HANDLER
//
// Phải đặt SAU toàn bộ routes.
// ============================================================

app.use(
    errorMiddleware
);

// ============================================================
// EXPORT APP
// ============================================================

module.exports =
    app;