import {
    useEffect,
    useState,
} from "react";

import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    FaArrowRight,
    FaHeart,
    FaRegHeart,
    FaShoppingBag,
    FaTruck,
    FaShieldAlt,
    FaUndo,
} from "react-icons/fa";

import {
    toast,
} from "react-toastify";

import productService from "../../services/productService";
import favoriteService from "../../services/favoriteService";

import {
    useAuth,
} from "../../contexts/AuthContext";

import "./HomePage.css";

const SERVER_URL =
    import.meta.env.VITE_SERVER_URL ||
    "http://localhost:5000";

// ============================================================
// HELPERS
// ============================================================

const formatPrice = (
    value
) => {
    const number =
        Number(value || 0);

    return `${number.toLocaleString(
        "vi-VN"
    )}₫`;
};

const getProductImage = (
    product
) => {
    const image =
        product?.thumbnail ||
        product?.image ||
        product?.image_url;

    if (!image) {
        return null;
    }

    if (
        image.startsWith(
            "http://"
        ) ||
        image.startsWith(
            "https://"
        )
    ) {
        return image;
    }

    return `${SERVER_URL}${image}`;
};

// ============================================================
// PRODUCT CARD
// ============================================================

function ProductCard({
    product,
}) {
    const {
        isAuthenticated,
    } = useAuth();

    const navigate =
        useNavigate();

    const location =
        useLocation();

    const [
        isFavorite,
        setIsFavorite,
    ] = useState(false);

    const [
        favoriteLoading,
        setFavoriteLoading,
    ] = useState(false);

    const image =
        getProductImage(
            product
        );

    const price =
        Number(
            product.sale_price ||
            product.price ||
            0
        );

    const originalPrice =
        Number(
            product.price ||
            0
        );

    const hasSale =
        product.sale_price &&
        Number(
            product.sale_price
        ) <
            originalPrice;

    // ========================================================
    // CHECK FAVORITE
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
                    if (mounted) {
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

                    if (mounted) {
                        setIsFavorite(
                            Boolean(
                                value
                            )
                        );
                    }
                } catch (error) {
                    console.error(
                        "HOME CHECK FAVORITE ERROR:",
                        error
                    );

                    if (mounted) {
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
        isAuthenticated,
        product?.id,
    ]);

    // ========================================================
    // TOGGLE FAVORITE
    // ========================================================

    const handleToggleFavorite =
        async (event) => {
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
            } catch (error) {
                console.error(
                    "HOME TOGGLE FAVORITE ERROR:",
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

    return (
        <article className="home-product-card">
            <button
                type="button"
                className={
                    isFavorite
                        ? "home-favorite-button active"
                        : "home-favorite-button"
                }
                onClick={
                    handleToggleFavorite
                }
                disabled={
                    favoriteLoading
                }
                aria-pressed={
                    isFavorite
                }
                aria-label={
                    isFavorite
                        ? "Bỏ khỏi yêu thích"
                        : "Thêm vào yêu thích"
                }
                title={
                    isFavorite
                        ? "Bỏ khỏi yêu thích"
                        : "Thêm vào yêu thích"
                }
            >
                {favoriteLoading ? (
                    <span className="spinner-border spinner-border-sm" />
                ) : isFavorite ? (
                    <FaHeart />
                ) : (
                    <FaRegHeart />
                )}
            </button>

            <Link
                to={`/products/${product.id}`}
                className="home-product-image"
            >
                {hasSale && (
                    <span className="home-sale-badge">
                        SALE
                    </span>
                )}

                {image ? (
                    <img
                        src={image}
                        alt={
                            product.name
                        }
                        loading="lazy"
                    />
                ) : (
                    <div className="home-image-placeholder">
                        <FaShoppingBag />

                        <span>
                            Sneaker Shop
                        </span>
                    </div>
                )}
            </Link>

            <div className="home-product-content">
                {product.brand_name && (
                    <div className="home-product-brand">
                        {
                            product.brand_name
                        }
                    </div>
                )}

                <Link
                    className="home-product-name"
                    to={`/products/${product.id}`}
                >
                    {product.name}
                </Link>

                <div className="home-price-row">
                    <span className="home-current-price">
                        {formatPrice(
                            price
                        )}
                    </span>

                    {hasSale && (
                        <span className="home-old-price">
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

// ============================================================
// HOME
// ============================================================

function HomePage() {
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
                                limit: 8,
                            }
                        );

                    const data =
                        response?.data;

                    let list = [];

                    if (
                        Array.isArray(
                            data
                        )
                    ) {
                        list =
                            data;
                    } else if (
                        Array.isArray(
                            data
                                ?.products
                        )
                    ) {
                        list =
                            data.products;
                    } else if (
                        Array.isArray(
                            response
                                ?.products
                        )
                    ) {
                        list =
                            response.products;
                    }

                    if (mounted) {
                        setProducts(
                            list.slice(
                                0,
                                8
                            )
                        );
                    }
                } catch (err) {
                    console.error(
                        "HOME PRODUCTS ERROR:",
                        err
                    );

                    if (mounted) {
                        setError(
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
            mounted = false;
        };
    }, []);

    return (
        <>
            {/* ==================================================
                HERO
            ================================================== */}

            <section className="home-hero">
                <div className="container">
                    <div className="row align-items-center min-vh-hero">
                        <div className="col-lg-6">
                            <div className="home-hero-content">
                                <span className="home-eyebrow">
                                    NEW COLLECTION
                                </span>

                                <h1>
                                    Bước đi
                                    <span>
                                        {" "}
                                        khác biệt.
                                    </span>

                                    <br />

                                    Phong cách
                                    của riêng bạn.
                                </h1>

                                <p>
                                    Khám phá những
                                    mẫu sneaker nổi
                                    bật dành cho mọi
                                    phong cách và
                                    mọi hành trình.
                                </p>

                                <div className="home-hero-actions">
                                    <Link
                                        to="/products"
                                        className="home-primary-link"
                                    >
                                        Mua ngay

                                        <FaArrowRight />
                                    </Link>

                                    <a
                                        href="#featured-products"
                                        className="home-secondary-link"
                                    >
                                        Khám phá
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="home-hero-visual">
                                <div className="home-orange-circle" />

                                <img
                                    src="/src/assets/hero.png"
                                    alt="Sneaker"
                                    className="home-hero-shoe"
                                />

                                <div className="home-floating-card home-floating-one">
                                    <strong>
                                        100%
                                    </strong>

                                    <span>
                                        Authentic
                                    </span>
                                </div>

                                <div className="home-floating-card home-floating-two">
                                    <strong>
                                        NEW
                                    </strong>

                                    <span>
                                        Collection
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================================================
                BENEFITS
            ================================================== */}

            <section className="home-benefits">
                <div className="container">
                    <div className="home-benefits-grid">
                        <div className="home-benefit">
                            <FaTruck />

                            <div>
                                <strong>
                                    Giao hàng nhanh
                                </strong>

                                <span>
                                    Trên toàn quốc
                                </span>
                            </div>
                        </div>

                        <div className="home-benefit">
                            <FaShieldAlt />

                            <div>
                                <strong>
                                    Chính hãng
                                </strong>

                                <span>
                                    Cam kết chất lượng
                                </span>
                            </div>
                        </div>

                        <div className="home-benefit">
                            <FaUndo />

                            <div>
                                <strong>
                                    Đổi trả dễ dàng
                                </strong>

                                <span>
                                    Hỗ trợ khách hàng
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================================================
                PRODUCTS
            ================================================== */}

            <section
                className="home-products-section"
                id="featured-products"
            >
                <div className="container">
                    <div className="home-section-header">
                        <div>
                            <span>
                                SẢN PHẨM NỔI BẬT
                            </span>

                            <h2>
                                Sneaker dành cho bạn
                            </h2>

                            <p>
                                Những sản phẩm đang
                                có tại Sneaker Shop.
                            </p>
                        </div>

                        <Link
                            to="/products"
                            className="home-view-all"
                        >
                            Xem tất cả

                            <FaArrowRight />
                        </Link>
                    </div>

                    {loading && (
                        <div className="home-loading">
                            <div className="spinner-border" />

                            <span>
                                Đang tải sản phẩm...
                            </span>
                        </div>
                    )}

                    {!loading &&
                        error && (
                            <div className="alert alert-danger">
                                {error}
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        products.length ===
                            0 && (
                            <div className="home-empty">
                                Chưa có sản phẩm
                                để hiển thị.
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        products.length >
                            0 && (
                            <div className="home-product-grid">
                                {products.map(
                                    (
                                        product
                                    ) => (
                                        <ProductCard
                                            key={
                                                product.id
                                            }
                                            product={
                                                product
                                            }
                                        />
                                    )
                                )}
                            </div>
                        )}

                    <div className="home-mobile-view-all">
                        <Link
                            to="/products"
                            className="home-primary-link"
                        >
                            Xem tất cả sản phẩm

                            <FaArrowRight />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ==================================================
                CTA
            ================================================== */}

            <section className="home-cta-section">
                <div className="container">
                    <div className="home-cta">
                        <div>
                            <span>
                                SNEAKER SHOP
                            </span>

                            <h2>
                                Sẵn sàng tìm đôi
                                giày tiếp theo?
                            </h2>

                            <p>
                                Khám phá toàn bộ bộ
                                sưu tập ngay hôm nay.
                            </p>
                        </div>

                        <Link
                            to="/products"
                            className="home-cta-button"
                        >
                            Khám phá ngay

                            <FaArrowRight />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}

export default HomePage;