import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    FaBox,
    FaChevronLeft,
    FaChevronRight,
    FaClock,
    FaEye,
    FaShoppingBag,
    FaTimes,
    FaTruck,
} from "react-icons/fa";

import {
    toast,
} from "react-toastify";

import orderService from "../../services/orderService";

import "./OrderHistoryPage.css";

// ============================================================
// FORMAT PRICE
// ============================================================

const formatPrice = (
    value
) => {
    return `${Number(
        value || 0
    ).toLocaleString(
        "vi-VN"
    )}₫`;
};

// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (
    value
) => {
    if (!value) {
        return "--";
    }

    const date =
        new Date(
            value
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }

    return date.toLocaleString(
        "vi-VN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",

            hour: "2-digit",
            minute: "2-digit",
        }
    );
};

// ============================================================
// NORMALIZE ORDER
// ============================================================

const normalizeOrder = (
    order
) => ({
    id:
        order.id ??
        order.order_id ??
        order.orderId,

    totalAmount:
        Number(
            order.totalAmount ??
            order.total_amount ??
            order.total ??
            0
        ),

    status:
        order.status ??
        "pending",

    paymentMethod:
        order.paymentMethod ??
        order.payment_method ??
        "",

    paymentStatus:
        order.paymentStatus ??
        order.payment_status ??
        "",

    shippingAddress:
        order.shippingAddress ??
        order.shipping_address ??
        "",

    phoneNumber:
        order.phoneNumber ??
        order.phone_number ??
        "",

    note:
        order.note ??
        "",

    createdAt:
        order.createdAt ??
        order.created_at ??
        null,

    items:
        Array.isArray(
            order.items
        )
            ? order.items
            : [],
});

// ============================================================
// EXTRACT ORDERS
// ============================================================

const extractOrders = (
    response
) => {
    if (
        Array.isArray(
            response
        )
    ) {
        return response;
    }

    if (
        Array.isArray(
            response?.orders
        )
    ) {
        return response.orders;
    }

    if (
        Array.isArray(
            response?.data
        )
    ) {
        return response.data;
    }

    if (
        Array.isArray(
            response?.data?.orders
        )
    ) {
        return response.data.orders;
    }

    if (
        Array.isArray(
            response?.data?.items
        )
    ) {
        return response.data.items;
    }

    return [];
};

// ============================================================
// STATUS CONFIG
// ============================================================

const STATUS_MAP = {
    pending: {
        label:
            "Chờ xác nhận",

        className:
            "pending",
    },

    confirmed: {
        label:
            "Đã xác nhận",

        className:
            "confirmed",
    },

    processing: {
        label:
            "Đang xử lý",

        className:
            "processing",
    },

    shipping: {
        label:
            "Đang giao",

        className:
            "shipping",
    },

    delivered: {
        label:
            "Đã giao",

        className:
            "delivered",
    },

    cancelled: {
        label:
            "Đã hủy",

        className:
            "cancelled",
    },
};

const getStatusInfo = (
    status
) => {
    return (
        STATUS_MAP[
            status
        ] || {
            label:
                status ||
                "Không xác định",

            className:
                "unknown",
        }
    );
};

// ============================================================
// PAYMENT LABEL
// ============================================================

const getPaymentMethod = (
    value
) => {
    if (
        value ===
        "cod"
    ) {
        return "COD";
    }

    if (
        value ===
        "banking"
    ) {
        return "Chuyển khoản";
    }

    return (
        value ||
        "--"
    );
};

// ============================================================
// PAGE
// ============================================================

