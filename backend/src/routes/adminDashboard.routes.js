const express = require("express");

const router = express.Router();

const authMiddleware = require(
    "../middleware/auth.middleware"
);

const adminMiddleware = require(
    "../middleware/admin.middleware"
);

const validateMiddleware = require(
    "../middleware/validate.middleware"
);

const adminUserController = require(
    "../controllers/adminUser.controller"
);

const statisticsController = require(
    "../controllers/statistics.controller"
);

const adminUserValidator = require(
    "../validators/adminUser.validator"
);

const statisticsValidator = require(
    "../validators/statistics.validator"
);

// ============================================================
// ADMIN SECURITY
//
// Tất cả API trong router này đều yêu cầu:
// 1. Đã đăng nhập
// 2. Có quyền admin
// ============================================================

router.use(
    authMiddleware,
    adminMiddleware
);

// ============================================================
// DASHBOARD
// GET /api/admin/dashboard
// ============================================================

router.get(
    "/dashboard",
    statisticsController.getDashboard
);

// ============================================================
// LOW STOCK
// GET /api/admin/dashboard/low-stock
// ============================================================

router.get(
    "/dashboard/low-stock",

    statisticsValidator.lowStock,

    validateMiddleware,

    statisticsController.getLowStock
);

// ============================================================
// REVENUE
// GET /api/admin/statistics/revenue
// ============================================================

router.get(
    "/statistics/revenue",

    statisticsValidator.period,

    validateMiddleware,

    statisticsController.getRevenueStatistics
);

// ============================================================
// ORDER STATISTICS
// GET /api/admin/statistics/orders
// ============================================================

router.get(
    "/statistics/orders",

    statisticsValidator.period,

    validateMiddleware,

    statisticsController.getOrderStatistics
);

// ============================================================
// PRODUCT STATISTICS
// GET /api/admin/statistics/products
// ============================================================

router.get(
    "/statistics/products",

    statisticsController.getProductStatistics
);

// ============================================================
// CUSTOMER STATISTICS
// GET /api/admin/statistics/customers
// ============================================================

router.get(
    "/statistics/customers",

    statisticsController.getCustomerStatistics
);

// ============================================================
// CUSTOMER GROWTH
// GET /api/admin/statistics/customers/growth
// ============================================================

router.get(
    "/statistics/customers/growth",

    statisticsValidator.period,

    validateMiddleware,

    statisticsController.getCustomerGrowth
);

// ============================================================
// TOP PRODUCTS
// GET /api/admin/statistics/top-products
// ============================================================

router.get(
    "/statistics/top-products",

    statisticsValidator.topList,

    validateMiddleware,

    statisticsController.getTopProducts
);

// ============================================================
// TOP CUSTOMERS
// GET /api/admin/statistics/top-customers
// ============================================================

router.get(
    "/statistics/top-customers",

    statisticsValidator.topList,

    validateMiddleware,

    statisticsController.getTopCustomers
);

// ============================================================
// SALES
// GET /api/admin/statistics/sales
// ============================================================

router.get(
    "/statistics/sales",

    statisticsValidator.period,

    validateMiddleware,

    statisticsController.getSalesStatistics
);

// ============================================================
// RECENT ORDERS
//
// QUAN TRỌNG:
// Route này phải được mount trước /admin/orders/:id
//
// GET /api/admin/orders/recent
// ============================================================

router.get(
    "/orders/recent",

    statisticsValidator.recentOrders,

    validateMiddleware,

    statisticsController.getRecentOrders
);

// ============================================================
// USERS LIST
// GET /api/admin/users
// ============================================================

router.get(
    "/users",

    adminUserValidator.listUsers,

    validateMiddleware,

    adminUserController.getUsers
);

// ============================================================
// USER DETAIL
// GET /api/admin/users/:id
// ============================================================

router.get(
    "/users/:id",

    adminUserValidator.userId,

    validateMiddleware,

    adminUserController.getUserDetail
);

// ============================================================
// UPDATE USER STATUS
// PATCH /api/admin/users/:id/status
// ============================================================

router.patch(
    "/users/:id/status",

    adminUserValidator.updateStatus,

    validateMiddleware,

    adminUserController.updateStatus
);

// ============================================================
// UPDATE USER ROLE
// PATCH /api/admin/users/:id/role
// ============================================================

router.patch(
    "/users/:id/role",

    adminUserValidator.updateRole,

    validateMiddleware,

    adminUserController.updateRole
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;