import {
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

// ============================================================
// LAYOUTS
// ============================================================

import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";

// ============================================================
// ROUTE GUARDS
// ============================================================

import ProtectedRoute from "../components/common/ProtectedRoute";
import AdminRoute from "../components/common/AdminRoute";

// ============================================================
// PUBLIC
// ============================================================

import HomePage from "../pages/home/HomePage";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

import ProductListPage from "../pages/products/ProductListPage";
import ProductDetailPage from "../pages/products/ProductDetailPage";

// ============================================================
// CUSTOMER
// ============================================================

import FavoritePage from "../pages/favorites/FavoritePage";

import CartPage from "../pages/cart/CartPage";

import CheckoutPage from "../pages/checkout/CheckoutPage";

import ProfilePage from "../pages/profile/ProfilePage";
import AddressPage from "../pages/profile/AddressPage";

import OrderHistoryPage from "../pages/orders/OrderHistoryPage";
import OrderDetailPage from "../pages/orders/OrderDetailPage";

// ============================================================
// ADMIN
// ============================================================

import DashboardPage from "../pages/admin/DashboardPage";

import AdminStatisticsPage from "../pages/admin/AdminStatisticsPage";

import UserManagementPage from "../pages/admin/UserManagementPage";

import ProductManagementPage from "../pages/admin/ProductManagementPage";
import ProductFormPage from "../pages/admin/ProductFormPage";

import OrderManagementPage from "../pages/admin/OrderManagementPage";
import OrderDetailAdminPage from "../pages/admin/OrderDetailAdminPage";

import CategoryManagementPage from "../pages/admin/CategoryManagementPage";

import BrandManagementPage from "../pages/admin/BrandManagementPage";

import CouponManagementPage from "../pages/admin/CouponManagementPage";

import AdminReviewsPage from "../pages/admin/AdminReviewsPage";

// ============================================================
// 404 PAGE
// ============================================================

function NotFoundPage() {
    return (
        <div className="container py-5 text-center">
            <h1 className="display-1 fw-bold">
                404
            </h1>

            <h3>
                Không tìm thấy trang
            </h3>

            <p className="text-secondary">
                Trang bạn đang tìm kiếm
                không tồn tại.
            </p>
        </div>
    );
}

// ============================================================
// APP ROUTES
// ============================================================

function AppRoutes() {
    return (
        <Routes>
            {/* ==================================================
                PUBLIC / CUSTOMER
            ================================================== */}

            <Route element={<MainLayout />}>
                {/* ==============================================
                    HOME
                ============================================== */}

                <Route
                    path="/"
                    element={<HomePage />}
                />

                {/* ==============================================
                    PRODUCTS
                ============================================== */}

                <Route
                    path="/products"
                    element={<ProductListPage />}
                />

                <Route
                    path="/products/:id"
                    element={<ProductDetailPage />}
                />

                {/* ==============================================
                    FAVORITES
                ============================================== */}

                <Route
                    path="/favorites"
                    element={
                        <ProtectedRoute>
                            <FavoritePage />
                        </ProtectedRoute>
                    }
                />

                {/* ==============================================
                    CART
                ============================================== */}

                <Route
                    path="/cart"
                    element={
                        <ProtectedRoute>
                            <CartPage />
                        </ProtectedRoute>
                    }
                />

                {/* ==============================================
                    CHECKOUT
                ============================================== */}

                <Route
                    path="/checkout"
                    element={
                        <ProtectedRoute>
                            <CheckoutPage />
                        </ProtectedRoute>
                    }
                />

                {/* ==============================================
                    PROFILE
                ============================================== */}

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile/addresses"
                    element={
                        <ProtectedRoute>
                            <AddressPage />
                        </ProtectedRoute>
                    }
                />

                {/* ==============================================
                    ORDERS
                ============================================== */}

                <Route
                    path="/orders"
                    element={
                        <ProtectedRoute>
                            <OrderHistoryPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/orders/:id"
                    element={
                        <ProtectedRoute>
                            <OrderDetailPage />
                        </ProtectedRoute>
                    }
                />

                {/* ==============================================
                    CUSTOMER 404
                ============================================== */}

                <Route
                    path="*"
                    element={<NotFoundPage />}
                />
            </Route>

            {/* ==================================================
                AUTH
            ================================================== */}

            <Route
                path="/login"
                element={<LoginPage />}
            />

            <Route
                path="/register"
                element={<RegisterPage />}
            />

            {/* ==================================================
                ADMIN
            ================================================== */}

            <Route
                path="/admin"
                element={
                    <AdminRoute>
                        <AdminLayout />
                    </AdminRoute>
                }
            >
                {/* ==============================================
                    DASHBOARD
                ============================================== */}

                <Route
                    index
                    element={<DashboardPage />}
                />

                {/* ==============================================
                    STATISTICS
                ============================================== */}

                <Route
                    path="statistics"
                    element={<AdminStatisticsPage />}
                />

                {/* ==============================================
                    USERS
                ============================================== */}

                <Route
                    path="users"
                    element={<UserManagementPage />}
                />

                {/* ==============================================
                    PRODUCTS
                ============================================== */}

                <Route
                    path="products"
                    element={<ProductManagementPage />}
                />

                <Route
                    path="products/create"
                    element={<ProductFormPage />}
                />

                <Route
                    path="products/:id/edit"
                    element={<ProductFormPage />}
                />

                {/* ==============================================
                    ORDERS
                ============================================== */}

                <Route
                    path="orders"
                    element={<OrderManagementPage />}
                />

                <Route
                    path="orders/:id"
                    element={<OrderDetailAdminPage />}
                />

                {/* ==============================================
                    CATEGORIES
                ============================================== */}

                <Route
                    path="categories"
                    element={<CategoryManagementPage />}
                />

                {/* ==============================================
                    BRANDS
                ============================================== */}

                <Route
                    path="brands"
                    element={<BrandManagementPage />}
                />

                {/* ==============================================
                    COUPONS
                ============================================== */}

                <Route
                    path="coupons"
                    element={<CouponManagementPage />}
                />

                {/* ==============================================
                    REVIEWS
                ============================================== */}

                <Route
                    path="reviews"
                    element={<AdminReviewsPage />}
                />

                {/* ==============================================
                    ADMIN FALLBACK
                ============================================== */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/admin"
                            replace
                        />
                    }
                />
            </Route>

            {/* ==================================================
                LEGACY / REDIRECT
            ================================================== */}

            <Route
                path="/home"
                element={
                    <Navigate
                        to="/"
                        replace
                    />
                }
            />

            {/* ==================================================
                GLOBAL FALLBACK
            ================================================== */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/"
                        replace
                    />
                }
            />
        </Routes>
    );
}

export default AppRoutes;