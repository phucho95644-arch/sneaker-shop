import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    FaBoxOpen,
    FaCheck,
    FaEdit,
    FaImage,
    FaPlus,
    FaSearch,
    FaTags,
    FaTimes,
    FaTrash,
} from "react-icons/fa";

import {
    toast,
} from "react-toastify";

import adminBrandService
    from "../../services/adminBrandService";

import "./BrandManagementPage.css";

// ============================================================
// CONFIG
// ============================================================

const SERVER_URL =
    import.meta.env.VITE_SERVER_URL ||
    "http://localhost:5000";

// ============================================================
// DEFAULT FORM
// ============================================================

const INITIAL_FORM = {
    name: "",
    slug: "",
    logo: "",
    description: "",
    status: "active",
};

// ============================================================
// HELPERS
// ============================================================

const getApiMessage = (
    error,
    fallback
) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.msg ||
        error?.message ||
        fallback
    );
};

const slugify = (
    value
) => {
    return String(
        value || ""
    )
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim()
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        );
};

const resolveImageUrl = (
    value
) => {
    if (!value) {
        return "";
    }

    const image =
        String(
            value
        ).trim();

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

    if (
        image.startsWith("/")
    ) {
        return `${SERVER_URL}${image}`;
    }

    return `${SERVER_URL}/${image}`;
};

// ============================================================
// COMPONENT
// ============================================================

