import {
    Navigate,
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    useState,
} from "react";

import {
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash,
} from "react-icons/fa";

import {
    toast,
} from "react-toastify";

import {
    useAuth,
} from "../../contexts/AuthContext";

import "./AuthPages.css";

function LoginPage() {
    const navigate =
        useNavigate();

    const location =
        useLocation();

    const {
        login,
        isAuthenticated,
        isAdmin,
        loading: authLoading,
    } = useAuth();

    const [formData, setFormData] =
        useState({
            email: "",
            password: "",
        });

    const [
        showPassword,
        setShowPassword,
    ] = useState(false);

    const [
        submitting,
        setSubmitting,
    ] = useState(false);

    // ========================================================
    // INPUT
    // ========================================================

    const handleChange = (
        event
    ) => {
        const {
            name,
            value,
        } = event.target;

        setFormData(
            (
                previous
            ) => ({
                ...previous,

                [name]:
                    value,
            })
        );
    };

    // ========================================================
    // SUBMIT
    // ========================================================

    const handleSubmit =
        async (
            event
        ) => {
            event.preventDefault();

            if (submitting) {
                return;
            }

            const email =
                formData.email.trim();

            const password =
                formData.password;

            if (
                !email ||
                !password
            ) {
                toast.error(
                    "Vui lòng nhập đầy đủ email và mật khẩu."
                );

                return;
            }

            try {
                setSubmitting(
                    true
                );

                const user =
                    await login(
                        email,
                        password
                    );

                toast.success(
                    "Đăng nhập thành công!"
                );

                const previousPath =
                    location.state
                        ?.from
                        ?.pathname;

                if (
                    previousPath
                ) {
                    navigate(
                        previousPath,
                        {
                            replace:
                                true,
                        }
                    );

                    return;
                }

                if (
                    user?.role ===
                    "admin"
                ) {
                    navigate(
                        "/admin",
                        {
                            replace:
                                true,
                        }
                    );

                    return;
                }

                navigate(
                    "/",
                    {
                        replace:
                            true,
                    }
                );
            } catch (error) {
                const message =
                    error.response
                        ?.data
                        ?.message ||
                    "Đăng nhập thất bại. Vui lòng thử lại.";

                toast.error(
                    message
                );
            } finally {
                setSubmitting(
                    false
                );
            }
        };

    // ========================================================
    // AUTH RESTORE
    // ========================================================

    if (authLoading) {
        return (
            <div className="auth-loading">
                <div
                    className="spinner-border"
                    role="status"
                />

                <span>
                    Đang kiểm tra tài khoản...
                </span>
            </div>
        );
    }

    // User đã login mà truy cập /login
    if (isAuthenticated) {
        return (
            <Navigate
                to={
                    isAdmin
                        ? "/admin"
                        : "/"
                }
                replace
            />
        );
    }

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="auth-page">
            <div className="auth-background" />

            <div className="auth-card">
                <div className="auth-logo">
                    SNEAKER
                    <span>
                        SHOP
                    </span>
                </div>

                <div className="auth-heading">
                    <h1>
                        Chào mừng trở lại
                    </h1>

                    <p>
                        Đăng nhập để tiếp tục mua sắm.
                    </p>
                </div>

                <form
                    onSubmit={
                        handleSubmit
                    }
                >
                    <div className="auth-field">
                        <label
                            htmlFor="email"
                        >
                            Email
                        </label>

                        <div className="auth-input-wrapper">
                            <FaEnvelope />

                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={
                                    formData.email
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="example@email.com"
                                autoComplete="email"
                                maxLength={254}
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label
                            htmlFor="password"
                        >
                            Mật khẩu
                        </label>

                        <div className="auth-input-wrapper">
                            <FaLock />

                            <input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                value={
                                    formData.password
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Nhập mật khẩu"
                                autoComplete="current-password"
                                maxLength={128}
                                required
                            />

                            <button
                                type="button"
                                className="auth-password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        (
                                            value
                                        ) =>
                                            !value
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? "Ẩn mật khẩu"
                                        : "Hiện mật khẩu"
                                }
                            >
                                {showPassword ? (
                                    <FaEyeSlash />
                                ) : (
                                    <FaEye />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={
                            submitting
                        }
                    >
                        {submitting ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm"
                                    aria-hidden="true"
                                />

                                Đang đăng nhập...
                            </>
                        ) : (
                            "Đăng nhập"
                        )}
                    </button>
                </form>

                <div className="auth-switch">
                    Chưa có tài khoản?

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/register"
                            )
                        }
                    >
                        Đăng ký ngay
                    </button>
                </div>

                <button
                    className="auth-home-link"
                    type="button"
                    onClick={() =>
                        navigate("/")
                    }
                >
                    ← Quay lại cửa hàng
                </button>
            </div>
        </div>
    );
}

export default LoginPage;