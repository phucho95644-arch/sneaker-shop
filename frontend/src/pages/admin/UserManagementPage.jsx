import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    FaBan,
    FaCheckCircle,
    FaEye,
    FaFilter,
    FaRedo,
    FaSearch,
    FaShieldAlt,
    FaTimes,
    FaUser,
    FaUsers,
} from "react-icons/fa";

import {
    toast,
} from "react-toastify";

import adminUserService
    from "../../services/adminUserService";

import "./UserManagementPage.css";

// ============================================================
// CONFIG
// ============================================================

const SERVER_URL =
    import.meta.env.VITE_SERVER_URL ||
    "http://localhost:5000";

const DEFAULT_FILTERS = {
    search: "",
    role: "",
    status: "",
    sort: "newest",
};

// ============================================================
// HELPERS
// ============================================================

const getErrorMessage = (
    error,
    fallback =
        "Đã xảy ra lỗi."
) =>
    error?.response?.data?.message ||
    error?.message ||
    fallback;

const getFullName = (user) =>
    user?.fullName ||
    user?.full_name ||
    user?.name ||
    user?.username ||
    "Chưa cập nhật";

const getCreatedAt = (user) =>
    user?.createdAt ||
    user?.created_at ||
    null;

const getAvatarUrl = (
    avatar
) => {
    if (!avatar) {
        return null;
    }

    if (
        avatar.startsWith("http://") ||
        avatar.startsWith("https://")
    ) {
        return avatar;
    }

    return `${SERVER_URL}${
        avatar.startsWith("/")
            ? ""
            : "/"
    }${avatar}`;
};

const formatDate = (
    value
) => {
    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }

    return date.toLocaleString(
        "vi-VN"
    );
};

const formatMoney = (
    value
) => {
    const number =
        Number(value || 0);

    return new Intl
        .NumberFormat(
            "vi-VN",
            {
                style: "currency",
                currency: "VND",
                maximumFractionDigits:
                    0,
            }
        )
        .format(number);
};

const roleLabel = (
    role
) => {
    switch (role) {
        case "admin":
            return "Quản trị viên";

        case "customer":
            return "Khách hàng";

        default:
            return (
                role ||
                "Không xác định"
            );
    }
};

const statusLabel = (
    status
) => {
    switch (status) {
        case "active":
            return "Hoạt động";

        case "inactive":
            return "Không hoạt động";

        case "blocked":
            return "Đã khóa";

        default:
            return (
                status ||
                "Không xác định"
            );
    }
};

const normalizeListData = (
    rawData
) => {
    if (
        Array.isArray(
            rawData
        )
    ) {
        return {
            items: rawData,

            pagination: {
                page: 1,
                limit:
                    rawData.length ||
                    20,
                total:
                    rawData.length,
                totalPages: 1,
            },
        };
    }

    const items =
        rawData?.items ||
        rawData?.users ||
        rawData?.data ||
        [];

    const pagination =
        rawData?.pagination ||
        rawData?.meta ||
        {};

    const page =
        Number(
            pagination.page ||
            pagination.currentPage ||
            1
        );

    const limit =
        Number(
            pagination.limit ||
            pagination.pageSize ||
            20
        );

    const total =
        Number(
            pagination.total ||
            pagination.totalItems ||
            items.length ||
            0
        );

    const totalPages =
        Number(
            pagination.totalPages ||
            Math.max(
                1,
                Math.ceil(
                    total /
                    Math.max(
                        limit,
                        1
                    )
                )
            )
        );

    return {
        items:
            Array.isArray(items)
                ? items
                : [],

        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    };
};

// ============================================================
// PAGE
// ============================================================

