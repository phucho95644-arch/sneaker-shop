import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    FaArrowRight,
    FaBan,
    FaBoxOpen,
    FaCheckCircle,
    FaClock,
    FaExclamationTriangle,
    FaMoneyBillWave,
    FaShoppingBag,
    FaStar,
    FaSyncAlt,
    FaTruck,
    FaUsers,
} from "react-icons/fa";

import {
    toast,
} from "react-toastify";

import adminDashboardService
    from "../../services/adminDashboardService";

import "./DashboardPage.css";

// ============================================================
// HELPERS
// ============================================================

const numberValue = (value) => {
    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
};

const formatNumber = (value) => {
    return numberValue(value)
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
        numberValue(value)
    );
};

// ============================================================
// DASHBOARD PAGE
// ============================================================

function DashboardPage() {
    const [
        dashboard,
        setDashboard,
    ] = useState(null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    // ========================================================
    // LOAD DASHBOARD
    // ========================================================

    const loadDashboard =
        useCallback(
            async (
                showRefreshToast = false
            ) => {
                try {
                    if (
                        showRefreshToast
                    ) {
                        setRefreshing(
                            true
                        );
                    } else {
                        setLoading(
                            true
                        );
                    }

                    const response =
                        await adminDashboardService
                            .getDashboard();

                    const data =
                        response?.data ||
                        response ||
                        {};

                    setDashboard(
                        data
                    );

                    if (
                        showRefreshToast
                    ) {
                        toast.success(
                            "Đã cập nhật dữ liệu dashboard."
                        );
                    }
                } catch (
                    error
                ) {
                    console.error(
                        "ADMIN DASHBOARD ERROR:",
                        error
                    );

                    toast.error(
                        error.response
                            ?.data
                            ?.message ||
                        "Không thể tải dữ liệu dashboard."
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
            []
        );

    useEffect(
        () => {
            loadDashboard();
        },
        [
            loadDashboard,
        ]
    );

    // ========================================================
    // DATA
    // ========================================================

    const users =
        dashboard?.users ||
        {};

    const products =
        dashboard?.products ||
        {};

    const orders =
        dashboard?.orders ||
        {};

    const revenue =
        dashboard?.revenue ||
        {};

    const reviews =
        dashboard?.reviews ||
        {};

    // ========================================================
    // LOADING
    // ========================================================

    if (
        loading
    ) {
        return (
            <div className="admin-dashboard-page">
                <div className="admin-dashboard-loading">
                    <div className="spinner-border" />

                    <span>
                        Đang tải dữ liệu quản trị...
                    </span>
                </div>
            </div>
        );
    }

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="admin-dashboard-page">
            {/* ==================================================
                HEADER
            ================================================== */}

            <header className="admin-dashboard-header">
                <div>
                    <span className="admin-dashboard-eyebrow">
                        SNEAKER SHOP
                    </span>

                    <h1>
                        Admin Dashboard
                    </h1>

                    <p>
                        Tổng quan hoạt động
                        của cửa hàng và hệ
                        thống quản trị.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-dashboard-refresh"
                    disabled={
                        refreshing
                    }
                    onClick={() =>
                        loadDashboard(
                            true
                        )
                    }
                >
                    <FaSyncAlt
                        className={
                            refreshing
                                ? "dashboard-spin"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Đang cập nhật..."
                        : "Làm mới"}
                </button>
            </header>

            {/* ==================================================
                MAIN STATS
            ================================================== */}

            <section className="dashboard-stat-grid">
                {/* USERS */}

                <article className="dashboard-stat-card">
                    <div className="dashboard-stat-icon dashboard-stat-icon--users">
                        <FaUsers />
                    </div>

                    <div className="dashboard-stat-content">
                        <span>
                            Khách hàng
                        </span>

                        <strong>
                            {formatNumber(
                                users.totalCustomers
                            )}
                        </strong>

                        <small>
                            +{" "}
                            {formatNumber(
                                users.newCustomersToday
                            )}{" "}
                            hôm nay
                        </small>
                    </div>
                </article>

                {/* PRODUCTS */}

                <article className="dashboard-stat-card">
                    <div className="dashboard-stat-icon dashboard-stat-icon--products">
                        <FaBoxOpen />
                    </div>

                    <div className="dashboard-stat-content">
                        <span>
                            Sản phẩm
                        </span>

                        <strong>
                            {formatNumber(
                                products.totalProducts
                            )}
                        </strong>

                        <small>
                            {formatNumber(
                                products.activeProducts
                            )}{" "}
                            đang hoạt động
                        </small>
                    </div>
                </article>

                {/* ORDERS */}

                <article className="dashboard-stat-card">
                    <div className="dashboard-stat-icon dashboard-stat-icon--orders">
                        <FaShoppingBag />
                    </div>

                    <div className="dashboard-stat-content">
                        <span>
                            Đơn hàng
                        </span>

                        <strong>
                            {formatNumber(
                                orders.totalOrders
                            )}
                        </strong>

                        <small>
                            {formatNumber(
                                orders.pending
                            )}{" "}
                            chờ xác nhận
                        </small>
                    </div>
                </article>

                {/* REVENUE */}

                <article className="dashboard-stat-card">
                    <div className="dashboard-stat-icon dashboard-stat-icon--revenue">
                        <FaMoneyBillWave />
                    </div>

                    <div className="dashboard-stat-content">
                        <span>
                            Doanh thu tháng
                        </span>

                        <strong className="dashboard-stat-money">
                            {formatCurrency(
                                revenue.thisMonth
                            )}
                        </strong>

                        <small>
                            Hôm nay:{" "}
                            {formatCurrency(
                                revenue.today
                            )}
                        </small>
                    </div>
                </article>
            </section>

            {/* ==================================================
                CONTENT GRID
            ================================================== */}

            <section className="dashboard-content-grid">
                {/* ==================================================
                    ORDER STATUS
                ================================================== */}

                <article className="dashboard-panel">
                    <div className="dashboard-panel-header">
                        <div>
                            <span>
                                ĐƠN HÀNG
                            </span>

                            <h2>
                                Trạng thái đơn hàng
                            </h2>
                        </div>

                        <Link
                            to="/admin/orders"
                            className="dashboard-panel-link"
                        >
                            Xem tất cả

                            <FaArrowRight />
                        </Link>
                    </div>

                    <div className="dashboard-status-list">
                        <div className="dashboard-status-item">
                            <div className="dashboard-status-label">
                                <span className="dashboard-status-icon dashboard-status-icon--pending">
                                    <FaClock />
                                </span>

                                <div>
                                    <strong>
                                        Chờ xác nhận
                                    </strong>

                                    <small>
                                        pending
                                    </small>
                                </div>
                            </div>

                            <b>
                                {formatNumber(
                                    orders.pending
                                )}
                            </b>
                        </div>

                        <div className="dashboard-status-item">
                            <div className="dashboard-status-label">
                                <span className="dashboard-status-icon dashboard-status-icon--confirmed">
                                    <FaCheckCircle />
                                </span>

                                <div>
                                    <strong>
                                        Đã xác nhận
                                    </strong>

                                    <small>
                                        confirmed
                                    </small>
                                </div>
                            </div>

                            <b>
                                {formatNumber(
                                    orders.confirmed
                                )}
                            </b>
                        </div>

                        <div className="dashboard-status-item">
                            <div className="dashboard-status-label">
                                <span className="dashboard-status-icon dashboard-status-icon--processing">
                                    <FaBoxOpen />
                                </span>

                                <div>
                                    <strong>
                                        Đang xử lý
                                    </strong>

                                    <small>
                                        processing
                                    </small>
                                </div>
                            </div>

                            <b>
                                {formatNumber(
                                    orders.processing
                                )}
                            </b>
                        </div>

                        <div className="dashboard-status-item">
                            <div className="dashboard-status-label">
                                <span className="dashboard-status-icon dashboard-status-icon--shipping">
                                    <FaTruck />
                                </span>

                                <div>
                                    <strong>
                                        Đang giao
                                    </strong>

                                    <small>
                                        shipping
                                    </small>
                                </div>
                            </div>

                            <b>
                                {formatNumber(
                                    orders.shipping
                                )}
                            </b>
                        </div>

                        <div className="dashboard-status-item">
                            <div className="dashboard-status-label">
                                <span className="dashboard-status-icon dashboard-status-icon--delivered">
                                    <FaCheckCircle />
                                </span>

                                <div>
                                    <strong>
                                        Đã giao
                                    </strong>

                                    <small>
                                        delivered
                                    </small>
                                </div>
                            </div>

                            <b>
                                {formatNumber(
                                    orders.delivered
                                )}
                            </b>
                        </div>

                        <div className="dashboard-status-item">
                            <div className="dashboard-status-label">
                                <span className="dashboard-status-icon dashboard-status-icon--cancelled">
                                    <FaBan />
                                </span>

                                <div>
                                    <strong>
                                        Đã hủy
                                    </strong>

                                    <small>
                                        cancelled
                                    </small>
                                </div>
                            </div>

                            <b>
                                {formatNumber(
                                    orders.cancelled
                                )}
                            </b>
                        </div>
                    </div>
                </article>

                {/* ==================================================
                    REVIEWS
                ================================================== */}

                <article className="dashboard-panel">
                    <div className="dashboard-panel-header">
                        <div>
                            <span>
                                ĐÁNH GIÁ
                            </span>

                            <h2>
                                Review sản phẩm
                            </h2>
                        </div>

                        <Link
                            to="/admin/reviews"
                            className="dashboard-panel-link"
                        >
                            Quản lý

                            <FaArrowRight />
                        </Link>
                    </div>

                    <div className="dashboard-review-summary">
                        <div className="dashboard-review-total">
                            <FaStar />

                            <strong>
                                {formatNumber(
                                    reviews.total
                                )}
                            </strong>

                            <span>
                                Tổng đánh giá
                            </span>
                        </div>

                        <div className="dashboard-review-grid">
                            <div className="dashboard-review-box dashboard-review-box--pending">
                                <span>
                                    Chờ duyệt
                                </span>

                                <strong>
                                    {formatNumber(
                                        reviews.pending
                                    )}
                                </strong>
                            </div>

                            <div className="dashboard-review-box dashboard-review-box--approved">
                                <span>
                                    Đã duyệt
                                </span>

                                <strong>
                                    {formatNumber(
                                        reviews.approved
                                    )}
                                </strong>
                            </div>

                            <div className="dashboard-review-box dashboard-review-box--hidden">
                                <span>
                                    Đã ẩn
                                </span>

                                <strong>
                                    {formatNumber(
                                        reviews.hidden
                                    )}
                                </strong>
                            </div>
                        </div>
                    </div>
                </article>
            </section>

            {/* ==================================================
                SYSTEM OVERVIEW
            ================================================== */}

            <section className="dashboard-bottom-grid">
                {/* CUSTOMERS */}

                <article className="dashboard-panel">
                    <div className="dashboard-panel-header">
                        <div>
                            <span>
                                KHÁCH HÀNG
                            </span>

                            <h2>
                                Tổng quan người dùng
                            </h2>
                        </div>

                        <Link
                            to="/admin/users"
                            className="dashboard-panel-link"
                        >
                            Quản lý

                            <FaArrowRight />
                        </Link>
                    </div>

                    <div className="dashboard-info-grid">
                        <div>
                            <span>
                                Đang hoạt động
                            </span>

                            <strong>
                                {formatNumber(
                                    users.activeCustomers
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Bị khóa
                            </span>

                            <strong>
                                {formatNumber(
                                    users.blockedCustomers
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Mới hôm nay
                            </span>

                            <strong>
                                {formatNumber(
                                    users.newCustomersToday
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Mới tháng này
                            </span>

                            <strong>
                                {formatNumber(
                                    users.newCustomersThisMonth
                                )}
                            </strong>
                        </div>
                    </div>
                </article>

                {/* INVENTORY */}

                <article className="dashboard-panel">
                    <div className="dashboard-panel-header">
                        <div>
                            <span>
                                KHO HÀNG
                            </span>

                            <h2>
                                Tình trạng sản phẩm
                            </h2>
                        </div>

                        <Link
                            to="/admin/products"
                            className="dashboard-panel-link"
                        >
                            Sản phẩm

                            <FaArrowRight />
                        </Link>
                    </div>

                    <div className="dashboard-inventory">
                        <div className="dashboard-inventory-main">
                            <div>
                                <span>
                                    Tổng biến thể
                                </span>

                                <strong>
                                    {formatNumber(
                                        products.totalVariants
                                    )}
                                </strong>
                            </div>

                            <FaBoxOpen />
                        </div>

                        <div className="dashboard-inventory-alerts">
                            <div className="dashboard-inventory-alert dashboard-inventory-alert--low">
                                <FaExclamationTriangle />

                                <div>
                                    <span>
                                        Sắp hết hàng
                                    </span>

                                    <strong>
                                        {formatNumber(
                                            products.lowStockVariants
                                        )}
                                    </strong>
                                </div>
                            </div>

                            <div className="dashboard-inventory-alert dashboard-inventory-alert--out">
                                <FaBan />

                                <div>
                                    <span>
                                        Hết hàng
                                    </span>

                                    <strong>
                                        {formatNumber(
                                            products.outOfStockVariants
                                        )}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </section>

            {/* ==================================================
                REVENUE
            ================================================== */}

            <section className="dashboard-revenue-panel">
                <div className="dashboard-panel-header">
                    <div>
                        <span>
                            DOANH THU
                        </span>

                        <h2>
                            Tổng quan doanh thu
                        </h2>
                    </div>
                </div>

                <div className="dashboard-revenue-grid">
                    <div>
                        <span>
                            Hôm nay
                        </span>

                        <strong>
                            {formatCurrency(
                                revenue.today
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Tháng này
                        </span>

                        <strong>
                            {formatCurrency(
                                revenue.thisMonth
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Năm nay
                        </span>

                        <strong>
                            {formatCurrency(
                                revenue.thisYear
                            )}
                        </strong>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default DashboardPage;