import {
    useMemo,
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    FaArrowLeft,
    FaMinus,
    FaPlus,
    FaShoppingBag,
    FaTrash,
} from "react-icons/fa";

import {
    toast,
} from "react-toastify";

import {
    useCart,
} from "../../contexts/CartContext";

import "./CartPage.css";

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
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        return value;
    }

    return `${SERVER_URL}${value}`;
};

// ============================================================
// NORMALIZE CART ITEM
// ============================================================

const normalizeCartItem = (
    item
) => {
    const id =
        item.id ??
        item.cart_item_id ??
        item.cartItemId;

    const productVariantId =
        item.product_variant_id ??
        item.productVariantId ??
        item.variant_id ??
        item.variantId;

    const productId =
        item.product_id ??
        item.productId ??
        item.product?.id;

    const name =
        item.product_name ??
        item.productName ??
        item.name ??
        item.product?.name ??
        "Sản phẩm";

    const image =
        item.thumbnail ??
        item.image ??
        item.image_url ??
        item.product_image ??
        item.product?.thumbnail ??
        item.product?.image ??
        item.product?.image_url ??
        null;

    const size =
        item.size_name ??
        item.sizeName ??
        item.size ??
        item.variant?.size_name ??
        item.variant?.size?.name ??
        "";

    const color =
        item.color_name ??
        item.colorName ??
        item.color ??
        item.variant?.color_name ??
        item.variant?.color?.name ??
        "";

    const sku =
        item.sku ??
        item.variant_sku ??
        item.variant?.sku ??
        "";

    const price =
        Number(
            item.sale_price ??
            item.unit_price ??
            item.price ??
            item.variant?.sale_price ??
            item.variant?.price ??
            0
        );

    const quantity =
        Number(
            item.quantity ??
            1
        );

    const stock =
        Number(
            item.stock ??
            item.stock_quantity ??
            item.variant?.stock ??
            item.variant?.stock_quantity ??
            0
        );

    return {
        id,
        productVariantId,
        productId,
        name,
        image:
            makeImageUrl(
                image
            ),
        size,
        color,
        sku,
        price,
        quantity,
        stock,
        raw:
            item,
    };
};

// ============================================================
// CART PAGE
// ============================================================

