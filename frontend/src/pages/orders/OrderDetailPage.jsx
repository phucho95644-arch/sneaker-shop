import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    FaArrowLeft,
    FaBox,
    FaCheckCircle,
    FaClock,
    FaCreditCard,
    FaMapMarkerAlt,
    FaMoneyBillWave,
    FaPhone,
    FaShoppingBag,
    FaStickyNote,
    FaTimes,
    FaTruck,
} from "react-icons/fa";

import {
    toast,
} from "react-toastify";

import orderService from "../../services/orderService";

import "./OrderDetailPage.css";

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
// NORMALIZE ITEM
// ============================================================

const normalizeItem = (
    item
) => ({
    id:
        item.id ??
        item.item_id,

    productName:
        item.productName ??
        item.product_name ??
        "Sản phẩm",

    imageUrl:
        item.imageUrl ??
        item.image_url ??
        "",

    size:
        item.size ??
        item.size_name ??
        "",

    color:
        item.color ??
        item.color_name ??
        "",

    quantity:
        Number(
            item.quantity ??
            0
        ),

    unitPrice:
        Number(
            item.unitPrice ??
            item.unit_price ??
            0
        ),
});

// ============================================================
// NORMALIZE ORDER
// ============================================================

const normalizeOrder = (
    response
) => {
    const data =
        response?.order ??
        response?.data?.order ??
        response?.data ??
        response;

    if (!data) {
        return null;
    }

    return {
        id:
            data.id ??
            data.order_id ??
            data.orderId,

        totalAmount:
            Number(
                data.totalAmount ??
                data.total_amount ??
                data.total ??
                0
            ),

        status:
            data.status ??
            "pending",

        paymentMethod:
            data.paymentMethod ??
            data.payment_method ??
            "",

        paymentStatus:
            data.paymentStatus ??
            data.payment_status ??
            "",

        shippingAddress:
            data.shippingAddress ??
            data.shipping_address ??
            "",

        phoneNumber:
            data.phoneNumber ??
            data.phone_number ??
            "",

        note:
            data.note ??
            "",

        createdAt:
            data.createdAt ??
            data.created_at ??
            null,

        items:
            Array.isArray(
                data.items
            )
                ? data.items.map(
                      normalizeItem
                  )
                : [],
    };
};

// ============================================================
// STATUS
// ============================================================

const STATUS_MAP = {
    pending: {
        label:
            "Chờ xác nhận",

        className:
            "pending",

        icon:
            <FaClock />,
    },

    confirmed: {
        label:
            "Đã xác nhận",

        className:
            "confirmed",

        icon:
            <FaCheckCircle />,
    },

    processing: {
        label:
            "Đang xử lý",

        className:
            "processing",

        icon:
            <FaBox />,
    },

    shipping: {
        label:
            "Đang giao",

        className:
            "shipping",

        icon:
            <FaTruck />,
    },

    delivered: {
        label:
            "Đã giao",

        className:
            "delivered",

        icon:
            <FaCheckCircle />,
    },

    cancelled: {
        label:
            "Đã hủy",

        className:
            "cancelled",

        icon:
            <FaTimes />,
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

            icon:
                <FaBox />,
        }
    );
};

// ============================================================
// PAYMENT
// ============================================================

const getPaymentMethodLabel = (
    value
) => {
    switch (value) {
        case "cod":
            return "Thanh toán khi nhận hàng";

        case "banking":
            return "Chuyển khoản ngân hàng";

        default:
            return value || "--";
    }
};

const getPaymentStatus = (
    value
) => {
    switch (value) {
        case "paid":
            return {
                text:
                    "Đã thanh toán",
                className:
                    "paid",
            };

        case "pending":
            return {
                text:
                    "Chưa thanh toán",
                className:
                    "pending",
            };

        case "failed":
            return {
                text:
                    "Thanh toán thất bại",
                className:
                    "failed",
            };

        case "refunded":
            return {
                text:
                    "Đã hoàn tiền",
                className:
                    "refunded",
            };

        default:
            return {
                text:
                    value ||
                    "Chưa xác định",
                className:
                    "unknown",
            };
    }
};

// ============================================================
// PAGE
// ============================================================

