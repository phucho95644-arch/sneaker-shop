import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    FaChevronLeft,
    FaHeart,
    FaMinus,
    FaPlus,
    FaRegHeart,
    FaShoppingBag,
    FaShieldAlt,
    FaTruck,
    FaUndo,
} from "react-icons/fa";

import {
    toast,
} from "react-toastify";

import productService from "../../services/productService";

import favoriteService from "../../services/favoriteService";

import ProductReviews from "../../components/reviews/ProductReviews";

import {
    useAuth,
} from "../../contexts/AuthContext";

import {
    useCart,
} from "../../contexts/CartContext";

import "./ProductDetailPage.css";

// ============================================================
// CONFIG
// ============================================================

const SERVER_URL =
    import.meta.env.VITE_SERVER_URL ||
    "http://localhost:5000";

// ============================================================
// PRICE
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
// IMAGE VALUE
// ============================================================

const getImageValue = (
    image
) => {
    if (
        typeof image ===
        "string"
    ) {
        return image;
    }

    return (
        image?.image_url ||
        image?.imageUrl ||
        image?.url ||
        image?.path ||
        image?.image ||
        null
    );
};

// ============================================================
// NORMALIZE PRODUCT
// ============================================================

const normalizeProduct = (
    response
) => {
    if (
        response?.data
            ?.product
    ) {
        return (
            response.data
                .product
        );
    }

    if (
        response?.data &&
        !Array.isArray(
            response.data
        )
    ) {
        return response.data;
    }

    if (
        response?.product
    ) {
        return response.product;
    }

    return response || null;
};

// ============================================================
// PRODUCT DETAIL
// ============================================================

