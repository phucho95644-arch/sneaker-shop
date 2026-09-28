import {
    NavLink,
    useNavigate,
} from "react-router-dom";

import {
    FaHeart,
    FaShoppingBag,
    FaUser,
    FaSignOutAlt,
    FaUserShield,
} from "react-icons/fa";

import {
    useAuth,
} from "../../contexts/AuthContext";

import {
    useCart,
} from "../../contexts/CartContext";

function Header() {
    const navigate =
        useNavigate();

    const {
        user,
        isAuthenticated,
        isAdmin,
        logout,
    } = useAuth();

    const {
        totalItems,
        resetCart,
    } = useCart();

    // ========================================================
    // LOGOUT
    // ========================================================

    const handleLogout = () => {
        resetCart();

        logout();

        navigate("/");
    };

    return (
        <header>
            <nav className="navbar navbar-expand-lg navbar-dark sneaker-navbar">
                <div className="container">
                    {/* ==========================================
                        BRAND
                    ========================================== */}

                    <NavLink
                        className="navbar-brand sneaker-brand"
                        to="/"
                    >
                        SNEAKER
                        <span>
                            SHOP
                        </span>
                    </NavLink>

                    {/* ==========================================
                        MOBILE TOGGLER
                    ========================================== */}

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#mainNavbar"
                        aria-controls="mainNavbar"
                        aria-expanded="false"
                        aria-label="Mở menu"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>

                    {/* ==========================================
                        MENU
                    ========================================== */}

                    <div
                        className="collapse navbar-collapse"
                        id="mainNavbar"
                    >
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <NavLink
                                    className="nav-link"
                                    to="/"
                                >
                                    Trang chủ
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink
                                    className="nav-link"
                                    to="/products"
                                >
                                    Sản phẩm
                                </NavLink>
                            </li>
                        </ul>

                        {/* ======================================
                            RIGHT ACTIONS
                        ====================================== */}

                        <div className="d-flex align-items-center gap-2 sneaker-actions">
                            {isAuthenticated && (
                                <>
                                    {/* ==========================
                                        FAVORITES
                                    ========================== */}

                                    <NavLink
                                        className="header-icon-btn"
                                        to="/favorites"
                                        title="Yêu thích"
                                    >
                                        <FaHeart />
                                    </NavLink>

                                    {/* ==========================
                                        CART
                                    ========================== */}

                                    <NavLink
                                        className="header-icon-btn header-cart-link"
                                        to="/cart"
                                        title="Giỏ hàng"
                                    >
                                        <FaShoppingBag />

                                        {totalItems >
                                            0 && (
                                            <span className="header-cart-badge">
                                                {totalItems >
                                                99
                                                    ? "99+"
                                                    : totalItems}
                                            </span>
                                        )}
                                    </NavLink>
                                </>
                            )}

                            {/* ==================================
                                NOT LOGIN
                            ================================== */}

                            {!isAuthenticated ? (
                                <>
                                    <NavLink
                                        className="btn btn-outline-light"
                                        to="/login"
                                    >
                                        Đăng nhập
                                    </NavLink>

                                    <NavLink
                                        className="btn sneaker-primary-btn"
                                        to="/register"
                                    >
                                        Đăng ký
                                    </NavLink>
                                </>
                            ) : (
                                /* =================================
                                   USER MENU
                                ================================= */

                                <div className="dropdown">
                                    <button
                                        className="btn btn-dark dropdown-toggle d-flex align-items-center gap-2"
                                        data-bs-toggle="dropdown"
                                        type="button"
                                    >
                                        <FaUser />

                                        <span>
                                            {user?.fullName ||
                                                "Tài khoản"}
                                        </span>
                                    </button>

                                    <ul className="dropdown-menu dropdown-menu-end">
                                        <li>
                                            <NavLink
                                                className="dropdown-item"
                                                to="/profile"
                                            >
                                                <FaUser className="me-2" />

                                                Hồ sơ
                                            </NavLink>
                                        </li>

                                        <li>
                                            <NavLink
                                                className="dropdown-item"
                                                to="/orders"
                                            >
                                                <FaShoppingBag className="me-2" />

                                                Đơn hàng
                                            </NavLink>
                                        </li>

                                        {isAdmin && (
                                            <>
                                                <li>
                                                    <hr className="dropdown-divider" />
                                                </li>

                                                <li>
                                                    <NavLink
                                                        className="dropdown-item"
                                                        to="/admin"
                                                    >
                                                        <FaUserShield className="me-2" />

                                                        Quản trị
                                                    </NavLink>
                                                </li>
                                            </>
                                        )}

                                        <li>
                                            <hr className="dropdown-divider" />
                                        </li>

                                        <li>
                                            <button
                                                type="button"
                                                className="dropdown-item text-danger"
                                                onClick={
                                                    handleLogout
                                                }
                                            >
                                                <FaSignOutAlt className="me-2" />

                                                Đăng xuất
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;