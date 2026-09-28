import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    FaBoxOpen,
    FaChartLine,
    FaCheckCircle,
    FaClock,
    FaMoneyBillWave,
    FaShoppingBag,
    FaSyncAlt,
    FaTimesCircle,
    FaTruck,
    FaUsers,
} from "react-icons/fa";

import {
    toast,
} from "react-toastify";

import adminStatisticsService
    from "../../services/adminStatisticsService";

import "./AdminStatisticsPage.css";

// ============================================================
// HELPERS
// ============================================================

const toNumber = (value) => {
    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
};

// ============================================================
// FORMAT NUMBER
// ============================================================

const formatNumber = (value) => {
    return toNumber(value)
        .toLocaleString("vi-VN");
};

// ============================================================
// FORMAT MONEY
// ============================================================

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

// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (value) => {
    if (!value) {
        return "-";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }

    return date.toLocaleString(
        "vi-VN"
    );
};

// ============================================================
// NORMALIZE ARRAY
// ============================================================

const toArray = (value) => {
    if (
        Array.isArray(value)
    ) {
        return value;
    }

    if (
        Array.isArray(
            value?.items
        )
    ) {
        return value.items;
    }

    if (
        Array.isArray(
            value?.data
        )
    ) {
        return value.data;
    }

    if (
        Array.isArray(
            value?.results
        )
    ) {
        return value.results;
    }

    return [];
};

// ============================================================
// CUSTOMER NAME
// ============================================================

const getCustomerName = (order) => {
    const customer =
        order?.customer;

    // customer là string
    if (
        typeof customer ===
        "string"
    ) {
        return customer;
    }

    // customer là object
    if (
        customer &&
        typeof customer ===
            "object"
    ) {
        return (
            customer.fullName ||
            customer.full_name ||
            customer.name ||
            customer.email ||
            `Khách hàng #${
                customer.id || "?"
            }`
        );
    }

    return (
        order?.customerName ||
        order?.customer_name ||
        order?.userName ||
        order?.user_name ||
        order?.fullName ||
        order?.email ||
        "-"
    );
};

// ============================================================
// TOP CUSTOMER NAME
// ============================================================

const getTopCustomerName = (
    customer,
    index
) => {
    const user =
        customer?.user;

    if (
        typeof user ===
        "string"
    ) {
        return user;
    }

    if (
        user &&
        typeof user ===
            "object"
    ) {
        return (
            user.fullName ||
            user.full_name ||
            user.name ||
            user.email ||
            `Khách hàng #${
                user.id ||
                index + 1
            }`
        );
    }

    return (
        customer?.fullName ||
        customer?.full_name ||
        customer?.userName ||
        customer?.user_name ||
        customer?.name ||
        customer?.email ||
        `Khách hàng #${
            index + 1
        }`
    );
};

// ============================================================
// GET PERCENT
// ============================================================

const getPercentage = (
    value,
    maximum
) => {
    const current =
        toNumber(value);

    const max =
        toNumber(maximum);

    if (
        max <= 0 ||
        current <= 0
    ) {
        return 0;
    }

    return Math.max(
        3,
        Math.min(
            100,
            (
                current /
                max
            ) *
                100
        )
    );
};

// ============================================================
// ADMIN STATISTICS PAGE
// ============================================================

