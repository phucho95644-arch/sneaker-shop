const express = require(
    "express"
);

const router =
    express.Router();

// ============================================================
// RATE LIMIT
// ============================================================

const {
    loginLimiter,
    registerLimiter,
} = require(
    "../middleware/rateLimit.middleware"
);

// ============================================================
// AUTH
// ============================================================

const authRoutes =
    require(
        "./auth.routes"
    );

// ============================================================
// USER
// ============================================================

const userRoutes =
    require(
        "./user.routes"
    );

const addressRoutes =
    require(
        "./address.routes"
    );

// ============================================================
// SHOPPING
// ============================================================

const favoriteRoutes =
    require(
        "./favorite.routes"
    );

const cartRoutes =
    require(
        "./cart.routes"
    );

// ============================================================
// PUBLIC CATALOG
// ============================================================

const categoryRoutes =
    require(
        "./category.routes"
    );

const brandRoutes =
    require(
        "./brand.routes"
    );

const sizeRoutes =
    require(
        "./size.routes"
    );

const colorRoutes =
    require(
        "./color.routes"
    );

const productRoutes =
    require(
        "./product.routes"
    );

// ============================================================
// REVIEW / COUPON
// ============================================================

const reviewRoutes =
    require(
        "./review.routes"
    );

const couponRoutes =
    require(
        "./coupon.routes"
    );

// ============================================================
// ORDERS
// ============================================================

const orderRoutes =
    require(
        "./order.routes"
    );

const adminOrderRoutes =
    require(
        "./admin.orders.routes"
    );

// ============================================================
// ADMIN ROUTES
// ============================================================

const adminCouponRoutes =
    require(
        "./admin.coupons.routes"
    );

const adminDashboardRoutes =
    require(
        "./adminDashboard.routes"
    );

const adminProductRoutes =
    require(
        "./admin.products.routes"
    );

const adminCategoryRoutes =
    require(
        "./admin.categories.routes"
    );

const adminBrandRoutes =
    require(
        "./admin.brands.routes"
    );

const adminSizeRoutes =
    require(
        "./admin.sizes.routes"
    );

const adminColorRoutes =
    require(
        "./admin.colors.routes"
    );

const adminRoutes =
    require(
        "./admin.routes"
    );

// ============================================================
// AUTH RATE LIMIT
//
// POST /api/auth/login
// POST /api/auth/register
// ============================================================

router.use(
    "/auth/login",
    loginLimiter
);

router.use(
    "/auth/register",
    registerLimiter
);

// ============================================================
// AUTH
// ============================================================

router.use(
    "/auth",
    authRoutes
);

// ============================================================
// USER ADDRESSES
//
// Route cụ thể phải đứng trước /users
// ============================================================

router.use(
    "/users/addresses",
    addressRoutes
);

// ============================================================
// USERS
// ============================================================

router.use(
    "/users",
    userRoutes
);

// ============================================================
// FAVORITES
// ============================================================

router.use(
    "/favorites",
    favoriteRoutes
);

// ============================================================
// CART
// ============================================================

router.use(
    "/cart",
    cartRoutes
);

// ============================================================
// PUBLIC CATEGORIES
//
// GET /api/categories
// ============================================================

router.use(
    "/categories",
    categoryRoutes
);

// ============================================================
// PUBLIC BRANDS
//
// GET /api/brands
// ============================================================

router.use(
    "/brands",
    brandRoutes
);

// ============================================================
// PUBLIC SIZES
//
// GET /api/sizes
// ============================================================

router.use(
    "/sizes",
    sizeRoutes
);

// ============================================================
// PUBLIC COLORS
//
// GET /api/colors
// ============================================================

router.use(
    "/colors",
    colorRoutes
);

// ============================================================
// PUBLIC PRODUCTS
//
// GET /api/products
// GET /api/products/:id
// ============================================================

router.use(
    "/products",
    productRoutes
);

// ============================================================
// REVIEWS
// ============================================================

