import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    FaArrowLeft,
    FaCheck,
    FaCreditCard,
    FaHome,
    FaMapMarkerAlt,
    FaMoneyBillWave,
    FaShoppingBag,
    FaTag,
} from "react-icons/fa";

import {
    toast,
} from "react-toastify";

import addressService from "../../services/addressService";
import orderService from "../../services/orderService";

import {
    useCart,
} from "../../contexts/CartContext";

import "./CheckoutPage.css";

// ============================================================
// CONFIG
// ============================================================

const SERVER_URL =
    import.meta.env.VITE_SERVER_URL ||
    "http://localhost:5000";

// ============================================================
// HELPERS
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

const makeImageUrl = (
    value
) => {
    if (!value) {
        return null;
    }

    if (
        value.startsWith(
            "http://"
        ) ||
        value.startsWith(
            "https://"
        )
    ) {
        return value;
    }

    return `${SERVER_URL}${value}`;
};

// ============================================================
// NORMALIZE ADDRESS
// ============================================================

const normalizeAddress = (
    address
) => {
    return {
        id:
            address.id ??
            address.address_id ??
            address.addressId,

        fullName:
            address.fullName ??
            address.full_name ??
            address.recipient_name ??
            "",

        phone:
            address.phone ??
            address.phone_number ??
            "",

        province:
            address.province ??
            "",

        district:
            address.district ??
            "",

        ward:
            address.ward ??
            "",

        addressDetail:
            address.addressDetail ??
            address.address_detail ??
            address.address ??
            "",

        isDefault:
            Boolean(
                address.isDefault ??
                address.is_default ??
                false
            ),

        raw:
            address,
    };
};

// ============================================================
// NORMALIZE CART ITEM
// ============================================================

const normalizeCartItem = (
    item
) => {
    const variant =
        item.variant ||
        {};

    return {
        id:
            item.id,

        productId:
            item.product_id ??
            item.productId ??
            item.product?.id ??
            variant.product_id,

        name:
            item.product_name ??
            item.productName ??
            item.product?.name ??
            variant.product_name ??
            "Sản phẩm",

        image:
            makeImageUrl(
                item.thumbnail ??
                item.image ??
                item.image_url ??
                item.product_thumbnail ??
                item.product?.thumbnail ??
                variant.product_thumbnail ??
                null
            ),

        size:
            item.size_name ??
            item.sizeName ??
            variant.size_name ??
            variant.size?.name ??
            "",

        color:
            item.color_name ??
            item.colorName ??
            variant.color_name ??
            variant.color?.name ??
            "",

        quantity:
            Number(
                item.quantity ||
                0
            ),

        price:
            Number(
                item.unit_price ??
                item.sale_price ??
                item.price ??
                variant.unit_price ??
                variant.price ??
                0
            ),
    };
};

// ============================================================
// EXTRACT ADDRESS LIST
// ============================================================

const extractAddresses = (
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
            response?.data
        )
    ) {
        return response.data;
    }

    if (
        Array.isArray(
            response?.data?.addresses
        )
    ) {
        return response.data.addresses;
    }

    if (
        Array.isArray(
            response?.addresses
        )
    ) {
        return response.addresses;
    }

    return [];
};

// ============================================================
// CHECKOUT PAGE
// ============================================================

