import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    FaBoxOpen,
    FaChartLine,
    FaClipboardList,
    FaMoneyBillWave,
    FaShoppingBag,
    FaSyncAlt,
    FaUsers,
} from "react-icons/fa";

import {
    toast,
} from "react-toastify";

import adminStatisticsService
    from "../../services/adminStatisticsService";

import "./StatisticsPage.css";

// ============================================================
// HELPERS
// ============================================================

const toNumber = (value) => {
    const result =
        Number(value);

    return Number.isFinite(result)
        ? result
        : 0;
};

const formatNumber = (value) => {
    return toNumber(value)
        .toLocaleString("vi-VN");
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat(
        "vi-VN",
        {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }
    ).format(
        toNumber(value)
    );
};

const normalizeArray = (data) => {
    if (
        Array.isArray(data)
    ) {
        return data;
    }

    if (
        Array.isArray(
            data?.items
        )
    ) {
        return data.items;
    }

    if (
        Array.isArray(
            data?.data
        )
    ) {
        return data.data;
    }

    return [];
};

const getMaxValue = (
    items,
    key
) => {
    if (
        !items.length
    ) {
        return 1;
    }

    return Math.max(
        ...items.map(
            (item) =>
                toNumber(
                    item?.[key]
                )
        ),
        1
    );
};

// ============================================================
// STATISTICS PAGE
// ============================================================

