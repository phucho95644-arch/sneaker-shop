import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    toast,
} from "react-toastify";

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

import adminCategoryService
    from "../../services/adminCategoryService";

import "./CategoryManagementPage.css";

// ============================================================
// CONFIG
// ============================================================

const SERVER_URL =
    import.meta.env
        .VITE_SERVER_URL ||
    "http://localhost:5000";

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

const resolveImageUrl = (
    image
) => {
    if (!image) {
        return "";
    }

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

const initialForm = {
    name: "",
    slug: "",
    description: "",
    image: "",
    status: "active",
};

// ============================================================
// COMPONENT
// ============================================================

function CategoryManagementPage() {
    // ========================================================
    // DATA
    // ========================================================

    const [
        categories,
        setCategories,
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
        selectedCategory,
        setSelectedCategory,
    ] = useState(null);

    const [
        form,
        setForm,
    ] = useState(
        initialForm
    );

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
    // LOAD
    // ========================================================

    const loadCategories =
        useCallback(
            async () => {
                try {
                    setLoading(
                        true
                    );

                    const data =
                        await adminCategoryService
                            .getCategories();

                    setCategories(
                        data
                    );
                } catch (
                    error
                ) {
                    console.error(
                        "LOAD CATEGORIES ERROR:",
                        error
                    );

                    toast.error(
                        getApiMessage(
                            error,
                            "Không thể tải danh sách danh mục."
                        )
                    );

                    setCategories(
                        []
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
            loadCategories();
        },
        [
            loadCategories,
        ]
    );

    // ========================================================
    // FILTERED DATA
    // ========================================================

    const filteredCategories =
        useMemo(
            () => {
                const keyword =
                    search
                        .trim()
                        .toLowerCase();

                return categories
                    .filter(
                        (
                            category
                        ) => {
                            if (
                                statusFilter &&
                                category.status !==
                                    statusFilter
                            ) {
                                return false;
                            }

                            if (
                                !keyword
                            ) {
                                return true;
                            }

                            return (
                                String(
                                    category.name ||
                                        ""
                                )
                                    .toLowerCase()
                                    .includes(
                                        keyword
                                    ) ||
                                String(
                                    category.slug ||
                                        ""
                                )
                                    .toLowerCase()
                                    .includes(
                                        keyword
                                    ) ||
                                String(
                                    category.description ||
                                        ""
                                )
                                    .toLowerCase()
                                    .includes(
                                        keyword
                                    )
                            );
                        }
                    );
            },
            [
                categories,
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
                    categories.length;

                const active =
                    categories.filter(
                        (
                            item
                        ) =>
                            item.status ===
                            "active"
                    ).length;

                const inactive =
                    categories.filter(
                        (
                            item
                        ) =>
                            item.status ===
                            "inactive"
                    ).length;

                const products =
                    categories.reduce(
                        (
                            totalCount,
                            item
                        ) =>
                            totalCount +
                            Number(
                                item.product_count ||
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
                categories,
            ]
        );

    // ========================================================
    // CREATE MODAL
    // ========================================================

    const openCreateModal =
        () => {
            setModalMode(
                "create"
            );

            setSelectedCategory(
                null
            );

            setForm(
                initialForm
            );

            setModalOpen(
                true
            );
        };

    // ========================================================
    // EDIT MODAL
    // ========================================================

    const openEditModal =
        (
            category
        ) => {
            setModalMode(
                "edit"
            );

            setSelectedCategory(
                category
            );

            setForm({
                name:
                    category.name ||
                    "",

                slug:
                    category.slug ||
                    "",

                description:
                    category.description ||
                    "",

                image:
                    category.image ||
                    "",

                status:
                    category.status ||
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

            setSelectedCategory(
                null
            );

            setForm(
                initialForm
            );
        };

    // ========================================================
    // CHANGE FORM
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
    // NAME CHANGE
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
    // SAVE
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
                    "Vui lòng nhập tên danh mục."
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

                description:
                    form.description
                        .trim(),

                image:
                    form.image.trim(),

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
                    selectedCategory
                        ?.id
                ) {
                    const response =
                        await adminCategoryService
                            .updateCategory(
                                selectedCategory
                                    .id,
                                payload
                            );

                    toast.success(
                        response?.message ||
                            "Cập nhật danh mục thành công."
                    );
                } else {
                    const response =
                        await adminCategoryService
                            .createCategory(
                                payload
                            );

                    toast.success(
                        response?.message ||
                            "Thêm danh mục thành công."
                    );
                }

                setModalOpen(
                    false
                );

                setSelectedCategory(
                    null
                );

                setForm(
                    initialForm
                );

                await loadCategories();
            } catch (
                error
            ) {
                console.error(
                    "SAVE CATEGORY ERROR:",
                    error
                );

                toast.error(
                    getApiMessage(
                        error,
                        "Không thể lưu danh mục."
                    )
                );
            } finally {
                setSaving(
                    false
                );
            }
        };

    // ========================================================
    // STATUS
    // ========================================================

    const handleStatusChange =
        async (
            category,
            nextStatus
        ) => {
            if (
                category.status ===
                nextStatus
            ) {
                return;
            }

            try {
                setChangingStatusId(
                    category.id
                );

                const response =
                    await adminCategoryService
                        .updateStatus(
                            category.id,
                            nextStatus
                        );

                setCategories(
                    (
                        previous
                    ) =>
                        previous.map(
                            (
                                item
                            ) =>
                                item.id ===
                                category.id
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
                        "Cập nhật trạng thái thành công."
                );
            } catch (
                error
            ) {
                console.error(
                    "UPDATE CATEGORY STATUS ERROR:",
                    error
                );

                toast.error(
                    getApiMessage(
                        error,
                        "Không thể cập nhật trạng thái."
                    )
                );
            } finally {
                setChangingStatusId(
                    null
                );
            }
        };

    // ========================================================
    // DELETE
    // ========================================================

    const handleDelete =
        async (
            category
        ) => {
            const productCount =
                Number(
                    category.product_count ||
                        0
                );

            if (
                productCount >
                0
            ) {
                toast.warning(
                    `Danh mục đang có ${productCount} sản phẩm. Hãy chuyển sang trạng thái tạm ngừng thay vì xóa.`
                );

                return;
            }

            const confirmed =
                window.confirm(
                    `Bạn có chắc muốn xóa danh mục "${category.name}"?\n\nHành động này không thể hoàn tác.`
                );

            if (
                !confirmed
            ) {
                return;
            }

            try {
                setDeletingId(
                    category.id
                );

                const response =
                    await adminCategoryService
                        .deleteCategory(
                            category.id
                        );

                toast.success(
                    response?.message ||
                        "Xóa danh mục thành công."
                );

                setCategories(
                    (
                        previous
                    ) =>
                        previous.filter(
                            (
                                item
                            ) =>
                                item.id !==
                                category.id
                        )
                );
            } catch (
                error
            ) {
                console.error(
                    "DELETE CATEGORY ERROR:",
                    error
                );

                toast.error(
                    getApiMessage(
                        error,
                        "Không thể xóa danh mục."
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
        <div className="category-admin-page">
            {/* HEADER */}

            <section className="category-page-header">
                <div>
                    <span className="category-eyebrow">
                        SNEAKER SHOP ADMIN
                    </span>

                    <h1>
                        Quản lý danh mục
                    </h1>

                    <p>
                        Quản lý nhóm sản phẩm,
                        trạng thái và số lượng
                        sản phẩm theo danh mục.
                    </p>
                </div>

                <button
                    type="button"
                    className="category-create-btn"
                    onClick={
                        openCreateModal
                    }
                >
                    <FaPlus />

                    Thêm danh mục
                </button>
            </section>

            {/* STATISTICS */}

            <section className="category-stat-grid">
                <article className="category-stat-card">
                    <div className="category-stat-icon">
                        <FaTags />
                    </div>

                    <div>
                        <span>
                            Tổng danh mục
                        </span>

                        <strong>
                            {
                                statistics.total
                            }
                        </strong>
                    </div>
                </article>

                <article className="category-stat-card">
                    <div className="category-stat-icon">
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

                <article className="category-stat-card">
                    <div className="category-stat-icon">
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

                <article className="category-stat-card">
                    <div className="category-stat-icon">
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

            {/* PANEL */}

            <section className="category-panel">
                <div className="category-toolbar">
                    <label className="category-search">
                        <FaSearch />

                        <input
                            value={
                                search
                            }
                            onChange={(
                                event
                            ) =>
                                setSearch(
                                    event
                                        .target
                                        .value
                                )
                            }
                            placeholder="Tìm theo tên, slug, mô tả..."
                        />
                    </label>

                    <select
                        className="category-filter"
                        value={
                            statusFilter
                        }
                        onChange={(
                            event
                        ) =>
                            setStatusFilter(
                                event
                                    .target
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

                {loading ? (
                    <div className="category-state">
                        <div className="spinner-border spinner-border-sm" />

                        <strong>
                            Đang tải danh mục...
                        </strong>
                    </div>
                ) : filteredCategories
                      .length ===
                  0 ? (
                    <div className="category-state">
                        <FaTags />

                        <strong>
                            Không tìm thấy danh mục
                        </strong>

                        <span>
                            Thử thay đổi từ khóa
                            hoặc bộ lọc.
                        </span>
                    </div>
                ) : (
                    <div className="category-table-wrap">
                        <table className="category-table">
                            <thead>
                                <tr>
                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Danh mục
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

                                    <th className="category-action-heading">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredCategories.map(
                                    (
                                        category
                                    ) => {
                                        const image =
                                            resolveImageUrl(
                                                category.image
                                            );

                                        return (
                                            <tr
                                                key={
                                                    category.id
                                                }
                                            >
                                                <td>
                                                    <span className="category-id">
                                                        #
                                                        {
                                                            category.id
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="category-name-cell">
                                                        <div className="category-thumb">
                                                            {image ? (
                                                                <img
                                                                    src={
                                                                        image
                                                                    }
                                                                    alt={
                                                                        category.name
                                                                    }
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
                                                                    category.name
                                                                }
                                                            </strong>

                                                            <span>
                                                                {category.description ||
                                                                    "Chưa có mô tả"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <code>
                                                        {
                                                            category.slug
                                                        }
                                                    </code>
                                                </td>

                                                <td>
                                                    <span className="category-product-count">
                                                        {Number(
                                                            category.product_count ||
                                                                0
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <select
                                                        className={`category-status-select ${
                                                            category.status ===
                                                            "active"
                                                                ? "category-status-active"
                                                                : "category-status-inactive"
                                                        }`}
                                                        value={
                                                            category.status
                                                        }
                                                        disabled={
                                                            changingStatusId ===
                                                            category.id
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            handleStatusChange(
                                                                category,
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

                                                <td>
                                                    <div className="category-actions">
                                                        <button
                                                            type="button"
                                                            className="category-icon-btn edit"
                                                            title="Sửa danh mục"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    category
                                                                )
                                                            }
                                                        >
                                                            <FaEdit />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="category-icon-btn delete"
                                                            title="Xóa danh mục"
                                                            disabled={
                                                                deletingId ===
                                                                category.id
                                                            }
                                                            onClick={() =>
                                                                handleDelete(
                                                                    category
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

            {/* MODAL */}

            {modalOpen && (
                <div
                    className="category-modal-backdrop"
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
                    <div className="category-modal">
                        <div className="category-modal-header">
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
                                        ? "Sửa danh mục"
                                        : "Thêm danh mục"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="category-modal-close"
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

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >
                            <div className="category-modal-body">
                                <label className="category-form-field">
                                    <span>
                                        Tên danh mục *
                                    </span>

                                    <input
                                        name="name"
                                        value={
                                            form.name
                                        }
                                        onChange={
                                            handleNameChange
                                        }
                                        placeholder="Ví dụ: Running"
                                    />
                                </label>

                                <label className="category-form-field">
                                    <span>
                                        Slug
                                    </span>

                                    <input
                                        name="slug"
                                        value={
                                            form.slug
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="running"
                                    />

                                    <small>
                                        Có thể để trống
                                        để hệ thống tự
                                        tạo.
                                    </small>
                                </label>

                                <label className="category-form-field">
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
                                        placeholder="Mô tả ngắn về danh mục..."
                                    />
                                </label>

                                <label className="category-form-field">
                                    <span>
                                        Hình ảnh
                                    </span>

                                    <input
                                        name="image"
                                        value={
                                            form.image
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="/uploads/categories/running.jpg hoặc URL ảnh"
                                    />
                                </label>

                                {form.image && (
                                    <div className="category-image-preview">
                                        <img
                                            src={resolveImageUrl(
                                                form.image
                                            )}
                                            alt="Xem trước danh mục"
                                            onError={(
                                                event
                                            ) => {
                                                event.currentTarget.style.display =
                                                    "none";
                                            }}
                                        />
                                    </div>
                                )}

                                <label className="category-form-field">
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

                            <div className="category-modal-footer">
                                <button
                                    type="button"
                                    className="category-cancel-btn"
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
                                    className="category-save-btn"
                                    disabled={
                                        saving
                                    }
                                >
                                    {saving
                                        ? "Đang lưu..."
                                        : modalMode ===
                                            "edit"
                                          ? "Lưu thay đổi"
                                          : "Tạo danh mục"}
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
    CategoryManagementPage;