function BrandManagementPage() {
    // ========================================================
    // DATA
    // ========================================================

    const [
        brands,
        setBrands,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    // ========================================================
    // FILTER
    // ========================================================

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState("");

    // ========================================================
    // MODAL
    // ========================================================

    const [
        modalOpen,
        setModalOpen,
    ] = useState(false);

    const [
        modalMode,
        setModalMode,
    ] = useState(
        "create"
    );

    const [
        selectedBrand,
        setSelectedBrand,
    ] = useState(null);

    const [
        form,
        setForm,
    ] = useState(
        INITIAL_FORM
    );

    // ========================================================
    // ACTION STATES
    // ========================================================

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        changingStatusId,
        setChangingStatusId,
    ] = useState(null);

    const [
        deletingId,
        setDeletingId,
    ] = useState(null);

    // ========================================================
    // LOAD BRANDS
    // ========================================================

    const loadBrands =
        useCallback(
            async () => {
                try {
                    setLoading(
                        true
                    );

                    const data =
                        await adminBrandService
                            .getBrands();

                    setBrands(
                        Array.isArray(
                            data
                        )
                            ? data
                            : []
                    );
                } catch (
                    error
                ) {
                    console.error(
                        "LOAD BRANDS ERROR:",
                        error
                    );

                    setBrands(
                        []
                    );

                    toast.error(
                        getApiMessage(
                            error,
                            "Không thể tải danh sách thương hiệu."
                        )
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
            loadBrands();
        },
        [
            loadBrands,
        ]
    );

    // ========================================================
    // FILTERED BRANDS
    // ========================================================

    const filteredBrands =
        useMemo(
            () => {
                const keyword =
                    search
                        .trim()
                        .toLowerCase();

                return brands.filter(
                    (
                        brand
                    ) => {
                        if (
                            statusFilter &&
                            brand.status !==
                                statusFilter
                        ) {
                            return false;
                        }

                        if (
                            !keyword
                        ) {
                            return true;
                        }

                        const name =
                            String(
                                brand.name ||
                                    ""
                            )
                                .toLowerCase();

                        const slug =
                            String(
                                brand.slug ||
                                    ""
                            )
                                .toLowerCase();

                        const description =
                            String(
                                brand.description ||
                                    ""
                            )
                                .toLowerCase();

                        return (
                            name.includes(
                                keyword
                            ) ||
                            slug.includes(
                                keyword
                            ) ||
                            description.includes(
                                keyword
                            )
                        );
                    }
                );
            },
            [
                brands,
                search,
                statusFilter,
            ]
        );

    // ========================================================
    // STATISTICS
    // ========================================================

    const statistics =
        useMemo(
            () => {
                const total =
                    brands.length;

                const active =
                    brands.filter(
                        (
                            brand
                        ) =>
                            brand.status ===
                            "active"
                    ).length;

                const inactive =
                    brands.filter(
                        (
                            brand
                        ) =>
                            brand.status ===
                            "inactive"
                    ).length;

                const products =
                    brands.reduce(
                        (
                            totalCount,
                            brand
                        ) =>
                            totalCount +
                            Number(
                                brand.product_count ||
                                    0
                            ),
                        0
                    );

                return {
                    total,
                    active,
                    inactive,
                    products,
                };
            },
            [
                brands,
            ]
        );

    // ========================================================
    // OPEN CREATE MODAL
    // ========================================================

    const openCreateModal =
        () => {
            setModalMode(
                "create"
            );

            setSelectedBrand(
                null
            );

            setForm({
                ...INITIAL_FORM,
            });

            setModalOpen(
                true
            );
        };

    // ========================================================
    // OPEN EDIT MODAL
    // ========================================================

    const openEditModal =
        (
            brand
        ) => {
            setModalMode(
                "edit"
            );

            setSelectedBrand(
                brand
            );

            setForm({
                name:
                    brand.name ||
                    "",

                slug:
                    brand.slug ||
                    "",

                logo:
                    brand.logo ||
                    "",

                description:
                    brand.description ||
                    "",

                status:
                    brand.status ||
                    "active",
            });

            setModalOpen(
                true
            );
        };

    // ========================================================
    // CLOSE MODAL
    // ========================================================

    const closeModal =
        () => {
            if (
                saving
            ) {
                return;
            }

            setModalOpen(
                false
            );

            setSelectedBrand(
                null
            );

            setForm({
                ...INITIAL_FORM,
            });
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
                    previous
                ) => ({
                    ...previous,
                    [name]:
                        value,
                })
            );
        };

    // ========================================================
    // BRAND NAME CHANGE
    //
    // Khi tạo mới:
    // tự tạo slug từ name.
    //
    // Khi sửa:
    // giữ slug hiện tại để Admin chủ động thay đổi.
    // ========================================================

    const handleNameChange =
        (
            event
        ) => {
            const value =
                event.target
                    .value;

            setForm(
                (
                    previous
                ) => ({
                    ...previous,

                    name:
                        value,

                    slug:
                        modalMode ===
                        "create"
                            ? slugify(
                                  value
                              )
                            : previous.slug,
                })
            );
        };

    // ========================================================
    // SAVE BRAND
    // ========================================================

    const handleSubmit =
        async (
            event
        ) => {
            event.preventDefault();

            const name =
                form.name.trim();

            if (
                !name
            ) {
                toast.error(
                    "Vui lòng nhập tên thương hiệu."
                );

                return;
            }

            const payload = {
                name,

                slug:
                    form.slug.trim() ||
                    slugify(
                        name
                    ),

                logo:
                    form.logo.trim(),

                description:
                    form.description.trim(),

                status:
                    form.status,
            };

            try {
                setSaving(
                    true
                );

                if (
                    modalMode ===
                        "edit" &&
                    selectedBrand?.id
                ) {
                    const response =
                        await adminBrandService
                            .updateBrand(
                                selectedBrand.id,
                                payload
                            );

                    toast.success(
                        response?.message ||
                            "Cập nhật thương hiệu thành công."
                    );
                } else {
                    const response =
                        await adminBrandService
                            .createBrand(
                                payload
                            );

                    toast.success(
                        response?.message ||
                            "Thêm thương hiệu thành công."
                    );
                }

                setModalOpen(
                    false
                );

                setSelectedBrand(
                    null
                );

                setForm({
                    ...INITIAL_FORM,
                });

                await loadBrands();
            } catch (
                error
            ) {
                console.error(
                    "SAVE BRAND ERROR:",
                    error
                );

                toast.error(
                    getApiMessage(
                        error,
                        "Không thể lưu thương hiệu."
                    )
                );
            } finally {
                setSaving(
                    false
                );
            }
        };

    // ========================================================
    // CHANGE STATUS
    // ========================================================

    const handleStatusChange =
        async (
            brand,
            nextStatus
        ) => {
            if (
                brand.status ===
                nextStatus
            ) {
                return;
            }

            try {
                setChangingStatusId(
                    brand.id
                );

                const response =
                    await adminBrandService
                        .updateStatus(
                            brand.id,
                            nextStatus
                        );

                setBrands(
                    (
                        previous
                    ) =>
                        previous.map(
                            (
                                item
                            ) =>
                                item.id ===
                                brand.id
                                    ? {
                                          ...item,
                                          status:
                                              nextStatus,
                                      }
                                    : item
                        )
                );

                toast.success(
                    response?.message ||
                        "Cập nhật trạng thái thương hiệu thành công."
                );
            } catch (
                error
            ) {
                console.error(
                    "UPDATE BRAND STATUS ERROR:",
                    error
                );

                toast.error(
                    getApiMessage(
                        error,
                        "Không thể cập nhật trạng thái."
                    )
                );

                await loadBrands();
            } finally {
                setChangingStatusId(
                    null
                );
            }
        };

    // ========================================================
    // DELETE BRAND
    // ========================================================

    const handleDelete =
        async (
            brand
        ) => {
            const productCount =
                Number(
                    brand.product_count ||
                        0
                );

            if (
                productCount >
                0
            ) {
                toast.warning(
                    `Không thể xóa "${brand.name}" vì đang có ${productCount} sản phẩm sử dụng. Hãy chuyển thương hiệu sang trạng thái tạm ngừng.`
                );

                return;
            }

            const confirmed =
                window.confirm(
                    `Bạn có chắc muốn xóa thương hiệu "${brand.name}"?\n\nHành động này không thể hoàn tác.`
                );

            if (
                !confirmed
            ) {
                return;
            }

            try {
                setDeletingId(
                    brand.id
                );

                const response =
                    await adminBrandService
                        .deleteBrand(
                            brand.id
                        );

                setBrands(
                    (
                        previous
                    ) =>
                        previous.filter(
                            (
                                item
                            ) =>
                                item.id !==
                                brand.id
                        )
                );

                toast.success(
                    response?.message ||
                        "Xóa thương hiệu thành công."
                );
            } catch (
                error
            ) {
                console.error(
                    "DELETE BRAND ERROR:",
                    error
                );

                toast.error(
                    getApiMessage(
                        error,
                        "Không thể xóa thương hiệu."
                    )
                );
            } finally {
                setDeletingId(
                    null
                );
            }
        };

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="brand-admin-page">
            {/* ==================================================
                HEADER
            ================================================== */}

            <section className="brand-page-header">
                <div>
                    <span className="brand-eyebrow">
                        SNEAKER SHOP ADMIN
                    </span>

                    <h1>
                        Quản lý thương hiệu
                    </h1>

                    <p>
                        Quản lý các thương hiệu
                        giày, logo, trạng thái
                        và sản phẩm liên quan.
                    </p>
                </div>

                <button
                    type="button"
                    className="brand-create-btn"
                    onClick={
                        openCreateModal
                    }
                >
                    <FaPlus />

                    Thêm thương hiệu
                </button>
            </section>

            {/* ==================================================
                STATISTICS
            ================================================== */}

            <section className="brand-stat-grid">
                <article className="brand-stat-card">
                    <div className="brand-stat-icon">
                        <FaTags />
                    </div>

                    <div>
                        <span>
                            Tổng thương hiệu
                        </span>

                        <strong>
                            {
                                statistics.total
                            }
                        </strong>
                    </div>
                </article>

                <article className="brand-stat-card">
                    <div className="brand-stat-icon">
                        <FaCheck />
                    </div>

                    <div>
                        <span>
                            Hoạt động
                        </span>

                        <strong>
                            {
                                statistics.active
                            }
                        </strong>
                    </div>
                </article>

                <article className="brand-stat-card">
                    <div className="brand-stat-icon">
                        <FaTimes />
                    </div>

                    <div>
                        <span>
                            Tạm ngừng
                        </span>

                        <strong>
                            {
                                statistics.inactive
                            }
                        </strong>
                    </div>
                </article>

                <article className="brand-stat-card">
                    <div className="brand-stat-icon">
                        <FaBoxOpen />
                    </div>

                    <div>
                        <span>
                            Sản phẩm
                        </span>

                        <strong>
                            {
                                statistics.products
                            }
                        </strong>
                    </div>
                </article>
            </section>

            {/* ==================================================
                MAIN PANEL
            ================================================== */}

            <section className="brand-panel">
                {/* TOOLBAR */}

                <div className="brand-toolbar">
                    <label className="brand-search">
                        <FaSearch />

                        <input
                            type="text"
                            value={
                                search
                            }
                            onChange={(
                                event
                            ) =>
                                setSearch(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Tìm theo tên, slug, mô tả..."
                        />
                    </label>

                    <select
                        className="brand-filter"
                        value={
                            statusFilter
                        }
                        onChange={(
                            event
                        ) =>
                            setStatusFilter(
                                event.target
                                    .value
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
                    </select>
                </div>

                {/* LOADING */}

                {loading ? (
                    <div className="brand-state">
                        <div className="spinner-border spinner-border-sm" />

                        <strong>
                            Đang tải thương hiệu...
                        </strong>
                    </div>
                ) : filteredBrands.length ===
                  0 ? (
                    /* EMPTY */

                    <div className="brand-state">
                        <FaTags />

                        <strong>
                            Không tìm thấy thương hiệu
                        </strong>

                        <span>
                            Thử thay đổi từ khóa
                            hoặc bộ lọc.
                        </span>
                    </div>
                ) : (
                    /* TABLE */

                    <div className="brand-table-wrap">
                        <table className="brand-table">
                            <thead>
                                <tr>
                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Thương hiệu
                                    </th>

                                    <th>
                                        Slug
                                    </th>

                                    <th>
                                        Sản phẩm
                                    </th>

                                    <th>
                                        Trạng thái
                                    </th>

                                    <th className="brand-action-heading">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredBrands.map(
                                    (
                                        brand
                                    ) => {
                                        const logo =
                                            resolveImageUrl(
                                                brand.logo
                                            );

                                        const productCount =
                                            Number(
                                                brand.product_count ||
                                                    0
                                            );

                                        return (
                                            <tr
                                                key={
                                                    brand.id
                                                }
                                            >
                                                {/* ID */}

                                                <td>
                                                    <span className="brand-id">
                                                        #
                                                        {
                                                            brand.id
                                                        }
                                                    </span>
                                                </td>

                                                {/* BRAND */}

                                                <td>
                                                    <div className="brand-name-cell">
                                                        <div className="brand-logo">
                                                            {logo ? (
                                                                <img
                                                                    src={
                                                                        logo
                                                                    }
                                                                    alt={
                                                                        brand.name
                                                                    }
                                                                    loading="lazy"
                                                                    onError={(
                                                                        event
                                                                    ) => {
                                                                        event.currentTarget.style.display =
                                                                            "none";
                                                                    }}
                                                                />
                                                            ) : (
                                                                <FaImage />
                                                            )}
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {
                                                                    brand.name
                                                                }
                                                            </strong>

                                                            <span>
                                                                {brand.description ||
                                                                    "Chưa có mô tả"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* SLUG */}

                                                <td>
                                                    <code>
                                                        {
                                                            brand.slug
                                                        }
                                                    </code>
                                                </td>

                                                {/* PRODUCT COUNT */}

                                                <td>
                                                    <span className="brand-product-count">
                                                        {
                                                            productCount
                                                        }
                                                    </span>
                                                </td>

                                                {/* STATUS */}

                                                <td>
                                                    <select
                                                        className={`brand-status-select ${
                                                            brand.status ===
                                                            "active"
                                                                ? "brand-status-active"
                                                                : "brand-status-inactive"
                                                        }`}
                                                        value={
                                                            brand.status
                                                        }
                                                        disabled={
                                                            changingStatusId ===
                                                            brand.id
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            handleStatusChange(
                                                                brand,
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    >
                                                        <option value="active">
                                                            Hoạt động
                                                        </option>

                                                        <option value="inactive">
                                                            Tạm ngừng
                                                        </option>
                                                    </select>
                                                </td>

                                                {/* ACTION */}

                                                <td>
                                                    <div className="brand-actions">
                                                        <button
                                                            type="button"
                                                            className="brand-icon-btn edit"
                                                            title="Sửa thương hiệu"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    brand
                                                                )
                                                            }
                                                        >
                                                            <FaEdit />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="brand-icon-btn delete"
                                                            title={
                                                                productCount >
                                                                0
                                                                    ? `Đang có ${productCount} sản phẩm`
                                                                    : "Xóa thương hiệu"
                                                            }
                                                            disabled={
                                                                deletingId ===
                                                                brand.id
                                                            }
                                                            onClick={() =>
                                                                handleDelete(
                                                                    brand
                                                                )
                                                            }
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* ==================================================
                CREATE / EDIT MODAL
            ================================================== */}

            {modalOpen && (
                <div
                    className="brand-modal-backdrop"
                    onMouseDown={(
                        event
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }
                    }}
                >
                    <div className="brand-modal">
                        {/* HEADER */}

                        <div className="brand-modal-header">
                            <div>
                                <span>
                                    {modalMode ===
                                    "edit"
                                        ? "CHỈNH SỬA"
                                        : "TẠO MỚI"}
                                </span>

                                <h2>
                                    {modalMode ===
                                    "edit"
                                        ? "Sửa thương hiệu"
                                        : "Thêm thương hiệu"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="brand-modal-close"
                                onClick={
                                    closeModal
                                }
                                disabled={
                                    saving
                                }
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* FORM */}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >
                            <div className="brand-modal-body">
                                {/* NAME */}

                                <label className="brand-form-field">
                                    <span>
                                        Tên thương hiệu *
                                    </span>

                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            form.name
                                        }
                                        onChange={
                                            handleNameChange
                                        }
                                        placeholder="Ví dụ: Nike"
                                        maxLength={
                                            100
                                        }
                                        autoFocus
                                    />
                                </label>

                                {/* SLUG */}

                                <label className="brand-form-field">
                                    <span>
                                        Slug
                                    </span>

                                    <input
                                        type="text"
                                        name="slug"
                                        value={
                                            form.slug
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="nike"
                                        maxLength={
                                            150
                                        }
                                    />

                                    <small>
                                        Khi tạo mới,
                                        slug được tạo
                                        tự động từ tên.
                                        Bạn vẫn có thể
                                        chỉnh lại.
                                    </small>
                                </label>

                                {/* DESCRIPTION */}

                                <label className="brand-form-field">
                                    <span>
                                        Mô tả
                                    </span>

                                    <textarea
                                        name="description"
                                        rows="4"
                                        value={
                                            form.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Mô tả ngắn về thương hiệu..."
                                    />
                                </label>

                                {/* LOGO */}

                                <label className="brand-form-field">
                                    <span>
                                        Logo
                                    </span>

                                    <input
                                        type="text"
                                        name="logo"
                                        value={
                                            form.logo
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="/uploads/brands/nike.png hoặc URL ảnh"
                                        maxLength={
                                            500
                                        }
                                    />
                                </label>

                                {/* LOGO PREVIEW */}

                                {form.logo.trim() && (
                                    <div className="brand-image-preview">
                                        <img
                                            src={resolveImageUrl(
                                                form.logo
                                            )}
                                            alt="Xem trước logo thương hiệu"
                                            onError={(
                                                event
                                            ) => {
                                                event.currentTarget.style.display =
                                                    "none";
                                            }}
                                        />
                                    </div>
                                )}

                                {/* STATUS */}

                                <label className="brand-form-field">
                                    <span>
                                        Trạng thái
                                    </span>

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
                                    </select>
                                </label>
                            </div>

                            {/* FOOTER */}

                            <div className="brand-modal-footer">
                                <button
                                    type="button"
                                    className="brand-cancel-btn"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="brand-save-btn"
                                    disabled={
                                        saving
                                    }
                                >
                                    {saving
                                        ? "Đang lưu..."
                                        : modalMode ===
                                            "edit"
                                          ? "Lưu thay đổi"
                                          : "Tạo thương hiệu"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default
    BrandManagementPage;