const StatisticsModel = require(
    "../models/statistics.model"
);

const toNumber = (value) =>
    Number(value || 0);

// ============================================================
// DASHBOARD
// ============================================================
exports.getDashboard = async () => {
    const [
        users,
        products,
        orders,
        revenue,
        reviews,
        recentOrders,
        lowStock,
    ] = await Promise.all([
        StatisticsModel.getUserOverview(),

        StatisticsModel.getProductOverview(
            5
        ),

        StatisticsModel.getOrderOverview(),

        StatisticsModel.getRevenueOverview(),

        StatisticsModel.getReviewOverview(),

        StatisticsModel.getRecentOrders(
            8
        ),

        StatisticsModel.getLowStock(
            5,
            8
        ),
    ]);

    return {
        users: {
            totalCustomers:
                toNumber(
                    users.total_customers
                ),

            activeCustomers:
                toNumber(
                    users.active_customers
                ),

            inactiveCustomers:
                toNumber(
                    users.inactive_customers
                ),

            blockedCustomers:
                toNumber(
                    users.blocked_customers
                ),

            newCustomersToday:
                toNumber(
                    users.new_today
                ),

            newCustomersThisWeek:
                toNumber(
                    users.new_this_week
                ),

            newCustomersThisMonth:
                toNumber(
                    users.new_this_month
                ),
        },

        products: {
            totalProducts:
                toNumber(
                    products.total_products
                ),

            activeProducts:
                toNumber(
                    products.active_products
                ),

            inactiveProducts:
                toNumber(
                    products.inactive_products
                ),

            draftProducts:
                toNumber(
                    products.draft_products
                ),

            totalVariants:
                toNumber(
                    products.total_variants
                ),

            totalStock:
                toNumber(
                    products.total_stock
                ),

            lowStockVariants:
                toNumber(
                    products.low_stock_variants
                ),

            outOfStockVariants:
                toNumber(
                    products.out_of_stock_variants
                ),
        },

        orders: {
            totalOrders:
                toNumber(
                    orders.total_orders
                ),

            pending:
                toNumber(
                    orders.pending
                ),

            confirmed:
                toNumber(
                    orders.confirmed
                ),

            processing:
                toNumber(
                    orders.processing
                ),

            shipping:
                toNumber(
                    orders.shipping
                ),

            delivered:
                toNumber(
                    orders.delivered
                ),

            cancelled:
                toNumber(
                    orders.cancelled
                ),
        },

        revenue: {
            today:
                toNumber(
                    revenue.today
                ),

            thisMonth:
                toNumber(
                    revenue.this_month
                ),

            thisYear:
                toNumber(
                    revenue.this_year
                ),
        },

        reviews: {
            total:
                toNumber(
                    reviews.total
                ),

            pending:
                toNumber(
                    reviews.pending
                ),

            approved:
                toNumber(
                    reviews.approved
                ),

            hidden:
                toNumber(
                    reviews.hidden
                ),
        },

        recentOrders:
            recentOrders.map(
                (order) => ({
                    id:
                        order.id,

                    orderCode:
                        order.order_code,

                    customer: {
                        id:
                            order.user_id,

                        fullName:
                            order.full_name,

                        email:
                            order.email,

                        avatar:
                            order.avatar,
                    },

                    receiverName:
                        order.receiver_name,

                    receiverPhone:
                        order.receiver_phone,

                    totalAmount:
                        toNumber(
                            order.total_amount
                        ),

                    paymentMethod:
                        order.payment_method,

                    paymentStatus:
                        order.payment_status,

                    orderStatus:
                        order.order_status,

                    createdAt:
                        order.created_at,
                })
            ),

        lowStock:
            lowStock.map(
                (item) => ({
                    variantId:
                        item.variant_id,

                    sku:
                        item.sku,

                    stockQuantity:
                        toNumber(
                            item.stock_quantity
                        ),

                    variantStatus:
                        item.variant_status,

                    product: {
                        id:
                            item.product_id,

                        name:
                            item.product_name,

                        thumbnail:
                            item.thumbnail,
                    },

                    size: {
                        id:
                            item.size_id,

                        name:
                            item.size_name,
                    },

                    color: {
                        id:
                            item.color_id,

                        name:
                            item.color_name,

                        hexCode:
                            item.hex_code,
                    },
                })
            ),
    };
};