router.use(
    "/reviews",
    reviewRoutes
);

// ============================================================
// CUSTOMER COUPONS
//
// POST /api/coupons/validate
// ============================================================

router.use(
    "/coupons",
    couponRoutes
);

// ============================================================
// CUSTOMER ORDERS
// ============================================================

router.use(
    "/orders",
    orderRoutes
);

// ============================================================
// ADMIN COUPONS
//
// /api/admin/coupons
// ============================================================

router.use(
    "/admin/coupons",
    adminCouponRoutes
);

// ============================================================
// ADMIN DASHBOARD / USERS / STATISTICS
//
// QUAN TRỌNG:
//
// Phải đứng trước /admin/orders.
//
// Vì adminDashboardRoutes có:
//
// GET /api/admin/orders/recent
//
// Nếu /admin/orders đứng trước,
// "recent" có thể bị hiểu thành :id.
// ============================================================

router.use(
    "/admin",
    adminDashboardRoutes
);

// ============================================================
// ADMIN ORDERS
//
// GET
// /api/admin/orders
//
// GET
// /api/admin/orders/:id
//
// PATCH
// /api/admin/orders/:id/status
//
// PATCH
// /api/admin/orders/:id/payment-status
// ============================================================

router.use(
    "/admin/orders",
    adminOrderRoutes
);

// ============================================================
// ADMIN PRODUCTS
//
// GET
// /api/admin/products
//
// GET
// /api/admin/products/:id
//
// POST
// /api/admin/products
//
// PUT
// /api/admin/products/:id
//
// PATCH
// /api/admin/products/:id/status
//
// Đặt trước adminRoutes vì adminRoutes cũ
// cũng có route /products.
// ============================================================

router.use(
    "/admin/products",
    adminProductRoutes
);

// ============================================================
// ADMIN CATEGORIES
//
// GET
// /api/admin/categories
//
// GET
// /api/admin/categories/:id
//
// POST
// /api/admin/categories
//
// PUT
// /api/admin/categories/:id
//
// PATCH
// /api/admin/categories/:id/status
//
// DELETE
// /api/admin/categories/:id
// ============================================================

router.use(
    "/admin/categories",
    adminCategoryRoutes
);

// ============================================================
// ADMIN BRANDS
//
// GET
// /api/admin/brands
//
// GET
// /api/admin/brands/:id
//
// POST
// /api/admin/brands
//
// PUT
// /api/admin/brands/:id
//
// PATCH
// /api/admin/brands/:id/status
//
// DELETE
// /api/admin/brands/:id
// ============================================================

router.use(
    "/admin/brands",
    adminBrandRoutes
);

// ============================================================
// ADMIN SIZES
//
// GET
// /api/admin/sizes
//
// GET
// /api/admin/sizes/:id
//
// POST
// /api/admin/sizes
//
// PUT
// /api/admin/sizes/:id
//
// PATCH
// /api/admin/sizes/:id/status
//
// DELETE
// /api/admin/sizes/:id
// ============================================================

router.use(
    "/admin/sizes",
    adminSizeRoutes
);

// ============================================================
// ADMIN COLORS
//
// GET
// /api/admin/colors
//
// GET
// /api/admin/colors/:id
//
// POST
// /api/admin/colors
//
// PUT
// /api/admin/colors/:id
//
// PATCH
// /api/admin/colors/:id/status
//
// DELETE
// /api/admin/colors/:id
// ============================================================

router.use(
    "/admin/colors",
    adminColorRoutes
);

// ============================================================
// ADMIN GENERAL
//
// Các route Admin cũ / dùng chung.
//
// Ví dụ:
//
// GET /api/admin/inventory
//
// Các router cụ thể phía trên:
//
// /admin/products
// /admin/categories
// /admin/brands
// /admin/sizes
// /admin/colors
//
// được ưu tiên trước adminRoutes.
// ============================================================

router.use(
    "/admin",
    adminRoutes
);

// ============================================================
// EXPORT
// ============================================================

module.exports =
    router;