function ProductDetailPage() {
    const {
        id,
    } = useParams();

    const navigate =
        useNavigate();

    const location =
        useLocation();

    const {
        isAuthenticated,
    } = useAuth();

    const {
        addItem,
    } = useCart();

    // ========================================================
    // PRODUCT
    // ========================================================

    const [
        product,
        setProduct,
    ] = useState(null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    // ========================================================
    // PRODUCT OPTIONS
    // ========================================================

    const [
        selectedImage,
        setSelectedImage,
    ] = useState("");

    const [
        selectedSizeId,
        setSelectedSizeId,
    ] = useState("");

    const [
        selectedColorId,
        setSelectedColorId,
    ] = useState("");

    const [
        quantity,
        setQuantity,
    ] = useState(1);

    const [
        addingToCart,
        setAddingToCart,
    ] = useState(false);

    // ========================================================
    // FAVORITE
    // ========================================================

    const [
        isFavorite,
        setIsFavorite,
    ] = useState(false);

    const [
        favoriteLoading,
        setFavoriteLoading,
    ] = useState(false);

    // ========================================================
    // LOAD PRODUCT
    // ========================================================

    useEffect(() => {
        let mounted =
            true;

        const loadProduct =
            async () => {
                try {
                    setLoading(
                        true
                    );

                    setError(
                        ""
                    );

                    setSelectedImage(
                        ""
                    );

                    setSelectedSizeId(
                        ""
                    );

                    setSelectedColorId(
                        ""
                    );

                    setQuantity(
                        1
                    );

                    const response =
                        await productService.getProductById(
                            id
                        );

                    const data =
                        normalizeProduct(
                            response
                        );

                    if (!data) {
                        throw new Error(
                            "Không tìm thấy sản phẩm."
                        );
                    }

                    if (
                        mounted
                    ) {
                        setProduct(
                            data
                        );
                    }
                } catch (error) {
                    console.error(
                        "PRODUCT DETAIL ERROR:",
                        error
                    );

                    if (
                        mounted
                    ) {
                        setProduct(
                            null
                        );

                        setError(
                            error.response
                                ?.data
                                ?.message ||
                                error.message ||
                                "Không thể tải thông tin sản phẩm."
                        );
                    }
                } finally {
                    if (
                        mounted
                    ) {
                        setLoading(
                            false
                        );
                    }
                }
            };

        loadProduct();

        return () => {
            mounted =
                false;
        };
    }, [
        id,
    ]);

    // ========================================================
    // FAVORITE STATUS
    // ========================================================

    useEffect(() => {
        let mounted =
            true;

        const checkFavorite =
            async () => {
                if (
                    !isAuthenticated ||
                    !product?.id
                ) {
                    if (
                        mounted
                    ) {
                        setIsFavorite(
                            false
                        );
                    }

                    return;
                }

                try {
                    const response =
                        await favoriteService.checkFavorite(
                            product.id
                        );

                    const value =
                        response?.data
                            ?.isFavorite ??
                        response?.isFavorite ??
                        false;

                    if (
                        mounted
                    ) {
                        setIsFavorite(
                            Boolean(
                                value
                            )
                        );
                    }
                } catch (error) {
                    console.error(
                        "CHECK FAVORITE ERROR:",
                        error
                    );

                    if (
                        mounted
                    ) {
                        setIsFavorite(
                            false
                        );
                    }
                }
            };

        checkFavorite();

        return () => {
            mounted =
                false;
        };
    }, [
        product?.id,
        isAuthenticated,
    ]);

    // ========================================================
    // IMAGES
    // ========================================================

    const images =
        useMemo(() => {
            if (!product) {
                return [];
            }

            const source =
                product.images ||
                product.product_images ||
                product.productImages ||
                [];

            const result =
                Array.isArray(
                    source
                )
                    ? source
                          .map(
                              (
                                  item
                              ) =>
                                  makeImageUrl(
                                      getImageValue(
                                          item
                                      )
                                  )
                          )
                          .filter(
                              Boolean
                          )
                    : [];

            const thumbnail =
                makeImageUrl(
                    product.thumbnail ||
                        product.image ||
                        product.image_url ||
                        product.imageUrl
                );

            if (
                thumbnail &&
                !result.includes(
                    thumbnail
                )
            ) {
                result.unshift(
                    thumbnail
                );
            }

            return result;
        }, [
            product,
        ]);

    // ========================================================
    // DEFAULT IMAGE
    // ========================================================

    useEffect(() => {
        if (
            images.length >
            0
        ) {
            setSelectedImage(
                images[0]
            );
        } else {
            setSelectedImage(
                ""
            );
        }
    }, [
        images,
    ]);

    // ========================================================
    // VARIANTS
    // ========================================================

    const variants =
        useMemo(() => {
            const data =
                product?.variants ||
                product?.product_variants ||
                product?.productVariants ||
                [];

            return Array.isArray(
                data
            )
                ? data
                : [];
        }, [
            product,
        ]);

    // ========================================================
    // SIZES
    // ========================================================

    const sizes =
        useMemo(() => {
            const map =
                new Map();

            variants.forEach(
                (
                    variant
                ) => {
                    const sizeId =
                        variant.size_id ??
                        variant.sizeId ??
                        variant.size?.id;

                    const sizeName =
                        variant.size_name ??
                        variant.sizeName ??
                        variant.size?.name ??
                        variant.size?.value ??
                        variant.size;

                    if (
                        sizeId ===
                            undefined ||
                        sizeId ===
                            null
                    ) {
                        return;
                    }

                    map.set(
                        String(
                            sizeId
                        ),
                        {
                            id:
                                String(
                                    sizeId
                                ),

                            name:
                                sizeName ||
                                sizeId,
                        }
                    );
                }
            );

            return Array.from(
                map.values()
            );
        }, [
            variants,
        ]);

    // ========================================================
    // COLORS
    // ========================================================

    const colors =
        useMemo(() => {
            const map =
                new Map();

            variants.forEach(
                (
                    variant
                ) => {
                    const colorId =
                        variant.color_id ??
                        variant.colorId ??
                        variant.color?.id;

                    const colorName =
                        variant.color_name ??
                        variant.colorName ??
                        variant.color?.name ??
                        variant.color?.value ??
                        variant.color;

                    const colorHex =
                        variant.color_hex ??
                        variant.colorHex ??
                        variant.color?.hex ??
                        null;

                    if (
                        colorId ===
                            undefined ||
                        colorId ===
                            null
                    ) {
                        return;
                    }

                    map.set(
                        String(
                            colorId
                        ),
                        {
                            id:
                                String(
                                    colorId
                                ),

                            name:
                                colorName ||
                                colorId,

                            hex:
                                colorHex,
                        }
                    );
                }
            );

            return Array.from(
                map.values()
            );
        }, [
            variants,
        ]);

    // ========================================================
    // AUTO SELECT
    // ========================================================

    useEffect(() => {
        if (
            sizes.length ===
                1 &&
            !selectedSizeId
        ) {
            setSelectedSizeId(
                sizes[0].id
            );
        }
    }, [
        sizes,
        selectedSizeId,
    ]);

    useEffect(() => {
        if (
            colors.length ===
                1 &&
            !selectedColorId
        ) {
            setSelectedColorId(
                colors[0].id
            );
        }
    }, [
        colors,
        selectedColorId,
    ]);

    // ========================================================
    // AVAILABLE COLORS
    // ========================================================

    const availableColorIds =
        useMemo(() => {
            const result =
                new Set();

            variants.forEach(
                (
                    variant
                ) => {
                    const sizeId =
                        String(
                            variant.size_id ??
                                variant.sizeId ??
                                variant.size?.id ??
                                ""
                        );

                    const colorId =
                        String(
                            variant.color_id ??
                                variant.colorId ??
                                variant.color?.id ??
                                ""
                        );

                    const stock =
                        Number(
                            variant.stock ??
                                variant.stock_quantity ??
                                variant.quantity ??
                                0
                        );

                    if (
                        !selectedSizeId
                    ) {
                        if (
                            stock >
                            0
                        ) {
                            result.add(
                                colorId
                            );
                        }

                        return;
                    }

                    if (
                        sizeId ===
                            selectedSizeId &&
                        stock > 0
                    ) {
                        result.add(
                            colorId
                        );
                    }
                }
            );

            return result;
        }, [
            variants,
            selectedSizeId,
        ]);

    // ========================================================
    // SELECTED VARIANT
    // ========================================================

    const selectedVariant =
        useMemo(() => {
            if (
                variants.length ===
                0
            ) {
                return null;
            }

            return (
                variants.find(
                    (
                        variant
                    ) => {
                        const sizeId =
                            String(
                                variant.size_id ??
                                    variant.sizeId ??
                                    variant.size?.id ??
                                    ""
                            );

                        const colorId =
                            String(
                                variant.color_id ??
                                    variant.colorId ??
                                    variant.color?.id ??
                                    ""
                            );

                        const sizeMatches =
                            sizes.length ===
                                0 ||
                            sizeId ===
                                selectedSizeId;

                        const colorMatches =
                            colors.length ===
                                0 ||
                            colorId ===
                                selectedColorId;

                        return (
                            sizeMatches &&
                            colorMatches
                        );
                    }
                ) ||
                null
            );
        }, [
            variants,
            sizes,
            colors,
            selectedSizeId,
            selectedColorId,
        ]);

    // ========================================================
    // STOCK
    // ========================================================

    const stock =
        selectedVariant
            ? Number(
                  selectedVariant.stock ??
                      selectedVariant.stock_quantity ??
                      selectedVariant.quantity ??
                      0
              )
            : 0;

    // ========================================================
    // PRICE
    // ========================================================

    const originalPrice =
        Number(
            selectedVariant?.price ??
                selectedVariant?.price_override ??
                product?.price ??
                product?.base_price ??
                0
        );

    const salePrice =
        Number(
            selectedVariant?.sale_price ??
                selectedVariant?.salePrice ??
                product?.sale_price ??
                product?.salePrice ??
                0
        );

    const hasSale =
        salePrice > 0 &&
        salePrice <
            originalPrice;

    const displayPrice =
        hasSale
            ? salePrice
            : originalPrice;

    // ========================================================
    // SIZE
    // ========================================================

    const handleSelectSize = (
        sizeId
    ) => {
        setSelectedSizeId(
            sizeId
        );

        setSelectedColorId(
            ""
        );

        setQuantity(
            1
        );
    };

    // ========================================================
    // COLOR
    // ========================================================

    const handleSelectColor = (
        colorId
    ) => {
        setSelectedColorId(
            colorId
        );

        setQuantity(
            1
        );
    };

    // ========================================================
    // QUANTITY
    // ========================================================

    const decreaseQuantity =
        () => {
            setQuantity(
                (
                    current
                ) =>
                    Math.max(
                        1,
                        current - 1
                    )
            );
        };

    const increaseQuantity =
        () => {
            if (
                !selectedVariant
            ) {
                toast.info(
                    "Vui lòng chọn size và màu trước."
                );

                return;
            }

            if (
                stock <= 0
            ) {
                toast.error(
                    "Sản phẩm hiện đã hết hàng."
                );

                return;
            }

            if (
                quantity >=
                stock
            ) {
                toast.warning(
                    `Chỉ còn ${stock} sản phẩm trong kho.`
                );

                return;
            }

            setQuantity(
                (
                    current
                ) =>
                    current + 1
            );
        };

    // ========================================================
    // FAVORITE
    // ========================================================

    const handleToggleFavorite =
        async () => {
            if (
                !isAuthenticated
            ) {
                toast.info(
                    "Vui lòng đăng nhập để lưu sản phẩm yêu thích."
                );

                navigate(
                    "/login",
                    {
                        state: {
                            from:
                                location,
                        },
                    }
                );

                return;
            }

            if (
                !product?.id ||
                favoriteLoading
            ) {
                return;
            }

            try {
                setFavoriteLoading(
                    true
                );

                if (
                    isFavorite
                ) {
                    const response =
                        await favoriteService.removeFavorite(
                            product.id
                        );

                    setIsFavorite(
                        false
                    );

                    toast.success(
                        response?.message ||
                            "Đã xóa khỏi danh sách yêu thích."
                    );
                } else {
                    const response =
                        await favoriteService.addFavorite(
                            product.id
                        );

                    setIsFavorite(
                        true
                    );

                    toast.success(
                        response?.message ||
                            "Đã thêm vào danh sách yêu thích."
                    );
                }

                window.dispatchEvent(
                    new Event(
                        "favorites:updated"
                    )
                );
            } catch (error) {
                console.error(
                    "TOGGLE FAVORITE ERROR:",
                    error
                );

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                        "Không thể cập nhật danh sách yêu thích."
                );
            } finally {
                setFavoriteLoading(
                    false
                );
            }
        };

    // ========================================================
    // ADD CART
    // ========================================================

    const handleAddToCart =
        async () => {
            if (
                !isAuthenticated
            ) {
                toast.info(
                    "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng."
                );

                navigate(
                    "/login",
                    {
                        state: {
                            from:
                                location,
                        },
                    }
                );

                return;
            }

            if (
                sizes.length >
                    0 &&
                !selectedSizeId
            ) {
                toast.warning(
                    "Vui lòng chọn size."
                );

                return;
            }

            if (
                colors.length >
                    0 &&
                !selectedColorId
            ) {
                toast.warning(
                    "Vui lòng chọn màu."
                );

                return;
            }

            if (
                !selectedVariant
            ) {
                toast.warning(
                    "Không tìm thấy phiên bản sản phẩm phù hợp."
                );

                return;
            }

            const variantId =
                selectedVariant.id ??
                selectedVariant.variant_id ??
                selectedVariant.variantId;

            if (
                !variantId
            ) {
                toast.error(
                    "Không xác định được mã phiên bản sản phẩm."
                );

                return;
            }

            if (
                stock <= 0
            ) {
                toast.error(
                    "Sản phẩm này hiện đã hết hàng."
                );

                return;
            }

            if (
                quantity >
                stock
            ) {
                toast.warning(
                    `Chỉ còn ${stock} sản phẩm trong kho.`
                );

                return;
            }

            try {
                setAddingToCart(
                    true
                );

                await addItem(
                    variantId,
                    quantity
                );

                toast.success(
                    "Đã thêm sản phẩm vào giỏ hàng!"
                );
            } catch (error) {
                console.error(
                    "ADD CART ERROR:",
                    error
                );

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                        "Không thể thêm sản phẩm vào giỏ hàng."
                );
            } finally {
                setAddingToCart(
                    false
                );
            }
        };

    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {
        return (
            <div className="product-detail-loading">
                <div
                    className="spinner-border"
                    role="status"
                />

                <span>
                    Đang tải sản phẩm...
                </span>
            </div>
        );
    }

    // ========================================================
    // ERROR
    // ========================================================

    if (
        error ||
        !product
    ) {
        return (
            <div className="container py-5">
                <div className="product-detail-error">
                    <FaShoppingBag />

                    <h2>
                        Không thể hiển thị sản phẩm
                    </h2>

                    <p>
                        {error ||
                            "Không tìm thấy sản phẩm."}
                    </p>

                    <Link to="/products">
                        <FaChevronLeft />

                        Quay lại sản phẩm
                    </Link>
                </div>
            </div>
        );
    }

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="product-detail-page">
            <div className="container">
                {/* ==================================================
                    BREADCRUMB
                ================================================== */}

                <div className="product-detail-breadcrumb">
                    <Link to="/">
                        Trang chủ
                    </Link>

                    <span>
                        /
                    </span>

                    <Link to="/products">
                        Sản phẩm
                    </Link>

                    <span>
                        /
                    </span>

                    <strong>
                        {
                            product.name
                        }
                    </strong>
                </div>

                {/* ==================================================
                    MAIN
                ================================================== */}

                <div className="product-detail-grid">
                    {/* ==============================================
                        GALLERY
                    ============================================== */}

                    <section className="product-detail-gallery">
                        <div className="product-detail-main-image">
                            {selectedImage ? (
                                <img
                                    src={
                                        selectedImage
                                    }
                                    alt={
                                        product.name
                                    }
                                />
                            ) : (
                                <div className="product-detail-image-empty">
                                    <FaShoppingBag />

                                    <span>
                                        Chưa có ảnh sản phẩm
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* ==========================================
                            THUMBNAILS
                        ========================================== */}

                        {images.length >
                            1 && (
                            <div className="product-detail-thumbnails">
                                {images.map(
                                    (
                                        image,
                                        index
                                    ) => (
                                        <button
                                            type="button"
                                            key={`${image}-${index}`}
                                            className={
                                                selectedImage ===
                                                image
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={() =>
                                                setSelectedImage(
                                                    image
                                                )
                                            }
                                        >
                                            <img
                                                src={
                                                    image
                                                }
                                                alt={`${product.name} ${index + 1}`}
                                            />
                                        </button>
                                    )
                                )}
                            </div>
                        )}
                    </section>

                    {/* ==============================================
                        INFO
                    ============================================== */}

                    <section className="product-detail-info">
                        {/* ==========================================
                            BRAND
                        ========================================== */}

                        {product.brand_name && (
                            <span className="product-detail-brand">
                                {
                                    product.brand_name
                                }
                            </span>
                        )}

                        {/* ==========================================
                            NAME
                        ========================================== */}

                        <h1>
                            {
                                product.name
                            }
                        </h1>

                        {/* ==========================================
                            SKU
                        ========================================== */}

                        {product.sku && (
                            <div className="product-detail-sku">
                                Mã sản phẩm:{" "}

                                <strong>
                                    {
                                        product.sku
                                    }
                                </strong>
                            </div>
                        )}

                        {/* ==========================================
                            FAVORITE
                        ========================================== */}

                        <div className="product-detail-favorite-row">
                            <button
                                type="button"
                                className={
                                    isFavorite
                                        ? "product-favorite-btn active"
                                        : "product-favorite-btn"
                                }
                                onClick={
                                    handleToggleFavorite
                                }
                                disabled={
                                    favoriteLoading
                                }
                            >
                                {favoriteLoading ? (
                                    <span className="spinner-border spinner-border-sm" />
                                ) : isFavorite ? (
                                    <FaHeart />
                                ) : (
                                    <FaRegHeart />
                                )}

                                <span>
                                    {isFavorite
                                        ? "Đã yêu thích"
                                        : "Thêm vào yêu thích"}
                                </span>
                            </button>
                        </div>

                        {/* ==========================================
                            PRICE
                        ========================================== */}

                        <div className="product-detail-price">
                            <strong>
                                {formatPrice(
                                    displayPrice
                                )}
                            </strong>

                            {hasSale && (
                                <span>
                                    {formatPrice(
                                        originalPrice
                                    )}
                                </span>
                            )}
                        </div>

                        {/* ==========================================
                            DESCRIPTION
                        ========================================== */}

                        {product.description && (
                            <p className="product-detail-description">
                                {
                                    product.description
                                }
                            </p>
                        )}

                        {/* ==========================================
                            SIZE
                        ========================================== */}

                        {sizes.length >
                            0 && (
                            <div className="product-option-group">
                                <div className="product-option-heading">
                                    <strong>
                                        Chọn size
                                    </strong>

                                    {selectedSizeId && (
                                        <span>
                                            {
                                                sizes.find(
                                                    (
                                                        size
                                                    ) =>
                                                        size.id ===
                                                        selectedSizeId
                                                )
                                                    ?.name
                                            }
                                        </span>
                                    )}
                                </div>

                                <div className="product-size-list">
                                    {sizes.map(
                                        (
                                            size
                                        ) => (
                                            <button
                                                type="button"
                                                key={
                                                    size.id
                                                }
                                                className={
                                                    selectedSizeId ===
                                                    size.id
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    handleSelectSize(
                                                        size.id
                                                    )
                                                }
                                            >
                                                {
                                                    size.name
                                                }
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ==========================================
                            COLOR
                        ========================================== */}

                        {colors.length >
                            0 && (
                            <div className="product-option-group">
                                <div className="product-option-heading">
                                    <strong>
                                        Chọn màu
                                    </strong>

                                    {selectedColorId && (
                                        <span>
                                            {
                                                colors.find(
                                                    (
                                                        color
                                                    ) =>
                                                        color.id ===
                                                        selectedColorId
                                                )
                                                    ?.name
                                            }
                                        </span>
                                    )}
                                </div>

                                <div className="product-color-list">
                                    {colors.map(
                                        (
                                            color
                                        ) => {
                                            const available =
                                                availableColorIds.has(
                                                    color.id
                                                );

                                            return (
                                                <button
                                                    type="button"
                                                    key={
                                                        color.id
                                                    }
                                                    disabled={
                                                        !available
                                                    }
                                                    className={
                                                        selectedColorId ===
                                                        color.id
                                                            ? "active"
                                                            : ""
                                                    }
                                                    onClick={() =>
                                                        handleSelectColor(
                                                            color.id
                                                        )
                                                    }
                                                >
                                                    {color.hex && (
                                                        <span
                                                            className="product-color-dot"
                                                            style={{
                                                                backgroundColor:
                                                                    color.hex,
                                                            }}
                                                        />
                                                    )}

                                                    {
                                                        color.name
                                                    }
                                                </button>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ==========================================
                            STOCK
                        ========================================== */}

                        {selectedVariant && (
                            <div
                                className={
                                    stock >
                                    0
                                        ? "product-stock in-stock"
                                        : "product-stock out-stock"
                                }
                            >
                                {stock >
                                0
                                    ? `Còn ${stock} sản phẩm`
                                    : "Hết hàng"}
                            </div>
                        )}

                        {/* ==========================================
                            ACTIONS
                        ========================================== */}

                        <div className="product-detail-actions">
                            {/* ======================================
                                QUANTITY
                            ====================================== */}

                            <div className="product-quantity">
                                <button
                                    type="button"
                                    onClick={
                                        decreaseQuantity
                                    }
                                    disabled={
                                        quantity <=
                                            1 ||
                                        addingToCart
                                    }
                                >
                                    <FaMinus />
                                </button>

                                <span>
                                    {
                                        quantity
                                    }
                                </span>

                                <button
                                    type="button"
                                    onClick={
                                        increaseQuantity
                                    }
                                    disabled={
                                        addingToCart ||
                                        (
                                            selectedVariant &&
                                            quantity >=
                                                stock
                                        )
                                    }
                                >
                                    <FaPlus />
                                </button>
                            </div>

                            {/* ======================================
                                ADD CART
                            ====================================== */}

                            <button
                                type="button"
                                className="product-add-cart"
                                onClick={
                                    handleAddToCart
                                }
                                disabled={
                                    addingToCart ||
                                    (
                                        selectedVariant &&
                                        stock <=
                                            0
                                    )
                                }
                            >
                                {addingToCart ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" />

                                        Đang thêm...
                                    </>
                                ) : (
                                    <>
                                        <FaShoppingBag />

                                        Thêm vào giỏ hàng
                                    </>
                                )}
                            </button>
                        </div>

                        {/* ==========================================
                            BENEFITS
                        ========================================== */}

                        <div className="product-detail-benefits">
                            <div>
                                <FaTruck />

                                <span>
                                    Giao hàng nhanh toàn quốc
                                </span>
                            </div>

                            <div>
                                <FaShieldAlt />

                                <span>
                                    Cam kết sản phẩm chính hãng
                                </span>
                            </div>

                            <div>
                                <FaUndo />

                                <span>
                                    Hỗ trợ đổi trả sản phẩm
                                </span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* ==================================================
                    REVIEWS
                ================================================== */}

                <ProductReviews
                    productId={
                        product.id
                    }
                />
            </div>
        </div>
    );
}

export default ProductDetailPage;