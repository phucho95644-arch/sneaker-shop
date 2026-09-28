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
    FaArrowRight,
    FaHeart,
    FaRegHeart,
    FaShoppingBag,
    FaTrash,
} from "react-icons/fa";

import {
    toast,
} from "react-toastify";

import favoriteService from "../../services/favoriteService";

import "./FavoritePage.css";

// ============================================================
// CONFIG
// ============================================================

const SERVER_URL =
    import.meta.env.VITE_SERVER_URL ||
    "http://localhost:5000";

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
// IMAGE URL
// ============================================================

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

    return `${SERVER_URL}/${String(
        value
    ).replace(
        /^\/+/,
        ""
    )}`;
};

// ============================================================
// EXTRACT FAVORITES
// ============================================================

const extractFavorites = (
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
            response?.favorites
        )
    ) {
        return response.favorites;
    }

    if (
        Array.isArray(
            response?.data?.favorites
        )
    ) {
        return response.data.favorites;
    }

    if (
        Array.isArray(
            response?.items
        )
    ) {
        return response.items;
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
// NORMALIZE FAVORITE
// ============================================================

const normalizeFavorite = (
    item
) => {
    const product =
        item?.product &&
        typeof item.product ===
            "object"
            ? item.product
            : item;

    const productId =
        item?.product_id ??
        item?.productId ??
        product?.product_id ??
        product?.productId ??
        product?.id;

    const name =
        product?.name ??
        item?.product_name ??
        item?.productName ??
        "Sản phẩm";

    const brandName =
        product?.brand_name ??
        product?.brandName ??
        item?.brand_name ??
        item?.brandName ??
        "";

    const price =
        Number(
            product?.price ??
            product?.base_price ??
            item?.price ??
            0
        );

    const salePrice =
        Number(
            product?.sale_price ??
            product?.salePrice ??
            item?.sale_price ??
            item?.salePrice ??
            0
        );

    const image =
        product?.thumbnail ??
        product?.image_url ??
        product?.image ??
        item?.thumbnail ??
        item?.image_url ??
        item?.image ??
        null;

    return {
        favoriteId:
            item?.favorite_id ??
            item?.favoriteId ??
            null,

        productId,

        name,

        brandName,

        price,

        salePrice,

        image:
            makeImageUrl(
                image
            ),

        raw:
            item,
    };
};

// ============================================================
// FAVORITE PAGE
// ============================================================

function FavoritePage() {
    const [
        favorites,
        setFavorites,
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
        removingId,
        setRemovingId,
    ] = useState(null);

    // ========================================================
    // LOAD FAVORITES
    // ========================================================

    const loadFavorites =
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
                        await favoriteService.getFavorites();

                    const list =
                        extractFavorites(
                            response
                        )
                            .map(
                                normalizeFavorite
                            )
                            .filter(
                                (
                                    item
                                ) =>
                                    item.productId
                            );

                    setFavorites(
                        list
                    );
                } catch (error) {
                    console.error(
                        "LOAD FAVORITES ERROR:",
                        error
                    );

                    setError(
                        error.response
                            ?.data
                            ?.message ||
                            "Không thể tải danh sách yêu thích."
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
        loadFavorites();
    }, [
        loadFavorites,
    ]);

    // ========================================================
    // FAVORITE COUNT
    // ========================================================

    const favoriteCount =
        useMemo(
            () =>
                favorites.length,
            [
                favorites,
            ]
        );

    // ========================================================
    // REMOVE
    // ========================================================

    const handleRemove =
        async (
            item
        ) => {
            if (
                !item.productId
            ) {
                toast.error(
                    "Không xác định được sản phẩm."
                );

                return;
            }

            try {
                setRemovingId(
                    item.productId
                );

                const response =
                    await favoriteService.removeFavorite(
                        item.productId
                    );

                setFavorites(
                    (
                        current
                    ) =>
                        current.filter(
                            (
                                favorite
                            ) =>
                                String(
                                    favorite.productId
                                ) !==
                                String(
                                    item.productId
                                )
                        )
                );

                toast.success(
                    response?.message ||
                    "Đã xóa khỏi danh sách yêu thích."
                );
            } catch (error) {
                console.error(
                    "REMOVE FAVORITE ERROR:",
                    error
                );

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                        "Không thể xóa sản phẩm yêu thích."
                );
            } finally {
                setRemovingId(
                    null
                );
            }
        };

    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {
        return (
            <div className="favorite-loading">
                <div
                    className="spinner-border"
                    role="status"
                />

                <span>
                    Đang tải sản phẩm yêu thích...
                </span>
            </div>
        );
    }

    // ========================================================
    // ERROR
    // ========================================================

    if (error) {
        return (
            <div className="favorite-page">
                <div className="container">
                    <div className="favorite-error">
                        <FaRegHeart />

                        <h1>
                            Không thể tải danh sách yêu thích
                        </h1>

                        <p>
                            {
                                error
                            }
                        </p>

                        <button
                            type="button"
                            onClick={
                                loadFavorites
                            }
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ========================================================
    // EMPTY
    // ========================================================

    if (
        favorites.length ===
        0
    ) {
        return (
            <div className="favorite-page">
                <div className="container">
                    <div className="favorite-empty">
                        <div className="favorite-empty-icon">
                            <FaRegHeart />
                        </div>

                        <h1>
                            Danh sách yêu thích đang trống
                        </h1>

                        <p>
                            Lưu những đôi sneaker bạn yêu thích để xem lại sau.
                        </p>

                        <Link
                            to="/products"
                            className="favorite-shop-button"
                        >
                            Khám phá sản phẩm

                            <FaArrowRight />
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
        <div className="favorite-page">
            <div className="container">
                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="favorite-header">
                    <div>
                        <span>
                            SNEAKER SHOP
                        </span>

                        <h1>
                            Yêu thích
                        </h1>

                        <p>
                            Bạn đã lưu{" "}

                            <strong>
                                {
                                    favoriteCount
                                }
                            </strong>{" "}

                            sản phẩm.
                        </p>
                    </div>

                    <div className="favorite-header-icon">
                        <FaHeart />
                    </div>
                </div>

                {/* ==================================================
                    GRID
                ================================================== */}

                <div className="favorite-grid">
                    {favorites.map(
                        (
                            item
                        ) => {
                            const hasSale =
                                item.salePrice >
                                    0 &&
                                item.salePrice <
                                    item.price;

                            const displayPrice =
                                hasSale
                                    ? item.salePrice
                                    : item.price;

                            const isRemoving =
                                String(
                                    removingId
                                ) ===
                                String(
                                    item.productId
                                );

                            return (
                                <article
                                    className="favorite-card"
                                    key={
                                        item.productId
                                    }
                                >
                                    {/* ==================================
                                        IMAGE
                                    ================================== */}

                                    <Link
                                        to={`/products/${item.productId}`}
                                        className="favorite-image"
                                    >
                                        {hasSale && (
                                            <span className="favorite-sale-badge">
                                                SALE
                                            </span>
                                        )}

                                        {item.image ? (
                                            <img
                                                src={
                                                    item.image
                                                }
                                                alt={
                                                    item.name
                                                }
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="favorite-image-placeholder">
                                                <FaShoppingBag />

                                                <span>
                                                    Sneaker Shop
                                                </span>
                                            </div>
                                        )}
                                    </Link>

                                    {/* ==================================
                                        REMOVE HEART
                                    ================================== */}

                                    <button
                                        type="button"
                                        className="favorite-heart-button active"
                                        title="Xóa khỏi yêu thích"
                                        disabled={
                                            isRemoving
                                        }
                                        onClick={() =>
                                            handleRemove(
                                                item
                                            )
                                        }
                                    >
                                        {isRemoving ? (
                                            <span className="spinner-border spinner-border-sm" />
                                        ) : (
                                            <FaHeart />
                                        )}
                                    </button>

                                    {/* ==================================
                                        CONTENT
                                    ================================== */}

                                    <div className="favorite-content">
                                        {item.brandName && (
                                            <span className="favorite-brand">
                                                {
                                                    item.brandName
                                                }
                                            </span>
                                        )}

                                        <Link
                                            to={`/products/${item.productId}`}
                                            className="favorite-name"
                                        >
                                            {
                                                item.name
                                            }
                                        </Link>

                                        <div className="favorite-price">
                                            <strong>
                                                {formatPrice(
                                                    displayPrice
                                                )}
                                            </strong>

                                            {hasSale && (
                                                <span>
                                                    {formatPrice(
                                                        item.price
                                                    )}
                                                </span>
                                            )}
                                        </div>

                                        <div className="favorite-actions">
                                            <Link
                                                to={`/products/${item.productId}`}
                                            >
                                                Xem sản phẩm

                                                <FaArrowRight />
                                            </Link>

                                            <button
                                                type="button"
                                                disabled={
                                                    isRemoving
                                                }
                                                onClick={() =>
                                                    handleRemove(
                                                        item
                                                    )
                                                }
                                            >
                                                <FaTrash />

                                                Xóa
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        }
                    )}
                </div>
            </div>
        </div>
    );
}

export default FavoritePage;