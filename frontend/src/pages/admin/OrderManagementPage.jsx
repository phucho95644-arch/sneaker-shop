import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    FaEye,
    FaFilter,
    FaSearch,
    FaShoppingBag,
    FaSyncAlt,
} from "react-icons/fa";

import {
    toast,
} from "react-toastify";

import adminOrderService
    from "../../services/adminOrderService";

import "./OrderManagementPage.css";

// ============================================================
// CONSTANTS
// ============================================================

const LIMIT = 10;

const ORDER_STATUS_OPTIONS = [
    {
        value: "",
        label: "Tất cả trạng thái",
    },
    {
        value: "pending",
        label: "Chờ xác nhận",
    },
    {
        value: "confirmed",
        label: "Đã xác nhận",
    },
    {
        value: "processing",
        label: "Đang xử lý",
    },
    {
        value: "shipping",
        label: "Đang giao",
    },
    {
        value: "delivered",
        label: "Đã giao",
    },
    {
        value: "cancelled",
        label: "Đã hủy",
    },
];

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
        return "-";
    }

    return date.toLocaleString(
        "vi-VN"
    );
};

// ============================================================
// ORDER STATUS
// ============================================================

const getOrderStatusInfo = (
    status
) => {
    const map = {
        pending: {
            label:
                "Chờ xác nhận",
            className:
                "admin-order-status--pending",
        },

        confirmed: {
            label:
                "Đã xác nhận",
            className:
                "admin-order-status--confirmed",
        },

        processing: {
            label:
                "Đang xử lý",
            className:
                "admin-order-status--processing",
        },

        shipping: {
            label:
                "Đang giao",
            className:
                "admin-order-status--shipping",
        },

        delivered: {
            label:
                "Đã giao",
            className:
                "admin-order-status--delivered",
        },

        cancelled: {
            label:
                "Đã hủy",
            className:
                "admin-order-status--cancelled",
        },
    };

    return (
        map[status] || {
            label:
                status || "-",
            className: "",
        }
    );
};

// ============================================================
// PAYMENT STATUS
// ============================================================

const getPaymentStatusInfo = (
    status
) => {
    const map = {
        unpaid: {
            label:
                "Chưa thanh toán",
            className:
                "admin-payment-status--unpaid",
        },

        paid: {
            label:
                "Đã thanh toán",
            className:
                "admin-payment-status--paid",
        },

        failed: {
            label:
                "Thất bại",
            className:
                "admin-payment-status--failed",
        },

        refunded: {
            label:
                "Hoàn tiền",
            className:
                "admin-payment-status--refunded",
        },
    };

    return (
        map[status] || {
            label:
                status || "-",
            className: "",
        }
    );
};

// ============================================================
// PAYMENT METHOD
// ============================================================

const getPaymentMethod = (
    method
) => {
    const map = {
        cod:
            "COD",

        banking:
            "Chuyển khoản",
    };

    return (
        map[method] ||
        method ||
        "-"
    );
};

// ============================================================
// ORDER MANAGEMENT PAGE
// ============================================================