function CartPage() {
    const navigate =
        useNavigate();

    const {
        items,
        loading,
        updateItem,
        removeItem,
        clearCart,
    } = useCart();

    const [
        updatingItemId,
        setUpdatingItemId,
    ] = useState(null);

    const [
        removingItemId,
        setRemovingItemId,
    ] = useState(null);

    const [
        clearing,
        setClearing,
    ] = useState(false);

    // ========================================================
    // NORMALIZED ITEMS
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
    // UPDATE QUANTITY
    // ========================================================

    const handleUpdateQuantity =
        async (
            item,
            newQuantity
        ) => {
            if (
                updatingItemId
            ) {
                return;
            }

            if (
                newQuantity <
                1
            ) {
                return;
            }

            if (
                item.stock >
                    0 &&
                newQuantity >
                    item.stock
            ) {
                toast.warning(
                    `Chỉ còn ${item.stock} sản phẩm trong kho.`
                );

                return;
            }

            try {
                setUpdatingItemId(
                    item.id
                );

                await updateItem(
                    item.id,
                    newQuantity
                );
            } catch (error) {
                console.error(
                    "UPDATE CART ERROR:",
                    error
                );

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                    "Không thể cập nhật số lượng."
                );
            } finally {
                setUpdatingItemId(
                    null
                );
            }
        };

    // ========================================================
    // REMOVE ITEM
    // ========================================================

    const handleRemoveItem =
        async (
            item
        ) => {
            if (
                removingItemId
            ) {
                return;
            }

            const confirmed =
                window.confirm(
                    `Bạn có muốn xóa "${item.name}" khỏi giỏ hàng không?`
                );

            if (!confirmed) {
                return;
            }

            try {
                setRemovingItemId(
                    item.id
                );

                await removeItem(
                    item.id
                );

                toast.success(
                    "Đã xóa sản phẩm khỏi giỏ hàng."
                );
            } catch (error) {
                console.error(
                    "REMOVE CART ERROR:",
                    error
                );

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                    "Không thể xóa sản phẩm."
                );
            } finally {
                setRemovingItemId(
                    null
                );
            }
        };

    // ========================================================
    // CLEAR CART
    // ========================================================

    const handleClearCart =
        async () => {
            if (
                normalizedItems.length ===
                0 ||
                clearing
            ) {
                return;
            }

            const confirmed =
                window.confirm(
                    "Bạn có chắc muốn xóa toàn bộ giỏ hàng?"
                );

            if (!confirmed) {
                return;
            }

            try {
                setClearing(
                    true
                );

                await clearCart();

                toast.success(
                    "Đã xóa toàn bộ giỏ hàng."
                );
            } catch (error) {
                console.error(
                    "CLEAR CART ERROR:",
                    error
                );

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                    "Không thể xóa giỏ hàng."
                );
            } finally {
                setClearing(
                    false
                );
            }
        };

    // ========================================================
    // CHECKOUT
    // ========================================================

    const handleCheckout =
        () => {
            if (
                normalizedItems.length ===
                0
            ) {
                toast.warning(
                    "Giỏ hàng đang trống."
                );

                return;
            }

            navigate(
                "/checkout"
            );
        };

    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {
        return (
            <div className="cart-loading">
                <div
                    className="spinner-border"
                    role="status"
                />

                <span>
                    Đang tải giỏ hàng...
                </span>
            </div>
        );
    }

    // ========================================================
    // EMPTY
    // ========================================================

    if (
        normalizedItems.length ===
        0
    ) {
        return (
            <div className="cart-page">
                <div className="container">
                    <div className="cart-empty">
                        <div className="cart-empty-icon">
                            <FaShoppingBag />
                        </div>

                        <h1>
                            Giỏ hàng đang trống
                        </h1>

                        <p>
                            Bạn chưa có sản phẩm nào
                            trong giỏ hàng.
                        </p>

                        <Link
                            to="/products"
                            className="cart-empty-button"
                        >
                            <FaArrowLeft />

                            Tiếp tục mua sắm
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
        <div className="cart-page">
            <div className="container">
                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="cart-header">
                    <div>
                        <span>
                            SNEAKER SHOP
                        </span>

                        <h1>
                            Giỏ hàng
                        </h1>

                        <p>
                            Bạn đang có{" "}
                            <strong>
                                {
                                    totalQuantity
                                }
                            </strong>{" "}
                            sản phẩm trong giỏ.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="cart-clear-button"
                        onClick={
                            handleClearCart
                        }
                        disabled={
                            clearing
                        }
                    >
                        {clearing ? (
                            <>
                                <span className="spinner-border spinner-border-sm" />

                                Đang xóa...
                            </>
                        ) : (
                            <>
                                <FaTrash />

                                Xóa toàn bộ
                            </>
                        )}
                    </button>
                </div>

                {/* ==================================================
                    CART LAYOUT
                ================================================== */}

                <div className="cart-layout">
                    {/* ==============================================
                        ITEMS
                    ============================================== */}

                    <section className="cart-items">
                        {normalizedItems.map(
                            (
                                item
                            ) => {
                                const isUpdating =
                                    updatingItemId ===
                                    item.id;

                                const isRemoving =
                                    removingItemId ===
                                    item.id;

                                return (
                                    <article
                                        className="cart-item"
                                        key={
                                            item.id
                                        }
                                    >
                                        {/* ==================================
                                            IMAGE
                                        ================================== */}

                                        <Link
                                            to={
                                                item.productId
                                                    ? `/products/${item.productId}`
                                                    : "/products"
                                            }
                                            className="cart-item-image"
                                        >
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
                                        </Link>

                                        {/* ==================================
                                            INFO
                                        ================================== */}

                                        <div className="cart-item-info">
                                            <div className="cart-item-main-info">
                                                <Link
                                                    to={
                                                        item.productId
                                                            ? `/products/${item.productId}`
                                                            : "/products"
                                                    }
                                                    className="cart-item-name"
                                                >
                                                    {
                                                        item.name
                                                    }
                                                </Link>

                                                {item.sku && (
                                                    <span className="cart-item-sku">
                                                        SKU:{" "}
                                                        {
                                                            item.sku
                                                        }
                                                    </span>
                                                )}

                                                <div className="cart-item-variants">
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
                                            </div>

                                            {/* ==================================
                                                PRICE
                                            ================================== */}

                                            <div className="cart-item-unit-price">
                                                {formatPrice(
                                                    item.price
                                                )}
                                            </div>

                                            {/* ==================================
                                                QUANTITY
                                            ================================== */}

                                            <div className="cart-item-quantity">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        isUpdating ||
                                                        item.quantity <=
                                                            1
                                                    }
                                                    onClick={() =>
                                                        handleUpdateQuantity(
                                                            item,
                                                            item.quantity -
                                                                1
                                                        )
                                                    }
                                                >
                                                    <FaMinus />
                                                </button>

                                                <span>
                                                    {isUpdating ? (
                                                        <span className="spinner-border spinner-border-sm" />
                                                    ) : (
                                                        item.quantity
                                                    )}
                                                </span>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        isUpdating ||
                                                        (
                                                            item.stock >
                                                                0 &&
                                                            item.quantity >=
                                                                item.stock
                                                        )
                                                    }
                                                    onClick={() =>
                                                        handleUpdateQuantity(
                                                            item,
                                                            item.quantity +
                                                                1
                                                        )
                                                    }
                                                >
                                                    <FaPlus />
                                                </button>
                                            </div>

                                            {/* ==================================
                                                TOTAL
                                            ================================== */}

                                            <div className="cart-item-total">
                                                {formatPrice(
                                                    item.price *
                                                        item.quantity
                                                )}
                                            </div>

                                            {/* ==================================
                                                REMOVE
                                            ================================== */}

                                            <button
                                                type="button"
                                                className="cart-item-remove"
                                                title="Xóa sản phẩm"
                                                disabled={
                                                    isRemoving
                                                }
                                                onClick={() =>
                                                    handleRemoveItem(
                                                        item
                                                    )
                                                }
                                            >
                                                {isRemoving ? (
                                                    <span className="spinner-border spinner-border-sm" />
                                                ) : (
                                                    <FaTrash />
                                                )}
                                            </button>
                                        </div>
                                    </article>
                                );
                            }
                        )}

                        <Link
                            to="/products"
                            className="cart-continue-shopping"
                        >
                            <FaArrowLeft />

                            Tiếp tục mua sắm
                        </Link>
                    </section>

                    {/* ==============================================
                        SUMMARY
                    ============================================== */}

                    <aside className="cart-summary">
                        <h2>
                            Tổng đơn hàng
                        </h2>

                        <div className="cart-summary-row">
                            <span>
                                Sản phẩm
                            </span>

                            <strong>
                                {
                                    totalQuantity
                                }
                            </strong>
                        </div>

                        <div className="cart-summary-row">
                            <span>
                                Tạm tính
                            </span>

                            <strong>
                                {formatPrice(
                                    subtotal
                                )}
                            </strong>
                        </div>

                        <div className="cart-summary-row">
                            <span>
                                Phí vận chuyển
                            </span>

                            <strong>
                                Tính khi thanh toán
                            </strong>
                        </div>

                        <hr />

                        <div className="cart-summary-total">
                            <span>
                                Tổng cộng
                            </span>

                            <strong>
                                {formatPrice(
                                    subtotal
                                )}
                            </strong>
                        </div>

                        <button
                            type="button"
                            className="cart-checkout-button"
                            onClick={
                                handleCheckout
                            }
                        >
                            Tiến hành thanh toán
                        </button>

                        <p className="cart-summary-note">
                            Mã giảm giá và phí vận chuyển
                            sẽ được tính ở bước thanh toán.
                        </p>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default CartPage;