function StatisticsPage() {
    const [
        period,
        setPeriod,
    ] = useState(
        "month"
    );

    const [
        loading,
        setLoading,
    ] = useState(
        true
    );

    const [
        refreshing,
        setRefreshing,
    ] = useState(
        false
    );

    const [
        revenue,
        setRevenue,
    ] = useState(
        {}
    );

    const [
        orders,
        setOrders,
    ] = useState(
        {}
    );

    const [
        products,
        setProducts,
    ] = useState(
        {}
    );

    const [
        customers,
        setCustomers,
    ] = useState(
        {}
    );

    const [
        customerGrowth,
        setCustomerGrowth,
    ] = useState(
        []
    );

    const [
        topProducts,
        setTopProducts,
    ] = useState(
        []
    );

    const [
        topCustomers,
        setTopCustomers,
    ] = useState(
        []
    );

    const [
        sales,
        setSales,
    ] = useState(
        []
    );

    const [
        recentOrders,
        setRecentOrders,
    ] = useState(
        []
    );

    // ========================================================
    // LOAD
    // ========================================================

    const loadStatistics =
        useCallback(
            async (
                showToast = false
            ) => {
                if (
                    showToast
                ) {
                    setRefreshing(
                        true
                    );
                } else {
                    setLoading(
                        true
                    );
                }

                try {
                    const results =
                        await Promise.allSettled(
                            [
                                adminStatisticsService.getRevenue(
                                    {
                                        period,
                                    }
                                ),

                                adminStatisticsService.getOrders(
                                    {
                                        period,
                                    }
                                ),

                                adminStatisticsService.getProducts(),

                                adminStatisticsService.getCustomers(),

                                adminStatisticsService.getCustomerGrowth(
                                    {
                                        period,
                                    }
                                ),

                                adminStatisticsService.getTopProducts(
                                    {
                                        limit: 10,
                                    }
                                ),

                                adminStatisticsService.getTopCustomers(
                                    {
                                        limit: 10,
                                    }
                                ),

                                adminStatisticsService.getSales(
                                    {
                                        period,
                                    }
                                ),

                                adminStatisticsService.getRecentOrders(
                                    {
                                        limit: 10,
                                    }
                                ),
                            ]
                        );

                    const [
                        revenueResult,
                        orderResult,
                        productResult,
                        customerResult,
                        growthResult,
                        topProductsResult,
                        topCustomersResult,
                        salesResult,
                        recentOrdersResult,
                    ] =
                        results;

                    if (
                        revenueResult.status ===
                        "fulfilled"
                    ) {
                        setRevenue(
                            revenueResult.value ||
                                {}
                        );
                    }

                    if (
                        orderResult.status ===
                        "fulfilled"
                    ) {
                        setOrders(
                            orderResult.value ||
                                {}
                        );
                    }

                    if (
                        productResult.status ===
                        "fulfilled"
                    ) {
                        setProducts(
                            productResult.value ||
                                {}
                        );
                    }

                    if (
                        customerResult.status ===
                        "fulfilled"
                    ) {
                        setCustomers(
                            customerResult.value ||
                                {}
                        );
                    }

                    if (
                        growthResult.status ===
                        "fulfilled"
                    ) {
                        setCustomerGrowth(
                            normalizeArray(
                                growthResult.value
                            )
                        );
                    }

                    if (
                        topProductsResult.status ===
                        "fulfilled"
                    ) {
                        setTopProducts(
                            normalizeArray(
                                topProductsResult.value
                            )
                        );
                    }

                    if (
                        topCustomersResult.status ===
                        "fulfilled"
                    ) {
                        setTopCustomers(
                            normalizeArray(
                                topCustomersResult.value
                            )
                        );
                    }

                    if (
                        salesResult.status ===
                        "fulfilled"
                    ) {
                        setSales(
                            normalizeArray(
                                salesResult.value
                            )
                        );
                    }

                    if (
                        recentOrdersResult.status ===
                        "fulfilled"
                    ) {
                        setRecentOrders(
                            normalizeArray(
                                recentOrdersResult.value
                            )
                        );
                    }

                    const failed =
                        results.filter(
                            (item) =>
                                item.status ===
                                "rejected"
                        );

                    if (
                        failed.length >
                        0
                    ) {
                        console.warn(
                            "STATISTICS PARTIAL ERRORS:",
                            failed
                        );

                        toast.warning(
                            `Có ${failed.length} nhóm thống kê chưa tải được.`
                        );
                    } else if (
                        showToast
                    ) {
                        toast.success(
                            "Đã cập nhật thống kê."
                        );
                    }
                } catch (
                    error
                ) {
                    console.error(
                        "STATISTICS ERROR:",
                        error
                    );

                    toast.error(
                        "Không thể tải dữ liệu thống kê."
                    );
                } finally {
                    setLoading(
                        false
                    );

                    setRefreshing(
                        false
                    );
                }
            },
            [
                period,
            ]
        );

    useEffect(
        () => {
            loadStatistics();
        },
        [
            loadStatistics,
        ]
    );

    // ========================================================
    // REVENUE ITEMS
    // ========================================================

    const revenueItems =
        useMemo(
            () =>
                normalizeArray(
                    revenue
                ),
            [
                revenue,
            ]
        );

    const revenueTotal =
        useMemo(
            () => {
                if (
                    revenue?.totalRevenue !==
                    undefined
                ) {
                    return toNumber(
                        revenue.totalRevenue
                    );
                }

                return revenueItems.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        toNumber(
                            item.revenue
                        ),
                    0
                );
            },
            [
                revenue,
                revenueItems,
            ]
        );

    // ========================================================
    // ORDER STATS
    // ========================================================

    const orderStatus =
        orders?.byStatus ||
        orders?.status ||
        {};

    const totalOrders =
        toNumber(
            orders?.total ??
                orders?.totalOrders
        );

    // ========================================================
    // SALES
    // ========================================================

    const salesMax =
        getMaxValue(
            sales,
            "revenue"
        );

    const growthMax =
        getMaxValue(
            customerGrowth,
            "newCustomers"
        );

    // ========================================================
    // LOADING
    // ========================================================

    if (
        loading
    ) {
        return (
            <div className="statistics-page">
                <div className="statistics-loading">
                    <div className="spinner-border" />

                    <span>
                        Đang tải thống kê...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="statistics-page">
            {/* ==================================================
                HEADER
            ================================================== */}

            <header className="statistics-header">
                <div>
                    <span className="statistics-eyebrow">
                        PHÂN TÍCH HỆ THỐNG
                    </span>

                    <h1>
                        Thống kê kinh doanh
                    </h1>

                    <p>
                        Theo dõi doanh thu,
                        đơn hàng, khách hàng
                        và hiệu suất sản phẩm.
                    </p>
                </div>

                <div className="statistics-header-actions">
                    <select
                        value={
                            period
                        }
                        onChange={(
                            event
                        ) =>
                            setPeriod(
                                event
                                    .target
                                    .value
                            )
                        }
                    >
                        <option value="day">
                            Theo ngày
                        </option>

                        <option value="week">
                            Theo tuần
                        </option>

                        <option value="month">
                            Theo tháng
                        </option>

                        <option value="year">
                            Theo năm
                        </option>
                    </select>

                    <button
                        type="button"
                        disabled={
                            refreshing
                        }
                        onClick={() =>
                            loadStatistics(
                                true
                            )
                        }
                    >
                        <FaSyncAlt
                            className={
                                refreshing
                                    ? "statistics-spin"
                                    : ""
                            }
                        />

                        {refreshing
                            ? "Đang tải..."
                            : "Làm mới"}
                    </button>
                </div>
            </header>

            {/* ==================================================
                SUMMARY
            ================================================== */}

            <section className="statistics-summary-grid">
                <article className="statistics-summary-card">
                    <div className="statistics-summary-icon statistics-summary-icon--revenue">
                        <FaMoneyBillWave />
                    </div>

                    <div>
                        <span>
                            Doanh thu
                        </span>

                        <strong>
                            {formatCurrency(
                                revenueTotal
                            )}
                        </strong>
                    </div>
                </article>

                <article className="statistics-summary-card">
                    <div className="statistics-summary-icon statistics-summary-icon--orders">
                        <FaShoppingBag />
                    </div>

                    <div>
                        <span>
                            Tổng đơn hàng
                        </span>

                        <strong>
                            {formatNumber(
                                totalOrders
                            )}
                        </strong>
                    </div>
                </article>

                <article className="statistics-summary-card">
                    <div className="statistics-summary-icon statistics-summary-icon--products">
                        <FaBoxOpen />
                    </div>

                    <div>
                        <span>
                            Sản phẩm
                        </span>

                        <strong>
                            {formatNumber(
                                products?.totalProducts
                            )}
                        </strong>
                    </div>
                </article>

                <article className="statistics-summary-card">
                    <div className="statistics-summary-icon statistics-summary-icon--customers">
                        <FaUsers />
                    </div>

                    <div>
                        <span>
                            Khách hàng
                        </span>

                        <strong>
                            {formatNumber(
                                customers?.total
                            )}
                        </strong>
                    </div>
                </article>
            </section>

            {/* ==================================================
                SALES CHART
            ================================================== */}

            <section className="statistics-panel">
                <div className="statistics-panel-header">
                    <div>
                        <span>
                            DOANH SỐ
                        </span>

                        <h2>
                            Biểu đồ doanh thu
                        </h2>
                    </div>

                    <FaChartLine />
                </div>

                {sales.length ===
                0 ? (
                    <div className="statistics-empty">
                        Chưa có dữ liệu doanh số.
                    </div>
                ) : (
                    <div className="statistics-bar-chart">
                        {sales.map(
                            (
                                item,
                                index
                            ) => {
                                const value =
                                    toNumber(
                                        item.revenue
                                    );

                                const width =
                                    Math.max(
                                        (
                                            value /
                                            salesMax
                                        ) *
                                            100,
                                        3
                                    );

                                return (
                                    <div
                                        className="statistics-bar-row"
                                        key={
                                            item.label ||
                                            index
                                        }
                                    >
                                        <div className="statistics-bar-label">
                                            <span>
                                                {item.label ||
                                                    `#${index + 1}`}
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    value
                                                )}
                                            </strong>
                                        </div>

                                        <div className="statistics-bar-track">
                                            <div
                                                className="statistics-bar-fill"
                                                style={{
                                                    width: `${width}%`,
                                                }}
                                            />
                                        </div>

                                        <small>
                                            {formatNumber(
                                                item.orders
                                            )}{" "}
                                            đơn •{" "}
                                            {formatNumber(
                                                item.itemsSold
                                            )}{" "}
                                            sản phẩm
                                        </small>
                                    </div>
                                );
                            }
                        )}
                    </div>
                )}
            </section>

            {/* ==================================================
                MID GRID
            ================================================== */}

            <section className="statistics-two-column">
                {/* ORDER STATUS */}

                <article className="statistics-panel">
                    <div className="statistics-panel-header">
                        <div>
                            <span>
                                ĐƠN HÀNG
                            </span>

                            <h2>
                                Trạng thái đơn hàng
                            </h2>
                        </div>

                        <FaClipboardList />
                    </div>

                    <div className="statistics-status-list">
                        {[
                            [
                                "Chờ xác nhận",
                                "pending",
                            ],

                            [
                                "Đã xác nhận",
                                "confirmed",
                            ],

                            [
                                "Đang xử lý",
                                "processing",
                            ],

                            [
                                "Đang giao",
                                "shipping",
                            ],

                            [
                                "Đã giao",
                                "delivered",
                            ],

                            [
                                "Đã hủy",
                                "cancelled",
                            ],
                        ].map(
                            ([
                                label,
                                key,
                            ]) => (
                                <div
                                    className="statistics-status-item"
                                    key={
                                        key
                                    }
                                >
                                    <span>
                                        {
                                            label
                                        }
                                    </span>

                                    <strong>
                                        {formatNumber(
                                            orderStatus?.[
                                                key
                                            ]
                                        )}
                                    </strong>
                                </div>
                            )
                        )}
                    </div>

                    <div className="statistics-rate-grid">
                        <div>
                            <span>
                                Tỷ lệ hoàn tất
                            </span>

                            <strong>
                                {toNumber(
                                    orders?.completionRate
                                ).toFixed(
                                    1
                                )}
                                %
                            </strong>
                        </div>

                        <div>
                            <span>
                                Tỷ lệ hủy
                            </span>

                            <strong>
                                {toNumber(
                                    orders?.cancellationRate
                                ).toFixed(
                                    1
                                )}
                                %
                            </strong>
                        </div>
                    </div>
                </article>

                {/* PRODUCT */}

                <article className="statistics-panel">
                    <div className="statistics-panel-header">
                        <div>
                            <span>
                                KHO HÀNG
                            </span>

                            <h2>
                                Thống kê sản phẩm
                            </h2>
                        </div>

                        <FaBoxOpen />
                    </div>

                    <div className="statistics-product-grid">
                        <div>
                            <span>
                                Đang hoạt động
                            </span>

                            <strong>
                                {formatNumber(
                                    products?.activeProducts
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Không hoạt động
                            </span>

                            <strong>
                                {formatNumber(
                                    products?.inactiveProducts
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Biến thể
                            </span>

                            <strong>
                                {formatNumber(
                                    products?.totalVariants
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Tổng tồn kho
                            </span>

                            <strong>
                                {formatNumber(
                                    products?.totalStock
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Sắp hết
                            </span>

                            <strong>
                                {formatNumber(
                                    products?.lowStockVariants
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Hết hàng
                            </span>

                            <strong>
                                {formatNumber(
                                    products?.outOfStockVariants
                                )}
                            </strong>
                        </div>
                    </div>
                </article>
            </section>

            {/* ==================================================
                CUSTOMER GROWTH
            ================================================== */}

            <section className="statistics-panel">
                <div className="statistics-panel-header">
                    <div>
                        <span>
                            KHÁCH HÀNG
                        </span>

                        <h2>
                            Tăng trưởng khách hàng
                        </h2>
                    </div>

                    <FaUsers />
                </div>

                {customerGrowth.length ===
                0 ? (
                    <div className="statistics-empty">
                        Chưa có dữ liệu tăng trưởng.
                    </div>
                ) : (
                    <div className="statistics-growth-chart">
                        {customerGrowth.map(
                            (
                                item,
                                index
                            ) => {
                                const value =
                                    toNumber(
                                        item.newCustomers
                                    );

                                const height =
                                    Math.max(
                                        (
                                            value /
                                            growthMax
                                        ) *
                                            100,
                                        5
                                    );

                                return (
                                    <div
                                        className="statistics-growth-column"
                                        key={
                                            item.label ||
                                            index
                                        }
                                    >
                                        <strong>
                                            {
                                                value
                                            }
                                        </strong>

                                        <div className="statistics-growth-track">
                                            <div
                                                style={{
                                                    height: `${height}%`,
                                                }}
                                            />
                                        </div>

                                        <span>
                                            {item.label ||
                                                "-"}
                                        </span>
                                    </div>
                                );
                            }
                        )}
                    </div>
                )}
            </section>

            {/* ==================================================
                TOP TABLES
            ================================================== */}

            <section className="statistics-two-column">
                {/* TOP PRODUCTS */}

                <article className="statistics-panel">
                    <div className="statistics-panel-header">
                        <div>
                            <span>
                                TOP 10
                            </span>

                            <h2>
                                Sản phẩm bán chạy
                            </h2>
                        </div>
                    </div>

                    <div className="statistics-table-wrap">
                        <table className="statistics-table">
                            <thead>
                                <tr>
                                    <th>
                                        #
                                    </th>

                                    <th>
                                        Sản phẩm
                                    </th>

                                    <th>
                                        Đã bán
                                    </th>

                                    <th>
                                        Doanh thu
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {topProducts.length ===
                                0 ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="statistics-table-empty"
                                        >
                                            Chưa có dữ liệu.
                                        </td>
                                    </tr>
                                ) : (
                                    topProducts.map(
                                        (
                                            product,
                                            index
                                        ) => (
                                            <tr
                                                key={
                                                    product.productId ||
                                                    index
                                                }
                                            >
                                                <td>
                                                    {index +
                                                        1}
                                                </td>

                                                <td>
                                                    <strong>
                                                        {product.name ||
                                                            product.productName ||
                                                            "-"}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {formatNumber(
                                                        product.quantitySold
                                                    )}
                                                </td>

                                                <td>
                                                    {formatCurrency(
                                                        product.revenue
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </article>

                {/* TOP CUSTOMERS */}

                <article className="statistics-panel">
                    <div className="statistics-panel-header">
                        <div>
                            <span>
                                TOP 10
                            </span>

                            <h2>
                                Khách hàng nổi bật
                            </h2>
                        </div>
                    </div>

                    <div className="statistics-table-wrap">
                        <table className="statistics-table">
                            <thead>
                                <tr>
                                    <th>
                                        #
                                    </th>

                                    <th>
                                        Khách hàng
                                    </th>

                                    <th>
                                        Đơn
                                    </th>

                                    <th>
                                        Chi tiêu
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {topCustomers.length ===
                                0 ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="statistics-table-empty"
                                        >
                                            Chưa có dữ liệu.
                                        </td>
                                    </tr>
                                ) : (
                                    topCustomers.map(
                                        (
                                            customer,
                                            index
                                        ) => (
                                            <tr
                                                key={
                                                    customer.userId ||
                                                    customer.id ||
                                                    index
                                                }
                                            >
                                                <td>
                                                    {index +
                                                        1}
                                                </td>

                                                <td>
                                                    <strong>
                                                        {customer.name ||
                                                            customer.fullName ||
                                                            customer.userName ||
                                                            customer.email ||
                                                            "-"}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {formatNumber(
                                                        customer.totalOrders
                                                    )}
                                                </td>

                                                <td>
                                                    {formatCurrency(
                                                        customer.totalSpent
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </article>
            </section>

            {/* ==================================================
                RECENT ORDERS
            ================================================== */}

            <section className="statistics-panel">
                <div className="statistics-panel-header">
                    <div>
                        <span>
                            GẦN ĐÂY
                        </span>

                        <h2>
                            Đơn hàng mới nhất
                        </h2>
                    </div>
                </div>

                <div className="statistics-table-wrap">
                    <table className="statistics-table statistics-table--wide">
                        <thead>
                            <tr>
                                <th>
                                    Mã đơn
                                </th>

                                <th>
                                    Khách hàng
                                </th>

                                <th>
                                    Tổng tiền
                                </th>

                                <th>
                                    Thanh toán
                                </th>

                                <th>
                                    Trạng thái
                                </th>

                                <th>
                                    Ngày tạo
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {recentOrders.length ===
                            0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="statistics-table-empty"
                                    >
                                        Chưa có đơn hàng.
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map(
                                    (
                                        order,
                                        index
                                    ) => (
                                        <tr
                                            key={
                                                order.id ||
                                                order.orderId ||
                                                order.orderCode ||
                                                index
                                            }
                                        >
                                            <td>
                                                <strong>
                                                    {order.orderCode ||
                                                        order.order_code ||
                                                        `#${order.id || index + 1}`}
                                                </strong>
                                            </td>

                                            <td>
                                                {order.customer ||
                                                    order.customerName ||
                                                    order.userName ||
                                                    "-"}
                                            </td>

                                            <td>
                                                {formatCurrency(
                                                    order.totalAmount ||
                                                        order.total_amount
                                                )}
                                            </td>

                                            <td>
                                                {order.paymentStatus ||
                                                    order.payment_status ||
                                                    "-"}
                                            </td>

                                            <td>
                                                {order.orderStatus ||
                                                    order.status ||
                                                    "-"}
                                            </td>

                                            <td>
                                                {order.createdAt ||
                                                order.created_at
                                                    ? new Date(
                                                          order.createdAt ||
                                                              order.created_at
                                                      ).toLocaleString(
                                                          "vi-VN"
                                                      )
                                                    : "-"}
                                            </td>
                                        </tr>
                                    )
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

export default StatisticsPage;