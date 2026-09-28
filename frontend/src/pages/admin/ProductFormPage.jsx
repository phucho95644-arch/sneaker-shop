import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    FaArrowLeft,
    FaBox,
    FaImage,
    FaPlus,
    FaSave,
    FaTrash,
} from "react-icons/fa";

import {
    toast,
} from "react-toastify";

import adminProductService
    from "../../services/adminProductService";

import "./ProductFormPage.css";

const SERVER_URL =
    import.meta.env
        .VITE_SERVER_URL ||
    "http://localhost:5000";

// ============================================================
// HELPERS
// ============================================================

const createEmptyVariant =
    () => ({
        id: null,

        sizeId: "",
        colorId: "",

        sku: "",

        priceAdjustment:
            0,

        stockQuantity:
            0,

        status:
            "active",
    });

const createEmptyImage =
    (
        isMain = false
    ) => ({
        imageUrl: "",
        isMain,
        sortOrder: 0,
    });

const initialForm = {
    name: "",
    slug: "",
    sku: "",

    categoryId: "",
    brandId: "",

    price: "",
    salePrice: "",

    gender:
        "unisex",

    status:
        "active",

    isFeatured:
        false,

    thumbnail: "",

    shortDescription:
        "",

    description:
        "",
};

const imageUrl = (
    value
) => {
    if (!value) {
        return "";
    }

    if (
        value.startsWith(
            "http://"
        ) ||
        value.startsWith(
            "https://"
        ) ||
        value.startsWith(
            "data:"
        )
    ) {
        return value;
    }

    if (
        value.startsWith(
            "/"
        )
    ) {
        return (
            SERVER_URL +
            value
        );
    }

    return (
        `${SERVER_URL}/${value}`
    );
};

function ProductFormPage() {
    const {
        id,
    } =
        useParams();

    const navigate =
        useNavigate();

    const isEdit =
        Boolean(
            id
        );

    // ========================================================
    // STATE
    // ========================================================

    const [
        form,
        setForm,
    ] =
        useState(
            initialForm
        );

    const [
        images,
        setImages,
    ] =
        useState([
            createEmptyImage(
                true
            ),
        ]);

    const [
        variants,
        setVariants,
    ] =
        useState([
            createEmptyVariant(),
        ]);

    const [
        categories,
        setCategories,
    ] =
        useState(
            []
        );

    const [
        brands,
        setBrands,
    ] =
        useState(
            []
        );

    const [
        sizes,
        setSizes,
    ] =
        useState(
            []
        );

    const [
        colors,
        setColors,
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
        saving,
        setSaving,
    ] =
        useState(
            false
        );

    // ========================================================
    // LOAD CATALOG
    // ========================================================

    useEffect(
        () => {
            let mounted =
                true;

            const load =
                async () => {
                    setLoading(
                        true
                    );

                    try {
                        const [
                            categoryData,
                            brandData,
                            sizeData,
                            colorData,
                        ] =
                            await Promise.all([
                                adminProductService
                                    .getCategories(),

                                adminProductService
                                    .getBrands(),

                                adminProductService
                                    .getSizes(),

                                adminProductService
                                    .getColors(),
                            ]);

                        if (
                            !mounted
                        ) {
                            return;
                        }

                        setCategories(
                            categoryData
                        );

                        setBrands(
                            brandData
                        );

                        setSizes(
                            sizeData
                        );

                        setColors(
                            colorData
                        );

                        // =====================================
                        // EDIT PRODUCT
                        // =====================================

                        if (
                            isEdit
                        ) {
                            const product =
                                await adminProductService
                                    .getProduct(
                                        id
                                    );

                            if (
                                !mounted
                            ) {
                                return;
                            }

                            setForm({
                                name:
                                    product
                                        ?.name ||
                                    "",

                                slug:
                                    product
                                        ?.slug ||
                                    "",

                                sku:
                                    product
                                        ?.sku ||
                                    "",

                                categoryId:
                                    product
                                        ?.category_id ??
                                    "",

                                brandId:
                                    product
                                        ?.brand_id ??
                                    "",

                                price:
                                    product
                                        ?.price ??
                                    "",

                                salePrice:
                                    product
                                        ?.sale_price ??
                                    "",

                                gender:
                                    product
                                        ?.gender ||
                                    "unisex",

                                status:
                                    product
                                        ?.status ||
                                    "active",

                                isFeatured:
                                    Boolean(
                                        Number(
                                            product
                                                ?.is_featured ||
                                                0
                                        )
                                    ),

                                thumbnail:
                                    product
                                        ?.thumbnail ||
                                    "",

                                shortDescription:
                                    product
                                        ?.short_description ||
                                    "",

                                description:
                                    product
                                        ?.description ||
                                    "",
                            });

                            const productImages =
                                Array.isArray(
                                    product
                                        ?.images
                                )
                                    ? product.images
                                    : [];

                            if (
                                productImages
                                    .length >
                                0
                            ) {
                                setImages(
                                    productImages.map(
                                        (
                                            image,
                                            index
                                        ) => ({
                                            imageUrl:
                                                image
                                                    ?.image_url ||
                                                "",

                                            isMain:
                                                Boolean(
                                                    Number(
                                                        image
                                                            ?.is_main ||
                                                            0
                                                    )
                                                ),

                                            sortOrder:
                                                Number(
                                                    image
                                                        ?.sort_order ??
                                                        index
                                                ),
                                        })
                                    )
                                );
                            } else if (
                                product
                                    ?.thumbnail
                            ) {
                                setImages([
                                    {
                                        imageUrl:
                                            product
                                                .thumbnail,

                                        isMain:
                                            true,

                                        sortOrder:
                                            0,
                                    },
                                ]);
                            }

                            const productVariants =
                                Array.isArray(
                                    product
                                        ?.variants
                                )
                                    ? product.variants
                                    : [];

                            if (
                                productVariants
                                    .length >
                                0
                            ) {
                                setVariants(
                                    productVariants.map(
                                        (
                                            variant
                                        ) => ({
                                            id:
                                                variant
                                                    ?.id ||
                                                null,

                                            sizeId:
                                                variant
                                                    ?.size_id ??
                                                "",

                                            colorId:
                                                variant
                                                    ?.color_id ??
                                                "",

                                            sku:
                                                variant
                                                    ?.sku ||
                                                "",

                                            priceAdjustment:
                                                Number(
                                                    variant
                                                        ?.price_adjustment ??
                                                        0
                                                ),

                                            stockQuantity:
                                                Number(
                                                    variant
                                                        ?.stock_quantity ??
                                                        0
                                                ),

                                            status:
                                                variant
                                                    ?.status ||
                                                "active",
                                        })
                                    )
                                );
                            }
                        }
                    } catch (
                        error
                    ) {
                        console.error(
                            "LOAD PRODUCT FORM ERROR:",
                            error
                        );

                        toast.error(
                            error
                                ?.response
                                ?.data
                                ?.message ||
                                "Không thể tải dữ liệu sản phẩm."
                        );
                    } finally {
                        if (
                            mounted
                        ) {
                            setLoading(
                                false
                            );
                        }
                    }
                };

            load();

            return () => {
                mounted =
                    false;
            };
        },
        [
            id,
            isEdit,
        ]
    );

    // ========================================================
    // PRODUCT INPUT
    // ========================================================

    const handleChange =
        (
            event
        ) => {
            const {
                name,
                value,
                type,
                checked,
            } =
                event.target;

            setForm(
                (
                    prev
                ) => ({
                    ...prev,

                    [name]:
                        type ===
                        "checkbox"
                            ? checked
                            : value,
                })
            );
        };

    // ========================================================
    // IMAGE
    // ========================================================

    const handleImageChange =
        (
            index,
            field,
            value
        ) => {
            setImages(
                (
                    prev
                ) =>
                    prev.map(
                        (
                            item,
                            currentIndex
                        ) =>
                            currentIndex ===
                            index
                                ? {
                                      ...item,

                                      [field]:
                                          value,
                                  }
                                : item
                    )
            );
        };

    const setMainImage =
        (
            index
        ) => {
            setImages(
                (
                    prev
                ) =>
                    prev.map(
                        (
                            image,
                            currentIndex
                        ) => ({
                            ...image,

                            isMain:
                                currentIndex ===
                                index,
                        })
                    )
            );
        };

    const addImage =
        () => {
            setImages(
                (
                    prev
                ) => [
                    ...prev,

                    createEmptyImage(
                        false
                    ),
                ]
            );
        };

    const removeImage =
        (
            index
        ) => {
            setImages(
                (
                    prev
                ) => {
                    const next =
                        prev.filter(
                            (
                                _,
                                currentIndex
                            ) =>
                                currentIndex !==
                                index
                        );

                    if (
                        next.length ===
                        0
                    ) {
                        return [
                            createEmptyImage(
                                true
                            ),
                        ];
                    }

                    if (
                        !next.some(
                            (
                                image
                            ) =>
                                image.isMain
                        )
                    ) {
                        next[0] = {
                            ...next[0],
                            isMain:
                                true,
                        };
                    }

                    return next;
                }
            );
        };

    // ========================================================
    // VARIANT
    // ========================================================

    const handleVariantChange =
        (
            index,
            field,
            value
        ) => {
            setVariants(
                (
                    prev
                ) =>
                    prev.map(
                        (
                            variant,
                            currentIndex
                        ) =>
                            currentIndex ===
                            index
                                ? {
                                      ...variant,

                                      [field]:
                                          value,
                                  }
                                : variant
                    )
            );
        };

    const addVariant =
        () => {
            setVariants(
                (
                    prev
                ) => [
                    ...prev,

                    createEmptyVariant(),
                ]
            );
        };

    const removeVariant =
        (
            index
        ) => {
            setVariants(
                (
                    prev
                ) =>
                    prev.filter(
                        (
                            _,
                            currentIndex
                        ) =>
                            currentIndex !==
                            index
                    )
            );
        };

    // ========================================================
    // TOTAL STOCK
    // ========================================================

    const totalStock =
        useMemo(
            () =>
                variants.reduce(
                    (
                        total,
                        variant
                    ) =>
                        total +
                        Number(
                            variant
                                .stockQuantity ||
                                0
                        ),

                    0
                ),
            [
                variants,
            ]
        );

    // ========================================================
    // PAYLOAD
    // ========================================================

    const createPayload =
        () => {
            const cleanedImages =
                images
                    .filter(
                        (
                            image
                        ) =>
                            String(
                                image
                                    .imageUrl ||
                                    ""
                            ).trim()
                    )
                    .map(
                        (
                            image,
                            index
                        ) => ({
                            imageUrl:
                                String(
                                    image
                                        .imageUrl
                                ).trim(),

                            isMain:
                                Boolean(
                                    image
                                        .isMain
                                ),

                            sortOrder:
                                index,
                        })
                    );

            const cleanedVariants =
                variants
                    .filter(
                        (
                            variant
                        ) =>
                            variant
                                .sizeId &&
                            variant
                                .colorId &&
                            String(
                                variant
                                    .sku ||
                                    ""
                            ).trim()
                    )
                    .map(
                        (
                            variant
                        ) => ({
                            ...(variant.id
                                ? {
                                      id:
                                          Number(
                                              variant.id
                                          ),
                                  }
                                : {}),

                            sizeId:
                                Number(
                                    variant
                                        .sizeId
                                ),

                            colorId:
                                Number(
                                    variant
                                        .colorId
                                ),

                            sku:
                                String(
                                    variant
                                        .sku
                                )
                                    .trim()
                                    .toUpperCase(),

                            priceAdjustment:
                                Number(
                                    variant
                                        .priceAdjustment ||
                                        0
                                ),

                            stockQuantity:
                                Number(
                                    variant
                                        .stockQuantity ||
                                        0
                                ),

                            status:
                                variant
                                    .status ||
                                "active",
                        })
                    );

            const mainImage =
                cleanedImages.find(
                    (
                        image
                    ) =>
                        image.isMain
                ) ||
                cleanedImages[0];

            return {
                name:
                    form.name.trim(),

                slug:
                    form.slug.trim(),

                sku:
                    form.sku
                        .trim()
                        .toUpperCase(),

                categoryId:
                    form.categoryId
                        ? Number(
                              form.categoryId
                          )
                        : null,

                brandId:
                    form.brandId
                        ? Number(
                              form.brandId
                          )
                        : null,

                price:
                    Number(
                        form.price
                    ),

                salePrice:
                    form.salePrice ===
                        ""
                        ? null
                        : Number(
                              form.salePrice
                          ),

                gender:
                    form.gender,

                status:
                    form.status,

                isFeatured:
                    Boolean(
                        form.isFeatured
                    ),

                thumbnail:
                    form.thumbnail
                        .trim() ||
                    mainImage
                        ?.imageUrl ||
                    null,

                shortDescription:
                    form
                        .shortDescription
                        .trim(),

                description:
                    form
                        .description
                        .trim(),

                images:
                    cleanedImages,

                variants:
                    cleanedVariants,
            };
        };

    // ========================================================
    // FRONTEND VALIDATE
    // ========================================================

    const validate =
        (
            payload
        ) => {
            if (
                !payload.name
            ) {
                toast.error(
                    "Vui lòng nhập tên sản phẩm."
                );

                return false;
            }

            if (
                !payload.sku
            ) {
                toast.error(
                    "Vui lòng nhập SKU sản phẩm."
                );

                return false;
            }

            if (
                !Number.isFinite(
                    payload.price
                ) ||
                payload.price <
                    0
            ) {
                toast.error(
                    "Giá sản phẩm không hợp lệ."
                );

                return false;
            }

            if (
                payload.salePrice !==
                    null &&
                payload.salePrice >
                    payload.price
            ) {
                toast.error(
                    "Giá khuyến mãi không được lớn hơn giá gốc."
                );

                return false;
            }

            const variantSkus =
                payload.variants.map(
                    (
                        variant
                    ) =>
                        variant.sku
                );

            if (
                new Set(
                    variantSkus
                ).size !==
                variantSkus.length
            ) {
                toast.error(
                    "SKU biến thể đang bị trùng."
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

            const payload =
                createPayload();

            if (
                !validate(
                    payload
                )
            ) {
                return;
            }

            setSaving(
                true
            );

            try {
                if (
                    isEdit
                ) {
                    await adminProductService
                        .updateProduct(
                            id,
                            payload
                        );

                    toast.success(
                        "Cập nhật sản phẩm thành công."
                    );
                } else {
                    await adminProductService
                        .createProduct(
                            payload
                        );

                    toast.success(
                        "Thêm sản phẩm thành công."
                    );
                }

                navigate(
                    "/admin/products"
                );
            } catch (
                error
            ) {
                console.error(
                    "SAVE PRODUCT ERROR:",
                    error
                );

                const errors =
                    error
                        ?.response
                        ?.data
                        ?.errors;

                if (
                    Array.isArray(
                        errors
                    ) &&
                    errors.length >
                        0
                ) {
                    toast.error(
                        errors[0]
                            ?.msg ||
                            "Dữ liệu sản phẩm không hợp lệ."
                    );
                } else {
                    toast.error(
                        error
                            ?.response
                            ?.data
                            ?.message ||
                            "Không thể lưu sản phẩm."
                    );
                }
            } finally {
                setSaving(
                    false
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
            <div className="product-form-page">
                <div className="product-form-loading">
                    <div className="spinner-border" />

                    <span>
                        Đang tải dữ liệu sản phẩm...
                    </span>
                </div>
            </div>
        );
    }

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="product-form-page">
            <div className="product-form-topbar">
                <Link
                    to="/admin/products"
                    className="product-form-back"
                >
                    <FaArrowLeft />

                    Quay lại danh sách
                </Link>
            </div>

            <header className="product-form-header">
                <div>
                    <span className="product-form-eyebrow">
                        QUẢN LÝ SẢN PHẨM
                    </span>

                    <h1>
                        {isEdit
                            ? "Chỉnh sửa sản phẩm"
                            : "Thêm sản phẩm"}
                    </h1>

                    <p>
                        {isEdit
                            ? `Đang chỉnh sửa sản phẩm #${id}`
                            : "Tạo một sản phẩm mới cho Sneaker Shop."}
                    </p>
                </div>

                <div className="product-form-stock-summary">
                    <span>
                        Tổng tồn kho
                    </span>

                    <strong>
                        {totalStock}
                    </strong>
                </div>
            </header>

            <form
                onSubmit={
                    handleSubmit
                }
            >
                <div className="product-form-layout">
                    {/* ========================================= */}
                    {/* LEFT */}
                    {/* ========================================= */}

                    <main className="product-form-main">
                        {/* BASIC */}

                        <section className="product-form-card">
                            <div className="product-form-section-title">
                                <FaBox />

                                <div>
                                    <span>
                                        THÔNG TIN CƠ BẢN
                                    </span>

                                    <h2>
                                        Sản phẩm
                                    </h2>
                                </div>
                            </div>

                            <div className="product-form-grid">
                                <label className="product-field product-field--full">
                                    <span>
                                        Tên sản phẩm *
                                    </span>

                                    <input
                                        name="name"
                                        value={
                                            form.name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Ví dụ: Nike Air Force 1 07"
                                        required
                                    />
                                </label>

                                <label className="product-field">
                                    <span>
                                        SKU sản phẩm *
                                    </span>

                                    <input
                                        name="sku"
                                        value={
                                            form.sku
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="NIKE-AF1-07"
                                        required
                                    />
                                </label>

                                <label className="product-field">
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
                                        placeholder="Tự tạo nếu để trống"
                                    />
                                </label>

                                <label className="product-field">
                                    <span>
                                        Danh mục
                                    </span>

                                    <select
                                        name="categoryId"
                                        value={
                                            form.categoryId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >
                                        <option value="">
                                            -- Chọn danh mục --
                                        </option>

                                        {categories.map(
                                            (
                                                item
                                            ) => (
                                                <option
                                                    key={
                                                        item.id
                                                    }
                                                    value={
                                                        item.id
                                                    }
                                                >
                                                    {
                                                        item.name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </label>

                                <label className="product-field">
                                    <span>
                                        Thương hiệu
                                    </span>

                                    <select
                                        name="brandId"
                                        value={
                                            form.brandId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >
                                        <option value="">
                                            -- Chọn thương hiệu --
                                        </option>

                                        {brands.map(
                                            (
                                                item
                                            ) => (
                                                <option
                                                    key={
                                                        item.id
                                                    }
                                                    value={
                                                        item.id
                                                    }
                                                >
                                                    {
                                                        item.name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </label>

                                <label className="product-field">
                                    <span>
                                        Giá gốc *
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        step="1000"
                                        name="price"
                                        value={
                                            form.price
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="2890000"
                                        required
                                    />
                                </label>

                                <label className="product-field">
                                    <span>
                                        Giá khuyến mãi
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        step="1000"
                                        name="salePrice"
                                        value={
                                            form.salePrice
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Để trống nếu không giảm"
                                    />
                                </label>

                                <label className="product-field">
                                    <span>
                                        Giới tính
                                    </span>

                                    <select
                                        name="gender"
                                        value={
                                            form.gender
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >
                                        <option value="men">
                                            Nam
                                        </option>

                                        <option value="women">
                                            Nữ
                                        </option>

                                        <option value="unisex">
                                            Unisex
                                        </option>

                                        <option value="kids">
                                            Trẻ em
                                        </option>
                                    </select>
                                </label>

                                <label className="product-field">
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
                                            Đang bán
                                        </option>

                                        <option value="inactive">
                                            Ngừng bán
                                        </option>

                                        <option value="draft">
                                            Bản nháp
                                        </option>
                                    </select>
                                </label>

                                <label className="product-field product-field--full">
                                    <span>
                                        Mô tả ngắn
                                    </span>

                                    <textarea
                                        name="shortDescription"
                                        rows="3"
                                        value={
                                            form.shortDescription
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Mô tả ngắn hiển thị cho khách hàng..."
                                    />
                                </label>

                                <label className="product-field product-field--full">
                                    <span>
                                        Mô tả chi tiết
                                    </span>

                                    <textarea
                                        name="description"
                                        rows="7"
                                        value={
                                            form.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Thông tin chi tiết về sản phẩm..."
                                    />
                                </label>
                            </div>
                        </section>

                        {/* IMAGES */}

                        <section className="product-form-card">
                            <div className="product-form-card-header">
                                <div className="product-form-section-title">
                                    <FaImage />

                                    <div>
                                        <span>
                                            MEDIA
                                        </span>

                                        <h2>
                                            Hình ảnh
                                        </h2>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="product-add-button"
                                    onClick={
                                        addImage
                                    }
                                >
                                    <FaPlus />

                                    Thêm ảnh
                                </button>
                            </div>

                            <label className="product-field">
                                <span>
                                    Thumbnail
                                </span>

                                <input
                                    name="thumbnail"
                                    value={
                                        form.thumbnail
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="/uploads/products/giay.jpg"
                                />
                            </label>

                            <div className="product-images-list">
                                {images.map(
                                    (
                                        image,
                                        index
                                    ) => (
                                        <div
                                            className="product-image-row"
                                            key={
                                                index
                                            }
                                        >
                                            <div className="product-image-preview">
                                                {image
                                                    .imageUrl ? (
                                                    <img
                                                        src={imageUrl(
                                                            image.imageUrl
                                                        )}
                                                        alt=""
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

                                            <div className="product-image-input">
                                                <span>
                                                    Ảnh{" "}
                                                    {index +
                                                        1}
                                                </span>

                                                <input
                                                    value={
                                                        image.imageUrl
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleImageChange(
                                                            index,
                                                            "imageUrl",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    placeholder="/uploads/products/..."
                                                />
                                            </div>

                                            <label className="product-main-image">
                                                <input
                                                    type="radio"
                                                    name="mainImage"
                                                    checked={
                                                        image.isMain
                                                    }
                                                    onChange={() =>
                                                        setMainImage(
                                                            index
                                                        )
                                                    }
                                                />

                                                Ảnh chính
                                            </label>

                                            <button
                                                type="button"
                                                className="product-delete-row"
                                                onClick={() =>
                                                    removeImage(
                                                        index
                                                    )
                                                }
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        </section>

                        {/* VARIANTS */}

                        <section className="product-form-card">
                            <div className="product-form-card-header">
                                <div className="product-form-section-title">
                                    <FaBox />

                                    <div>
                                        <span>
                                            BIẾN THỂ
                                        </span>

                                        <h2>
                                            Size, màu và tồn kho
                                        </h2>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="product-add-button"
                                    onClick={
                                        addVariant
                                    }
                                >
                                    <FaPlus />

                                    Thêm biến thể
                                </button>
                            </div>

                            <div className="product-variants-list">
                                {variants.length ===
                                0 ? (
                                    <div className="product-empty-variant">
                                        Chưa có biến thể.
                                    </div>
                                ) : (
                                    variants.map(
                                        (
                                            variant,
                                            index
                                        ) => (
                                            <div
                                                className="product-variant-card"
                                                key={
                                                    variant.id ||
                                                    `new-${index}`
                                                }
                                            >
                                                <div className="product-variant-head">
                                                    <strong>
                                                        Biến thể{" "}
                                                        {index +
                                                            1}
                                                    </strong>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeVariant(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>

                                                <div className="product-variant-grid">
                                                    <label className="product-field">
                                                        <span>
                                                            Size *
                                                        </span>

                                                        <select
                                                            value={
                                                                variant.sizeId
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                handleVariantChange(
                                                                    index,
                                                                    "sizeId",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            <option value="">
                                                                -- Size --
                                                            </option>

                                                            {sizes.map(
                                                                (
                                                                    size
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            size.id
                                                                        }
                                                                        value={
                                                                            size.id
                                                                        }
                                                                    >
                                                                        {
                                                                            size.size_name
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    </label>

                                                    <label className="product-field">
                                                        <span>
                                                            Màu *
                                                        </span>

                                                        <select
                                                            value={
                                                                variant.colorId
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                handleVariantChange(
                                                                    index,
                                                                    "colorId",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            <option value="">
                                                                -- Màu --
                                                            </option>

                                                            {colors.map(
                                                                (
                                                                    color
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            color.id
                                                                        }
                                                                        value={
                                                                            color.id
                                                                        }
                                                                    >
                                                                        {
                                                                            color.name
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    </label>

                                                    <label className="product-field">
                                                        <span>
                                                            SKU *
                                                        </span>

                                                        <input
                                                            value={
                                                                variant.sku
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                handleVariantChange(
                                                                    index,
                                                                    "sku",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="NIKE-AF1-WHITE-40"
                                                        />
                                                    </label>

                                                    <label className="product-field">
                                                        <span>
                                                            Tồn kho
                                                        </span>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="1"
                                                            value={
                                                                variant.stockQuantity
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                handleVariantChange(
                                                                    index,
                                                                    "stockQuantity",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </label>

                                                    <label className="product-field">
                                                        <span>
                                                            Điều chỉnh giá
                                                        </span>

                                                        <input
                                                            type="number"
                                                            step="1000"
                                                            value={
                                                                variant.priceAdjustment
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                handleVariantChange(
                                                                    index,
                                                                    "priceAdjustment",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </label>

                                                    <label className="product-field">
                                                        <span>
                                                            Trạng thái
                                                        </span>

                                                        <select
                                                            value={
                                                                variant.status
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                handleVariantChange(
                                                                    index,
                                                                    "status",
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
                                                    </label>
                                                </div>
                                            </div>
                                        )
                                    )
                                )}
                            </div>
                        </section>
                    </main>

                    {/* ========================================= */}
                    {/* RIGHT */}
                    {/* ========================================= */}

                    <aside className="product-form-sidebar">
                        <section className="product-form-card product-form-sticky">
                            <span className="product-form-side-label">
                                XUẤT BẢN
                            </span>

                            <label className="product-featured">
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={
                                        form.isFeatured
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                                <div>
                                    <strong>
                                        Sản phẩm nổi bật
                                    </strong>

                                    <small>
                                        Hiển thị ưu tiên trên cửa hàng.
                                    </small>
                                </div>
                            </label>

                            <div className="product-form-summary">
                                <div>
                                    <span>
                                        Biến thể
                                    </span>

                                    <strong>
                                        {
                                            variants.length
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Tổng tồn
                                    </span>

                                    <strong>
                                        {
                                            totalStock
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Hình ảnh
                                    </span>

                                    <strong>
                                        {
                                            images.filter(
                                                (
                                                    image
                                                ) =>
                                                    image.imageUrl
                                                        .trim()
                                            )
                                                .length
                                        }
                                    </strong>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="product-save-button"
                                disabled={
                                    saving
                                }
                            >
                                <FaSave />

                                {saving
                                    ? "Đang lưu..."
                                    : isEdit
                                      ? "Lưu thay đổi"
                                      : "Tạo sản phẩm"}
                            </button>

                            <Link
                                to="/admin/products"
                                className="product-cancel-button"
                            >
                                Hủy
                            </Link>
                        </section>
                    </aside>
                </div>
            </form>
        </div>
    );
}

export default
    ProductFormPage;