function OrderDetailPage() {
    const {
        id,
    } = useParams();

    const navigate =
        useNavigate();

    const [
        order,
        setOrder,
    ] = useState(null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    const [
        cancelling,
        setCancelling,
    ] = useState(false);

    // ========================================================
    // LOAD ORDER
    // ========================================================

    const loadOrder =
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
                        await orderService.getOrderById(
                            id
                        );

                    const data =
                        normalizeOrder(
                            response
                        );

                    if (!data) {
                        throw new Error(
                            "Không tìm thấy đơn hàng."
                        );
                    }

                    setOrder(
                        data
                    );
                } catch (error) {
                    console.error(
                        "ORDER DETAIL ERROR:",
                        error
                    );

                    setOrder(
                        null
                    );

                    setError(
                        error.response
                            ?.data
                            ?.message ||
                            error.message ||
                            "Không thể tải chi tiết đơn hàng."
                    );
                } finally {
                    setLoading(
                        false
                    );
                }
            },
            [
                id,
            ]
        );

    useEffect(() => {
        loadOrder();
    }, [
        loadOrder,
    ]);

    // ========================================================
    // ITEM TOTAL
    // ========================================================

    const calculatedSubtotal =
        useMemo(() => {
            if (!order) {
                return 0;
            }

            return order.items.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.unitPrice *
                        item.quantity,
                0
            );
        }, [
            order,
        ]);

    // ========================================================
    // TOTAL QUANTITY
    // ========================================================

    const totalQuantity =
        useMemo(() => {
            if (!order) {
                return 0;
            }

            return order.items.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.quantity,
                0
            );
        }, [
            order,
        ]);

    // ========================================================
    // CANCEL ORDER
    // ========================================================

    const handleCancelOrder =
        async () => {
            if (
                !order ||
                order.status !==
                    "pending"
            ) {
                toast.warning(
                    "Chỉ có thể hủy đơn hàng đang chờ xác nhận."
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
                setCancelling(
                    true
                );

                const response =
                    await orderService.cancelOrder(
                        order.id
                    );

                toast.success(
                    response?.message ||
                    "Đã hủy đơn hàng thành công."
                );

                await loadOrder();
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
                setCancelling(
                    false
                );
            }
        };

    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {
        return (
            <div className="order-detail-loading">
                <div
                    className="spinner-border"
                    role="status"
                />

                <span>
                    Đang tải chi tiết đơn hàng...
                </span>
            </div>
        );
    }

    // ========================================================
    // ERROR
    // ========================================================

    if (
        error ||
        !order
    ) {
        return (
            <div className="order-detail-page">
                <div className="container">
                    <div className="order-detail-error">
                        <FaShoppingBag />

                        <h1>
                            Không thể hiển thị đơn hàng
                        </h1>

                        <p>
                            {error ||
                                "Không tìm thấy đơn hàng."}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/orders"
                                )
                            }
                        >
                            <FaArrowLeft />

                            Quay lại đơn hàng
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const statusInfo =
        getStatusInfo(
            order.status
        );

    const paymentStatus =
        getPaymentStatus(
            order.paymentStatus
        );

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="order-detail-page">
            <div className="container">
                {/* ==================================================
                    BACK
                ================================================== */}

                <Link
                    to="/orders"
                    className="order-detail-back"
                >
                    <FaArrowLeft />

                    Đơn hàng của tôi
                </Link>

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="order-detail-header">
                    <div>
                        <span>
                            CHI TIẾT ĐƠN HÀNG
                        </span>

                        <h1>
                            Đơn hàng #
                            {
                                order.id
                            }
                        </h1>

                        <p>
                            Đặt lúc{" "}
                            {formatDate(
                                order.createdAt
                            )}
                        </p>
                    </div>

                    <div
                        className={`order-detail-status ${statusInfo.className}`}
                    >
                        {
                            statusInfo.icon
                        }

                        {
                            statusInfo.label
                        }
                    </div>
                </div>

                {/* ==================================================
                    LAYOUT
                ================================================== */}

                <div className="order-detail-layout">
                    {/* ==============================================
                        LEFT
                    ============================================== */}

                    <main className="order-detail-content">
                        {/* ==========================================
                            ITEMS
                        ========================================== */}

                        <section className="order-detail-card">
                            <div className="order-detail-card-title">
                                <div>
                                    <FaShoppingBag />
                                </div>

                                <div>
                                    <h2>
                                        Sản phẩm
                                    </h2>

                                    <p>
                                        {
                                            totalQuantity
                                        }{" "}
                                        sản phẩm trong đơn
                                    </p>
                                </div>
                            </div>

                            {order.items.length ===
                            0 ? (
                                <div className="order-detail-no-items">
                                    Không có dữ liệu sản phẩm.
                                </div>
                            ) : (
                                <div className="order-detail-items">
                                    {order.items.map(
                                        (
                                            item,
                                            index
                                        ) => (
                                            <article
                                                className="order-detail-item"
                                                key={
                                                    item.id ??
                                                    index
                                                }
                                            >
                                                <div className="order-detail-item-image">
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={
                                                                item.imageUrl
                                                            }
                                                            alt={
                                                                item.productName
                                                            }
                                                        />
                                                    ) : (
                                                        <FaShoppingBag />
                                                    )}
                                                </div>

                                                <div className="order-detail-item-info">
                                                    <h3>
                                                        {
                                                            item.productName
                                                        }
                                                    </h3>

                                                    <div className="order-detail-variant">
                                                        {item.size && (
                                                            <span>
                                                                Size:{" "}

                                                                <strong>
                                                                    {
                                                                        item.size
                                                                    }
                                                                </strong>
                                                            </span>
                                                        )}

                                                        {item.color && (
                                                            <span>
                                                                Màu:{" "}

                                                                <strong>
                                                                    {
                                                                        item.color
                                                                    }
                                                                </strong>
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="order-detail-item-unit">
                                                        {formatPrice(
                                                            item.unitPrice
                                                        )}

                                                        {" × "}

                                                        {
                                                            item.quantity
                                                        }
                                                    </div>
                                                </div>

                                                <strong className="order-detail-item-total">
                                                    {formatPrice(
                                                        item.unitPrice *
                                                            item.quantity
                                                    )}
                                                </strong>
                                            </article>
                                        )
                                    )}
                                </div>
                            )}
                        </section>

                        {/* ==========================================
                            DELIVERY
                        ========================================== */}

                        <section className="order-detail-card">
                            <div className="order-detail-card-title">
                                <div>
                                    <FaMapMarkerAlt />
                                </div>

                                <div>
                                    <h2>
                                        Thông tin giao hàng
                                    </h2>

                                    <p>
                                        Địa chỉ nhận đơn hàng.
                                    </p>
                                </div>
                            </div>

                            <div className="order-delivery-info">
                                <div>
                                    <FaMapMarkerAlt />

                                    <span>
                                        <small>
                                            Địa chỉ
                                        </small>

                                        <strong>
                                            {order.shippingAddress ||
                                                "Chưa có thông tin"}
                                        </strong>
                                    </span>
                                </div>

                                <div>
                                    <FaPhone />

                                    <span>
                                        <small>
                                            Số điện thoại
                                        </small>

                                        <strong>
                                            {order.phoneNumber ||
                                                "Chưa có thông tin"}
                                        </strong>
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* ==========================================
                            NOTE
                        ========================================== */}

                        {order.note && (
                            <section className="order-detail-card">
                                <div className="order-detail-card-title">
                                    <div>
                                        <FaStickyNote />
                                    </div>

                                    <div>
                                        <h2>
                                            Ghi chú
                                        </h2>
                                    </div>
                                </div>

                                <p className="order-detail-note">
                                    {
                                        order.note
                                    }
                                </p>
                            </section>
                        )}
                    </main>

                    {/* ==============================================
                        SUMMARY
                    ============================================== */}

                    <aside className="order-detail-summary">
                        <h2>
                            Thông tin đơn hàng
                        </h2>

                        {/* PAYMENT METHOD */}

                        <div className="order-summary-block">
                            <span>
                                <FaCreditCard />

                                Phương thức thanh toán
                            </span>

                            <strong>
                                {getPaymentMethodLabel(
                                    order.paymentMethod
                                )}
                            </strong>
                        </div>

                        {/* PAYMENT STATUS */}

                        <div className="order-summary-block">
                            <span>
                                <FaMoneyBillWave />

                                Trạng thái thanh toán
                            </span>

                            <strong
                                className={`order-payment-status ${paymentStatus.className}`}
                            >
                                {
                                    paymentStatus.text
                                }
                            </strong>
                        </div>

                        <div className="order-detail-divider" />

                        {/* SUBTOTAL */}

                        <div className="order-detail-summary-row">
                            <span>
                                Tạm tính
                            </span>

                            <strong>
                                {formatPrice(
                                    calculatedSubtotal
                                )}
                            </strong>
                        </div>

                        <div className="order-detail-summary-row">
                            <span>
                                Số lượng
                            </span>

                            <strong>
                                {
                                    totalQuantity
                                }
                            </strong>
                        </div>

                        <div className="order-detail-divider" />

                        {/* TOTAL */}

                        <div className="order-detail-total">
                            <span>
                                Tổng cộng
                            </span>

                            <strong>
                                {formatPrice(
                                    order.totalAmount ||
                                        calculatedSubtotal
                                )}
                            </strong>
                        </div>

                        {/* CANCEL */}

                        {order.status ===
                            "pending" && (
                            <button
                                type="button"
                                className="order-detail-cancel"
                                onClick={
                                    handleCancelOrder
                                }
                                disabled={
                                    cancelling
                                }
                            >
                                {cancelling ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" />

                                        Đang hủy...
                                    </>
                                ) : (
                                    <>
                                        <FaTimes />

                                        Hủy đơn hàng
                                    </>
                                )}
                            </button>
                        )}

                        <Link
                            to="/products"
                            className="order-detail-buy-more"
                        >
                            Tiếp tục mua sắm
                        </Link>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default OrderDetailPage;