function OrderManagementPage() {
    // ========================================================
    // STATE
    // ========================================================

    const [
        orders,
        setOrders,
    ] = useState(
        []
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
        page,
        setPage,
    ] = useState(
        1
    );

    const [
        total,
        setTotal,
    ] = useState(
        0
    );

    const [
        status,
        setStatus,
    ] = useState(
        ""
    );

    const [
        searchInput,
        setSearchInput,
    ] = useState(
        ""
    );

    const [
        search,
        setSearch,
    ] = useState(
        ""
    );

    // ========================================================
    // TOTAL PAGES
    // ========================================================

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total /
                    LIMIT
            )
        );

    // ========================================================
    // LOAD ORDERS
    // ========================================================

    const loadOrders =
        useCallback(
            async (
                manualRefresh =
                    false
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
                    const params = {
                        page,
                        limit:
                            LIMIT,
                    };

                    if (status) {
                        params.status =
                            status;
                    }

                    if (search) {
                        params.search =
                            search;
                    }

                    const data =
                        await adminOrderService
                            .getOrders(
                                params
                            );

                    setOrders(
                        Array.isArray(
                            data?.items
                        )
                            ? data.items
                            : []
                    );

                    setTotal(
                        toNumber(
                            data?.total
                        )
                    );

                    if (
                        manualRefresh
                    ) {
                        toast.success(
                            "Đã cập nhật danh sách đơn hàng."
                        );
                    }
                } catch (
                    error
                ) {
                    console.error(
                        "ADMIN ORDERS ERROR:",
                        error
                    );

                    setOrders(
                        []
                    );

                    setTotal(
                        0
                    );

                    toast.error(
                        error
                            ?.response
                            ?.data
                            ?.message ||
                            "Không thể tải danh sách đơn hàng."
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
                page,
                status,
                search,
            ]
        );

    // ========================================================
    // AUTO LOAD
    // ========================================================

    useEffect(
        () => {
            loadOrders();
        },
        [
            loadOrders,
        ]
    );

    // ========================================================
    // SEARCH
    // ========================================================

    const handleSearch = (
        event
    ) => {
        event.preventDefault();

        setPage(
            1
        );

        setSearch(
            searchInput
                .trim()
        );
    };

    // ========================================================
    // CHANGE STATUS FILTER
    // ========================================================

    const handleStatusChange = (
        event
    ) => {
        setPage(
            1
        );

        setStatus(
            event.target
                .value
        );
    };

    // ========================================================
    // RESET FILTER
    // ========================================================

    const handleReset = () => {
        setSearchInput(
            ""
        );

        setSearch(
            ""
        );

        setStatus(
            ""
        );

        setPage(
            1
        );
    };

    // ========================================================
    // LOADING
    // ========================================================

    if (
        loading
    ) {
        return (
            <div className="admin-orders-page">
                <div className="admin-orders-loading">
                    <div className="spinner-border" />

                    <span>
                        Đang tải đơn hàng...
                    </span>
                </div>
            </div>
        );
    }

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="admin-orders-page">
            {/* ==================================================
                HEADER
            ================================================== */}

            <header className="admin-orders-header">
                <div>
                    <span className="admin-orders-eyebrow">
                        QUẢN LÝ BÁN HÀNG
                    </span>

                    <h1>
                        Đơn hàng
                    </h1>

                    <p>
                        Theo dõi và xử lý
                        các đơn hàng của
                        Sneaker Shop.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-orders-refresh"
                    disabled={
                        refreshing
                    }
                    onClick={() =>
                        loadOrders(
                            true
                        )
                    }
                >
                    <FaSyncAlt
                        className={
                            refreshing
                                ? "admin-orders-spin"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Đang tải..."
                        : "Làm mới"}
                </button>
            </header>

            {/* ==================================================
                SUMMARY
            ================================================== */}

            <section className="admin-orders-summary">
                <div className="admin-orders-summary-icon">
                    <FaShoppingBag />
                </div>

                <div>
                    <span>
                        Tổng đơn phù hợp
                    </span>

                    <strong>
                        {total.toLocaleString(
                            "vi-VN"
                        )}
                    </strong>
                </div>
            </section>

            {/* ==================================================
                FILTERS
            ================================================== */}

            <section className="admin-orders-filters">
                <form
                    className="admin-orders-search"
                    onSubmit={
                        handleSearch
                    }
                >
                    <FaSearch />

                    <input
                        type="text"
                        value={
                            searchInput
                        }
                        placeholder="Tìm mã đơn, tên hoặc số điện thoại..."
                        onChange={(
                            event
                        ) =>
                            setSearchInput(
                                event
                                    .target
                                    .value
                            )
                        }
                    />

                    <button
                        type="submit"
                    >
                        Tìm kiếm
                    </button>
                </form>

                <div className="admin-orders-filter-select">
                    <FaFilter />

                    <select
                        value={
                            status
                        }
                        onChange={
                            handleStatusChange
                        }
                    >
                        {ORDER_STATUS_OPTIONS.map(
                            (
                                item
                            ) => (
                                <option
                                    key={
                                        item.value ||
                                        "all"
                                    }
                                    value={
                                        item.value
                                    }
                                >
                                    {
                                        item.label
                                    }
                                </option>
                            )
                        )}
                    </select>
                </div>

                {(search ||
                    status) && (
                    <button
                        type="button"
                        className="admin-orders-reset"
                        onClick={
                            handleReset
                        }
                    >
                        Xóa bộ lọc
                    </button>
                )}
            </section>

            {/* ==================================================
                TABLE
            ================================================== */}

            <section className="admin-orders-card">
                <div className="admin-orders-table-wrap">
                    <table className="admin-orders-table">
                        <thead>
                            <tr>
                                <th>
                                    Mã đơn
                                </th>

                                <th>
                                    Sản phẩm
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
                                    Ngày đặt
                                </th>

                                <th>
                                    Thao tác
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.length ===
                            0 ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="admin-orders-empty"
                                    >
                                        Không tìm thấy đơn hàng phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                orders.map(
                                    (
                                        order
                                    ) => {
                                        const orderStatus =
                                            getOrderStatusInfo(
                                                order
                                                    ?.order_status
                                            );

                                        const paymentStatus =
                                            getPaymentStatusInfo(
                                                order
                                                    ?.payment_status
                                            );

                                        return (
                                            <tr
                                                key={
                                                    order.id
                                                }
                                            >
                                                {/* CODE */}

                                                <td>
                                                    <div className="admin-orders-code">
                                                        <strong>
                                                            {order
                                                                ?.order_code ||
                                                                `#${order.id}`}
                                                        </strong>

                                                        <span>
                                                            ID:{" "}
                                                            {
                                                                order.id
                                                            }
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* ITEMS */}

                                                <td>
                                                    <strong>
                                                        {toNumber(
                                                            order
                                                                ?.totalItems
                                                        ).toLocaleString(
                                                            "vi-VN"
                                                        )}
                                                    </strong>{" "}
                                                    sản phẩm
                                                </td>

                                                {/* TOTAL */}

                                                <td>
                                                    <strong className="admin-orders-price">
                                                        {formatCurrency(
                                                            order
                                                                ?.total_amount
                                                        )}
                                                    </strong>
                                                </td>

                                                {/* PAYMENT */}

                                                <td>
                                                    <div className="admin-orders-payment">
                                                        <span
                                                            className={[
                                                                "admin-payment-status",

                                                                paymentStatus.className,
                                                            ]
                                                                .filter(
                                                                    Boolean
                                                                )
                                                                .join(
                                                                    " "
                                                                )}
                                                        >
                                                            {
                                                                paymentStatus.label
                                                            }
                                                        </span>

                                                        <small>
                                                            {getPaymentMethod(
                                                                order
                                                                    ?.payment_method
                                                            )}
                                                        </small>
                                                    </div>
                                                </td>

                                                {/* ORDER STATUS */}

                                                <td>
                                                    <span
                                                        className={[
                                                            "admin-order-status",

                                                            orderStatus.className,
                                                        ]
                                                            .filter(
                                                                Boolean
                                                            )
                                                            .join(
                                                                " "
                                                            )}
                                                    >
                                                        {
                                                            orderStatus.label
                                                        }
                                                    </span>
                                                </td>

                                                {/* DATE */}

                                                <td>
                                                    <span className="admin-orders-date">
                                                        {formatDate(
                                                            order
                                                                ?.created_at
                                                        )}
                                                    </span>
                                                </td>

                                                {/* ACTION */}

                                                <td>
                                                    <Link
                                                        to={`/admin/orders/${order.id}`}
                                                        className="admin-orders-view"
                                                        title="Xem chi tiết đơn hàng"
                                                    >
                                                        <FaEye />

                                                        <span>
                                                            Chi tiết
                                                        </span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ==============================================
                    PAGINATION
                ============================================== */}

                {total >
                    0 && (
                    <div className="admin-orders-pagination">
                        <div>
                            Trang{" "}
                            <strong>
                                {
                                    page
                                }
                            </strong>{" "}
                            /{" "}
                            <strong>
                                {
                                    totalPages
                                }
                            </strong>
                        </div>

                        <div className="admin-orders-pagination-buttons">
                            <button
                                type="button"
                                disabled={
                                    page <=
                                    1
                                }
                                onClick={() =>
                                    setPage(
                                        (
                                            current
                                        ) =>
                                            Math.max(
                                                1,
                                                current -
                                                    1
                                            )
                                    )
                                }
                            >
                                Trước
                            </button>

                            <button
                                type="button"
                                disabled={
                                    page >=
                                    totalPages
                                }
                                onClick={() =>
                                    setPage(
                                        (
                                            current
                                        ) =>
                                            Math.min(
                                                totalPages,
                                                current +
                                                    1
                                            )
                                    )
                                }
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

export default OrderManagementPage;