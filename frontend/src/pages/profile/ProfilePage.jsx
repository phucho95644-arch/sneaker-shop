import {
    useEffect,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    FaEnvelope,
    FaKey,
    FaMapMarkerAlt,
    FaPhone,
    FaSave,
    FaShoppingBag,
    FaUser,
    FaUserShield,
} from "react-icons/fa";

import {
    toast,
} from "react-toastify";

import userService from "../../services/userService";
import authService from "../../services/authService";

import {
    useAuth,
} from "../../contexts/AuthContext";

import "./ProfilePage.css";

// ============================================================
// NORMALIZE PROFILE
// ============================================================

const normalizeProfile = (
    response
) => {
    const data =
        response?.data?.user ??
        response?.data ??
        response?.user ??
        response ??
        {};

    return {
        id:
            data.id ??
            null,

        fullName:
            data.fullName ??
            data.full_name ??
            "",

        email:
            data.email ??
            "",

        phone:
            data.phone ??
            "",

        avatar:
            data.avatar ??
            "",

        role:
            data.role ??
            "customer",

        status:
            data.status ??
            "active",

        createdAt:
            data.createdAt ??
            data.created_at ??
            null,
    };
};

// ============================================================
// PROFILE PAGE
// ============================================================

function ProfilePage() {
    const {
        refreshUser,
    } = useAuth();

    // ========================================================
    // PROFILE STATE
    // ========================================================

    const [
        profile,
        setProfile,
    ] = useState(null);

    const [
        formData,
        setFormData,
    ] = useState({
        fullName: "",
        phone: "",
    });

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        saving,
        setSaving,
    ] = useState(false);

    // ========================================================
    // PASSWORD STATE
    // ========================================================

    const [
        passwordForm,
        setPasswordForm,
    ] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    const [
        changingPassword,
        setChangingPassword,
    ] = useState(false);

    // ========================================================
    // LOAD PROFILE
    // ========================================================

    useEffect(() => {
        let mounted =
            true;

        const loadProfile =
            async () => {
                try {
                    setLoading(
                        true
                    );

                    const response =
                        await userService.getProfile();

                    const data =
                        normalizeProfile(
                            response
                        );

                    if (!mounted) {
                        return;
                    }

                    setProfile(
                        data
                    );

                    setFormData({
                        fullName:
                            data.fullName,
                        phone:
                            data.phone,
                    });
                } catch (error) {
                    console.error(
                        "PROFILE ERROR:",
                        error
                    );

                    if (mounted) {
                        toast.error(
                            error.response
                                ?.data
                                ?.message ||
                                "Không thể tải hồ sơ."
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

        loadProfile();

        return () => {
            mounted =
                false;
        };
    }, []);

    // ========================================================
    // PROFILE INPUT
    // ========================================================

    const handleProfileChange =
        (
            event
        ) => {
            const {
                name,
                value,
            } =
                event.target;

            setFormData(
                (
                    current
                ) => ({
                    ...current,

                    [name]:
                        value,
                })
            );
        };

    // ========================================================
    // SAVE PROFILE
    // ========================================================

    const handleSaveProfile =
        async (
            event
        ) => {
            event.preventDefault();

            const fullName =
                formData.fullName.trim();

            const phone =
                formData.phone.trim();

            if (
                fullName.length <
                2
            ) {
                toast.warning(
                    "Họ tên phải có ít nhất 2 ký tự."
                );

                return;
            }

            if (
                phone &&
                !/^[0-9]{10,11}$/.test(
                    phone
                )
            ) {
                toast.warning(
                    "Số điện thoại phải gồm 10 đến 11 chữ số."
                );

                return;
            }

            try {
                setSaving(
                    true
                );

                const response =
                    await userService.updateProfile({
                        fullName,
                        phone,
                    });

                toast.success(
                    response?.message ||
                    "Cập nhật hồ sơ thành công."
                );

                const updated =
                    normalizeProfile(
                        response
                    );

                if (
                    updated?.id
                ) {
                    setProfile(
                        updated
                    );
                } else {
                    setProfile(
                        (
                            current
                        ) => ({
                            ...current,

                            fullName,
                            phone,
                        })
                    );
                }

                await refreshUser();
            } catch (error) {
                console.error(
                    "UPDATE PROFILE ERROR:",
                    error
                );

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                        "Không thể cập nhật hồ sơ."
                );
            } finally {
                setSaving(
                    false
                );
            }
        };

    // ========================================================
    // PASSWORD INPUT
    // ========================================================

    const handlePasswordChange =
        (
            event
        ) => {
            const {
                name,
                value,
            } =
                event.target;

            setPasswordForm(
                (
                    current
                ) => ({
                    ...current,

                    [name]:
                        value,
                })
            );
        };

    // ========================================================
    // CHANGE PASSWORD
    // ========================================================

    const handleChangePassword =
        async (
            event
        ) => {
            event.preventDefault();

            const {
                currentPassword,
                newPassword,
                confirmNewPassword,
            } =
                passwordForm;

            if (
                !currentPassword ||
                !newPassword ||
                !confirmNewPassword
            ) {
                toast.warning(
                    "Vui lòng nhập đầy đủ thông tin mật khẩu."
                );

                return;
            }

            if (
                newPassword.length <
                8
            ) {
                toast.warning(
                    "Mật khẩu mới phải có ít nhất 8 ký tự."
                );

                return;
            }

            if (
                !/[A-Za-z]/.test(
                    newPassword
                ) ||
                !/\d/.test(
                    newPassword
                )
            ) {
                toast.warning(
                    "Mật khẩu mới phải chứa cả chữ và số."
                );

                return;
            }

            if (
                newPassword ===
                currentPassword
            ) {
                toast.warning(
                    "Mật khẩu mới phải khác mật khẩu hiện tại."
                );

                return;
            }

            if (
                newPassword !==
                confirmNewPassword
            ) {
                toast.warning(
                    "Xác nhận mật khẩu mới không khớp."
                );

                return;
            }

            try {
                setChangingPassword(
                    true
                );

                const response =
                    await authService.changePassword({
                        currentPassword,
                        newPassword,
                        confirmNewPassword,
                    });

                toast.success(
                    response?.message ||
                    "Đổi mật khẩu thành công."
                );

                setPasswordForm({
                    currentPassword:
                        "",
                    newPassword:
                        "",
                    confirmNewPassword:
                        "",
                });
            } catch (error) {
                console.error(
                    "CHANGE PASSWORD ERROR:",
                    error
                );

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                        "Không thể đổi mật khẩu."
                );
            } finally {
                setChangingPassword(
                    false
                );
            }
        };

    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {
        return (
            <div className="profile-loading">
                <div
                    className="spinner-border"
                    role="status"
                />

                <span>
                    Đang tải hồ sơ...
                </span>
            </div>
        );
    }

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="profile-page">
            <div className="container">
                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="profile-header">
                    <span>
                        TÀI KHOẢN
                    </span>

                    <h1>
                        Hồ sơ cá nhân
                    </h1>

                    <p>
                        Quản lý thông tin tài khoản Sneaker Shop của bạn.
                    </p>
                </div>

                <div className="profile-layout">
                    {/* ==============================================
                        SIDEBAR
                    ============================================== */}

                    <aside className="profile-sidebar">
                        <div className="profile-avatar">
                            {profile?.avatar ? (
                                <img
                                    src={
                                        profile.avatar
                                    }
                                    alt={
                                        profile.fullName ||
                                        "Avatar"
                                    }
                                />
                            ) : (
                                <FaUser />
                            )}
                        </div>

                        <h2>
                            {profile?.fullName ||
                                "Khách hàng"}
                        </h2>

                        <p>
                            {profile?.email}
                        </p>

                        <div className="profile-role">
                            {profile?.role ===
                            "admin" ? (
                                <>
                                    <FaUserShield />

                                    Quản trị viên
                                </>
                            ) : (
                                <>
                                    <FaUser />

                                    Khách hàng
                                </>
                            )}
                        </div>

                        <div className="profile-sidebar-links">
                            <Link
                                to="/profile/addresses"
                            >
                                <FaMapMarkerAlt />

                                Sổ địa chỉ
                            </Link>

                            <Link
                                to="/orders"
                            >
                                <FaShoppingBag />

                                Đơn hàng của tôi
                            </Link>
                        </div>
                    </aside>

                    {/* ==============================================
                        CONTENT
                    ============================================== */}

                    <main className="profile-content">
                        {/* ==========================================
                            PROFILE FORM
                        ========================================== */}

                        <section className="profile-card">
                            <div className="profile-card-heading">
                                <div>
                                    <span>
                                        THÔNG TIN
                                    </span>

                                    <h2>
                                        Thông tin cá nhân
                                    </h2>
                                </div>
                            </div>

                            <form
                                onSubmit={
                                    handleSaveProfile
                                }
                            >
                                <div className="profile-form-grid">
                                    <div className="profile-field">
                                        <label
                                            htmlFor="fullName"
                                        >
                                            Họ và tên
                                        </label>

                                        <div className="profile-input">
                                            <FaUser />

                                            <input
                                                id="fullName"
                                                name="fullName"
                                                type="text"
                                                value={
                                                    formData.fullName
                                                }
                                                onChange={
                                                    handleProfileChange
                                                }
                                                maxLength={
                                                    100
                                                }
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="profile-field">
                                        <label>
                                            Email
                                        </label>

                                        <div className="profile-input disabled">
                                            <FaEnvelope />

                                            <input
                                                type="email"
                                                value={
                                                    profile?.email ||
                                                    ""
                                                }
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    <div className="profile-field">
                                        <label
                                            htmlFor="phone"
                                        >
                                            Số điện thoại
                                        </label>

                                        <div className="profile-input">
                                            <FaPhone />

                                            <input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                value={
                                                    formData.phone
                                                }
                                                onChange={
                                                    handleProfileChange
                                                }
                                                maxLength={
                                                    11
                                                }
                                                placeholder="Chưa cập nhật"
                                            />
                                        </div>
                                    </div>

                                    <div className="profile-field">
                                        <label>
                                            Trạng thái
                                        </label>

                                        <div className="profile-status">
                                            <span />

                                            {profile?.status ===
                                            "active"
                                                ? "Đang hoạt động"
                                                : profile?.status ||
                                                  "Không xác định"}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="profile-save-btn"
                                    disabled={
                                        saving
                                    }
                                >
                                    {saving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" />

                                            Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave />

                                            Lưu thay đổi
                                        </>
                                    )}
                                </button>
                            </form>
                        </section>

                        {/* ==========================================
                            PASSWORD
                        ========================================== */}

                        <section className="profile-card">
                            <div className="profile-card-heading">
                                <div>
                                    <span>
                                        BẢO MẬT
                                    </span>

                                    <h2>
                                        Đổi mật khẩu
                                    </h2>
                                </div>

                                <FaKey />
                            </div>

                            <form
                                onSubmit={
                                    handleChangePassword
                                }
                            >
                                <div className="profile-password-grid">
                                    <div className="profile-field">
                                        <label
                                            htmlFor="currentPassword"
                                        >
                                            Mật khẩu hiện tại
                                        </label>

                                        <input
                                            id="currentPassword"
                                            name="currentPassword"
                                            type="password"
                                            value={
                                                passwordForm.currentPassword
                                            }
                                            onChange={
                                                handlePasswordChange
                                            }
                                            autoComplete="current-password"
                                            maxLength={
                                                128
                                            }
                                        />
                                    </div>

                                    <div className="profile-field">
                                        <label
                                            htmlFor="newPassword"
                                        >
                                            Mật khẩu mới
                                        </label>

                                        <input
                                            id="newPassword"
                                            name="newPassword"
                                            type="password"
                                            value={
                                                passwordForm.newPassword
                                            }
                                            onChange={
                                                handlePasswordChange
                                            }
                                            autoComplete="new-password"
                                            maxLength={
                                                128
                                            }
                                        />
                                    </div>

                                    <div className="profile-field">
                                        <label
                                            htmlFor="confirmNewPassword"
                                        >
                                            Xác nhận mật khẩu
                                        </label>

                                        <input
                                            id="confirmNewPassword"
                                            name="confirmNewPassword"
                                            type="password"
                                            value={
                                                passwordForm.confirmNewPassword
                                            }
                                            onChange={
                                                handlePasswordChange
                                            }
                                            autoComplete="new-password"
                                            maxLength={
                                                128
                                            }
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="profile-password-btn"
                                    disabled={
                                        changingPassword
                                    }
                                >
                                    {changingPassword ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" />

                                            Đang đổi...
                                        </>
                                    ) : (
                                        <>
                                            <FaKey />

                                            Đổi mật khẩu
                                        </>
                                    )}
                                </button>
                            </form>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;