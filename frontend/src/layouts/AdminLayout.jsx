import {
    useState,
} from "react";

import {
    NavLink,
    Outlet,
    useNavigate,
} from "react-router-dom";

import {
    FaBars,
    FaBoxOpen,
    FaChartLine,
    FaChartPie,
    FaClipboardList,
    FaLayerGroup,
    FaSignOutAlt,
    FaStar,
    FaStore,
    FaTags,
    FaTicketAlt,
    FaUsers,
} from "react-icons/fa";

import "./AdminLayout.css";

// ============================================================
// ADMIN MENU
// ============================================================

const menuItems = [
    {
        to: "/admin",
        label: "Dashboard",
        icon: <FaChartPie />,
        end: true,
    },

    {
        to: "/admin/statistics",
        label: "Thống kê",
        icon: <FaChartLine />,
    },

    {
        to: "/admin/users",
        label: "Người dùng",
        icon: <FaUsers />,
    },

    {
        to: "/admin/products",
        label: "Sản phẩm",
        icon: <FaBoxOpen />,
    },

    {
        to: "/admin/orders",
        label: "Đơn hàng",
        icon: <FaClipboardList />,
    },

    {
        to: "/admin/categories",
        label: "Danh mục",
        icon: <FaLayerGroup />,
    },

    {
        to: "/admin/brands",
        label: "Thương hiệu",
        icon: <FaTags />,
    },

    {
        to: "/admin/coupons",
        label: "Mã giảm giá",
        icon: <FaTicketAlt />,
    },

    {
        to: "/admin/reviews",
        label: "Đánh giá",
        icon: <FaStar />,
    },
];

// ============================================================
// ADMIN LAYOUT
// ============================================================

function AdminLayout() {
    const navigate =
        useNavigate();

    const [
        collapsed,
        setCollapsed,
    ] = useState(false);

    const [
        mobileOpen,
        setMobileOpen,
    ] = useState(false);

    // ========================================================
    // LOGOUT
    // ========================================================

    const handleLogout = () => {
        const confirmed =
            window.confirm(
                "Bạn có chắc muốn đăng xuất khỏi trang quản trị?"
            );

        if (!confirmed) {
            return;
        }

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        navigate(
            "/login",
            {
                replace: true,
            }
        );
    };

    // ========================================================
    // CLOSE MOBILE MENU
    // ========================================================

    const handleNavigate = () => {
        setMobileOpen(
            false
        );
    };

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="admin-layout">
            {/* ==================================================
                MOBILE OVERLAY
            ================================================== */}

            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Đóng menu admin"
                    className="admin-sidebar-overlay"
                    onClick={() =>
                        setMobileOpen(
                            false
                        )
                    }
                />
            )}

            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <aside
                className={[
                    "admin-sidebar",

                    collapsed
                        ? "admin-sidebar--collapsed"
                        : "",

                    mobileOpen
                        ? "admin-sidebar--mobile-open"
                        : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                {/* ==============================================
                    BRAND
                ============================================== */}

                <div className="admin-sidebar-brand">
                    <div className="admin-sidebar-logo">
                        <FaStore />
                    </div>

                    {!collapsed && (
                        <div className="admin-sidebar-brand-text">
                            <strong>
                                SNEAKER
                                <span>
                                    SHOP
                                </span>
                            </strong>

                            <small>
                                ADMIN PANEL
                            </small>
                        </div>
                    )}
                </div>

                {/* ==============================================
                    NAVIGATION
                ============================================== */}

                <nav className="admin-sidebar-nav">
                    <div className="admin-sidebar-section-title">
                        {!collapsed &&
                            "QUẢN TRỊ"}
                    </div>

                    {menuItems.map(
                        (
                            item
                        ) => (
                            <NavLink
                                key={
                                    item.to
                                }
                                to={
                                    item.to
                                }
                                end={
                                    item.end
                                }
                                title={
                                    collapsed
                                        ? item.label
                                        : undefined
                                }
                                onClick={
                                    handleNavigate
                                }
                                className={({
                                    isActive,
                                }) =>
                                    [
                                        "admin-sidebar-link",

                                        isActive
                                            ? "admin-sidebar-link--active"
                                            : "",
                                    ]
                                        .filter(
                                            Boolean
                                        )
                                        .join(
                                            " "
                                        )
                                }
                            >
                                <span className="admin-sidebar-link-icon">
                                    {
                                        item.icon
                                    }
                                </span>

                                {!collapsed && (
                                    <span>
                                        {
                                            item.label
                                        }
                                    </span>
                                )}
                            </NavLink>
                        )
                    )}
                </nav>

                {/* ==============================================
                    FOOTER
                ============================================== */}

                <div className="admin-sidebar-footer">
                    <button
                        type="button"
                        className="admin-sidebar-logout"
                        title={
                            collapsed
                                ? "Đăng xuất"
                                : undefined
                        }
                        onClick={
                            handleLogout
                        }
                    >
                        <FaSignOutAlt />

                        {!collapsed && (
                            <span>
                                Đăng xuất
                            </span>
                        )}
                    </button>
                </div>
            </aside>

            {/* ==================================================
                MAIN AREA
            ================================================== */}

            <div
                className={[
                    "admin-layout-main",

                    collapsed
                        ? "admin-layout-main--collapsed"
                        : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                {/* ==============================================
                    TOPBAR
                ============================================== */}

                <header className="admin-topbar">
                    <div className="admin-topbar-left">
                        {/* MOBILE MENU */}

                        <button
                            type="button"
                            className="admin-mobile-menu-btn"
                            onClick={() =>
                                setMobileOpen(
                                    true
                                )
                            }
                            aria-label="Mở menu admin"
                        >
                            <FaBars />
                        </button>

                        {/* DESKTOP COLLAPSE */}

                        <button
                            type="button"
                            className="admin-collapse-btn"
                            onClick={() =>
                                setCollapsed(
                                    (
                                        current
                                    ) =>
                                        !current
                                )
                            }
                            title={
                                collapsed
                                    ? "Mở rộng sidebar"
                                    : "Thu gọn sidebar"
                            }
                        >
                            <FaBars />
                        </button>

                        {/* TITLE */}

                        <div className="admin-topbar-title">
                            <strong>
                                Sneaker Shop
                            </strong>

                            <span>
                                Hệ thống quản trị cửa hàng
                            </span>
                        </div>
                    </div>

                    {/* ==========================================
                        ADMIN USER
                    ========================================== */}

                    <div className="admin-topbar-user">
                        <div className="admin-topbar-avatar">
                            A
                        </div>

                        <div className="admin-topbar-user-info">
                            <strong>
                                Quản trị viên
                            </strong>

                            <span>
                                Administrator
                            </span>
                        </div>
                    </div>
                </header>

                {/* ==============================================
                    PAGE CONTENT
                ============================================== */}

                <main className="admin-layout-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;