function OrderHistoryPage() {
    const [
        orders,
        setOrders,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState("all");

    const [
        cancellingId,
        setCancellingId,
    ] = useState(null);

    const [
        page,
        setPage,
    ] = useState(1);

    const limit = 8;

    // ========================================================
    // LOAD
    // ========================================================

    const loadOrders =
        useCallback(
            async () => {
                try {
                    setLoading(
                        true
                    );

                    setError(
                        ""
                    );

                    const response =
                        await orderService.getMyOrders();

                    const list =
                        extractOrders(
                            response
                        ).map(
                            normalizeOrder
                        );

                    setOrders(
                        list
                    );
                } catch (error) {
                    console.error(
                        "LOAD ORDERS ERROR:",
                        error
                    );

                    setError(
                        error.response
                            ?.data
                            ?.message ||
                            "Không thể tải lịch sử đơn hàng."
                    );
                } finally {
                    setLoading(
                        false
                    );
                }
            },
            []
        );

    useEffect(() => {
        loadOrders();
    }, [
        loadOrders,
    ]);

    // ========================================================
    // FILTER
    // ========================================================

    const filteredOrders =
        useMemo(() => {
            if (
                statusFilter ===
                "all"
            ) {
                return orders;
            }

            return orders.filter(
                (
                    order
                ) =>
                    order.status ===
                    statusFilter
            );
        }, [
            orders,
            statusFilter,
        ]);

    // ========================================================
    // PAGINATION
    // ========================================================

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredOrders.length /
                    limit
            )
        );

    const paginatedOrders =
        useMemo(() => {
            const start =
                (page - 1) *
                limit;

            return filteredOrders.slice(
                start,
                start + limit
            );
        }, [
            filteredOrders,
            page,
        ]);

    useEffect(() => {
        setPage(
            1
        );
    }, [
        statusFilter,
    ]);

    // ========================================================
    // CANCEL
    // ========================================================

    const handleCancel =
        async (
            order
        ) => {
            if (
                order.status !==
                "pending"
            ) {
                toast.warning(
                    "Chỉ có thể hủy đơn đang chờ xác nhận."
                );

                return;
            }

            const confirmed =
                window.confirm(
                    `Bạn có chắc muốn hủy đơn hàng #${order.id}?`
                );

            if (!confirmed) {
                return;
            }

            try {
                setCancellingId(
                    order.id
                );

                const response =
                    await orderService.cancelOrder(
                        order.id
                    );

                toast.success(
                    response?.message ||
                    "Đã hủy đơn hàng."
                );

                await loadOrders();
            } catch (error) {
                console.error(
                    "CANCEL ORDER ERROR:",
                    error
                );

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                        "Không thể hủy đơn hàng."
                );
            } finally {
                setCancellingId(
                    null
                );
            }
        };

    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {
        return (
            <div className="order-history-loading">
                <div
                    className="spinner-border"
                    role="status"
                />

                <span>
                    Đang tải đơn hàng...
                </span>
            </div>
        );
    }

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="order-history-page">
            <div className="container">
                {/* ==============================================
                    HEADER
                ============================================== */}

                <div className="order-history-header">
                    <span>
                        TÀI KHOẢN
                    </span>

                    <h1>
                        Đơn hàng của tôi
                    </h1>

                    <p>
                        Theo dõi và quản lý các đơn hàng đã đặt.
                    </p>
                </div>

                {/* ==============================================
                    FILTERS
                ============================================== */}

                <div className="order-history-filters">
                    {[
                        [
                            "all",
                            "Tất cả",
                        ],

                        [
                            "pending",
                            "Chờ xác nhận",
                        ],

                        [
                            "confirmed",
                            "Đã xác nhận",
                        ],

                        [
                            "processing",
                            "Đang xử lý",
                        ],

                        [
                            "shipping",
                            "Đang giao",
                        ],

                        [
                            "delivered",
                            "Đã giao",
                        ],

                        [
                            "cancelled",
                            "Đã hủy",
                        ],
                    ].map(
                        (
                            [
                                value,
                                label,
                            ]
                        ) => (
                            <button
                                type="button"
                                key={
                                    value
                                }
                                className={
                                    statusFilter ===
                                    value
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setStatusFilter(
                                        value
                                    )
                                }
                            >
                                {
                                    label
                                }
                            </button>
                        )
                    )}
                </div>

                {/* ==============================================
                    ERROR
                ============================================== */}

                {error && (
                    <div className="order-history-error">
                        <FaBox />

                        <h2>
                            Không thể tải đơn hàng
                        </h2>

                        <p>
                            {
                                error
                            }
                        </p>

                        <button
                            type="button"
                            onClick={
                                loadOrders
                            }
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                {/* ==============================================
                    EMPTY
                ============================================== */}

                {!error &&
                    filteredOrders.length ===
                        0 && (
                        <div className="order-history-empty">
                            <FaShoppingBag />

                            <h2>
                                Chưa có đơn hàng
                            </h2>

                            <p>
                                Không có đơn hàng phù hợp với trạng thái này.
                            </p>

                            <Link
                                to="/products"
                            >
                                Mua sắm ngay
                            </Link>
                        </div>
                    )}

                {/* ==============================================
                    LIST
                ============================================== */}

                {!error &&
                    paginatedOrders.length >
                        0 && (
                        <div className="order-history-list">
                            {paginatedOrders.map(
                                (
                                    order
                                ) => {
                                    const statusInfo =
                                        getStatusInfo(
                                            order.status
                                        );

                                    const itemCount =
                                        order.items.reduce(
                                            (
                                                total,
                                                item
                                            ) =>
                                                total +
                                                Number(
                                                    item.quantity ||
                                                        0
                                                ),
                                            0
                                        );

                                    return (
                                        <article
                                            className="order-history-card"
                                            key={
                                                order.id
                                            }
                                        >
                                            {/* HEADER */}

                                            <div className="order-card-top">
                                                <div>
                                                    <div className="order-number">
                                                        Đơn hàng{" "}

                                                        <strong>
                                                            #
                                                            {
                                                                order.id
                                                            }
                                                        </strong>
                                                    </div>

                                                    <div className="order-date">
                                                        <FaClock />

                                                        {formatDate(
                                                            order.createdAt
                                                        )}
                                                    </div>
                                                </div>

                                                <span
                                                    className={`order-status ${statusInfo.className}`}
                                                >
                                                    {
                                                        statusInfo.label
                                                    }
                                                </span>
                                            </div>

                                            {/* BODY */}

                                            <div className="order-card-body">
                                                <div className="order-info-box">
                                                    <span>
                                                        Sản phẩm
                                                    </span>

                                                    <strong>
                                                        {itemCount ||
                                                            order.items
                                                                .length ||
                                                            "--"}
                                                    </strong>
                                                </div>

                                                <div className="order-info-box">
                                                    <span>
                                                        Thanh toán
                                                    </span>

                                                    <strong>
                                                        {getPaymentMethod(
                                                            order.paymentMethod
                                                        )}
                                                    </strong>
                                                </div>

                                                <div className="order-info-box">
                                                    <span>
                                                        Tổng tiền
                                                    </span>

                                                    <strong className="order-total-price">
                                                        {formatPrice(
                                                            order.totalAmount
                                                        )}
                                                    </strong>
                                                </div>
                                            </div>

                                            {/* PRODUCT PREVIEW */}

                                            {order.items.length >
                                                0 && (
                                                <div className="order-product-preview">
                                                    {order.items
                                                        .slice(
                                                            0,
                                                            3
                                                        )
                                                        .map(
                                                            (
                                                                item,
                                                                index
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        item.id ??
                                                                        index
                                                                    }
                                                                >
                                                                    <FaBox />

                                                                    <span>
                                                                        {item.productName ??
                                                                            item.product_name ??
                                                                            "Sản phẩm"}

                                                                        {Number(
                                                                            item.quantity
                                                                        ) >
                                                                            0 &&
                                                                            ` × ${item.quantity}`}
                                                                    </span>
                                                                </div>
                                                            )
                                                        )}

                                                    {order.items
                                                        .length >
                                                        3 && (
                                                        <small>
                                                            +
                                                            {order
                                                                .items
                                                                .length -
                                                                3}{" "}
                                                            sản phẩm khác
                                                        </small>
                                                    )}
                                                </div>
                                            )}

                                            {/* ACTION */}

                                            <div className="order-card-actions">
                                                {order.status ===
                                                    "pending" && (
                                                    <button
                                                        type="button"
                                                        className="order-cancel-button"
                                                        disabled={
                                                            cancellingId ===
                                                            order.id
                                                        }
                                                        onClick={() =>
                                                            handleCancel(
                                                                order
                                                            )
                                                        }
                                                    >
                                                        {cancellingId ===
                                                        order.id ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm" />

                                                                Đang hủy...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FaTimes />

                                                                Hủy đơn
                                                            </>
                                                        )}
                                                    </button>
                                                )}

                                                <Link
                                                    to={`/orders/${order.id}`}
                                                    className="order-detail-button"
                                                >
                                                    <FaEye />

                                                    Xem chi tiết
                                                </Link>
                                            </div>
                                        </article>
                                    );
                                }
                            )}
                        </div>
                    )}

                {/* ==============================================
                    PAGINATION
                ============================================== */}

                {!error &&
                    filteredOrders.length >
                        limit && (
                        <div className="order-history-pagination">
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
                                <FaChevronLeft />
                            </button>

                            <span>
                                Trang{" "}
                                <strong>
                                    {
                                        page
                                    }
                                </strong>{" "}
                                /{" "}
                                {
                                    totalPages
                                }
                            </span>

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
                                <FaChevronRight />
                            </button>
                        </div>
                    )}
            </div>
        </div>
    );
}

export default OrderHistoryPage;