function CheckoutPage() {
    const navigate =
        useNavigate();

    const {
        items,
        loading: cartLoading,
        resetCart,
    } = useCart();

    // ========================================================
    // STATE
    // ========================================================

    const [
        addresses,
        setAddresses,
    ] = useState([]);

    const [
        selectedAddressId,
        setSelectedAddressId,
    ] = useState("");

    const [
        paymentMethod,
        setPaymentMethod,
    ] = useState("cod");

    const [
        couponCode,
        setCouponCode,
    ] = useState("");

    const [
        note,
        setNote,
    ] = useState("");

    const [
        loadingAddresses,
        setLoadingAddresses,
    ] = useState(true);

    const [
        submitting,
        setSubmitting,
    ] = useState(false);

    const [
        addressError,
        setAddressError,
    ] = useState("");

    // ========================================================
    // NORMALIZE CART
    // ========================================================

    const normalizedItems =
        useMemo(() => {
            return items.map(
                normalizeCartItem
            );
        }, [
            items,
        ]);

    // ========================================================
    // SUBTOTAL
    // ========================================================

    const subtotal =
        useMemo(() => {
            return normalizedItems.reduce(
                (
                    total,
                    item
                ) => {
                    return (
                        total +
                        item.price *
                            item.quantity
                    );
                },
                0
            );
        }, [
            normalizedItems,
        ]);

    // ========================================================
    // TOTAL QUANTITY
    // ========================================================

    const totalQuantity =
        useMemo(() => {
            return normalizedItems.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.quantity,
                0
            );
        }, [
            normalizedItems,
        ]);

    // ========================================================
    // LOAD ADDRESSES
    // ========================================================

    useEffect(() => {
        let mounted =
            true;

        const loadAddresses =
            async () => {
                try {
                    setLoadingAddresses(
                        true
                    );

                    setAddressError(
                        ""
                    );

                    const response =
                        await addressService.getAddresses();

                    const list =
                        extractAddresses(
                            response
                        ).map(
                            normalizeAddress
                        );

                    if (!mounted) {
                        return;
                    }

                    setAddresses(
                        list
                    );

                    const defaultAddress =
                        list.find(
                            (
                                address
                            ) =>
                                address.isDefault
                        );

                    if (
                        defaultAddress
                    ) {
                        setSelectedAddressId(
                            String(
                                defaultAddress.id
                            )
                        );
                    } else if (
                        list.length >
                        0
                    ) {
                        setSelectedAddressId(
                            String(
                                list[0].id
                            )
                        );
                    }
                } catch (error) {
                    console.error(
                        "LOAD ADDRESSES ERROR:",
                        error
                    );

                    if (mounted) {
                        setAddressError(
                            error.response
                                ?.data
                                ?.message ||
                                "Không thể tải địa chỉ nhận hàng."
                        );
                    }
                } finally {
                    if (mounted) {
                        setLoadingAddresses(
                            false
                        );
                    }
                }
            };

        loadAddresses();

        return () => {
            mounted =
                false;
        };
    }, []);

    // ========================================================
    // SELECTED ADDRESS
    // ========================================================

    const selectedAddress =
        useMemo(() => {
            return (
                addresses.find(
                    (
                        address
                    ) =>
                        String(
                            address.id
                        ) ===
                        String(
                            selectedAddressId
                        )
                ) ||
                null
            );
        }, [
            addresses,
            selectedAddressId,
        ]);

    // ========================================================
    // CREATE ORDER
    // ========================================================

    const handleSubmit =
        async (
            event
        ) => {
            event.preventDefault();

            if (
                normalizedItems.length ===
                0
            ) {
                toast.warning(
                    "Giỏ hàng đang trống."
                );

                navigate(
                    "/cart"
                );

                return;
            }

            if (
                !selectedAddressId
            ) {
                toast.warning(
                    "Vui lòng chọn địa chỉ nhận hàng."
                );

                return;
            }

            if (
                ![
                    "cod",
                    "banking",
                ].includes(
                    paymentMethod
                )
            ) {
                toast.warning(
                    "Phương thức thanh toán không hợp lệ."
                );

                return;
            }

            if (
                note.length >
                500
            ) {
                toast.warning(
                    "Ghi chú không được vượt quá 500 ký tự."
                );

                return;
            }

            // Backend checkout nhận đúng:
            // addressId
            // paymentMethod
            // couponCode (optional)
            // note (optional)

            const payload = {
                addressId:
                    Number(
                        selectedAddressId
                    ),

                paymentMethod,

                note:
                    note.trim(),
            };

            if (
                couponCode.trim()
            ) {
                payload.couponCode =
                    couponCode
                        .trim()
                        .toUpperCase();
            }

            try {
                setSubmitting(
                    true
                );

                const response =
                    await orderService.createOrder(
                        payload
                    );

                console.log(
                    "CREATE ORDER RESPONSE:",
                    response
                );

                const orderId =
                    response?.data
                        ?.order?.id ??
                    response?.data
                        ?.orderId ??
                    response?.data
                        ?.id ??
                    response?.orderId ??
                    response?.id ??
                    null;

                resetCart();

                toast.success(
                    response?.message ||
                    "Đặt hàng thành công!"
                );

                if (orderId) {
                    navigate(
                        `/orders/${orderId}`,
                        {
                            replace:
                                true,
                        }
                    );

                    return;
                }

                navigate(
                    "/orders",
                    {
                        replace:
                            true,
                    }
                );
            } catch (error) {
                console.error(
                    "CHECKOUT ERROR:",
                    error
                );

                const responseData =
                    error.response
                        ?.data;

                if (
                    Array.isArray(
                        responseData
                            ?.errors
                    ) &&
                    responseData
                        .errors
                        .length >
                        0
                ) {
                    toast.error(
                        responseData
                            .errors[0]
                            ?.msg ||
                        responseData
                            ?.message ||
                        "Thông tin thanh toán không hợp lệ."
                    );

                    return;
                }

                toast.error(
                    responseData
                        ?.message ||
                    "Không thể tạo đơn hàng."
                );
            } finally {
                setSubmitting(
                    false
                );
            }
        };

    // ========================================================
    // CART LOADING
    // ========================================================

    if (cartLoading) {
        return (
            <div className="checkout-loading">
                <div
                    className="spinner-border"
                    role="status"
                />

                <span>
                    Đang tải thông tin thanh toán...
                </span>
            </div>
        );
    }

    // ========================================================
    // EMPTY CART
    // ========================================================

    if (
        normalizedItems.length ===
        0
    ) {
        return (
            <div className="checkout-page">
                <div className="container">
                    <div className="checkout-empty">
                        <FaShoppingBag />

                        <h1>
                            Không có sản phẩm để thanh toán
                        </h1>

                        <p>
                            Hãy thêm sản phẩm vào giỏ hàng trước.
                        </p>

                        <Link
                            to="/products"
                        >
                            <FaArrowLeft />

                            Quay lại mua sắm
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="checkout-page">
            <div className="container">
                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="checkout-header">
                    <Link
                        to="/cart"
                    >
                        <FaArrowLeft />

                        Quay lại giỏ hàng
                    </Link>

                    <span>
                        SNEAKER SHOP
                    </span>

                    <h1>
                        Thanh toán
                    </h1>

                    <p>
                        Kiểm tra thông tin trước khi đặt hàng.
                    </p>
                </div>

                {/* ==================================================
                    FORM
                ================================================== */}

                <form
                    onSubmit={
                        handleSubmit
                    }
                >
                    <div className="checkout-layout">
                        {/* ==========================================
                            LEFT
                        ========================================== */}

                        <div className="checkout-content">
                            {/* ======================================
                                ADDRESS
                            ====================================== */}

                            <section className="checkout-card">
                                <div className="checkout-card-heading">
                                    <div className="checkout-heading-icon">
                                        <FaMapMarkerAlt />
                                    </div>

                                    <div>
                                        <h2>
                                            Địa chỉ nhận hàng
                                        </h2>

                                        <p>
                                            Chọn địa chỉ giao hàng cho đơn này.
                                        </p>
                                    </div>
                                </div>

                                {loadingAddresses && (
                                    <div className="checkout-section-loading">
                                        <div className="spinner-border spinner-border-sm" />

                                        Đang tải địa chỉ...
                                    </div>
                                )}

                                {!loadingAddresses &&
                                    addressError && (
                                        <div className="alert alert-danger">
                                            {
                                                addressError
                                            }
                                        </div>
                                    )}

                                {!loadingAddresses &&
                                    !addressError &&
                                    addresses.length ===
                                        0 && (
                                        <div className="checkout-no-address">
                                            <FaHome />

                                            <h3>
                                                Bạn chưa có địa chỉ nhận hàng
                                            </h3>

                                            <p>
                                                Hãy thêm địa chỉ trong phần hồ sơ trước khi thanh toán.
                                            </p>

                                            <Link
                                                to="/profile"
                                            >
                                                Đi tới hồ sơ
                                            </Link>
                                        </div>
                                    )}

                                {!loadingAddresses &&
                                    addresses.length >
                                        0 && (
                                        <div className="checkout-address-list">
                                            {addresses.map(
                                                (
                                                    address
                                                ) => {
                                                    const selected =
                                                        String(
                                                            address.id
                                                        ) ===
                                                        String(
                                                            selectedAddressId
                                                        );

                                                    return (
                                                        <label
                                                            className={
                                                                selected
                                                                    ? "checkout-address active"
                                                                    : "checkout-address"
                                                            }
                                                            key={
                                                                address.id
                                                            }
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="address"
                                                                value={
                                                                    address.id
                                                                }
                                                                checked={
                                                                    selected
                                                                }
                                                                onChange={() =>
                                                                    setSelectedAddressId(
                                                                        String(
                                                                            address.id
                                                                        )
                                                                    )
                                                                }
                                                            />

                                                            <div className="checkout-address-content">
                                                                <div className="checkout-address-top">
                                                                    <strong>
                                                                        {address.fullName ||
                                                                            "Người nhận"}
                                                                    </strong>

                                                                    {address.isDefault && (
                                                                        <span>
                                                                            Mặc định
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {address.phone && (
                                                                    <p>
                                                                        {
                                                                            address.phone
                                                                        }
                                                                    </p>
                                                                )}

                                                                <p>
                                                                    {[
                                                                        address.addressDetail,
                                                                        address.ward,
                                                                        address.district,
                                                                        address.province,
                                                                    ]
                                                                        .filter(
                                                                            Boolean
                                                                        )
                                                                        .join(
                                                                            ", "
                                                                        )}
                                                                </p>
                                                            </div>

                                                            {selected && (
                                                                <div className="checkout-address-check">
                                                                    <FaCheck />
                                                                </div>
                                                            )}
                                                        </label>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}
                            </section>

                            {/* ======================================
                                PAYMENT
                            ====================================== */}

                            <section className="checkout-card">
                                <div className="checkout-card-heading">
                                    <div className="checkout-heading-icon">
                                        <FaCreditCard />
                                    </div>

                                    <div>
                                        <h2>
                                            Phương thức thanh toán
                                        </h2>

                                        <p>
                                            Chọn cách bạn muốn thanh toán.
                                        </p>
                                    </div>
                                </div>

                                <div className="checkout-payment-list">
                                    {/* COD */}

                                    <label
                                        className={
                                            paymentMethod ===
                                            "cod"
                                                ? "checkout-payment active"
                                                : "checkout-payment"
                                        }
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={
                                                paymentMethod ===
                                                "cod"
                                            }
                                            onChange={() =>
                                                setPaymentMethod(
                                                    "cod"
                                                )
                                            }
                                        />

                                        <div className="checkout-payment-icon">
                                            <FaMoneyBillWave />
                                        </div>

                                        <div>
                                            <strong>
                                                Thanh toán khi nhận hàng
                                            </strong>

                                            <span>
                                                COD
                                            </span>
                                        </div>

                                        {paymentMethod ===
                                            "cod" && (
                                            <FaCheck className="checkout-payment-check" />
                                        )}
                                    </label>

                                    {/* BANKING */}

                                    <label
                                        className={
                                            paymentMethod ===
                                            "banking"
                                                ? "checkout-payment active"
                                                : "checkout-payment"
                                        }
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="banking"
                                            checked={
                                                paymentMethod ===
                                                "banking"
                                            }
                                            onChange={() =>
                                                setPaymentMethod(
                                                    "banking"
                                                )
                                            }
                                        />

                                        <div className="checkout-payment-icon">
                                            <FaCreditCard />
                                        </div>

                                        <div>
                                            <strong>
                                                Chuyển khoản ngân hàng
                                            </strong>

                                            <span>
                                                Banking
                                            </span>
                                        </div>

                                        {paymentMethod ===
                                            "banking" && (
                                            <FaCheck className="checkout-payment-check" />
                                        )}
                                    </label>
                                </div>
                            </section>

                            {/* ======================================
                                COUPON
                            ====================================== */}

                            <section className="checkout-card">
                                <div className="checkout-card-heading">
                                    <div className="checkout-heading-icon">
                                        <FaTag />
                                    </div>

                                    <div>
                                        <h2>
                                            Mã giảm giá
                                        </h2>

                                        <p>
                                            Nhập mã nếu bạn có coupon.
                                        </p>
                                    </div>
                                </div>

                                <div className="checkout-coupon">
                                    <input
                                        type="text"
                                        value={
                                            couponCode
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setCouponCode(
                                                event
                                                    .target
                                                    .value
                                                    .toUpperCase()
                                            )
                                        }
                                        maxLength={
                                            50
                                        }
                                        placeholder="Ví dụ: SNEAKER10"
                                    />
                                </div>
                            </section>

                            {/* ======================================
                                NOTE
                            ====================================== */}

                            <section className="checkout-card">
                                <h2 className="checkout-note-title">
                                    Ghi chú đơn hàng
                                </h2>

                                <textarea
                                    className="checkout-note"
                                    value={
                                        note
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setNote(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    maxLength={
                                        500
                                    }
                                    rows={
                                        4
                                    }
                                    placeholder="Ghi chú cho shop hoặc đơn vị giao hàng..."
                                />

                                <div className="checkout-note-count">
                                    {
                                        note.length
                                    }
                                    /500
                                </div>
                            </section>
                        </div>

                        {/* ==========================================
                            SUMMARY
                        ========================================== */}

                        <aside className="checkout-summary">
                            <h2>
                                Đơn hàng của bạn
                            </h2>

                            <div className="checkout-items">
                                {normalizedItems.map(
                                    (
                                        item
                                    ) => (
                                        <div
                                            className="checkout-item"
                                            key={
                                                item.id
                                            }
                                        >
                                            <div className="checkout-item-image">
                                                {item.image ? (
                                                    <img
                                                        src={
                                                            item.image
                                                        }
                                                        alt={
                                                            item.name
                                                        }
                                                    />
                                                ) : (
                                                    <FaShoppingBag />
                                                )}

                                                <span>
                                                    {
                                                        item.quantity
                                                    }
                                                </span>
                                            </div>

                                            <div className="checkout-item-info">
                                                <strong>
                                                    {
                                                        item.name
                                                    }
                                                </strong>

                                                <small>
                                                    {[
                                                        item.size
                                                            ? `Size ${item.size}`
                                                            : "",
                                                        item.color,
                                                    ]
                                                        .filter(
                                                            Boolean
                                                        )
                                                        .join(
                                                            " • "
                                                        )}
                                                </small>
                                            </div>

                                            <div className="checkout-item-price">
                                                {formatPrice(
                                                    item.price *
                                                        item.quantity
                                                )}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="checkout-summary-divider" />

                            <div className="checkout-summary-row">
                                <span>
                                    Sản phẩm
                                </span>

                                <strong>
                                    {
                                        totalQuantity
                                    }
                                </strong>
                            </div>

                            <div className="checkout-summary-row">
                                <span>
                                    Tạm tính
                                </span>

                                <strong>
                                    {formatPrice(
                                        subtotal
                                    )}
                                </strong>
                            </div>

                            <div className="checkout-summary-row">
                                <span>
                                    Phí vận chuyển
                                </span>

                                <strong>
                                    Tính bởi hệ thống
                                </strong>
                            </div>

                            {couponCode && (
                                <div className="checkout-summary-row">
                                    <span>
                                        Coupon
                                    </span>

                                    <strong className="checkout-coupon-value">
                                        {
                                            couponCode
                                        }
                                    </strong>
                                </div>
                            )}

                            <div className="checkout-summary-divider" />

                            <div className="checkout-total">
                                <span>
                                    Tạm tính
                                </span>

                                <strong>
                                    {formatPrice(
                                        subtotal
                                    )}
                                </strong>
                            </div>

                            {selectedAddress && (
                                <div className="checkout-selected-address">
                                    <FaMapMarkerAlt />

                                    <span>
                                        Giao tới{" "}
                                        <strong>
                                            {selectedAddress.fullName ||
                                                "người nhận"}
                                        </strong>
                                    </span>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="checkout-submit"
                                disabled={
                                    submitting ||
                                    loadingAddresses ||
                                    !selectedAddressId
                                }
                            >
                                {submitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" />

                                        Đang đặt hàng...
                                    </>
                                ) : (
                                    <>
                                        <FaCheck />

                                        Đặt hàng
                                    </>
                                )}
                            </button>

                            <p className="checkout-security-note">
                                Giá, coupon và tồn kho sẽ được backend kiểm tra lại khi tạo đơn.
                            </p>
                        </aside>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CheckoutPage;