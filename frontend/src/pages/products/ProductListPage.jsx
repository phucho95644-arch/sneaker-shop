import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
    useLocation,
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import {
    FaHeart,
    FaRegHeart,
    FaShoppingBag,
} from "react-icons/fa";

import {
    toast,
} from "react-toastify";

import productService from "../../services/productService";
import favoriteService from "../../services/favoriteService";

import {
    useAuth,
} from "../../contexts/AuthContext";

const SERVER_URL =
    import.meta.env.VITE_SERVER_URL ||
    "http://localhost:5000";

// ============================================================
// HELPERS
// ============================================================

const normalize = (
    value
) => {
    return String(
        value || ""
    )
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /\s+/g,
            ""
        )
        .trim();
};

const formatPrice = (
    price
) => {
    if (
        price === null ||
        price === undefined ||
        price === ""
    ) {
        return "Liên hệ";
    }

    return `${Number(
        price || 0
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

    const image =
        String(value);

    if (
        image.startsWith(
            "http://"
        ) ||
        image.startsWith(
            "https://"
        ) ||
        image.startsWith(
            "data:"
        )
    ) {
        return image;
    }

    return `${SERVER_URL}/${image.replace(
        /^\/+/, 
        ""
    )}`;
};

const getImage = (
    product
) => {
    const value =
        product?.thumbnail ||
        product?.image_url ||
        product?.imageUrl ||
        product?.image ||
        product?.images?.[0]?.image_url ||
        product?.images?.[0]?.url ||
        null;

    return makeImageUrl(
        value
    );
};

const extractProducts = (
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
            response?.data?.products
        )
    ) {
        return response.data.products;
    }

    if (
        Array.isArray(
            response?.products
        )
    ) {
        return response.products;
    }

    if (
        Array.isArray(
            response?.data?.data
        )
    ) {
        return response.data.data;
    }

    return [];
};

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
            response?.data?.items
        )
    ) {
        return response.data.items;
    }

    return [];
};

const getFavoriteProductId = (
    item
) => {
    return (
        item?.product_id ??
        item?.productId ??
        item?.product?.id ??
        item?.product?.product_id ??
        null
    );
};

// ============================================================
// PRODUCT LIST PAGE
// ============================================================

function ProductListPage() {
    const [
        products,
        setProducts,
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
        favoriteIds,
        setFavoriteIds,
    ] = useState(
        () => new Set()
    );

    const [
        favoriteLoadingId,
        setFavoriteLoadingId,
    ] = useState(null);

    const [
        searchParams,
    ] = useSearchParams();

    const category =
        searchParams.get(
            "category"
        );

    const navigate =
        useNavigate();

    const location =
        useLocation();

    const {
        isAuthenticated,
    } = useAuth();

    // ========================================================
    // LOAD PRODUCTS
    // ========================================================

    useEffect(() => {
        let mounted =
            true;

        const loadProducts =
            async () => {
                try {
                    setLoading(
                        true
                    );

                    setError("");

                    const response =
                        await productService.getProducts(
                            {
                                limit: 100,
                            }
                        );

                    const list =
                        extractProducts(
                            response
                        );

                    if (mounted) {
                        setProducts(
                            list
                        );
                    }
                } catch (error) {
                    console.error(
                        "PRODUCT LIST ERROR:",
                        error
                    );

                    if (mounted) {
                        setProducts(
                            []
                        );

                        setError(
                            error.response
                                ?.data
                                ?.message ||
                                "Không thể tải sản phẩm."
                        );
                    }
                } finally {
                    if (mounted) {
                        setLoading(
                            false
                        );
                    }
                }
            };

        loadProducts();

        return () => {
            mounted =
                false;
        };
    }, []);

    // ========================================================
    // LOAD FAVORITES
    // ========================================================

    useEffect(() => {
        let mounted =
            true;

        const loadFavorites =
            async () => {
                if (
                    !isAuthenticated
                ) {
                    if (mounted) {
                        setFavoriteIds(
                            new Set()
                        );
                    }

                    return;
                }

                try {
                    const response =
                        await favoriteService.getFavorites();

                    const list =
                        extractFavorites(
                            response
                        );

                    const ids =
                        new Set(
                            list
                                .map(
                                    getFavoriteProductId
                                )
                                .filter(
                                    (
                                        value
                                    ) =>
                                        value !==
                                            null &&
                                        value !==
                                            undefined
                                )
                                .map(
                                    String
                                )
                        );

                    if (mounted) {
                        setFavoriteIds(
                            ids
                        );
                    }
                } catch (error) {
                    console.error(
                        "PRODUCT LIST FAVORITES ERROR:",
                        error
                    );
                }
            };

        loadFavorites();

        return () => {
            mounted =
                false;
        };
    }, [
        isAuthenticated,
    ]);

    // ========================================================
    // FILTER PRODUCTS
    // ========================================================

    const filteredProducts =
        useMemo(() => {
            if (!category) {
                return products;
            }

            const selectedCategory =
                normalize(
                    category
                );

            return products.filter(
                (
                    product
                ) => {
                    const productCategory =
                        normalize(
                            product.category_name ||
                                product.category ||
                                product.type ||
                                product.categoryName
                        );

                    if (
                        selectedCategory ===
                        "new"
                    ) {
                        return Boolean(
                            product.is_new ??
                                product.isNew ??
                                product.new_collection ??
                                product.is_featured
                        );
                    }

                    return (
                        productCategory ===
                            selectedCategory ||
                        productCategory.includes(
                            selectedCategory
                        ) ||
                        selectedCategory.includes(
                            productCategory
                        )
                    );
                }
            );
        }, [
            products,
            category,
        ]);

    // ========================================================
    // TOGGLE FAVORITE
    // ========================================================

    const handleToggleFavorite =
        async (
            event,
            product
        ) => {
            event.preventDefault();
            event.stopPropagation();

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

            const productId =
                product?.id ??
                product?.product_id;

            if (
                !productId ||
                favoriteLoadingId !==
                    null
            ) {
                return;
            }

            const key =
                String(
                    productId
                );

            const isFavorite =
                favoriteIds.has(
                    key
                );

            try {
                setFavoriteLoadingId(
                    key
                );

                if (isFavorite) {
                    const response =
                        await favoriteService.removeFavorite(
                            productId
                        );

                    setFavoriteIds(
                        (
                            current
                        ) => {
                            const next =
                                new Set(
                                    current
                                );

                            next.delete(
                                key
                            );

                            return next;
                        }
                    );

                    toast.success(
                        response?.message ||
                            "Đã xóa khỏi danh sách yêu thích."
                    );
                } else {
                    const response =
                        await favoriteService.addFavorite(
                            productId
                        );

                    setFavoriteIds(
                        (
                            current
                        ) => {
                            const next =
                                new Set(
                                    current
                                );

                            next.add(
                                key
                            );

                            return next;
                        }
                    );

                    toast.success(
                        response?.message ||
                            "Đã thêm vào danh sách yêu thích."
                    );
                }
            } catch (error) {
                console.error(
                    "PRODUCT LIST TOGGLE FAVORITE ERROR:",
                    error
                );

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                        "Không thể cập nhật danh sách yêu thích."
                );
            } finally {
                setFavoriteLoadingId(
                    null
                );
            }
        };

    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {
        return (
            <div className="product-list-loading-page">
                <div
                    className="spinner-border"
                    role="status"
                />

                <p>
                    ĐANG TẢI SẢN PHẨM...
                </p>
            </div>
        );
    }

    // ========================================================
    // ERROR
    // ========================================================

    if (error) {
        return (
            <div className="product-list-error-page">
                <FaShoppingBag />

                <h2>
                    Không thể tải sản phẩm
                </h2>

                <p>
                    {error}
                </p>

                <Link to="/">
                    QUAY LẠI TRANG CHỦ
                </Link>
            </div>
        );
    }

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="product-list-page">
            {/* ==================================================
                HERO
            ================================================== */}

            {!category && (
                <section className="product-list-hero">
                    <div className="product-list-hero-overlay" />

                    <div className="product-list-hero-content">
                        <p>
                            SNEAKER SHOP
                        </p>

                        <h1>
                            BỘ SƯU TẬP
                            <br />
                            SNEAKER
                        </h1>

                        <span>
                            Năng động · Hiện đại · Cá tính
                        </span>

                        <a href="#product-list-collection">
                            KHÁM PHÁ SẢN PHẨM
                        </a>
                    </div>
                </section>
            )}

            {/* ==================================================
                COLLECTION
            ================================================== */}

            <section
                className="product-list-collection"
                id="product-list-collection"
            >
                <div className="product-list-header">
                    <div>
                        <p className="product-list-small-title">
                            SNEAKER SHOP
                        </p>

                        <h2>
                            {category
                                ? category ===
                                  "women"
                                    ? "ĐỒ NỮ"
                                    : category ===
                                      "men"
                                    ? "ĐỒ NAM"
                                    : category ===
                                      "new"
                                    ? "BỘ SƯU TẬP MỚI"
                                    : "SẢN PHẨM"
                                : "TẤT CẢ SẢN PHẨM"}
                        </h2>
                    </div>

                    <p className="product-list-count">
                        {
                            filteredProducts.length
                        }{" "}
                        sản phẩm
                    </p>
                </div>

                {filteredProducts.length ===
                0 ? (
                    <div className="product-list-empty">
                        <FaShoppingBag />

                        <h3>
                            Chưa có sản phẩm trong danh mục này
                        </h3>

                        <p>
                            Vui lòng chọn danh mục khác.
                        </p>

                        <Link to="/products">
                            XEM TẤT CẢ SẢN PHẨM
                        </Link>
                    </div>
                ) : (
                    <div className="product-list-grid">
                        {filteredProducts.map(
                            (
                                product
                            ) => {
                                const productId =
                                    product.id ??
                                    product.product_id;

                                const favoriteKey =
                                    String(
                                        productId
                                    );

                                const isFavorite =
                                    favoriteIds.has(
                                        favoriteKey
                                    );

                                const isFavoriteLoading =
                                    favoriteLoadingId ===
                                    favoriteKey;

                                const image =
                                    getImage(
                                        product
                                    );

                                const originalPrice =
                                    Number(
                                        product.price ||
                                            product.base_price ||
                                            0
                                    );

                                const salePrice =
                                    Number(
                                        product.sale_price ||
                                            product.salePrice ||
                                            0
                                    );

                                const hasSale =
                                    salePrice >
                                        0 &&
                                    salePrice <
                                        originalPrice;

                                const displayPrice =
                                    hasSale
                                        ? salePrice
                                        : originalPrice;

                                return (
                                    <article
                                        className="product-list-card"
                                        key={
                                            productId
                                        }
                                    >
                                        <div className="product-list-image-wrap">
                                            <Link
                                                to={`/products/${productId}`}
                                                className="product-list-image"
                                            >
                                                {image ? (
                                                    <img
                                                        src={
                                                            image
                                                        }
                                                        alt={
                                                            product.name ||
                                                            "Sản phẩm"
                                                        }
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="product-list-image-placeholder">
                                                        <FaShoppingBag />
                                                        <span>
                                                            Sneaker Shop
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="product-list-overlay">
                                                    XEM CHI TIẾT
                                                </div>
                                            </Link>

                                            {hasSale && (
                                                <span className="product-list-sale-badge">
                                                    SALE
                                                </span>
                                            )}

                                            <button
                                                type="button"
                                                className={
                                                    isFavorite
                                                        ? "product-list-favorite active"
                                                        : "product-list-favorite"
                                                }
                                                disabled={
                                                    isFavoriteLoading
                                                }
                                                onClick={(
                                                    event
                                                ) =>
                                                    handleToggleFavorite(
                                                        event,
                                                        product
                                                    )
                                                }
                                                aria-pressed={
                                                    isFavorite
                                                }
                                                title={
                                                    isFavorite
                                                        ? "Bỏ khỏi yêu thích"
                                                        : "Thêm vào yêu thích"
                                                }
                                            >
                                                {isFavoriteLoading ? (
                                                    <span className="spinner-border spinner-border-sm" />
                                                ) : isFavorite ? (
                                                    <FaHeart />
                                                ) : (
                                                    <FaRegHeart />
                                                )}
                                            </button>
                                        </div>

                                        <div className="product-list-info">
                                            <p className="product-list-category">
                                                {product.category_name ||
                                                    product.category ||
                                                    product.brand_name ||
                                                    "SNEAKER SHOP"}
                                            </p>

                                            <Link
                                                to={`/products/${productId}`}
                                                className="product-list-name"
                                            >
                                                {product.name ||
                                                    product.product_name ||
                                                    "Sản phẩm"}
                                            </Link>

                                            <div className="product-list-price-row">
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
                                        </div>
                                    </article>
                                );
                            }
                        )}
                    </div>
                )}
            </section>

            {!category && (
                <section className="product-list-brand-section">
                    <p>
                        SNEAKER SHOP
                    </p>

                    <h2>
                        BƯỚC ĐI
                        <br />
                        KHÁC BIỆT
                    </h2>

                    <span>
                        Find your next favorite pair.
                    </span>
                </section>
            )}

            {/* ==================================================
                STYLE
            ================================================== */}

            <style>{`
                * {
                    box-sizing: border-box;
                }

                .product-list-page {
                    width: 100%;
                    background: #ffffff;
                    color: #111111;
                }

                /* HERO */

                .product-list-hero {
                    position: relative;
                    min-height: 560px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    background:
                        radial-gradient(circle at 70% 35%, rgba(255,90,31,.48), transparent 26%),
                        linear-gradient(135deg, #080808, #202020 55%, #090909);
                }

                .product-list-hero-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom, rgba(0,0,0,.05), rgba(0,0,0,.3));
                }

                .product-list-hero-content {
                    position: relative;
                    z-index: 2;
                    width: min(900px, 90%);
                    text-align: center;
                    color: #ffffff;
                }

                .product-list-hero-content p {
                    margin: 0 0 20px;
                    font-size: 11px;
                    letter-spacing: 5px;
                }

                .product-list-hero-content h1 {
                    margin: 0 0 22px;
                    font-size: clamp(44px, 7vw, 86px);
                    font-weight: 800;
                    line-height: .96;
                    letter-spacing: 3px;
                }

                .product-list-hero-content span {
                    display: block;
                    margin-bottom: 30px;
                    color: #d6d6d6;
                    font-size: 14px;
                    letter-spacing: 2px;
                }

                .product-list-hero-content a {
                    display: inline-block;
                    padding-bottom: 7px;
                    border-bottom: 1px solid #ffffff;
                    color: #ffffff;
                    font-size: 11px;
                    letter-spacing: 2px;
                    text-decoration: none;
                }

                /* COLLECTION */

                .product-list-collection {
                    padding: 80px 5%;
                }

                .product-list-header {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    gap: 25px;
                    margin-bottom: 45px;
                    padding-bottom: 25px;
                    border-bottom: 1px solid #dddddd;
                }

                .product-list-small-title {
                    margin: 0 0 10px;
                    color: #ff5a1f;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 4px;
                }

                .product-list-header h2 {
                    margin: 0;
                    font-size: clamp(25px, 4vw, 38px);
                    font-weight: 800;
                    letter-spacing: 2px;
                }

                .product-list-count {
                    margin: 0;
                    color: #777777;
                    font-size: 12px;
                }

                /* GRID */

                .product-list-grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 34px 20px;
                }

                .product-list-card {
                    min-width: 0;
                }

                .product-list-image-wrap {
                    position: relative;
                }

                .product-list-image {
                    position: relative;
                    aspect-ratio: 1 / 1;
                    display: block;
                    overflow: hidden;
                    border-radius: 16px;
                    background: #f4f4f4;
                }

                .product-list-image img {
                    width: 100%;
                    height: 100%;
                    display: block;
                    object-fit: contain;
                    padding: 12px;
                    transition: transform .35s ease;
                }

                .product-list-card:hover .product-list-image img {
                    transform: scale(1.045);
                }

                .product-list-image-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    color: #aaaaaa;
                }

                .product-list-image-placeholder svg {
                    font-size: 2rem;
                }

                .product-list-overlay {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    padding: 14px;
                    text-align: center;
                    color: #111111;
                    background: rgba(255,255,255,.94);
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 2px;
                    opacity: 0;
                    transform: translateY(8px);
                    transition: opacity .2s ease, transform .2s ease;
                }

                .product-list-card:hover .product-list-overlay {
                    opacity: 1;
                    transform: translateY(0);
                }

                .product-list-sale-badge {
                    position: absolute;
                    z-index: 5;
                    top: 13px;
                    left: 13px;
                    padding: 5px 9px;
                    border-radius: 7px;
                    color: #ffffff;
                    background: #ff5a1f;
                    font-size: 10px;
                    font-weight: 900;
                }

                /* FAVORITE */

                .product-list-favorite {
                    position: absolute;
                    z-index: 10;
                    top: 13px;
                    right: 13px;
                    width: 42px;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(0,0,0,.09);
                    border-radius: 50%;
                    color: #333333;
                    background: rgba(255,255,255,.96);
                    box-shadow: 0 5px 15px rgba(0,0,0,.12);
                    cursor: pointer;
                    transition: transform .2s ease, color .2s ease, background .2s ease;
                }

                .product-list-favorite:hover:not(:disabled) {
                    transform: scale(1.08);
                    color: #ff5a1f;
                }

                .product-list-favorite.active {
                    border-color: #ff5a1f;
                    color: #ffffff;
                    background: #ff5a1f;
                }

                .product-list-favorite:disabled {
                    cursor: not-allowed;
                    opacity: .65;
                }

                /* INFO */

                .product-list-info {
                    padding: 16px 3px 0;
                }

                .product-list-category {
                    margin: 0 0 8px;
                    color: #888888;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 1.6px;
                    text-transform: uppercase;
                }

                .product-list-name {
                    display: -webkit-box;
                    overflow: hidden;
                    color: #111111;
                    font-size: 15px;
                    font-weight: 800;
                    line-height: 1.45;
                    text-decoration: none;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }

                .product-list-name:hover {
                    color: #ff5a1f;
                }

                .product-list-price-row {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 9px;
                    margin-top: 10px;
                }

                .product-list-price-row strong {
                    color: #ff5a1f;
                    font-size: 15px;
                    font-weight: 900;
                }

                .product-list-price-row span {
                    color: #aaaaaa;
                    font-size: 12px;
                    text-decoration: line-through;
                }

                /* EMPTY */

                .product-list-empty {
                    min-height: 380px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }

                .product-list-empty > svg {
                    margin-bottom: 15px;
                    color: #cccccc;
                    font-size: 3.5rem;
                }

                .product-list-empty h3 {
                    margin-bottom: 10px;
                    font-size: 22px;
                }

                .product-list-empty p {
                    color: #777777;
                }

                .product-list-empty a {
                    margin-top: 8px;
                    color: #111111;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 1.5px;
                    text-decoration: underline;
                }

                /* BRAND */

                .product-list-brand-section {
                    padding: 120px 20px;
                    text-align: center;
                    color: #ffffff;
                    background: #111111;
                }

                .product-list-brand-section p {
                    margin: 0 0 18px;
                    color: #888888;
                    font-size: 10px;
                    letter-spacing: 5px;
                }

                .product-list-brand-section h2 {
                    margin: 0;
                    font-size: clamp(42px, 6vw, 72px);
                    font-weight: 300;
                    line-height: 1;
                    letter-spacing: 4px;
                }

                .product-list-brand-section span {
                    display: block;
                    margin-top: 20px;
                    color: #aaaaaa;
                    font-size: 12px;
                    letter-spacing: 2px;
                }

                /* STATES */

                .product-list-loading-page,
                .product-list-error-page {
                    min-height: 70vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 30px;
                    text-align: center;
                }

                .product-list-loading-page p {
                    margin: 0;
                    font-size: 11px;
                    letter-spacing: 2px;
                }

                .product-list-error-page > svg {
                    color: #cccccc;
                    font-size: 3rem;
                }

                .product-list-error-page a {
                    color: #ff5a1f;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 1.5px;
                }

                @media (max-width: 1100px) {
                    .product-list-grid {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }
                }

                @media (max-width: 800px) {
                    .product-list-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }

                    .product-list-hero {
                        min-height: 480px;
                    }
                }

                @media (max-width: 600px) {
                    .product-list-collection {
                        padding: 50px 16px;
                    }

                    .product-list-header {
                        display: block;
                    }

                    .product-list-count {
                        margin-top: 14px;
                    }

                    .product-list-grid {
                        gap: 24px 10px;
                    }

                    .product-list-favorite {
                        width: 38px;
                        height: 38px;
                    }

                    .product-list-name {
                        font-size: 13px;
                    }
                }
            `}</style>
        </div>
    );
}

export default ProductListPage;
