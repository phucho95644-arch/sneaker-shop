import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    FaCheckCircle,
    FaClock,
    FaEdit,
    FaMoneyBillWave,
    FaPercent,
    FaPlus,
    FaPowerOff,
    FaSave,
    FaSearch,
    FaSyncAlt,
    FaTicketAlt,
    FaTimes,
} from "react-icons/fa";

import {
    toast,
} from "react-toastify";

import adminCouponService
    from "../../services/adminCouponService";

import "./CouponManagementPage.css";

// ============================================================
// EMPTY FORM
// ============================================================

const EMPTY_FORM = {
    code: "",
    description: "",
    discountType: "percent",
    discountValue: "",
    minimumOrder: "",
    maximumDiscount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    status: "active",
};

// ============================================================
// HELPERS
// ============================================================

const normalizeCoupon = (
    coupon
) => ({
    id:
        coupon.id,

    code:
        coupon.code ??
        "",

    description:
        coupon.description ??
        "",

    discountType:
        coupon.discountType ??
        coupon.discount_type ??
        "percent",

    discountValue:
        Number(
            coupon.discountValue ??
            coupon.discount_value ??
            0
        ),

    minimumOrder:
        coupon.minimumOrder ??
        coupon.minimum_order ??
        "",

    maximumDiscount:
        coupon.maximumDiscount ??
        coupon.maximum_discount ??
        "",

    startDate:
        coupon.startDate ??
        coupon.start_date ??
        null,

    endDate:
        coupon.endDate ??
        coupon.end_date ??
        null,

    usageLimit:
        coupon.usageLimit ??
        coupon.usage_limit ??
        null,

    usedCount:
        Number(
            coupon.usedCount ??
            coupon.used_count ??
            0
        ),

    status:
        coupon.status ??
        "active",

    createdAt:
        coupon.createdAt ??
        coupon.created_at ??
        null,
});

const formatCurrency = (
    value
) => {
    const number =
        Number(value || 0);

    return new Intl.NumberFormat(
        "vi-VN",
        {
            style: "currency",
            currency: "VND",
        }
    ).format(number);
};

const formatDate = (
    value
) => {
    if (!value) {
        return "Không giới hạn";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }

    return date.toLocaleString(
        "vi-VN"
    );
};

const toInputDateTime = (
    value
) => {
    if (!value) {
        return "";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    const pad = (
        number
    ) =>
        String(number)
            .padStart(
                2,
                "0"
            );

    return (
        `${date.getFullYear()}-` +
        `${pad(
            date.getMonth() + 1
        )}-` +
        `${pad(
            date.getDate()
        )}T` +
        `${pad(
            date.getHours()
        )}:` +
        `${pad(
            date.getMinutes()
        )}`
    );
};

const getDiscountText = (
    coupon
) => {
    if (
        coupon.discountType ===
        "percent"
    ) {
        return `${coupon.discountValue}%`;
    }

    return formatCurrency(
        coupon.discountValue
    );
};

// ============================================================
// PAGE
// ============================================================

function CouponManagementPage() {
    const [
        coupons,
        setCoupons,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState("");

    const [
        typeFilter,
        setTypeFilter,
    ] = useState("");

    const [
        showModal,
        setShowModal,
    ] = useState(false);

    const [
        editingCoupon,
        setEditingCoupon,
    ] = useState(null);

    const [
        form,
        setForm,
    ] = useState(
        EMPTY_FORM
    );

    // ========================================================
    // LOAD
    // ========================================================

    const loadCoupons =
        useCallback(
            async () => {
                try {
                    setLoading(
                        true
                    );

                    const data =
                        await adminCouponService
                            .getCoupons();

                    setCoupons(
                        data.map(
                            normalizeCoupon
                        )
                    );
                } catch (
                    error
                ) {
                    console.error(
                        "LOAD COUPONS ERROR:",
                        error
                    );

                    toast.error(
                        error.response
                            ?.data
                            ?.message ||
                        "Không thể tải danh sách mã giảm giá."
                    );
                } finally {
                    setLoading(
                        false
                    );
                }
            },
            []
        );

    useEffect(
        () => {
            loadCoupons();
        },
        [
            loadCoupons,
        ]
    );

    // ========================================================
    // FILTER
    // ========================================================

    const filteredCoupons =
        useMemo(
            () => {
                const keyword =
                    search
                        .trim()
                        .toLowerCase();

                return coupons.filter(
                    (
                        coupon
                    ) => {
                        const matchSearch =
                            !keyword ||
                            coupon.code
                                .toLowerCase()
                                .includes(
                                    keyword
                                ) ||
                            coupon.description
                                .toLowerCase()
                                .includes(
                                    keyword
                                );

                        const matchStatus =
                            !statusFilter ||
                            coupon.status ===
                                statusFilter;

                        const matchType =
                            !typeFilter ||
                            coupon.discountType ===
                                typeFilter;

                        return (
                            matchSearch &&
                            matchStatus &&
                            matchType
                        );
                    }
                );
            },
            [
                coupons,
                search,
                statusFilter,
                typeFilter,
            ]
        );

    // ========================================================
    // STATS
    // ========================================================

    const stats =
        useMemo(
            () => ({
                total:
                    coupons.length,

                active:
                    coupons.filter(
                        (
                            item
                        ) =>
                            item.status ===
                            "active"
                    ).length,

                percent:
                    coupons.filter(
                        (
                            item
                        ) =>
                            item.discountType ===
                            "percent"
                    ).length,

                fixed:
                    coupons.filter(
                        (
                            item
                        ) =>
                            item.discountType ===
                            "fixed"
                    ).length,
            }),
            [
                coupons,
            ]
        );

    // ========================================================
    // OPEN CREATE
    // ========================================================

    const openCreate =
        () => {
            setEditingCoupon(
                null
            );

            setForm(
                EMPTY_FORM
            );

            setShowModal(
                true
            );
        };

    // ========================================================
    // OPEN EDIT
    // ========================================================

    const openEdit =
        (
            coupon
        ) => {
            setEditingCoupon(
                coupon
            );

            setForm({
                code:
                    coupon.code,

                description:
                    coupon.description,

                discountType:
                    coupon.discountType,

                discountValue:
                    coupon.discountValue,

                minimumOrder:
                    coupon.minimumOrder ??
                    "",

                maximumDiscount:
                    coupon.maximumDiscount ??
                    "",

                startDate:
                    toInputDateTime(
                        coupon.startDate
                    ),

                endDate:
                    toInputDateTime(
                        coupon.endDate
                    ),

                usageLimit:
                    coupon.usageLimit ??
                    "",

                status:
                    coupon.status,
            });

            setShowModal(
                true
            );
        };

    // ========================================================
    // FORM CHANGE
    // ========================================================

    const handleChange =
        (
            event
        ) => {
            const {
                name,
                value,
            } =
                event.target;

            setForm(
                (
                    current
                ) => ({
                    ...current,

                    [name]:
                        name ===
                        "code"
                            ? value
                                  .toUpperCase()
                                  .replace(
                                      /[^A-Z0-9_-]/g,
                                      ""
                                  )
                            : value,
                })
            );
        };

    // ========================================================
    // BUILD PAYLOAD
    // ========================================================

    const buildPayload =
        () => {
            const payload = {
                description:
                    form.description
                        .trim(),

                discountType:
                    form.discountType,

                discountValue:
                    Number(
                        form.discountValue
                    ),
            };

            if (
                !editingCoupon
            ) {
                payload.code =
                    form.code
                        .trim()
                        .toUpperCase();

                payload.status =
                    form.status;
            }

            if (
                form.minimumOrder !==
                ""
            ) {
                payload.minimumOrder =
                    Number(
                        form.minimumOrder
                    );
            }

            if (
                form.maximumDiscount !==
                ""
            ) {
                payload.maximumDiscount =
                    Number(
                        form.maximumDiscount
                    );
            }

            if (
                form.usageLimit !==
                ""
            ) {
                payload.usageLimit =
                    Number(
                        form.usageLimit
                    );
            }

            if (
                form.startDate
            ) {
                payload.startDate =
                    new Date(
                        form.startDate
                    ).toISOString();
            }

            if (
                form.endDate
            ) {
                payload.endDate =
                    new Date(
                        form.endDate
                    ).toISOString();
            }

            return payload;
        };

    // ========================================================
    // SUBMIT
    // ========================================================

    const handleSubmit =
        async (
            event
        ) => {
            event.preventDefault();

            const code =
                form.code
                    .trim();

            if (
                !editingCoupon &&
                (
                    code.length < 3 ||
                    code.length > 50
                )
            ) {
                toast.error(
                    "Mã giảm giá phải từ 3 đến 50 ký tự."
                );

                return;
            }

            if (
                !form.discountValue ||
                Number(
                    form.discountValue
                ) <= 0
            ) {
                toast.error(
                    "Giá trị giảm phải lớn hơn 0."
                );

                return;
            }

            if (
                form.discountType ===
                    "percent" &&
                Number(
                    form.discountValue
                ) > 100
            ) {
                toast.error(
                    "Phần trăm giảm không được lớn hơn 100%."
                );

                return;
            }

            if (
                form.startDate &&
                form.endDate &&
                new Date(
                    form.endDate
                ) <=
                    new Date(
                        form.startDate
                    )
            ) {
                toast.error(
                    "Ngày kết thúc phải sau ngày bắt đầu."
                );

                return;
            }

            try {
                setSaving(
                    true
                );

                const payload =
                    buildPayload();

                if (
                    editingCoupon
                ) {
                    await adminCouponService
                        .updateCoupon(
                            editingCoupon.id,
                            payload
                        );

                    toast.success(
                        "Cập nhật mã giảm giá thành công."
                    );
                } else {
                    await adminCouponService
                        .createCoupon(
                            payload
                        );

                    toast.success(
                        "Thêm mã giảm giá thành công."
                    );
                }

                setShowModal(
                    false
                );

                setEditingCoupon(
                    null
                );

                await loadCoupons();
            } catch (
                error
            ) {
                console.error(
                    "SAVE COUPON ERROR:",
                    error
                );

                const errors =
                    error.response
                        ?.data
                        ?.errors;

                if (
                    Array.isArray(
                        errors
                    ) &&
                    errors.length
                ) {
                    toast.error(
                        errors[0]
                            ?.msg ||
                        "Dữ liệu mã giảm giá không hợp lệ."
                    );
                } else {
                    toast.error(
                        error.response
                            ?.data
                            ?.message ||
                        "Không thể lưu mã giảm giá."
                    );
                }
            } finally {
                setSaving(
                    false
                );
            }
        };

    // ========================================================
    // CHANGE STATUS
    // ========================================================

    const handleStatus =
        async (
            coupon
        ) => {
            const nextStatus =
                coupon.status ===
                "active"
                    ? "inactive"
                    : "active";

            try {
                await adminCouponService
                    .updateStatus(
                        coupon.id,
                        nextStatus
                    );

                toast.success(
                    nextStatus ===
                        "active"
                        ? "Đã kích hoạt mã giảm giá."
                        : "Đã tạm ngừng mã giảm giá."
                );

                await loadCoupons();
            } catch (
                error
            ) {
                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                    "Không thể cập nhật trạng thái."
                );
            }
        };

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="coupon-page">
            <div className="coupon-page-header">
                <div>
                    <span className="coupon-eyebrow">
                        QUẢN LÝ KHUYẾN MÃI
                    </span>

                    <h1>
                        Quản lý mã giảm giá
                    </h1>

                    <p>
                        Tạo và quản lý các chương trình giảm giá
                        dành cho khách hàng.
                    </p>
                </div>

                <button
                    type="button"
                    className="coupon-add-button"
                    onClick={
                        openCreate
                    }
                >
                    <FaPlus />

                    Thêm mã giảm giá
                </button>
            </div>

            <div className="coupon-stats-grid">
                <div className="coupon-stat-card">
                    <div className="coupon-stat-icon">
                        <FaTicketAlt />
                    </div>

                    <div>
                        <span>
                            Tổng mã giảm giá
                        </span>

                        <strong>
                            {
                                stats.total
                            }
                        </strong>
                    </div>
                </div>

                <div className="coupon-stat-card">
                    <div className="coupon-stat-icon active">
                        <FaCheckCircle />
                    </div>

                    <div>
                        <span>
                            Đang hoạt động
                        </span>

                        <strong>
                            {
                                stats.active
                            }
                        </strong>
                    </div>
                </div>

                <div className="coupon-stat-card">
                    <div className="coupon-stat-icon percent">
                        <FaPercent />
                    </div>

                    <div>
                        <span>
                            Giảm theo %
                        </span>

                        <strong>
                            {
                                stats.percent
                            }
                        </strong>
                    </div>
                </div>

                <div className="coupon-stat-card">
                    <div className="coupon-stat-icon fixed">
                        <FaMoneyBillWave />
                    </div>

                    <div>
                        <span>
                            Giảm cố định
                        </span>

                        <strong>
                            {
                                stats.fixed
                            }
                        </strong>
                    </div>
                </div>
            </div>

            <div className="coupon-panel">
                <div className="coupon-toolbar">
                    <div className="coupon-search">
                        <FaSearch />

                        <input
                            type="text"
                            value={
                                search
                            }
                            onChange={
                                (
                                    event
                                ) =>
                                    setSearch(
                                        event.target.value
                                    )
                            }
                            placeholder="Tìm theo mã hoặc mô tả..."
                        />
                    </div>

                    <select
                        value={
                            statusFilter
                        }
                        onChange={
                            (
                                event
                            ) =>
                                setStatusFilter(
                                    event.target.value
                                )
                        }
                    >
                        <option value="">
                            Tất cả trạng thái
                        </option>

                        <option value="active">
                            Hoạt động
                        </option>

                        <option value="inactive">
                            Tạm ngừng
                        </option>

                        <option value="expired">
                            Hết hạn
                        </option>
                    </select>

                    <select
                        value={
                            typeFilter
                        }
                        onChange={
                            (
                                event
                            ) =>
                                setTypeFilter(
                                    event.target.value
                                )
                        }
                    >
                        <option value="">
                            Tất cả loại giảm
                        </option>

                        <option value="percent">
                            Phần trăm
                        </option>

                        <option value="fixed">
                            Số tiền cố định
                        </option>
                    </select>

                    <button
                        type="button"
                        className="coupon-refresh-button"
                        onClick={
                            loadCoupons
                        }
                    >
                        <FaSyncAlt />

                        Làm mới
                    </button>
                </div>

                <div className="coupon-table-wrapper">
                    <table className="coupon-table">
                        <thead>
                            <tr>
                                <th>
                                    Mã
                                </th>

                                <th>
                                    Khuyến mãi
                                </th>

                                <th>
                                    Điều kiện
                                </th>

                                <th>
                                    Sử dụng
                                </th>

                                <th>
                                    Thời hạn
                                </th>

                                <th>
                                    Trạng thái
                                </th>

                                <th>
                                    Thao tác
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="coupon-empty"
                                    >
                                        Đang tải mã giảm giá...
                                    </td>
                                </tr>
                            ) : filteredCoupons.length ===
                              0 ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="coupon-empty"
                                    >
                                        <FaTicketAlt />

                                        <strong>
                                            Chưa có mã giảm giá
                                        </strong>

                                        <span>
                                            Tạo mã giảm giá đầu tiên
                                            cho cửa hàng.
                                        </span>
                                    </td>
                                </tr>
                            ) : (
                                filteredCoupons.map(
                                    (
                                        coupon
                                    ) => (
                                        <tr
                                            key={
                                                coupon.id
                                            }
                                        >
                                            <td>
                                                <span className="coupon-code">
                                                    {
                                                        coupon.code
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <strong className="coupon-discount">
                                                    {getDiscountText(
                                                        coupon
                                                    )}
                                                </strong>

                                                <span className="coupon-description">
                                                    {coupon.description ||
                                                        "Không có mô tả"}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="coupon-condition">
                                                    <span>
                                                        Đơn tối thiểu
                                                    </span>

                                                    <strong>
                                                        {coupon.minimumOrder
                                                            ? formatCurrency(
                                                                  coupon.minimumOrder
                                                              )
                                                            : "Không yêu cầu"}
                                                    </strong>
                                                </div>

                                                {coupon.maximumDiscount && (
                                                    <small>
                                                        Tối đa:{" "}
                                                        {formatCurrency(
                                                            coupon.maximumDiscount
                                                        )}
                                                    </small>
                                                )}
                                            </td>

                                            <td>
                                                <strong>
                                                    {
                                                        coupon.usedCount
                                                    }
                                                </strong>

                                                <span className="coupon-muted">
                                                    {" "}
                                                    /{" "}
                                                    {coupon.usageLimit ||
                                                        "∞"}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="coupon-date">
                                                    <FaClock />

                                                    <div>
                                                        <span>
                                                            {formatDate(
                                                                coupon.startDate
                                                            )}
                                                        </span>

                                                        <small>
                                                            đến{" "}
                                                            {formatDate(
                                                                coupon.endDate
                                                            )}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <span
                                                    className={`coupon-status coupon-status--${coupon.status}`}
                                                >
                                                    {coupon.status ===
                                                    "active"
                                                        ? "Hoạt động"
                                                        : coupon.status ===
                                                            "expired"
                                                          ? "Hết hạn"
                                                          : "Tạm ngừng"}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="coupon-actions">
                                                    <button
                                                        type="button"
                                                        title="Chỉnh sửa"
                                                        onClick={() =>
                                                            openEdit(
                                                                coupon
                                                            )
                                                        }
                                                    >
                                                        <FaEdit />
                                                    </button>

                                                    {coupon.status !==
                                                        "expired" && (
                                                        <button
                                                            type="button"
                                                            title={
                                                                coupon.status ===
                                                                "active"
                                                                    ? "Tạm ngừng"
                                                                    : "Kích hoạt"
                                                            }
                                                            className={
                                                                coupon.status ===
                                                                "active"
                                                                    ? "danger"
                                                                    : "success"
                                                            }
                                                            onClick={() =>
                                                                handleStatus(
                                                                    coupon
                                                                )
                                                            }
                                                        >
                                                            <FaPowerOff />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="coupon-table-footer">
                    Hiển thị{" "}
                    <strong>
                        {
                            filteredCoupons.length
                        }
                    </strong>{" "}
                    /{" "}
                    <strong>
                        {
                            coupons.length
                        }
                    </strong>{" "}
                    mã giảm giá
                </div>
            </div>

            {showModal && (
                <div className="coupon-modal-backdrop">
                    <div className="coupon-modal">
                        <div className="coupon-modal-header">
                            <div>
                                <span>
                                    {editingCoupon
                                        ? "CHỈNH SỬA"
                                        : "TẠO MỚI"}
                                </span>

                                <h2>
                                    {editingCoupon
                                        ? "Cập nhật mã giảm giá"
                                        : "Thêm mã giảm giá"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowModal(
                                        false
                                    )
                                }
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >
                            <div className="coupon-modal-body">
                                <div className="coupon-form-group coupon-form-full">
                                    <label>
                                        Mã giảm giá
                                    </label>

                                    <input
                                        type="text"
                                        name="code"
                                        value={
                                            form.code
                                        }
                                        disabled={
                                            Boolean(
                                                editingCoupon
                                            )
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength="50"
                                        placeholder="VD: SALE20"
                                    />

                                    <small>
                                        Chỉ dùng chữ in hoa, số, dấu -
                                        và _
                                    </small>
                                </div>

                                <div className="coupon-form-group coupon-form-full">
                                    <label>
                                        Mô tả
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            form.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows="3"
                                        placeholder="Mô tả chương trình khuyến mãi..."
                                    />
                                </div>

                                <div className="coupon-form-group">
                                    <label>
                                        Loại giảm giá
                                    </label>

                                    <select
                                        name="discountType"
                                        value={
                                            form.discountType
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >
                                        <option value="percent">
                                            Phần trăm (%)
                                        </option>

                                        <option value="fixed">
                                            Số tiền cố định
                                        </option>
                                    </select>
                                </div>

                                <div className="coupon-form-group">
                                    <label>
                                        Giá trị giảm
                                    </label>

                                    <input
                                        type="number"
                                        name="discountValue"
                                        value={
                                            form.discountValue
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min="0.01"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className="coupon-form-group">
                                    <label>
                                        Đơn hàng tối thiểu
                                    </label>

                                    <input
                                        type="number"
                                        name="minimumOrder"
                                        value={
                                            form.minimumOrder
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min="0"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="coupon-form-group">
                                    <label>
                                        Giảm tối đa
                                    </label>

                                    <input
                                        type="number"
                                        name="maximumDiscount"
                                        value={
                                            form.maximumDiscount
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min="0"
                                        placeholder="Không giới hạn"
                                    />
                                </div>

                                <div className="coupon-form-group">
                                    <label>
                                        Ngày bắt đầu
                                    </label>

                                    <input
                                        type="datetime-local"
                                        name="startDate"
                                        value={
                                            form.startDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />
                                </div>

                                <div className="coupon-form-group">
                                    <label>
                                        Ngày kết thúc
                                    </label>

                                    <input
                                        type="datetime-local"
                                        name="endDate"
                                        value={
                                            form.endDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />
                                </div>

                                <div className="coupon-form-group">
                                    <label>
                                        Giới hạn lượt dùng
                                    </label>

                                    <input
                                        type="number"
                                        name="usageLimit"
                                        value={
                                            form.usageLimit
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min="1"
                                        placeholder="Không giới hạn"
                                    />
                                </div>

                                {!editingCoupon && (
                                    <div className="coupon-form-group">
                                        <label>
                                            Trạng thái
                                        </label>

                                        <select
                                            name="status"
                                            value={
                                                form.status
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        >
                                            <option value="active">
                                                Hoạt động
                                            </option>

                                            <option value="inactive">
                                                Tạm ngừng
                                            </option>

                                            <option value="expired">
                                                Hết hạn
                                            </option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="coupon-modal-footer">
                                <button
                                    type="button"
                                    className="coupon-cancel-button"
                                    onClick={() =>
                                        setShowModal(
                                            false
                                        )
                                    }
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="coupon-save-button"
                                    disabled={
                                        saving
                                    }
                                >
                                    <FaSave />

                                    {saving
                                        ? "Đang lưu..."
                                        : editingCoupon
                                          ? "Lưu thay đổi"
                                          : "Tạo mã giảm giá"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CouponManagementPage;