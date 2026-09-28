import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
    useParams,
} from "react-router-dom";

import {
    FaArrowLeft,
    FaBoxOpen,
    FaCheckCircle,
    FaClock,
    FaCreditCard,
    FaMapMarkerAlt,
    FaMoneyBillWave,
    FaPhoneAlt,
    FaReceipt,
    FaSyncAlt,
    FaTimesCircle,
    FaTruck,
    FaUser,
} from "react-icons/fa";

import {
    toast,
} from "react-toastify";

import adminOrderService
    from "../../services/adminOrderService";

import "./OrderDetailAdminPage.css";

// ============================================================
// CONSTANTS
// ============================================================

const PAYMENT_STATUS_OPTIONS = [
    {
        value: "unpaid",
        label: "Chưa thanh toán",
    },
    {
        value: "paid",
        label: "Đã thanh toán",
    },
    {
        value: "failed",
        label: "Thanh toán thất bại",
    },
    {
        value: "refunded",
        label: "Đã hoàn tiền",
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
            label: "Chờ xác nhận",
            className:
                "admin-order-detail-status--pending",
            icon: <FaClock />,
        },

        confirmed: {
            label: "Đã xác nhận",
            className:
                "admin-order-detail-status--confirmed",
            icon: <FaCheckCircle />,
        },

        processing: {
            label: "Đang xử lý",
            className:
                "admin-order-detail-status--processing",
            icon: <FaBoxOpen />,
        },

        shipping: {
            label: "Đang giao",
            className:
                "admin-order-detail-status--shipping",
            icon: <FaTruck />,
        },

        delivered: {
            label: "Đã giao",
            className:
                "admin-order-detail-status--delivered",
            icon: <FaCheckCircle />,
        },

        cancelled: {
            label: "Đã hủy",
            className:
                "admin-order-detail-status--cancelled",
            icon: <FaTimesCircle />,
        },
    };

    return (
        map[status] || {
            label:
                status || "-",
            className: "",
            icon: null,
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
                "admin-order-detail-payment--unpaid",
        },

        paid: {
            label:
                "Đã thanh toán",
            className:
                "admin-order-detail-payment--paid",
        },

        failed: {
            label:
                "Thất bại",
            className:
                "admin-order-detail-payment--failed",
        },

        refunded: {
            label:
                "Hoàn tiền",
            className:
                "admin-order-detail-payment--refunded",
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
// PAYMENT RECORD STATUS
// ============================================================

const getPaymentRecordStatus = (
    status
) => {
    const map = {
        pending:
            "Đang chờ",

        success:
            "Thành công",

        failed:
            "Thất bại",

        refunded:
            "Đã hoàn tiền",
    };

    return (
        map[status] ||
        status ||
        "-"
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
            "Thanh toán khi nhận hàng",

        banking:
            "Chuyển khoản ngân hàng",
    };

    return (
        map[method] ||
        method ||
        "-"
    );
};

// ============================================================
// NEXT ORDER STATUS
// ============================================================

const getNextStatus = (
    currentStatus
) => {
    const map = {
        pending: {
            value:
                "confirmed",

            label:
                "Xác nhận đơn hàng",
        },

        confirmed: {
            value:
                "processing",

            label:
                "Chuyển sang xử lý",
        },

        processing: {
            value:
                "shipping",

            label:
                "Bắt đầu giao hàng",
        },

        shipping: {
            value:
                "delivered",

            label:
                "Đánh dấu đã giao",
        },
    };

    return (
        map[currentStatus] ||
        null
    );
};

// ============================================================
// ADMIN ORDER DETAIL PAGE
// ============================================================

function OrderDetailAdminPage() {
    const {
        id,
    } = useParams();

    // ========================================================
    // STATE
    // ========================================================

    const [
        order,
        setOrder,
    ] = useState(
        null
    );

    const [
        items,
        setItems,
    ] = useState(
        []
    );

    const [
        payments,
        setPayments,
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
        updatingStatus,
        setUpdatingStatus,
    ] = useState(
        false
    );

    const [
        updatingPayment,
        setUpdatingPayment,
    ] = useState(
        false
    );

    const [
        paymentStatus,
        setPaymentStatus,
    ] = useState(
        "unpaid"
    );

    const [
        transactionCode,
        setTransactionCode,
    ] = useState(
        ""
    );

    // ========================================================
    // LOAD DETAIL
    // ========================================================

    const loadOrder =
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
                    const data =
                        await adminOrderService
                            .getOrder(
                                id
                            );

                    const orderData =
                        data?.order ||
                        null;

                    const itemData =
                        Array.isArray(
                            data?.items
                        )
                            ? data.items
                            : [];

                    const paymentData =
                        Array.isArray(
                            data?.payments
                        )
                            ? data.payments
                            : [];

                    setOrder(
                        orderData
                    );

                    setItems(
                        itemData
                    );

                    setPayments(
                        paymentData
                    );

                    setPaymentStatus(
                        orderData
                            ?.payment_status ||
                            "unpaid"
                    );

                    setTransactionCode(
                        paymentData?.[0]
                            ?.transaction_code ||
                            ""
                    );

                    if (
                        manualRefresh
                    ) {
                        toast.success(
                            "Đã cập nhật thông tin đơn hàng."
                        );
                    }
                } catch (
                    error
                ) {
                    console.error(
                        "ADMIN ORDER DETAIL ERROR:",
                        error
                    );

                    setOrder(
                        null
                    );

                    toast.error(
                        error
                            ?.response
                            ?.data
                            ?.message ||
                            "Không thể tải chi tiết đơn hàng."
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
                id,
            ]
        );

    // ========================================================
    // AUTO LOAD
    // ========================================================

    useEffect(
        () => {
            loadOrder();
        },
        [
            loadOrder,
        ]
    );

    // ========================================================
    // TOTAL QUANTITY
    // ========================================================

    const totalQuantity =
        useMemo(
            () =>
                items.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        toNumber(
                            item?.quantity
                        ),
                    0
                ),
            [
                items,
            ]
        );

    // ========================================================
    // NEXT STATUS
    // ========================================================

    const nextStatus =
        getNextStatus(
            order?.order_status
        );

    // ========================================================
    // CAN CANCEL
    // ========================================================

    const canCancel =
        order?.order_status ===
            "pending" ||
        order?.order_status ===
            "confirmed";

    // ========================================================
    // UPDATE ORDER STATUS
    // ========================================================

    const handleUpdateStatus =
        async (
            status
        ) => {
            if (
                !order ||
                !status
            ) {
                return;
            }

            const statusInfo =
                getOrderStatusInfo(
                    status
                );

            const confirmed =
                window.confirm(
                    `Bạn có chắc muốn chuyển đơn ${order.order_code || `#${order.id}`} sang trạng thái "${statusInfo.label}"?`
                );

            if (
                !confirmed
            ) {
                return;
            }

            setUpdatingStatus(
                true
            );

            try {
                const response =
                    await adminOrderService
                        .updateStatus(
                            order.id,
                            status
                        );

                toast.success(
                    response?.message ||
                        "Cập nhật trạng thái đơn hàng thành công."
                );

                await loadOrder();
            } catch (
                error
            ) {
                console.error(
                    "UPDATE ORDER STATUS ERROR:",
                    error
                );

                toast.error(
                    error
                        ?.response
                        ?.data
                        ?.message ||
                        "Không thể cập nhật trạng thái đơn hàng."
                );
            } finally {
                setUpdatingStatus(
                    false
                );
            }
        };

    // ========================================================
    // CANCEL ORDER
    // ========================================================

    const handleCancelOrder =
        async () => {
            if (
                !order ||
                !canCancel
            ) {
                return;
            }

            const confirmed =
                window.confirm(
                    `Bạn có chắc muốn HỦY đơn ${order.order_code || `#${order.id}`}?\n\nSản phẩm sẽ được hoàn lại tồn kho.`
                );

            if (
                !confirmed
            ) {
                return;
            }

            await handleUpdateStatus(
                "cancelled"
            );
        };

    // ========================================================
    // UPDATE PAYMENT
    // ========================================================

    const handleUpdatePayment =
        async (
            event
        ) => {
            event.preventDefault();

            if (!order) {
                return;
            }

            const info =
                getPaymentStatusInfo(
                    paymentStatus
                );

            const confirmed =
                window.confirm(
                    `Cập nhật thanh toán của đơn ${order.order_code || `#${order.id}`} thành "${info.label}"?`
                );

            if (
                !confirmed
            ) {
                return;
            }

            setUpdatingPayment(
                true
            );

            try {
                const response =
                    await adminOrderService
                        .updatePaymentStatus(
                            order.id,
                            {
                                paymentStatus,

                                transactionCode:
                                    transactionCode
                                        .trim() ||
                                    null,
                            }
                        );

                toast.success(
                    response?.message ||
                        "Cập nhật thanh toán thành công."
                );

                await loadOrder();
            } catch (
                error
            ) {
                console.error(
                    "UPDATE PAYMENT ERROR:",
                    error
                );

                toast.error(
                    error
                        ?.response
                        ?.data
                        ?.message ||
                        "Không thể cập nhật trạng thái thanh toán."
                );
            } finally {
                setUpdatingPayment(
                    false
                );
            }
        };

    // ========================================================
    // LOADING
    // ========================================================

    if (
        loading
    ) {
        return (
            <div className="admin-order-detail-page">
                <div className="admin-order-detail-loading">
                    <div className="spinner-border" />

                    <span>
                        Đang tải chi tiết đơn hàng...
                    </span>
                </div>
            </div>
        );
    }

    // ========================================================
    // NOT FOUND
    // ========================================================

    if (!order) {
        return (
            <div className="admin-order-detail-page">
                <div className="admin-order-detail-not-found">
                    <FaReceipt />

                    <h2>
                        Không tìm thấy đơn hàng
                    </h2>

                    <p>
                        Đơn hàng này không tồn tại
                        hoặc đã bị xóa.
                    </p>

                    <Link
                        to="/admin/orders"
                    >
                        <FaArrowLeft />

                        Quay lại đơn hàng
                    </Link>
                </div>
            </div>
        );
    }

    // ========================================================
    // STATUS INFO
    // ========================================================

    const orderStatus =
        getOrderStatusInfo(
            order.order_status
        );

    const paymentInfo =
        getPaymentStatusInfo(
            order.payment_status
        );

    const payment =
        payments?.[0] ||
        null;

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="admin-order-detail-page">
            {/* ==================================================
                TOP NAV
            ================================================== */}

            <div className="admin-order-detail-nav">
                <Link
                    to="/admin/orders"
                    className="admin-order-detail-back"
                >
                    <FaArrowLeft />

                    Quay lại danh sách
                </Link>

                <button
                    type="button"
                    disabled={
                        refreshing
                    }
                    className="admin-order-detail-refresh"
                    onClick={() =>
                        loadOrder(
                            true
                        )
                    }
                >
                    <FaSyncAlt
                        className={
                            refreshing
                                ? "admin-order-detail-spin"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Đang tải..."
                        : "Làm mới"}
                </button>
            </div>

            {/* ==================================================
                HEADER
            ================================================== */}

            <header className="admin-order-detail-header">
                <div>
                    <span className="admin-order-detail-eyebrow">
                        CHI TIẾT ĐƠN HÀNG
                    </span>

                    <h1>
                        {order.order_code ||
                            `Đơn hàng #${order.id}`}
                    </h1>

                    <p>
                        Đặt ngày{" "}
                        {formatDate(
                            order.created_at
                        )}
                    </p>
                </div>

                <div className="admin-order-detail-header-statuses">
                    <span
                        className={[
                            "admin-order-detail-status",

                            orderStatus.className,
                        ]
                            .filter(
                                Boolean
                            )
                            .join(
                                " "
                            )}
                    >
                        {orderStatus.icon}

                        {
                            orderStatus.label
                        }
                    </span>

                    <span
                        className={[
                            "admin-order-detail-payment",

                            paymentInfo.className,
                        ]
                            .filter(
                                Boolean
                            )
                            .join(
                                " "
                            )}
                    >
                        <FaCreditCard />

                        {
                            paymentInfo.label
                        }
                    </span>
                </div>
            </header>

            {/* ==================================================
                ACTIONS
            ================================================== */}

            <section className="admin-order-detail-actions">
                <div>
                    <span>
                        XỬ LÝ ĐƠN HÀNG
                    </span>

                    <strong>
                        {
                            orderStatus.label
                        }
                    </strong>
                </div>

                <div className="admin-order-detail-action-buttons">
                    {nextStatus && (
                        <button
                            type="button"
                            className="admin-order-detail-next"
                            disabled={
                                updatingStatus
                            }
                            onClick={() =>
                                handleUpdateStatus(
                                    nextStatus.value
                                )
                            }
                        >
                            {updatingStatus
                                ? "Đang xử lý..."
                                : nextStatus.label}
                        </button>
                    )}

                    {canCancel && (
                        <button
                            type="button"
                            className="admin-order-detail-cancel"
                            disabled={
                                updatingStatus
                            }
                            onClick={
                                handleCancelOrder
                            }
                        >
                            <FaTimesCircle />

                            Hủy đơn hàng
                        </button>
                    )}

                    {!nextStatus &&
                        !canCancel && (
                            <span className="admin-order-detail-final-status">
                                {order.order_status ===
                                "delivered"
                                    ? "Đơn hàng đã hoàn tất."
                                    : "Đơn hàng đã kết thúc."}
                            </span>
                        )}
                </div>
            </section>

            {/* ==================================================
                MAIN GRID
            ================================================== */}

            <div className="admin-order-detail-grid">
                {/* ==================================================
                    LEFT
                ================================================== */}

                <div className="admin-order-detail-main">
                    {/* ==============================================
                        ITEMS
                    ============================================== */}

                    <section className="admin-order-detail-card">
                        <div className="admin-order-detail-card-header">
                            <div>
                                <span>
                                    SẢN PHẨM
                                </span>

                                <h2>
                                    Sản phẩm trong đơn
                                </h2>
                            </div>

                            <strong>
                                {totalQuantity} sản phẩm
                            </strong>
                        </div>

                        {items.length ===
                        0 ? (
                            <div className="admin-order-detail-empty">
                                Không có sản phẩm.
                            </div>
                        ) : (
                            <div className="admin-order-detail-items">
                                {items.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <article
                                            className="admin-order-detail-item"
                                            key={
                                                item.id ||
                                                `${item.product_id}-${index}`
                                            }
                                        >
                                            <div className="admin-order-detail-item-icon">
                                                <FaBoxOpen />
                                            </div>

                                            <div className="admin-order-detail-item-info">
                                                <strong>
                                                    {item.product_name ||
                                                        `Sản phẩm #${item.product_id || index + 1}`}
                                                </strong>

                                                <span>
                                                    {item.variant_name ||
                                                        "Phiên bản mặc định"}
                                                </span>

                                                {item.product_variant_id && (
                                                    <small>
                                                        Variant ID:{" "}
                                                        {
                                                            item.product_variant_id
                                                        }
                                                    </small>
                                                )}
                                            </div>

                                            <div className="admin-order-detail-item-price">
                                                <span>
                                                    {formatCurrency(
                                                        item.price
                                                    )}
                                                    {" × "}
                                                    {toNumber(
                                                        item.quantity
                                                    )}
                                                </span>

                                                <strong>
                                                    {formatCurrency(
                                                        item.subtotal
                                                    )}
                                                </strong>
                                            </div>
                                        </article>
                                    )
                                )}
                            </div>
                        )}
                    </section>

                    {/* ==============================================
                        RECEIVER
                    ============================================== */}

                    <section className="admin-order-detail-card">
                        <div className="admin-order-detail-card-header">
                            <div>
                                <span>
                                    GIAO HÀNG
                                </span>

                                <h2>
                                    Thông tin người nhận
                                </h2>
                            </div>

                            <FaMapMarkerAlt />
                        </div>

                        <div className="admin-order-detail-info-grid">
                            <div>
                                <span className="admin-order-detail-info-icon">
                                    <FaUser />
                                </span>

                                <div>
                                    <small>
                                        Người nhận
                                    </small>

                                    <strong>
                                        {order.receiver_name ||
                                            "-"}
                                    </strong>
                                </div>
                            </div>

                            <div>
                                <span className="admin-order-detail-info-icon">
                                    <FaPhoneAlt />
                                </span>

                                <div>
                                    <small>
                                        Số điện thoại
                                    </small>

                                    <strong>
                                        {order.receiver_phone ||
                                            "-"}
                                    </strong>
                                </div>
                            </div>

                            <div className="admin-order-detail-address">
                                <span className="admin-order-detail-info-icon">
                                    <FaMapMarkerAlt />
                                </span>

                                <div>
                                    <small>
                                        Địa chỉ giao hàng
                                    </small>

                                    <strong>
                                        {order.shipping_address ||
                                            "-"}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        {order.note && (
                            <div className="admin-order-detail-note">
                                <span>
                                    Ghi chú khách hàng
                                </span>

                                <p>
                                    {order.note}
                                </p>
                            </div>
                        )}

                        {order.cancelled_reason && (
                            <div className="admin-order-detail-cancel-reason">
                                <span>
                                    Lý do hủy
                                </span>

                                <p>
                                    {
                                        order.cancelled_reason
                                    }
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                {/* ==================================================
                    RIGHT
                ================================================== */}

                <aside className="admin-order-detail-sidebar">
                    {/* ==============================================
                        TOTAL
                    ============================================== */}

                    <section className="admin-order-detail-card">
                        <div className="admin-order-detail-card-header">
                            <div>
                                <span>
                                    THANH TOÁN
                                </span>

                                <h2>
                                    Tổng đơn hàng
                                </h2>
                            </div>

                            <FaMoneyBillWave />
                        </div>

                        <div className="admin-order-detail-money">
                            <div>
                                <span>
                                    Tạm tính
                                </span>

                                <strong>
                                    {formatCurrency(
                                        order.subtotal
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Giảm giá
                                </span>

                                <strong className="admin-order-detail-discount">
                                    -
                                    {formatCurrency(
                                        order.discount_amount
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Phí vận chuyển
                                </span>

                                <strong>
                                    {toNumber(
                                        order.shipping_fee
                                    ) ===
                                    0
                                        ? "Miễn phí"
                                        : formatCurrency(
                                              order.shipping_fee
                                          )}
                                </strong>
                            </div>

                            <div className="admin-order-detail-total">
                                <span>
                                    Tổng cộng
                                </span>

                                <strong>
                                    {formatCurrency(
                                        order.total_amount
                                    )}
                                </strong>
                            </div>
                        </div>
                    </section>

                    {/* ==============================================
                        PAYMENT INFO
                    ============================================== */}

                    <section className="admin-order-detail-card">
                        <div className="admin-order-detail-card-header">
                            <div>
                                <span>
                                    GIAO DỊCH
                                </span>

                                <h2>
                                    Thông tin thanh toán
                                </h2>
                            </div>

                            <FaCreditCard />
                        </div>

                        <div className="admin-order-detail-payment-info">
                            <div>
                                <span>
                                    Phương thức
                                </span>

                                <strong>
                                    {getPaymentMethod(
                                        order.payment_method
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Trạng thái đơn
                                </span>

                                <strong>
                                    {
                                        paymentInfo.label
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Payment record
                                </span>

                                <strong>
                                    {getPaymentRecordStatus(
                                        payment?.status
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Mã giao dịch
                                </span>

                                <strong>
                                    {payment?.transaction_code ||
                                        "-"}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Số tiền
                                </span>

                                <strong>
                                    {formatCurrency(
                                        payment?.amount ||
                                            order.total_amount
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Thanh toán lúc
                                </span>

                                <strong>
                                    {formatDate(
                                        payment?.paid_at
                                    )}
                                </strong>
                            </div>
                        </div>
                    </section>

                    {/* ==============================================
                        UPDATE PAYMENT
                    ============================================== */}

                    <section className="admin-order-detail-card">
                        <div className="admin-order-detail-card-header">
                            <div>
                                <span>
                                    QUẢN TRỊ
                                </span>

                                <h2>
                                    Cập nhật thanh toán
                                </h2>
                            </div>
                        </div>

                        <form
                            className="admin-order-detail-payment-form"
                            onSubmit={
                                handleUpdatePayment
                            }
                        >
                            <label>
                                <span>
                                    Trạng thái thanh toán
                                </span>

                                <select
                                    value={
                                        paymentStatus
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setPaymentStatus(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                >
                                    {PAYMENT_STATUS_OPTIONS.map(
                                        (
                                            option
                                        ) => (
                                            <option
                                                key={
                                                    option.value
                                                }
                                                value={
                                                    option.value
                                                }
                                            >
                                                {
                                                    option.label
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </label>

                            <label>
                                <span>
                                    Mã giao dịch
                                </span>

                                <input
                                    type="text"
                                    maxLength="100"
                                    value={
                                        transactionCode
                                    }
                                    placeholder="VD: BANK-2026-001"
                                    onChange={(
                                        event
                                    ) =>
                                        setTransactionCode(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                />
                            </label>

                            <button
                                type="submit"
                                disabled={
                                    updatingPayment
                                }
                            >
                                <FaCreditCard />

                                {updatingPayment
                                    ? "Đang cập nhật..."
                                    : "Cập nhật thanh toán"}
                            </button>
                        </form>

                        <p className="admin-order-detail-payment-note">
                            Với đơn COD, khi chuyển
                            trạng thái đơn sang
                            <strong>
                                {" "}
                                Đã giao
                            </strong>
                            , backend sẽ tự động
                            đánh dấu thanh toán
                            thành công.
                        </p>
                    </section>

                    {/* ==============================================
                        META
                    ============================================== */}

                    <section className="admin-order-detail-card">
                        <div className="admin-order-detail-meta">
                            <div>
                                <span>
                                    ID đơn hàng
                                </span>

                                <strong>
                                    #{order.id}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Ngày tạo
                                </span>

                                <strong>
                                    {formatDate(
                                        order.created_at
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Cập nhật cuối
                                </span>

                                <strong>
                                    {formatDate(
                                        order.updated_at
                                    )}
                                </strong>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}

export default OrderDetailAdminPage;