function UserManagementPage() {
    // ========================================================
    // STATE
    // ========================================================

    const [
        users,
        setUsers,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        submittingId,
        setSubmittingId,
    ] = useState(null);

    const [
        filters,
        setFilters,
    ] = useState(
        DEFAULT_FILTERS
    );

    const [
        appliedSearch,
        setAppliedSearch,
    ] = useState("");

    const [
        pagination,
        setPagination,
    ] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
    });

    const [
        detailOpen,
        setDetailOpen,
    ] = useState(false);

    const [
        detailLoading,
        setDetailLoading,
    ] = useState(false);

    const [
        selectedUser,
        setSelectedUser,
    ] = useState(null);

    // ========================================================
    // LOAD USERS
    // ========================================================

    const loadUsers =
        useCallback(
            async (
                page = 1
            ) => {
                try {
                    setLoading(
                        true
                    );

                    const data =
                        await adminUserService
                            .getUsers({
                                page,
                                limit:
                                    pagination.limit,

                                search:
                                    appliedSearch ||
                                    undefined,

                                role:
                                    filters.role ||
                                    undefined,

                                status:
                                    filters.status ||
                                    undefined,

                                sort:
                                    filters.sort ||
                                    "newest",
                            });

                    const normalized =
                        normalizeListData(
                            data
                        );

                    setUsers(
                        normalized.items
                    );

                    setPagination(
                        normalized.pagination
                    );
                } catch (
                    error
                ) {
                    console.error(
                        "LOAD ADMIN USERS ERROR:",
                        error
                    );

                    toast.error(
                        getErrorMessage(
                            error,
                            "Không thể tải danh sách người dùng."
                        )
                    );
                } finally {
                    setLoading(
                        false
                    );
                }
            },
            [
                appliedSearch,
                filters.role,
                filters.status,
                filters.sort,
                pagination.limit,
            ]
        );

    useEffect(
        () => {
            loadUsers(1);
        },
        [
            loadUsers,
        ]
    );

    // ========================================================
    // FILTER
    // ========================================================

    const handleFilterChange =
        (
            event
        ) => {
            const {
                name,
                value,
            } =
                event.target;

            setFilters(
                (
                    previous
                ) => ({
                    ...previous,
                    [name]:
                        value,
                })
            );
        };

    const handleSearchSubmit =
        (
            event
        ) => {
            event.preventDefault();

            setAppliedSearch(
                filters.search.trim()
            );
        };

    const handleResetFilters =
        () => {
            setFilters(
                DEFAULT_FILTERS
            );

            setAppliedSearch(
                ""
            );
        };

    // ========================================================
    // STATUS
    // ========================================================

    const handleStatusChange =
        async (
            user,
            nextStatus
        ) => {
            if (
                !nextStatus ||
                nextStatus ===
                    user.status
            ) {
                return;
            }

            try {
                setSubmittingId(
                    user.id
                );

                const response =
                    await adminUserService
                        .updateStatus(
                            user.id,
                            nextStatus
                        );

                toast.success(
                    response?.message ||
                    "Cập nhật trạng thái thành công."
                );

                await loadUsers(
                    pagination.page
                );
            } catch (
                error
            ) {
                console.error(
                    "UPDATE USER STATUS ERROR:",
                    error
                );

                toast.error(
                    getErrorMessage(
                        error,
                        "Không thể cập nhật trạng thái."
                    )
                );
            } finally {
                setSubmittingId(
                    null
                );
            }
        };

    // ========================================================
    // ROLE
    // ========================================================

    const handleRoleChange =
        async (
            user,
            nextRole
        ) => {
            if (
                !nextRole ||
                nextRole ===
                    user.role
            ) {
                return;
            }

            try {
                setSubmittingId(
                    user.id
                );

                const response =
                    await adminUserService
                        .updateRole(
                            user.id,
                            nextRole
                        );

                toast.success(
                    response?.message ||
                    "Cập nhật vai trò thành công."
                );

                await loadUsers(
                    pagination.page
                );
            } catch (
                error
            ) {
                console.error(
                    "UPDATE USER ROLE ERROR:",
                    error
                );

                toast.error(
                    getErrorMessage(
                        error,
                        "Không thể cập nhật vai trò."
                    )
                );
            } finally {
                setSubmittingId(
                    null
                );
            }
        };

    // ========================================================
    // DETAIL
    // ========================================================

    const handleOpenDetail =
        async (
            user
        ) => {
            try {
                setSelectedUser(
                    user
                );

                setDetailOpen(
                    true
                );

                setDetailLoading(
                    true
                );

                const data =
                    await adminUserService
                        .getUser(
                            user.id
                        );

                setSelectedUser(
                    data ||
                    user
                );
            } catch (
                error
            ) {
                console.error(
                    "LOAD USER DETAIL ERROR:",
                    error
                );

                toast.error(
                    getErrorMessage(
                        error,
                        "Không thể tải chi tiết người dùng."
                    )
                );
            } finally {
                setDetailLoading(
                    false
                );
            }
        };

    const closeDetail =
        () => {
            setDetailOpen(
                false
            );

            setSelectedUser(
                null
            );
        };

    // ========================================================
    // DERIVED
    // ========================================================

    const adminCount =
        users.filter(
            (
                user
            ) =>
                user.role ===
                "admin"
        ).length;

    const customerCount =
        users.filter(
            (
                user
            ) =>
                user.role ===
                "customer"
        ).length;

    const blockedCount =
        users.filter(
            (
                user
            ) =>
                user.status ===
                "blocked"
        ).length;

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="user-management-page">
            {/* HEADER */}

            <section className="user-page-header">
                <div>
                    <div className="user-page-eyebrow">
                        QUẢN TRỊ HỆ THỐNG
                    </div>

                    <h1>
                        Quản lý người dùng
                    </h1>

                    <p>
                        Theo dõi tài khoản,
                        phân quyền và trạng
                        thái hoạt động của
                        người dùng.
                    </p>
                </div>

                <button
                    type="button"
                    className="user-refresh-button"
                    onClick={() =>
                        loadUsers(
                            pagination.page
                        )
                    }
                    disabled={
                        loading
                    }
                >
                    <FaRedo />

                    Làm mới
                </button>
            </section>

            {/* STAT CARDS */}

            <section className="user-stat-grid">
                <article className="user-stat-card">
                    <div className="user-stat-icon">
                        <FaUsers />
                    </div>

                    <div>
                        <span>
                            Tổng người dùng
                        </span>

                        <strong>
                            {
                                pagination.total
                            }
                        </strong>
                    </div>
                </article>

                <article className="user-stat-card">
                    <div className="user-stat-icon">
                        <FaShieldAlt />
                    </div>

                    <div>
                        <span>
                            Admin trang này
                        </span>

                        <strong>
                            {
                                adminCount
                            }
                        </strong>
                    </div>
                </article>

                <article className="user-stat-card">
                    <div className="user-stat-icon">
                        <FaUser />
                    </div>

                    <div>
                        <span>
                            Khách hàng trang này
                        </span>

                        <strong>
                            {
                                customerCount
                            }
                        </strong>
                    </div>
                </article>

                <article className="user-stat-card">
                    <div className="user-stat-icon user-stat-icon-danger">
                        <FaBan />
                    </div>

                    <div>
                        <span>
                            Đang bị khóa
                        </span>

                        <strong>
                            {
                                blockedCount
                            }
                        </strong>
                    </div>
                </article>
            </section>

            {/* FILTER */}

            <section className="user-filter-panel">
                <form
                    className="user-search-form"
                    onSubmit={
                        handleSearchSubmit
                    }
                >
                    <FaSearch />

                    <input
                        type="text"
                        name="search"
                        value={
                            filters.search
                        }
                        onChange={
                            handleFilterChange
                        }
                        placeholder="Tìm theo tên, email hoặc số điện thoại..."
                    />

                    <button
                        type="submit"
                    >
                        Tìm kiếm
                    </button>
                </form>

                <div className="user-filter-row">
                    <div className="user-filter-title">
                        <FaFilter />

                        Bộ lọc
                    </div>

                    <select
                        name="role"
                        value={
                            filters.role
                        }
                        onChange={
                            handleFilterChange
                        }
                    >
                        <option value="">
                            Tất cả vai trò
                        </option>

                        <option value="customer">
                            Khách hàng
                        </option>

                        <option value="admin">
                            Quản trị viên
                        </option>
                    </select>

                    <select
                        name="status"
                        value={
                            filters.status
                        }
                        onChange={
                            handleFilterChange
                        }
                    >
                        <option value="">
                            Tất cả trạng thái
                        </option>

                        <option value="active">
                            Hoạt động
                        </option>

                        <option value="inactive">
                            Không hoạt động
                        </option>

                        <option value="blocked">
                            Đã khóa
                        </option>
                    </select>

                    <select
                        name="sort"
                        value={
                            filters.sort
                        }
                        onChange={
                            handleFilterChange
                        }
                    >
                        <option value="newest">
                            Mới nhất
                        </option>

                        <option value="oldest">
                            Cũ nhất
                        </option>

                        <option value="name_asc">
                            Tên A → Z
                        </option>

                        <option value="name_desc">
                            Tên Z → A
                        </option>

                        <option value="email_asc">
                            Email A → Z
                        </option>

                        <option value="email_desc">
                            Email Z → A
                        </option>
                    </select>

                    <button
                        type="button"
                        className="user-reset-button"
                        onClick={
                            handleResetFilters
                        }
                    >
                        Đặt lại
                    </button>
                </div>
            </section>

            {/* TABLE */}

            <section className="user-table-card">
                <div className="user-table-header">
                    <div>
                        <h2>
                            Danh sách người dùng
                        </h2>

                        <p>
                            {
                                pagination.total
                            }{" "}
                            tài khoản trong hệ thống
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="user-loading">
                        <div className="spinner-border" />

                        <span>
                            Đang tải dữ liệu...
                        </span>
                    </div>
                ) : users.length ===
                  0 ? (
                    <div className="user-empty">
                        <FaUsers />

                        <h3>
                            Không tìm thấy người dùng
                        </h3>

                        <p>
                            Thử thay đổi từ khóa
                            hoặc bộ lọc.
                        </p>
                    </div>
                ) : (
                    <div className="user-table-wrapper">
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>
                                        Người dùng
                                    </th>

                                    <th>
                                        Liên hệ
                                    </th>

                                    <th>
                                        Vai trò
                                    </th>

                                    <th>
                                        Trạng thái
                                    </th>

                                    <th>
                                        Đơn hàng
                                    </th>

                                    <th>
                                        Đã chi
                                    </th>

                                    <th>
                                        Ngày tạo
                                    </th>

                                    <th className="user-action-heading">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {users.map(
                                    (
                                        user
                                    ) => {
                                        const statistics =
                                            user.statistics ||
                                            {};

                                        const avatar =
                                            getAvatarUrl(
                                                user.avatar
                                            );

                                        const disabled =
                                            submittingId ===
                                            user.id;

                                        return (
                                            <tr
                                                key={
                                                    user.id
                                                }
                                            >
                                                <td>
                                                    <div className="user-profile-cell">
                                                        <div className="user-avatar">
                                                            {avatar ? (
                                                                <img
                                                                    src={
                                                                        avatar
                                                                    }
                                                                    alt={
                                                                        getFullName(
                                                                            user
                                                                        )
                                                                    }
                                                                    onError={(
                                                                        event
                                                                    ) => {
                                                                        event.currentTarget.style.display =
                                                                            "none";
                                                                    }}
                                                                />
                                                            ) : null}

                                                            <span>
                                                                {getFullName(
                                                                    user
                                                                )
                                                                    .charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase()}
                                                            </span>
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {getFullName(
                                                                    user
                                                                )}
                                                            </strong>

                                                            <small>
                                                                ID #
                                                                {
                                                                    user.id
                                                                }
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="user-contact">
                                                        <span>
                                                            {
                                                                user.email
                                                            }
                                                        </span>

                                                        <small>
                                                            {user.phone ||
                                                                "Chưa có SĐT"}
                                                        </small>
                                                    </div>
                                                </td>

                                                <td>
                                                    <select
                                                        className={`user-role-select user-role-${user.role}`}
                                                        value={
                                                            user.role ||
                                                            "customer"
                                                        }
                                                        disabled={
                                                            disabled
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            handleRoleChange(
                                                                user,
                                                                event.target
                                                                    .value
                                                            )
                                                        }
                                                    >
                                                        <option value="customer">
                                                            Khách hàng
                                                        </option>

                                                        <option value="admin">
                                                            Admin
                                                        </option>
                                                    </select>
                                                </td>

                                                <td>
                                                    <select
                                                        className={`user-status-select user-status-${user.status}`}
                                                        value={
                                                            user.status ||
                                                            "active"
                                                        }
                                                        disabled={
                                                            disabled
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            handleStatusChange(
                                                                user,
                                                                event.target
                                                                    .value
                                                            )
                                                        }
                                                    >
                                                        <option value="active">
                                                            Hoạt động
                                                        </option>

                                                        <option value="inactive">
                                                            Không hoạt động
                                                        </option>

                                                        <option value="blocked">
                                                            Đã khóa
                                                        </option>
                                                    </select>
                                                </td>

                                                <td>
                                                    <div className="user-number-cell">
                                                        <strong>
                                                            {Number(
                                                                statistics.totalOrders ||
                                                                statistics.total_orders ||
                                                                0
                                                            )}
                                                        </strong>

                                                        <small>
                                                            {Number(
                                                                statistics.deliveredOrders ||
                                                                statistics.delivered_orders ||
                                                                0
                                                            )}{" "}
                                                            hoàn tất
                                                        </small>
                                                    </div>
                                                </td>

                                                <td>
                                                    <strong className="user-money">
                                                        {formatMoney(
                                                            statistics.totalSpent ||
                                                            statistics.total_spent ||
                                                            0
                                                        )}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span className="user-date">
                                                        {formatDate(
                                                            getCreatedAt(
                                                                user
                                                            )
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="user-view-button"
                                                        onClick={() =>
                                                            handleOpenDetail(
                                                                user
                                                            )
                                                        }
                                                    >
                                                        <FaEye />

                                                        Xem
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* PAGINATION */}

                {!loading &&
                    pagination.totalPages >
                        1 && (
                        <div className="user-pagination">
                            <button
                                type="button"
                                disabled={
                                    pagination.page <=
                                    1
                                }
                                onClick={() =>
                                    loadUsers(
                                        pagination.page -
                                            1
                                    )
                                }
                            >
                                ← Trước
                            </button>

                            <span>
                                Trang{" "}
                                <strong>
                                    {
                                        pagination.page
                                    }
                                </strong>{" "}
                                /{" "}
                                {
                                    pagination.totalPages
                                }
                            </span>

                            <button
                                type="button"
                                disabled={
                                    pagination.page >=
                                    pagination.totalPages
                                }
                                onClick={() =>
                                    loadUsers(
                                        pagination.page +
                                            1
                                    )
                                }
                            >
                                Sau →
                            </button>
                        </div>
                    )}
            </section>

            {/* DETAIL MODAL */}

            {detailOpen && (
                <div
                    className="user-modal-backdrop"
                    onMouseDown={
                        closeDetail
                    }
                >
                    <div
                        className="user-modal"
                        onMouseDown={(
                            event
                        ) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="user-modal-header">
                            <div>
                                <span>
                                    CHI TIẾT TÀI KHOẢN
                                </span>

                                <h2>
                                    {getFullName(
                                        selectedUser
                                    )}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeDetail
                                }
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {detailLoading ? (
                            <div className="user-modal-loading">
                                <div className="spinner-border" />

                                Đang tải...
                            </div>
                        ) : (
                            <UserDetailContent
                                data={
                                    selectedUser
                                }
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================================
// USER DETAIL
// ============================================================

function UserDetailContent({
    data,
}) {
    if (!data) {
        return null;
    }

    const profile =
        data.profile ||
        data.user ||
        data;

    const statistics =
        data.orderStatistics ||
        data.order_statistics ||
        profile.statistics ||
        {};

    const addresses =
        data.addresses ||
        [];

    const favoriteCount =
        Number(
            data.favoriteCount ??
            data.favorite_count ??
            0
        );

    const reviewStatistics =
        data.reviewStatistics ||
        data.review_statistics ||
        {};

    return (
        <div className="user-modal-body">
            <div className="user-detail-grid">
                <article>
                    <span>
                        Họ tên
                    </span>

                    <strong>
                        {getFullName(
                            profile
                        )}
                    </strong>
                </article>

                <article>
                    <span>
                        Email
                    </span>

                    <strong>
                        {profile.email ||
                            "—"}
                    </strong>
                </article>

                <article>
                    <span>
                        Số điện thoại
                    </span>

                    <strong>
                        {profile.phone ||
                            "—"}
                    </strong>
                </article>

                <article>
                    <span>
                        Vai trò
                    </span>

                    <strong>
                        {roleLabel(
                            profile.role
                        )}
                    </strong>
                </article>

                <article>
                    <span>
                        Trạng thái
                    </span>

                    <strong>
                        {statusLabel(
                            profile.status
                        )}
                    </strong>
                </article>

                <article>
                    <span>
                        Ngày tạo
                    </span>

                    <strong>
                        {formatDate(
                            getCreatedAt(
                                profile
                            )
                        )}
                    </strong>
                </article>
            </div>

            <div className="user-detail-summary">
                <div>
                    <span>
                        Tổng đơn
                    </span>

                    <strong>
                        {Number(
                            statistics.totalOrders ||
                            statistics.total_orders ||
                            0
                        )}
                    </strong>
                </div>

                <div>
                    <span>
                        Đơn hoàn tất
                    </span>

                    <strong>
                        {Number(
                            statistics.deliveredOrders ||
                            statistics.delivered_orders ||
                            0
                        )}
                    </strong>
                </div>

                <div>
                    <span>
                        Tổng chi tiêu
                    </span>

                    <strong>
                        {formatMoney(
                            statistics.totalSpent ||
                            statistics.total_spent ||
                            0
                        )}
                    </strong>
                </div>

                <div>
                    <span>
                        Yêu thích
                    </span>

                    <strong>
                        {
                            favoriteCount
                        }
                    </strong>
                </div>

                <div>
                    <span>
                        Đánh giá
                    </span>

                    <strong>
                        {Number(
                            reviewStatistics.total ||
                            reviewStatistics.totalReviews ||
                            0
                        )}
                    </strong>
                </div>
            </div>

            <div className="user-address-section">
                <h3>
                    Địa chỉ
                </h3>

                {addresses.length ===
                0 ? (
                    <p>
                        Người dùng chưa có
                        địa chỉ.
                    </p>
                ) : (
                    <div className="user-address-list">
                        {addresses.map(
                            (
                                address,
                                index
                            ) => (
                                <div
                                    key={
                                        address.id ||
                                        index
                                    }
                                    className="user-address-item"
                                >
                                    <FaCheckCircle />

                                    <div>
                                        <strong>
                                            {address.recipient_name ||
                                                address.recipientName ||
                                                address.full_name ||
                                                "Địa chỉ giao hàng"}
                                        </strong>

                                        <span>
                                            {[
                                                address.address_line ||
                                                    address.addressLine ||
                                                    address.address,
                                                address.ward,
                                                address.district,
                                                address.city ||
                                                    address.province,
                                            ]
                                                .filter(
                                                    Boolean
                                                )
                                                .join(
                                                    ", "
                                                ) ||
                                                "Chưa cập nhật địa chỉ"}
                                        </span>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserManagementPage;