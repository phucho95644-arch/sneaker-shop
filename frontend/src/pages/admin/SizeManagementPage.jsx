import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    FaEdit,
    FaPlus,
    FaSearch,
    FaTrash,
    FaTimes,
} from "react-icons/fa";

import {
    toast,
} from "react-toastify";

import adminSizeService
    from "../../services/adminSizeService";

import "./AttributeManagement.css";

// ============================================================
// HELPERS
// ============================================================

const normalizeSize = (
    item
) => ({
    ...item,

    id:
        item?.id,

    sizeName:
        item?.sizeName ??
        item?.size_name ??
        "",

    sortOrder:
        Number(
            item?.sortOrder ??
            item?.sort_order ??
            0
        ),

    status:
        item?.status ??
        "active",

    variantCount:
        Number(
            item?.variantCount ??
            item?.variant_count ??
            0
        ),
});

// ============================================================
// COMPONENT
// ============================================================

function SizeManagementPage() {
    const [
        sizes,
        setSizes,
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
        modalOpen,
        setModalOpen,
    ] = useState(false);

    const [
        editingSize,
        setEditingSize,
    ] = useState(null);

    const [
        form,
        setForm,
    ] = useState({
        sizeName: "",
        sortOrder: 0,
        status: "active",
    });

    // ========================================================
    // LOAD
    // ========================================================

    const loadSizes =
        async () => {
            try {
                setLoading(
                    true
                );

                const data =
                    await adminSizeService
                        .getSizes();

                setSizes(
                    data.map(
                        normalizeSize
                    )
                );
            } catch (error) {
                console.error(
                    "LOAD SIZES ERROR:",
                    error
                );

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                    "Không thể tải danh sách size."
                );
            } finally {
                setLoading(
                    false
                );
            }
        };

    useEffect(
        () => {
            loadSizes();
        },
        []
    );

    // ========================================================
    // FILTER
    // ========================================================

    const filteredSizes =
        useMemo(
            () => {
                const keyword =
                    search
                        .trim()
                        .toLowerCase();

                return sizes.filter(
                    (
                        item
                    ) => {
                        const matchSearch =
                            !keyword ||
                            String(
                                item.sizeName
                            )
                                .toLowerCase()
                                .includes(
                                    keyword
                                );

                        const matchStatus =
                            !statusFilter ||
                            item.status ===
                                statusFilter;

                        return (
                            matchSearch &&
                            matchStatus
                        );
                    }
                );
            },
            [
                sizes,
                search,
                statusFilter,
            ]
        );

    // ========================================================
    // MODAL
    // ========================================================

    const openCreate =
        () => {
            setEditingSize(
                null
            );

            setForm({
                sizeName: "",
                sortOrder:
                    sizes.length +
                    1,
                status:
                    "active",
            });

            setModalOpen(
                true
            );
        };

    const openEdit =
        (
            item
        ) => {
            setEditingSize(
                item
            );

            setForm({
                sizeName:
                    item.sizeName,

                sortOrder:
                    item.sortOrder,

                status:
                    item.status,
            });

            setModalOpen(
                true
            );
        };

    const closeModal =
        () => {
            if (saving) {
                return;
            }

            setModalOpen(
                false
            );

            setEditingSize(
                null
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
                    previous
                ) => ({
                    ...previous,

                    [name]:
                        name ===
                        "sortOrder"
                            ? Number(
                                  value
                              )
                            : value,
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

            const sizeName =
                form.sizeName
                    .trim();

            if (!sizeName) {
                toast.error(
                    "Vui lòng nhập tên size."
                );

                return;
            }

            try {
                setSaving(
                    true
                );

                const payload = {
                    sizeName,
                    sortOrder:
                        Number(
                            form.sortOrder
                        ) || 0,
                    status:
                        form.status,
                };

                if (
                    editingSize
                ) {
                    await adminSizeService
                        .updateSize(
                            editingSize.id,
                            payload
                        );

                    toast.success(
                        "Cập nhật size thành công."
                    );
                } else {
                    await adminSizeService
                        .createSize(
                            payload
                        );

                    toast.success(
                        "Thêm size thành công."
                    );
                }

                setModalOpen(
                    false
                );

                setEditingSize(
                    null
                );

                await loadSizes();
            } catch (error) {
                console.error(
                    "SAVE SIZE ERROR:",
                    error
                );

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                    "Không thể lưu size."
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

    const handleToggleStatus =
        async (
            item
        ) => {
            const nextStatus =
                item.status ===
                "active"
                    ? "inactive"
                    : "active";

            try {
                await adminSizeService
                    .updateStatus(
                        item.id,
                        nextStatus
                    );

                toast.success(
                    nextStatus ===
                        "active"
                        ? "Đã kích hoạt size."
                        : "Đã tạm ngừng size."
                );

                await loadSizes();
            } catch (error) {
                console.error(
                    "SIZE STATUS ERROR:",
                    error
                );

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                    "Không thể cập nhật trạng thái."
                );
            }
        };

    // ========================================================
    // DELETE
    // ========================================================

    const handleDelete =
        async (
            item
        ) => {
            if (
                !window.confirm(
                    `Xóa size "${item.sizeName}"?`
                )
            ) {
                return;
            }

            try {
                await adminSizeService
                    .deleteSize(
                        item.id
                    );

                toast.success(
                    "Xóa size thành công."
                );

                await loadSizes();
            } catch (error) {
                console.error(
                    "DELETE SIZE ERROR:",
                    error
                );

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                    "Không thể xóa size."
                );
            }
        };

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="attribute-admin-page">
            <div className="attribute-page-header">
                <div>
                    <h1>
                        Quản lý Size
                    </h1>

                    <p>
                        Quản lý kích thước giày
                        và thứ tự hiển thị.
                    </p>
                </div>

                <button
                    type="button"
                    className="attribute-primary-btn"
                    onClick={
                        openCreate
                    }
                >
                    <FaPlus />

                    Thêm size
                </button>
            </div>

            <div className="attribute-summary-grid">
                <div className="attribute-summary-card">
                    <span>
                        Tổng size
                    </span>

                    <strong>
                        {
                            sizes.length
                        }
                    </strong>
                </div>

                <div className="attribute-summary-card">
                    <span>
                        Hoạt động
                    </span>

                    <strong>
                        {
                            sizes.filter(
                                (
                                    item
                                ) =>
                                    item.status ===
                                    "active"
                            ).length
                        }
                    </strong>
                </div>

                <div className="attribute-summary-card">
                    <span>
                        Tạm ngừng
                    </span>

                    <strong>
                        {
                            sizes.filter(
                                (
                                    item
                                ) =>
                                    item.status ===
                                    "inactive"
                            ).length
                        }
                    </strong>
                </div>
            </div>

            <div className="attribute-toolbar">
                <div className="attribute-search-box">
                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Tìm size..."
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
                    />
                </div>

                <select
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

            <div className="attribute-table-card">
                {loading ? (
                    <div className="attribute-state">
                        Đang tải dữ liệu...
                    </div>
                ) : filteredSizes.length ===
                  0 ? (
                    <div className="attribute-state">
                        Không có size phù hợp.
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="attribute-table">
                            <thead>
                                <tr>
                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Size
                                    </th>

                                    <th>
                                        Thứ tự
                                    </th>

                                    <th>
                                        Biến thể
                                    </th>

                                    <th>
                                        Trạng thái
                                    </th>

                                    <th className="attribute-actions-heading">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredSizes.map(
                                    (
                                        item
                                    ) => (
                                        <tr
                                            key={
                                                item.id
                                            }
                                        >
                                            <td>
                                                #
                                                {
                                                    item.id
                                                }
                                            </td>

                                            <td>
                                                <strong className="attribute-name">
                                                    {
                                                        item.sizeName
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                {
                                                    item.sortOrder
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.variantCount
                                                }
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className={`attribute-status ${
                                                        item.status ===
                                                        "active"
                                                            ? "active"
                                                            : "inactive"
                                                    }`}
                                                    onClick={() =>
                                                        handleToggleStatus(
                                                            item
                                                        )
                                                    }
                                                >
                                                    {item.status ===
                                                    "active"
                                                        ? "Hoạt động"
                                                        : "Tạm ngừng"}
                                                </button>
                                            </td>

                                            <td>
                                                <div className="attribute-actions">
                                                    <button
                                                        type="button"
                                                        className="attribute-icon-btn edit"
                                                        title="Sửa"
                                                        onClick={() =>
                                                            openEdit(
                                                                item
                                                            )
                                                        }
                                                    >
                                                        <FaEdit />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="attribute-icon-btn delete"
                                                        title="Xóa"
                                                        onClick={() =>
                                                            handleDelete(
                                                                item
                                                            )
                                                        }
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modalOpen && (
                <div
                    className="attribute-modal-backdrop"
                    onMouseDown={
                        closeModal
                    }
                >
                    <div
                        className="attribute-modal"
                        onMouseDown={(
                            event
                        ) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="attribute-modal-header">
                            <div>
                                <h2>
                                    {editingSize
                                        ? "Cập nhật size"
                                        : "Thêm size"}
                                </h2>

                                <p>
                                    Nhập thông tin
                                    kích thước giày.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="attribute-modal-close"
                                onClick={
                                    closeModal
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
                            <div className="attribute-modal-body">
                                <div className="attribute-form-group">
                                    <label>
                                        Tên size
                                        <span>
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        name="sizeName"
                                        value={
                                            form.sizeName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Ví dụ: 42"
                                        maxLength={
                                            20
                                        }
                                    />
                                </div>

                                <div className="attribute-form-group">
                                    <label>
                                        Thứ tự
                                    </label>

                                    <input
                                        type="number"
                                        name="sortOrder"
                                        value={
                                            form.sortOrder
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min="0"
                                    />
                                </div>

                                <div className="attribute-form-group">
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
                                    </select>
                                </div>
                            </div>

                            <div className="attribute-modal-footer">
                                <button
                                    type="button"
                                    className="attribute-secondary-btn"
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
                                    className="attribute-primary-btn"
                                    disabled={
                                        saving
                                    }
                                >
                                    {saving
                                        ? "Đang lưu..."
                                        : editingSize
                                          ? "Lưu thay đổi"
                                          : "Thêm size"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SizeManagementPage;