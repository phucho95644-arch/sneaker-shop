import {
    Navigate,
    useNavigate,
} from "react-router-dom";

import {
    useState,
} from "react";

import {
    FaEnvelope,
    FaLock,
    FaPhone,
    FaUser,
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

function RegisterPage() {
    const navigate =
        useNavigate();

    const {
        register,
        isAuthenticated,
        isAdmin,
        loading: authLoading,
    } = useAuth();

    const [formData, setFormData] =
        useState({
            fullName: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword:
                "",
        });

    const [
        showPassword,
        setShowPassword,
    ] = useState(false);

    const [
        showConfirmPassword,
        setShowConfirmPassword,
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
    // VALIDATE
    // ========================================================

    const validateForm =
        () => {
            const fullName =
                formData.fullName.trim();

            const email =
                formData.email.trim();

            const phone =
                formData.phone.trim();

            if (
                fullName.length <
                2
            ) {
                toast.error(
                    "Họ tên phải có ít nhất 2 ký tự."
                );

                return false;
            }

            if (
                !email
            ) {
                toast.error(
                    "Email không được để trống."
                );

                return false;
            }

            if (
                phone &&
                !/^[0-9]{10,11}$/.test(
                    phone
                )
            ) {
                toast.error(
                    "Số điện thoại phải gồm 10 đến 11 chữ số."
                );

                return false;
            }

            if (
                formData.password
                    .length < 8
            ) {
                toast.error(
                    "Mật khẩu phải có ít nhất 8 ký tự."
                );

                return false;
            }

            if (
                !/[A-Za-z]/.test(
                    formData.password
                ) ||
                !/\d/.test(
                    formData.password
                )
            ) {
                toast.error(
                    "Mật khẩu phải chứa cả chữ và số."
                );

                return false;
            }

            if (
                formData.password !==
                formData.confirmPassword
            ) {
                toast.error(
                    "Xác nhận mật khẩu không khớp."
                );

                return false;
            }

            return true;
        };

    // ========================================================
    // SUBMIT
    // ========================================================

    const handleSubmit =
        async (
            event
        ) => {
            event.preventDefault();

            if (
                submitting ||
                !validateForm()
            ) {
                return;
            }

            try {
                setSubmitting(
                    true
                );

                const payload = {
                    fullName:
                        formData.fullName.trim(),

                    email:
                        formData.email.trim(),

                    password:
                        formData.password,

                    confirmPassword:
                        formData.confirmPassword,
                };

                if (
                    formData.phone.trim()
                ) {
                    payload.phone =
                        formData.phone.trim();
                }

                await register(
                    payload
                );

                toast.success(
                    "Đăng ký thành công! Hãy đăng nhập."
                );

                navigate(
                    "/login",
                    {
                        replace:
                            true,
                    }
                );
            } catch (error) {
                const responseData =
                    error.response
                        ?.data;

                const message =
                    responseData
                        ?.message ||
                    "Đăng ký thất bại. Vui lòng thử lại.";

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
    // RESTORE SESSION
    // ========================================================

    if (authLoading) {
        return (
            <div className="auth-loading">
                <div className="spinner-border" />

                <span>
                    Đang tải...
                </span>
            </div>
        );
    }

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

            <div className="auth-card auth-card-register">
                <div className="auth-logo">
                    SNEAKER
                    <span>
                        SHOP
                    </span>
                </div>

                <div className="auth-heading">
                    <h1>
                        Tạo tài khoản
                    </h1>

                    <p>
                        Tham gia Sneaker Shop và bắt đầu mua sắm.
                    </p>
                </div>

                <form
                    onSubmit={
                        handleSubmit
                    }
                >
                    <div className="auth-field">
                        <label
                            htmlFor="fullName"
                        >
                            Họ và tên
                        </label>

                        <div className="auth-input-wrapper">
                            <FaUser />

                            <input
                                id="fullName"
                                type="text"
                                name="fullName"
                                value={
                                    formData.fullName
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Nguyễn Văn A"
                                minLength={2}
                                maxLength={100}
                                autoComplete="name"
                                required
                            />
                        </div>
                    </div>

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
                                maxLength={254}
                                autoComplete="email"
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label
                            htmlFor="phone"
                        >
                            Số điện thoại
                        </label>

                        <div className="auth-input-wrapper">
                            <FaPhone />

                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                value={
                                    formData.phone
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="0123456789"
                                maxLength={11}
                                autoComplete="tel"
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
                                placeholder="Ít nhất 8 ký tự, gồm chữ và số"
                                minLength={8}
                                maxLength={128}
                                autoComplete="new-password"
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
                            >
                                {showPassword ? (
                                    <FaEyeSlash />
                                ) : (
                                    <FaEye />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="auth-field">
                        <label
                            htmlFor="confirmPassword"
                        >
                            Xác nhận mật khẩu
                        </label>

                        <div className="auth-input-wrapper">
                            <FaLock />

                            <input
                                id="confirmPassword"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                name="confirmPassword"
                                value={
                                    formData.confirmPassword
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Nhập lại mật khẩu"
                                maxLength={128}
                                autoComplete="new-password"
                                required
                            />

                            <button
                                type="button"
                                className="auth-password-toggle"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        (
                                            value
                                        ) =>
                                            !value
                                    )
                                }
                            >
                                {showConfirmPassword ? (
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
                                <span className="spinner-border spinner-border-sm" />

                                Đang đăng ký...
                            </>
                        ) : (
                            "Tạo tài khoản"
                        )}
                    </button>
                </form>

                <div className="auth-switch">
                    Đã có tài khoản?

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/login"
                            )
                        }
                    >
                        Đăng nhập
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

export default RegisterPage;