function AdminStatisticsPage() {
    // ========================================================
    // STATE
    // ========================================================

    const [
        period,
        setPeriod,
    ] = useState(
        "day"
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
        orderStats,
        setOrderStats,
    ] = useState(
        {}
    );

    const [
        productStats,
        setProductStats,
    ] = useState(
        {}
    );

    const [
        customerStats,
        setCustomerStats,
    ] = useState(
        {}
    );

    const [
        growth,
        setGrowth,
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
        {}
    );

    const [
        recentOrders,
        setRecentOrders,
    ] = useState(
        []
    );

    const [
        failedApis,
        setFailedApis,
    ] = useState(
        []
    );

    // ========================================================
    // LOAD STATISTICS
    // ========================================================

    const loadStatistics =
        useCallback(
            async (
                manualRefresh = false
            ) => {
                if (
                    manualRefresh
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
                    const requests = [
                        {
                            key:
                                "revenue",

                            request:
                                adminStatisticsService
                                    .getRevenue(
                                        {
                                            period,
                                        }
                                    ),
                        },

                        {
                            key:
                                "orders",

                            request:
                                adminStatisticsService
                                    .getOrders(
                                        {
                                            period,
                                        }
                                    ),
                        },

                        {
                            key:
                                "products",

                            request:
                                adminStatisticsService
                                    .getProducts(),
                        },

                        {
                            key:
                                "customers",

                            request:
                                adminStatisticsService
                                    .getCustomers(),
                        },

                        {
                            key:
                                "growth",

                            request:
                                adminStatisticsService
                                    .getCustomerGrowth(
                                        {
                                            period,
                                        }
                                    ),
                        },

                        {
                            key:
                                "topProducts",

                            request:
                                adminStatisticsService
                                    .getTopProducts(
                                        {
                                            limit: 5,
                                        }
                                    ),
                        },

                        {
                            key:
                                "topCustomers",

                            request:
                                adminStatisticsService
                                    .getTopCustomers(
                                        {
                                            limit: 5,
                                        }
                                    ),
                        },

                        {
                            key:
                                "sales",

                            request:
                                adminStatisticsService
                                    .getSales(
                                        {
                                            period,
                                        }
                                    ),
                        },

                        {
                            key:
                                "recentOrders",

                            request:
                                adminStatisticsService
                                    .getRecentOrders(
                                        {
                                            limit: 6,
                                        }
                                    ),
                        },
                    ];

                    const results =
                        await Promise.allSettled(
                            requests.map(
                                (
                                    item
                                ) =>
                                    item.request
                            )
                        );

                    const failed = [];

                    results.forEach(
                        (
                            result,
                            index
                        ) => {
                            const key =
                                requests[
                                    index
                                ].key;

                            if (
                                result.status ===
                                "rejected"
                            ) {
                                console.error(
                                    `STATISTICS REQUEST ${key} ERROR:`,
                                    result.reason
                                );

                                failed.push(
                                    key
                                );

                                return;
                            }

                            const data =
                                result.value;

                            switch (
                                key
                            ) {
                                case "revenue":
                                    setRevenue(
                                        data ||
                                            {}
                                    );

                                    break;

                                case "orders":
                                    setOrderStats(
                                        data ||
                                            {}
                                    );

                                    break;

                                case "products":
                                    setProductStats(
                                        data ||
                                            {}
                                    );

                                    break;

                                case "customers":
                                    setCustomerStats(
                                        data ||
                                            {}
                                    );

                                    break;

                                case "growth":
                                    setGrowth(
                                        toArray(
                                            data
                                        )
                                    );

                                    break;

                                case "topProducts":
                                    setTopProducts(
                                        toArray(
                                            data
                                        )
                                    );

                                    break;

                                case "topCustomers":
                                    setTopCustomers(
                                        toArray(
                                            data
                                        )
                                    );

                                    break;

                                case "sales":
                                    setSales(
                                        data ||
                                            {}
                                    );

                                    break;

                                case "recentOrders":
                                    setRecentOrders(
                                        toArray(
                                            data
                                        )
                                    );

                                    break;

                                default:
                                    break;
                            }
                        }
                    );

                    setFailedApis(
                        failed
                    );

                    if (
                        failed.length >
                        0
                    ) {
                        toast.warning(
                            `Có ${failed.length} API thống kê đang lỗi. Các phần còn lại vẫn được hiển thị.`
                        );
                    } else if (
                        manualRefresh
                    ) {
                        toast.success(
                            "Đã cập nhật dữ liệu thống kê."
                        );
                    }
                } catch (
                    error
                ) {
                    console.error(
                        "LOAD STATISTICS ERROR:",
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

    // ========================================================
    // USE EFFECT
    // ========================================================

    useEffect(
        () => {
            loadStatistics();
        },
        [
            loadStatistics,
        ]
    );

    // ========================================================
    // NORMALIZE REVENUE
    // ========================================================

    const revenueItems =
        useMemo(
            () =>
                toArray(
                    revenue
                ),
            [
                revenue,
            ]
        );

    // ========================================================
    // NORMALIZE SALES
    // ========================================================

    const salesItems =
        useMemo(
            () =>
                toArray(
                    sales
                ),
            [
                sales,
            ]
        );

    // ========================================================
    // MAX REVENUE
    // ========================================================

    const maxRevenue =
        useMemo(
            () =>
                Math.max(
                    0,
                    ...revenueItems.map(
                        (
                            item
                        ) =>
                            toNumber(
                                item?.revenue
                            )
                    )
                ),
            [
                revenueItems,
            ]
        );

    // ========================================================
    // MAX GROWTH
    // ========================================================

    const maxGrowth =
        useMemo(
            () =>
                Math.max(
                    0,
                    ...growth.map(
                        (
                            item
                        ) =>
                            toNumber(
                                item?.newCustomers
                            )
                    )
                ),
            [
                growth,
            ]
        );

    // ========================================================
    // TOTAL REVENUE
    // ========================================================

    const totalRevenue =
        useMemo(
            () => {
                if (
                    revenue
                        ?.totalRevenue !==
                    undefined
                ) {
                    return toNumber(
                        revenue
                            .totalRevenue
                    );
                }

                return revenueItems.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        toNumber(
                            item?.revenue
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
    // TOTAL REVENUE ORDERS
    // ========================================================

    const totalRevenueOrders =
        useMemo(
            () =>
                revenueItems.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        toNumber(
                            item?.orders
                        ),
                    0
                ),
            [
                revenueItems,
            ]
        );

    // ========================================================
    // ITEMS SOLD
    // ========================================================

    const totalItemsSold =
        useMemo(
            () =>
                salesItems.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        toNumber(
                            item?.itemsSold
                        ),
                    0
                ),
            [
                salesItems,
            ]
        );

    // ========================================================
    // ORDER STATUS
    // ========================================================

    const byStatus =
        orderStats
            ?.byStatus ||
        orderStats
            ?.status ||
        {};

    const totalOrders =
        toNumber(
            orderStats?.total ??
                orderStats
                    ?.totalOrders
        );

    const completionRate =
        toNumber(
            orderStats
                ?.completionRate
        );

    const cancellationRate =
        toNumber(
            orderStats
                ?.cancellationRate
        );

    // ========================================================
    // LOADING
    // ========================================================

    if (
        loading
    ) {
        return (
            <div className="admin-statistics-page">
                <div className="admin-statistics-loading">
                    <div className="spinner-border" />

                    <span>
                        Đang tải dữ liệu thống kê...
                    </span>
                </div>
            </div>
        );
    }

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="admin-statistics-page">
            {/* ==================================================
                HEADER
            ================================================== */}

            <header className="admin-statistics-header">
                <div>
                    <span className="admin-statistics-eyebrow">
                        BÁO CÁO HỆ THỐNG
                    </span>

                    <h1>
                        Thống kê
                    </h1>

                    <p>
                        Theo dõi doanh thu,
                        đơn hàng, sản phẩm
                        và khách hàng.
                    </p>
                </div>

                <div className="admin-statistics-tools">
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
                API WARNING
            ================================================== */}

            {failedApis.length >
                0 && (
                <div
                    style={{
                        marginBottom:
                            "20px",

                        padding:
                            "12px 16px",

                        border:
                            "1px solid #fed7aa",

                        borderRadius:
                            "10px",

                        color:
                            "#9a3412",

                        background:
                            "#fff7ed",

                        fontSize:
                            "0.8rem",
                    }}
                >
                    Một số API thống kê
                    đang lỗi:{" "}
                    <strong>
                        {failedApis.join(
                            ", "
                        )}
                    </strong>
                    . Trang vẫn hiển thị
                    các dữ liệu tải được.
                </div>
            )}

            {/* ==================================================
                OVERVIEW
            ================================================== */}

            <section className="statistics-overview-grid">
                {/* REVENUE */}

                <article className="statistics-overview-card">
                    <span className="statistics-overview-icon statistics-overview-icon--revenue">
                        <FaMoneyBillWave />
                    </span>

                    <div>
                        <small>
                            Doanh thu kỳ
                        </small>

                        <strong>
                            {formatCurrency(
                                totalRevenue
                            )}
                        </strong>

                        <span>
                            {formatNumber(
                                totalRevenueOrders
                            )}{" "}
                            đơn hoàn tất
                        </span>
                    </div>
                </article>

                {/* ORDERS */}

                <article className="statistics-overview-card">
                    <span className="statistics-overview-icon statistics-overview-icon--orders">
                        <FaShoppingBag />
                    </span>

                    <div>
                        <small>
                            Tổng đơn hàng
                        </small>

                        <strong>
                            {formatNumber(
                                totalOrders
                            )}
                        </strong>

                        <span>
                            Hoàn thành{" "}
                            {completionRate.toFixed(
                                1
                            )}
                            %
                        </span>
                    </div>
                </article>

                {/* PRODUCTS */}

                <article className="statistics-overview-card">
                    <span className="statistics-overview-icon statistics-overview-icon--products">
                        <FaBoxOpen />
                    </span>

                    <div>
                        <small>
                            Sản phẩm
                        </small>

                        <strong>
                            {formatNumber(
                                productStats
                                    ?.totalProducts
                            )}
                        </strong>

                        <span>
                            {formatNumber(
                                productStats
                                    ?.totalStock
                            )}{" "}
                            sản phẩm trong kho
                        </span>
                    </div>
                </article>

                {/* CUSTOMERS */}

                <article className="statistics-overview-card">
                    <span className="statistics-overview-icon statistics-overview-icon--customers">
                        <FaUsers />
                    </span>

                    <div>
                        <small>
                            Khách hàng
                        </small>

                        <strong>
                            {formatNumber(
                                customerStats
                                    ?.total
                            )}
                        </strong>

                        <span>
                            +{" "}
                            {formatNumber(
                                customerStats
                                    ?.newThisMonth
                            )}{" "}
                            tháng này
                        </span>
                    </div>
                </article>
            </section>

            {/* ==================================================
                REVENUE CHART
            ================================================== */}

            <section className="statistics-panel statistics-panel--wide">
                <div className="statistics-panel-header">
                    <div>
                        <span>
                            DOANH THU
                        </span>

                        <h2>
                            Biểu đồ doanh thu
                        </h2>
                    </div>

                    <FaChartLine />
                </div>

                {revenueItems.length ===
                0 ? (
                    <div className="statistics-empty">
                        Chưa có dữ liệu doanh thu.
                    </div>
                ) : (
                    <div className="statistics-bar-chart">
                        {revenueItems
                            .slice(-12)
                            .map(
                                (
                                    item,
                                    index
                                ) => (
                                    <div
                                        className="statistics-bar-row"
                                        key={
                                            item
                                                ?.label ||
                                            index
                                        }
                                    >
                                        <span className="statistics-bar-label">
                                            {item
                                                ?.label ||
                                                "-"}
                                        </span>

                                        <div className="statistics-bar-track">
                                            <div
                                                className="statistics-bar-fill"
                                                style={{
                                                    width: `${getPercentage(
                                                        item?.revenue,
                                                        maxRevenue
                                                    )}%`,
                                                }}
                                            />
                                        </div>

                                        <strong>
                                            {formatCurrency(
                                                item
                                                    ?.revenue
                                            )}
                                        </strong>
                                    </div>
                                )
                            )}
                    </div>
                )}
            </section>

            {/* ==================================================
                ORDERS + PRODUCTS
            ================================================== */}

            <section className="statistics-two-column">
                {/* ==================================================
                    ORDER STATUS
                ================================================== */}

                <article className="statistics-panel">
                    <div className="statistics-panel-header">
                        <div>
                            <span>
                                ĐƠN HÀNG
                            </span>

                            <h2>
                                Trạng thái đơn
                            </h2>
                        </div>
                    </div>

                    <div className="statistics-order-list">
                        <div>
                            <FaClock />

                            <span>
                                Chờ xác nhận
                            </span>

                            <strong>
                                {formatNumber(
                                    byStatus
                                        ?.pending
                                )}
                            </strong>
                        </div>

                        <div>
                            <FaCheckCircle />

                            <span>
                                Đã xác nhận
                            </span>

                            <strong>
                                {formatNumber(
                                    byStatus
                                        ?.confirmed
                                )}
                            </strong>
                        </div>

                        <div>
                            <FaBoxOpen />

                            <span>
                                Đang xử lý
                            </span>

                            <strong>
                                {formatNumber(
                                    byStatus
                                        ?.processing
                                )}
                            </strong>
                        </div>

                        <div>
                            <FaTruck />

                            <span>
                                Đang giao
                            </span>

                            <strong>
                                {formatNumber(
                                    byStatus
                                        ?.shipping
                                )}
                            </strong>
                        </div>

                        <div>
                            <FaCheckCircle />

                            <span>
                                Đã giao
                            </span>

                            <strong>
                                {formatNumber(
                                    byStatus
                                        ?.delivered
                                )}
                            </strong>
                        </div>

                        <div>
                            <FaTimesCircle />

                            <span>
                                Đã hủy
                            </span>

                            <strong>
                                {formatNumber(
                                    byStatus
                                        ?.cancelled
                                )}
                            </strong>
                        </div>
                    </div>

                    <div className="statistics-rates">
                        <div>
                            <span>
                                Tỷ lệ hoàn thành
                            </span>

                            <strong>
                                {completionRate.toFixed(
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
                                {cancellationRate.toFixed(
                                    1
                                )}
                                %
                            </strong>
                        </div>
                    </div>
                </article>

                {/* ==================================================
                    PRODUCT STATS
                ================================================== */}

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
                    </div>

                    <div className="statistics-product-grid">
                        <div>
                            <span>
                                Đang bán
                            </span>

                            <strong>
                                {formatNumber(
                                    productStats
                                        ?.activeProducts
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Không hoạt động
                            </span>

                            <strong>
                                {formatNumber(
                                    productStats
                                        ?.inactiveProducts
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Biến thể
                            </span>

                            <strong>
                                {formatNumber(
                                    productStats
                                        ?.totalVariants
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Tổng tồn kho
                            </span>

                            <strong>
                                {formatNumber(
                                    productStats
                                        ?.totalStock
                                )}
                            </strong>
                        </div>

                        <div className="statistics-warning-box">
                            <span>
                                Sắp hết hàng
                            </span>

                            <strong>
                                {formatNumber(
                                    productStats
                                        ?.lowStockVariants
                                )}
                            </strong>
                        </div>

                        <div className="statistics-danger-box">
                            <span>
                                Hết hàng
                            </span>

                            <strong>
                                {formatNumber(
                                    productStats
                                        ?.outOfStockVariants
                                )}
                            </strong>
                        </div>
                    </div>
                </article>
            </section>

            {/* ==================================================
                CUSTOMER GROWTH
            ================================================== */}

            <section className="statistics-panel statistics-panel--wide">
                <div className="statistics-panel-header">
                    <div>
                        <span>
                            KHÁCH HÀNG
                        </span>

                        <h2>
                            Tăng trưởng khách hàng
                        </h2>
                    </div>
                </div>

                {growth.length ===
                0 ? (
                    <div className="statistics-empty">
                        Chưa có dữ liệu tăng trưởng khách hàng.
                    </div>
                ) : (
                    <div className="statistics-growth-chart">
                        {growth
                            .slice(-12)
                            .map(
                                (
                                    item,
                                    index
                                ) => (
                                    <div
                                        className="statistics-growth-item"
                                        key={
                                            item
                                                ?.label ||
                                            index
                                        }
                                    >
                                        <div className="statistics-growth-value">
                                            {formatNumber(
                                                item
                                                    ?.newCustomers
                                            )}
                                        </div>

                                        <div className="statistics-growth-column">
                                            <div
                                                style={{
                                                    height: `${getPercentage(
                                                        item?.newCustomers,
                                                        maxGrowth
                                                    )}%`,
                                                }}
                                            />
                                        </div>

                                        <span>
                                            {item
                                                ?.label ||
                                                "-"}
                                        </span>
                                    </div>
                                )
                            )}
                    </div>
                )}
            </section>

            {/* ==================================================
                TOP PRODUCTS + CUSTOMERS
            ================================================== */}

            <section className="statistics-two-column">
                {/* ==================================================
                    TOP PRODUCTS
                ================================================== */}

                <article className="statistics-panel">
                    <div className="statistics-panel-header">
                        <div>
                            <span>
                                BÁN CHẠY
                            </span>

                            <h2>
                                Top sản phẩm
                            </h2>
                        </div>
                    </div>

                    {topProducts.length ===
                    0 ? (
                        <div className="statistics-empty">
                            Chưa có dữ liệu.
                        </div>
                    ) : (
                        <div className="statistics-ranking-list">
                            {topProducts.map(
                                (
                                    product,
                                    index
                                ) => (
                                    <div
                                        className="statistics-ranking-item"
                                        key={
                                            product
                                                ?.productId ??
                                            product
                                                ?.id ??
                                            index
                                        }
                                    >
                                        <span className="statistics-ranking-number">
                                            {index +
                                                1}
                                        </span>

                                        <div className="statistics-ranking-info">
                                            <strong>
                                                {product
                                                    ?.name ||
                                                    product
                                                        ?.productName ||
                                                    `Sản phẩm #${
                                                        product
                                                            ?.productId ||
                                                        index +
                                                            1
                                                    }`}
                                            </strong>

                                            <span>
                                                {formatNumber(
                                                    product
                                                        ?.quantitySold
                                                )}{" "}
                                                sản phẩm đã bán
                                            </span>
                                        </div>

                                        <b>
                                            {formatCurrency(
                                                product
                                                    ?.revenue
                                            )}
                                        </b>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </article>

                {/* ==================================================
                    TOP CUSTOMERS
                ================================================== */}

                <article className="statistics-panel">
                    <div className="statistics-panel-header">
                        <div>
                            <span>
                                KHÁCH HÀNG
                            </span>

                            <h2>
                                Top khách hàng
                            </h2>
                        </div>
                    </div>

                    {topCustomers.length ===
                    0 ? (
                        <div className="statistics-empty">
                            Chưa có dữ liệu.
                        </div>
                    ) : (
                        <div className="statistics-ranking-list">
                            {topCustomers.map(
                                (
                                    customer,
                                    index
                                ) => (
                                    <div
                                        className="statistics-ranking-item"
                                        key={
                                            customer
                                                ?.user
                                                ?.id ??
                                            customer
                                                ?.userId ??
                                            customer
                                                ?.id ??
                                            index
                                        }
                                    >
                                        <span className="statistics-ranking-number">
                                            {index +
                                                1}
                                        </span>

                                        <div className="statistics-ranking-info">
                                            <strong>
                                                {getTopCustomerName(
                                                    customer,
                                                    index
                                                )}
                                            </strong>

                                            <span>
                                                {formatNumber(
                                                    customer
                                                        ?.deliveredOrders ??
                                                        customer
                                                            ?.totalOrders
                                                )}{" "}
                                                đơn hàng
                                            </span>
                                        </div>

                                        <b>
                                            {formatCurrency(
                                                customer
                                                    ?.totalSpent
                                            )}
                                        </b>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </article>
            </section>

            {/* ==================================================
                MINI STATS
            ================================================== */}

            <section className="statistics-mini-grid">
                <div>
                    <span>
                        Sản phẩm đã bán
                    </span>

                    <strong>
                        {formatNumber(
                            totalItemsSold
                        )}
                    </strong>
                </div>

                <div>
                    <span>
                        Khách đang hoạt động
                    </span>

                    <strong>
                        {formatNumber(
                            customerStats
                                ?.active ??
                                customerStats
                                    ?.activeCustomers
                        )}
                    </strong>
                </div>

                <div>
                    <span>
                        Khách bị khóa
                    </span>

                    <strong>
                        {formatNumber(
                            customerStats
                                ?.blocked ??
                                customerStats
                                    ?.blockedCustomers
                        )}
                    </strong>
                </div>

                <div>
                    <span>
                        Khách mới hôm nay
                    </span>

                    <strong>
                        {formatNumber(
                            customerStats
                                ?.newToday ??
                                customerStats
                                    ?.newCustomersToday
                        )}
                    </strong>
                </div>
            </section>

            {/* ==================================================
                RECENT ORDERS
            ================================================== */}

            <section className="statistics-panel statistics-panel--wide">
                <div className="statistics-panel-header">
                    <div>
                        <span>
                            HOẠT ĐỘNG GẦN ĐÂY
                        </span>

                        <h2>
                            Đơn hàng mới
                        </h2>
                    </div>
                </div>

                {recentOrders.length ===
                0 ? (
                    <div className="statistics-empty">
                        Chưa có đơn hàng.
                    </div>
                ) : (
                    <div className="statistics-table-wrap">
                        <table className="statistics-table">
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
                                {recentOrders.map(
                                    (
                                        order,
                                        index
                                    ) => (
                                        <tr
                                            key={
                                                order
                                                    ?.id ??
                                                order
                                                    ?.orderCode ??
                                                order
                                                    ?.order_code ??
                                                index
                                            }
                                        >
                                            <td>
                                                <strong>
                                                    {order
                                                        ?.orderCode ||
                                                        order
                                                            ?.order_code ||
                                                        `#${
                                                            order
                                                                ?.id ||
                                                            index +
                                                                1
                                                        }`}
                                                </strong>
                                            </td>

                                            <td>
                                                {getCustomerName(
                                                    order
                                                )}
                                            </td>

                                            <td>
                                                {formatCurrency(
                                                    order
                                                        ?.totalAmount ??
                                                        order
                                                            ?.total_amount
                                                )}
                                            </td>

                                            <td>
                                                {order
                                                    ?.paymentStatus ||
                                                    order
                                                        ?.payment_status ||
                                                    "-"}
                                            </td>

                                            <td>
                                                {order
                                                    ?.orderStatus ||
                                                    order
                                                        ?.order_status ||
                                                    order
                                                        ?.status ||
                                                    "-"}
                                            </td>

                                            <td>
                                                {formatDate(
                                                    order
                                                        ?.createdAt ??
                                                        order
                                                            ?.created_at
                                                )}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default AdminStatisticsPage;