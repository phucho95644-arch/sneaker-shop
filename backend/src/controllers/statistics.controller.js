const StatisticsService = require(
    "../services/statistics.service"
);

const asyncHandler = require(
    "../utils/asyncHandler"
);

// ============================================================
// DASHBOARD
// ============================================================
exports.getDashboard = asyncHandler(
    async (req, res) => {
        const data =
            await StatisticsService
                .getDashboard();

        return res.status(200).json({
            success: true,

            message:
                "Lấy dữ liệu dashboard thành công",

            data,
        });
    }
);

// ============================================================
// REVENUE
// ============================================================
exports.getRevenueStatistics =
    asyncHandler(
        async (req, res) => {
            const data =
                await StatisticsService
                    .getRevenueStatistics(
                        req.query
                    );

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        "Lấy thống kê doanh thu thành công",

                    data,
                });
        }
    );

// ============================================================
// ORDERS
// ============================================================
exports.getOrderStatistics =
    asyncHandler(
        async (req, res) => {
            const data =
                await StatisticsService
                    .getOrderStatistics(
                        req.query
                    );

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        "Lấy thống kê đơn hàng thành công",

                    data,
                });
        }
    );

// ============================================================
// PRODUCTS
// ============================================================
exports.getProductStatistics =
    asyncHandler(
        async (req, res) => {
            const data =
                await StatisticsService
                    .getProductStatistics();

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        "Lấy thống kê sản phẩm thành công",

                    data,
                });
        }
    );

// ============================================================
// CUSTOMERS
// ============================================================
exports.getCustomerStatistics =
    asyncHandler(
        async (req, res) => {
            const data =
                await StatisticsService
                    .getCustomerStatistics();

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        "Lấy thống kê khách hàng thành công",

                    data,
                });
        }
    );

// ============================================================
// CUSTOMER GROWTH
// ============================================================
exports.getCustomerGrowth =
    asyncHandler(
        async (req, res) => {
            const data =
                await StatisticsService
                    .getCustomerGrowth(
                        req.query.period
                    );

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        "Lấy tăng trưởng khách hàng thành công",

                    data,
                });
        }
    );

// ============================================================
// TOP PRODUCTS
// ============================================================
exports.getTopProducts =
    asyncHandler(
        async (req, res) => {
            const data =
                await StatisticsService
                    .getTopProducts(
                        req.query
                    );

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        "Lấy sản phẩm bán chạy thành công",

                    data,
                });
        }
    );

// ============================================================
// TOP CUSTOMERS
// ============================================================
exports.getTopCustomers =
    asyncHandler(
        async (req, res) => {
            const data =
                await StatisticsService
                    .getTopCustomers(
                        req.query.limit
                    );

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        "Lấy khách hàng hàng đầu thành công",

                    data,
                });
        }
    );

// ============================================================
// SALES
// ============================================================
exports.getSalesStatistics =
    asyncHandler(
        async (req, res) => {
            const data =
                await StatisticsService
                    .getSalesStatistics(
                        req.query
                    );

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        "Lấy thống kê bán hàng thành công",

                    data,
                });
        }
    );

// ============================================================
// RECENT ORDERS
// ============================================================
exports.getRecentOrders =
    asyncHandler(
        async (req, res) => {
            const data =
                await StatisticsService
                    .getRecentOrders(
                        req.query.limit
                    );

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        "Lấy đơn hàng gần đây thành công",

                    data,
                });
        }
    );

// ============================================================
// LOW STOCK
// ============================================================
exports.getLowStock =
    asyncHandler(
        async (req, res) => {
            const data =
                await StatisticsService
                    .getLowStock(
                        req.query.threshold,
                        req.query.limit
                    );

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        "Lấy danh sách tồn kho thấp thành công",

                    data,
                });
        }
    );