// ============================================================
// REVENUE
// ============================================================
exports.getRevenueStatistics =
    async (query) => {
        const period =
            query.period || "day";

        const rows =
            await StatisticsModel
                .getRevenueStatistics({
                    period,
                    fromDate:
                        query.fromDate ||
                        null,
                    toDate:
                        query.toDate ||
                        null,
                });

        return {
            period,

            items:
                rows.map(
                    (item) => ({
                        label:
                            String(
                                item.label
                            ),

                        orders:
                            toNumber(
                                item.orders
                            ),

                        revenue:
                            toNumber(
                                item.revenue
                            ),
                    })
                ),
        };
    };

// ============================================================
// ORDER STATISTICS
// ============================================================
exports.getOrderStatistics =
    async (query) => {
        const row =
            await StatisticsModel
                .getOrderStatistics({
                    fromDate:
                        query.fromDate ||
                        null,

                    toDate:
                        query.toDate ||
                        null,
                });

        const total =
            toNumber(row.total);

        const delivered =
            toNumber(
                row.delivered
            );

        const cancelled =
            toNumber(
                row.cancelled
            );

        return {
            total,

            byStatus: {
                pending:
                    toNumber(
                        row.pending
                    ),

                confirmed:
                    toNumber(
                        row.confirmed
                    ),

                processing:
                    toNumber(
                        row.processing
                    ),

                shipping:
                    toNumber(
                        row.shipping
                    ),

                delivered,

                cancelled,
            },

            completionRate:
                total > 0
                    ? Number(
                          (
                              (delivered /
                                  total) *
                              100
                          ).toFixed(2)
                      )
                    : 0,

            cancellationRate:
                total > 0
                    ? Number(
                          (
                              (cancelled /
                                  total) *
                              100
                          ).toFixed(2)
                      )
                    : 0,
        };
    };

// ============================================================
// PRODUCT STATISTICS
// ============================================================
exports.getProductStatistics =
    async () => {
        const data =
            await StatisticsModel
                .getProductOverview(5);

        return {
            totalProducts:
                toNumber(
                    data.total_products
                ),

            activeProducts:
                toNumber(
                    data.active_products
                ),

            inactiveProducts:
                toNumber(
                    data.inactive_products
                ),

            draftProducts:
                toNumber(
                    data.draft_products
                ),

            totalVariants:
                toNumber(
                    data.total_variants
                ),

            totalStock:
                toNumber(
                    data.total_stock
                ),

            lowStockVariants:
                toNumber(
                    data.low_stock_variants
                ),

            outOfStockVariants:
                toNumber(
                    data.out_of_stock_variants
                ),
        };
    };

// ============================================================
// CUSTOMER STATISTICS
// ============================================================
exports.getCustomerStatistics =
    async () => {
        const row =
            await StatisticsModel
                .getCustomerStatistics();

        return {
            total:
                toNumber(
                    row.total
                ),

            active:
                toNumber(
                    row.active
                ),

            inactive:
                toNumber(
                    row.inactive
                ),

            blocked:
                toNumber(
                    row.blocked
                ),

            newToday:
                toNumber(
                    row.new_today
                ),

            newThisWeek:
                toNumber(
                    row.new_this_week
                ),

            newThisMonth:
                toNumber(
                    row.new_this_month
                ),
        };
    };

// ============================================================
// CUSTOMER GROWTH
// ============================================================
exports.getCustomerGrowth =
    async (period) => {
        const selectedPeriod =
            period || "month";

        const rows =
            await StatisticsModel
                .getCustomerGrowth(
                    selectedPeriod
                );

        return {
            period:
                selectedPeriod,

            items:
                rows.map(
                    (item) => ({
                        label:
                            String(
                                item.label
                            ),

                        newCustomers:
                            toNumber(
                                item.new_customers
                            ),
                    })
                ),
        };
    };

