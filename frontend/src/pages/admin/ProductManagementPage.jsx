import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    FaBoxOpen,
    FaCheckCircle,
    FaEdit,
    FaExclamationTriangle,
    FaPlus,
    FaSearch,
    FaStar,
    FaSyncAlt,
    FaTags,
} from "react-icons/fa";

import {
    toast,
} from "react-toastify";

import adminProductService
    from "../../services/adminProductService";

import "./ProductManagementPage.css";

// ============================================================
// HELPERS
// ============================================================

const formatCurrency = (
    value
) => {
    const number =
        Number(
            value || 0
        );

    return new Intl.NumberFormat(
        "vi-VN",
        {
            style:
                "currency",

            currency:
                "VND",
        }
    ).format(
        number
    );
};

const getStatusInfo = (
    status
) => {
    switch (
        status
    ) {
        case "active":
            return {
                label:
                    "Đang bán",

                className:
                    "bg-success-subtle text-success",
            };

        case "inactive":
            return {
                label:
                    "Ngừng bán",

                className:
                    "bg-danger-subtle text-danger",
            };

        case "draft":
            return {
                label:
                    "Bản nháp",

                className:
                    "bg-warning-subtle text-warning-emphasis",
            };

        default:
            return {
                label:
                    status ||
                    "Không xác định",

                className:
                    "bg-secondary-subtle text-secondary",
            };
    }
};

// ============================================================
// COMPONENT
// ============================================================

function ProductManagementPage() {
    // ========================================================
    // STATE
    // ========================================================

    const [
        products,
        setProducts,
    ] =
        useState(
            []
        );

    const [
        loading,
        setLoading,
    ] =
        useState(
            true
        );

    const [
        refreshing,
        setRefreshing,
    ] =
        useState(
            false
        );

    const [
        error,
        setError,
    ] =
        useState(
            ""
        );

    const [
        search,
        setSearch,
    ] =
        useState(
            ""
        );

    const [
        status,
        setStatus,
    ] =
        useState(
            ""
        );

    const [
        changingStatusId,
        setChangingStatusId,
    ] =
        useState(
            null
        );

    // ========================================================
    // LOAD PRODUCTS
    // ========================================================

    const fetchProducts =
        useCallback(
            async (
                showLoading =
                    true
            ) => {
                try {
                    if (
                        showLoading
                    ) {
                        setLoading(
                            true
                        );
                    } else {
                        setRefreshing(
                            true
                        );
                    }

                    setError(
                        ""
                    );

                    const data =
                        await adminProductService
                            .getProducts();

                    setProducts(
                        Array.isArray(
                            data
                        )
                            ? data
                            : []
                    );
                } catch (
                    requestError
                ) {
                    console.error(
                        "GET ADMIN PRODUCTS ERROR:",
                        requestError
                    );

                    const message =
                        requestError
                            ?.response
                            ?.data
                            ?.message ||
                        requestError
                            ?.message ||
                        "Không thể tải danh sách sản phẩm.";

                    setError(
                        message
                    );

                    setProducts(
                        []
                    );
                } finally {
                    setLoading(
                        false
                    );

                    setRefreshing(
                        false
                    );
                }
            },
            []
        );

    useEffect(
        () => {
            fetchProducts();
        },
        [
            fetchProducts,
        ]
    );

    // ========================================================
    // FILTER
    // ========================================================

    const filteredProducts =
        useMemo(
            () => {
                const keyword =
                    search
                        .trim()
                        .toLowerCase();

                return products.filter(
                    (
                        product
                    ) => {
                        const matchSearch =
                            !keyword ||
                            String(
                                product
                                    ?.name ||
                                    ""
                            )
                                .toLowerCase()
                                .includes(
                                    keyword
                                ) ||
                            String(
                                product
                                    ?.sku ||
                                    ""
                            )
                                .toLowerCase()
                                .includes(
                                    keyword
                                ) ||
                            String(
                                product
                                    ?.brand_name ||
                                    ""
                            )
                                .toLowerCase()
                                .includes(
                                    keyword
                                ) ||
                            String(
                                product
                                    ?.category_name ||
                                    ""
                            )
                                .toLowerCase()
                                .includes(
                                    keyword
                                );

                        const matchStatus =
                            !status ||
                            product
                                ?.status ===
                                status;

                        return (
                            matchSearch &&
                            matchStatus
                        );
                    }
                );
            },
            [
                products,
                search,
                status,
            ]
        );

    // ========================================================
    // STATISTICS
    // ========================================================

    const statistics =
        useMemo(
            () => {
                const total =
                    products.length;

                const active =
                    products.filter(
                        (
                            item
                        ) =>
                            item
                                ?.status ===
                            "active"
                    ).length;

                const draft =
                    products.filter(
                        (
                            item
                        ) =>
                            item
                                ?.status ===
                            "draft"
                    ).length;

                const featured =
                    products.filter(
                        (
                            item
                        ) =>
                            Boolean(
                                Number(
                                    item
                                        ?.is_featured ||
                                        0
                                )
                            )
                    ).length;

                return {
                    total,
                    active,
                    draft,
                    featured,
                };
            },
            [
                products,
            ]
        );

    // ========================================================
    // STATUS
    // ========================================================

    const handleStatusChange =
        async (
            product,
            nextStatus
        ) => {
            if (
                !product?.id ||
                !nextStatus ||
                product.status ===
                    nextStatus
            ) {
                return;
            }

            try {
                setChangingStatusId(
                    product.id
                );

                await adminProductService
                    .updateStatus(
                        product.id,
                        nextStatus
                    );

                setProducts(
                    (
                        current
                    ) =>
                        current.map(
                            (
                                item
                            ) =>
                                item.id ===
                                product.id
                                    ? {
                                          ...item,

                                          status:
                                              nextStatus,
                                      }
                                    : item
                        )
                );

                toast.success(
                    "Cập nhật trạng thái sản phẩm thành công."
                );
            } catch (
                requestError
            ) {
                console.error(
                    "UPDATE PRODUCT STATUS ERROR:",
                    requestError
                );

                toast.error(
                    requestError
                        ?.response
                        ?.data
                        ?.message ||
                        "Không thể cập nhật trạng thái."
                );
            } finally {
                setChangingStatusId(
                    null
                );
            }
        };

    // ========================================================
    // LOADING
    // ========================================================

    if (
        loading
    ) {
        return (
            <div className="container-fluid py-4 px-4">
                <div
                    className="d-flex flex-column align-items-center justify-content-center"
                    style={{
                        minHeight:
                            "500px",
                    }}
                >
                    <div
                        className="spinner-border text-warning"
                        role="status"
                    />

                    <div className="mt-3 text-secondary">
                        Đang tải danh sách sản phẩm...
                    </div>
                </div>
            </div>
        );
    }

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="container-fluid py-4 px-4">
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                <div>
                    <div
                        className="fw-bold text-uppercase mb-1"
                        style={{
                            color:
                                "#ff5a1f",

                            fontSize:
                                "12px",

                            letterSpacing:
                                "1px",
                        }}
                    >
                        Sneaker Shop Admin
                    </div>

                    <h2 className="fw-bold mb-1">
                        Quản lý sản phẩm
                    </h2>

                    <p className="text-secondary mb-0">
                        Quản lý sản phẩm, giá bán, tồn kho và trạng thái hiển thị.
                    </p>
                </div>

                <Link
                    to="/admin/products/create"
                    className="btn btn-dark d-flex align-items-center gap-2 fw-semibold"
                >
                    <FaPlus />

                    Thêm sản phẩm
                </Link>
            </div>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div
                                className="d-flex align-items-center justify-content-center rounded-3"
                                style={{
                                    width:
                                        "48px",

                                    height:
                                        "48px",

                                    background:
                                        "#fff1e8",

                                    color:
                                        "#ff5a1f",
                                }}
                            >
                                <FaBoxOpen />
                            </div>

                            <div>
                                <div className="text-secondary small">
                                    Tổng sản phẩm
                                </div>

                                <div className="fs-4 fw-bold">
                                    {
                                        statistics.total
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div
                                className="d-flex align-items-center justify-content-center rounded-3 bg-success-subtle text-success"
                                style={{
                                    width:
                                        "48px",

                                    height:
                                        "48px",
                                }}
                            >
                                <FaCheckCircle />
                            </div>

                            <div>
                                <div className="text-secondary small">
                                    Đang bán
                                </div>

                                <div className="fs-4 fw-bold">
                                    {
                                        statistics.active
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div
                                className="d-flex align-items-center justify-content-center rounded-3 bg-warning-subtle text-warning-emphasis"
                                style={{
                                    width:
                                        "48px",

                                    height:
                                        "48px",
                                }}
                            >
                                <FaTags />
                            </div>

                            <div>
                                <div className="text-secondary small">
                                    Bản nháp
                                </div>

                                <div className="fs-4 fw-bold">
                                    {
                                        statistics.draft
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div
                                className="d-flex align-items-center justify-content-center rounded-3"
                                style={{
                                    width:
                                        "48px",

                                    height:
                                        "48px",

                                    background:
                                        "#fef3c7",

                                    color:
                                        "#d97706",
                                }}
                            >
                                <FaStar />
                            </div>

                            <div>
                                <div className="text-secondary small">
                                    Nổi bật
                                </div>

                                <div className="fs-4 fw-bold">
                                    {
                                        statistics.featured
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3 align-items-center">
                        <div className="col-12 col-lg-7">
                            <div className="input-group">
                                <span className="input-group-text bg-white">
                                    <FaSearch />
                                </span>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Tìm theo tên, SKU, thương hiệu, danh mục..."
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
                        </div>

                        <div className="col-12 col-md-6 col-lg-3">
                            <select
                                className="form-select"
                                value={
                                    status
                                }
                                onChange={(
                                    event
                                ) =>
                                    setStatus(
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
                                    Đang bán
                                </option>

                                <option value="inactive">
                                    Ngừng bán
                                </option>

                                <option value="draft">
                                    Bản nháp
                                </option>
                            </select>
                        </div>

                        <div className="col-12 col-md-6 col-lg-2">
                            <button
                                type="button"
                                className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                                onClick={() =>
                                    fetchProducts(
                                        false
                                    )
                                }
                                disabled={
                                    refreshing
                                }
                            >
                                <FaSyncAlt
                                    className={
                                        refreshing
                                            ? "fa-spin"
                                            : ""
                                    }
                                />

                                Làm mới
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2">
                    <FaExclamationTriangle />

                    <span>
                        {
                            error
                        }
                    </span>
                </div>
            )}

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="card border-0 shadow-sm overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="px-4 py-3">
                                    Sản phẩm
                                </th>

                                <th>
                                    SKU
                                </th>

                                <th>
                                    Danh mục
                                </th>

                                <th>
                                    Thương hiệu
                                </th>

                                <th>
                                    Giá
                                </th>

                                <th className="text-center">
                                    Tồn kho
                                </th>

                                <th>
                                    Trạng thái
                                </th>

                                <th className="text-end pe-4">
                                    Hành động
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredProducts.length ===
                            0 ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="text-center py-5 text-secondary"
                                    >
                                        <FaBoxOpen
                                            size={
                                                35
                                            }
                                            className="mb-3"
                                        />

                                        <div>
                                            Không tìm thấy sản phẩm.
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map(
                                    (
                                        product
                                    ) => {
                                        const statusInfo =
                                            getStatusInfo(
                                                product.status
                                            );

                                        return (
                                            <tr
                                                key={
                                                    product.id
                                                }
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div
                                                            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                                                            style={{
                                                                width:
                                                                    "52px",

                                                                height:
                                                                    "52px",

                                                                background:
                                                                    "#f3f4f6",

                                                                overflow:
                                                                    "hidden",
                                                            }}
                                                        >
                                                            {product.thumbnail ? (
                                                                <img
                                                                    src={
                                                                        product.thumbnail
                                                                    }
                                                                    alt={
                                                                        product.name
                                                                    }
                                                                    style={{
                                                                        width:
                                                                            "100%",

                                                                        height:
                                                                            "100%",

                                                                        objectFit:
                                                                            "cover",
                                                                    }}
                                                                    onError={(
                                                                        event
                                                                    ) => {
                                                                        event.currentTarget.style.display =
                                                                            "none";
                                                                    }}
                                                                />
                                                            ) : (
                                                                <FaBoxOpen className="text-secondary" />
                                                            )}
                                                        </div>

                                                        <div>
                                                            <div className="fw-bold text-dark">
                                                                {
                                                                    product.name
                                                                }
                                                            </div>

                                                            <div className="small text-secondary">
                                                                ID #
                                                                {
                                                                    product.id
                                                                }

                                                                {Boolean(
                                                                    Number(
                                                                        product.is_featured ||
                                                                            0
                                                                    )
                                                                ) && (
                                                                    <span className="ms-2 text-warning">
                                                                        <FaStar />{" "}
                                                                        Nổi bật
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="font-monospace small">
                                                        {product.sku ||
                                                            "—"}
                                                    </span>
                                                </td>

                                                <td>
                                                    {product.category_name ||
                                                        "—"}
                                                </td>

                                                <td>
                                                    {product.brand_name ||
                                                        "—"}
                                                </td>

                                                <td>
                                                    <div className="fw-semibold">
                                                        {formatCurrency(
                                                            product.sale_price ??
                                                                product.price
                                                        )}
                                                    </div>

                                                    {product.sale_price !==
                                                        null &&
                                                        product.sale_price !==
                                                            undefined && (
                                                            <small className="text-secondary text-decoration-line-through">
                                                                {formatCurrency(
                                                                    product.price
                                                                )}
                                                            </small>
                                                        )}
                                                </td>

                                                <td className="text-center">
                                                    <span
                                                        className={`badge ${
                                                            Number(
                                                                product.total_stock ||
                                                                    0
                                                            ) >
                                                            0
                                                                ? "bg-success-subtle text-success"
                                                                : "bg-danger-subtle text-danger"
                                                        }`}
                                                    >
                                                        {Number(
                                                            product.total_stock ||
                                                                0
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <select
                                                        className={`form-select form-select-sm ${statusInfo.className}`}
                                                        value={
                                                            product.status ||
                                                            "active"
                                                        }
                                                        style={{
                                                            minWidth:
                                                                "120px",
                                                        }}
                                                        disabled={
                                                            changingStatusId ===
                                                            product.id
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            handleStatusChange(
                                                                product,
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    >
                                                        <option value="active">
                                                            Đang bán
                                                        </option>

                                                        <option value="inactive">
                                                            Ngừng bán
                                                        </option>

                                                        <option value="draft">
                                                            Bản nháp
                                                        </option>
                                                    </select>
                                                </td>

                                                <td className="text-end pe-4">
                                                    <Link
                                                        to={`/admin/products/${product.id}/edit`}
                                                        className="btn btn-sm btn-outline-dark d-inline-flex align-items-center gap-2"
                                                    >
                                                        <FaEdit />

                                                        Sửa
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="text-secondary small mt-3">
                Hiển thị{" "}
                <strong>
                    {
                        filteredProducts.length
                    }
                </strong>{" "}
                /{" "}
                <strong>
                    {
                        products.length
                    }
                </strong>{" "}
                sản phẩm.
            </div>
        </div>
    );
}

export default ProductManagementPage;