// ============================================================
// TOP PRODUCTS
// ============================================================
exports.getTopProducts =
    async (query) => {
        const rows =
            await StatisticsModel
                .getTopProducts({
                    limit:
                        query.limit ||
                        10,

                    fromDate:
                        query.fromDate ||
                        null,

                    toDate:
                        query.toDate ||
                        null,
                });

        return rows.map(
            (item) => ({
                productId:
                    item.product_id,

                name:
                    item.product_name,

                thumbnail:
                    item.thumbnail,

                quantitySold:
                    toNumber(
                        item.quantity_sold
                    ),

                revenue:
                    toNumber(
                        item.revenue
                    ),
            })
        );
    };

// ============================================================
// TOP CUSTOMERS
// ============================================================
exports.getTopCustomers =
    async (limit) => {
        const rows =
            await StatisticsModel
                .getTopCustomers(
                    limit
                );

        return rows.map(
            (item) => ({
                id:
                    item.id,

                fullName:
                    item.full_name,

                email:
                    item.email,

                avatar:
                    item.avatar,

                totalOrders:
                    toNumber(
                        item.total_orders
                    ),

                deliveredOrders:
                    toNumber(
                        item.delivered_orders
                    ),

                totalSpent:
                    toNumber(
                        item.total_spent
                    ),
            })
        );
    };

// ============================================================
// SALES
// ============================================================
exports.getSalesStatistics =
    async (query) => {
        const period =
            query.period || "day";

        const rows =
            await StatisticsModel
                .getSalesStatistics({
                    period,

                    fromDate:
                        query.fromDate ||
                        null,

                    toDate:
                        query.toDate ||
                        null,
                });

        return {
            period,

            items:
                rows.map(
                    (item) => ({
                        label:
                            String(
                                item.label
                            ),

                        orders:
                            toNumber(
                                item.orders
                            ),

                        itemsSold:
                            toNumber(
                                item.items_sold
                            ),

                        revenue:
                            toNumber(
                                item.revenue
                            ),
                    })
                ),
        };
    };

// ============================================================
// RECENT ORDERS
// ============================================================
exports.getRecentOrders =
    async (limit) => {
        const rows =
            await StatisticsModel
                .getRecentOrders(
                    limit
                );

        return rows.map(
            (order) => ({
                id:
                    order.id,

                orderCode:
                    order.order_code,

                customer: {
                    id:
                        order.user_id,

                    fullName:
                        order.full_name,

                    email:
                        order.email,

                    avatar:
                        order.avatar,
                },

                receiverName:
                    order.receiver_name,

                totalAmount:
                    toNumber(
                        order.total_amount
                    ),

                paymentMethod:
                    order.payment_method,

                paymentStatus:
                    order.payment_status,

                orderStatus:
                    order.order_status,

                createdAt:
                    order.created_at,
            })
        );
    };

// ============================================================
// LOW STOCK
// ============================================================
exports.getLowStock =
    async (
        threshold,
        limit
    ) => {
        const rows =
            await StatisticsModel
                .getLowStock(
                    threshold,
                    limit
                );

        return rows.map(
            (item) => ({
                variantId:
                    item.variant_id,

                sku:
                    item.sku,

                stockQuantity:
                    toNumber(
                        item.stock_quantity
                    ),

                variantStatus:
                    item.variant_status,

                product: {
                    id:
                        item.product_id,

                    name:
                        item.product_name,

                    thumbnail:
                        item.thumbnail,
                },

                size: {
                    id:
                        item.size_id,

                    name:
                        item.size_name,
                },

                color: {
                    id:
                        item.color_id,

                    name:
                        item.color_name,

                    hexCode:
                        item.hex_code,
                },
            })
        );
    };