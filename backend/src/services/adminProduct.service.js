const {
    pool,
} = require(
    "../config/db"
);

const ApiError =
    require(
        "../utils/ApiError"
    );

const AdminProductModel =
    require(
        "../models/adminProduct.model"
    );

// ============================================================
// SLUG
// ============================================================

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
        .replace(
            /đ/g,
            "d"
        )
        .replace(
            /Đ/g,
            "D"
        )
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

// ============================================================
// NORMALIZE IMAGE
// ============================================================

const normalizeImages = (
    images
) => {
    if (
        !Array.isArray(
            images
        )
    ) {
        return undefined;
    }

    const normalized =
        images
            .filter(
                (
                    image
                ) =>
                    image &&
                    String(
                        image.imageUrl ||
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
                            image.imageUrl
                        ).trim(),

                    isMain:
                        Boolean(
                            image.isMain
                        ),

                    sortOrder:
                        Number.isInteger(
                            Number(
                                image.sortOrder
                            )
                        )
                            ? Number(
                                  image.sortOrder
                              )
                            : index,
                })
            );

    if (
        normalized.length >
        0
    ) {
        const firstMainIndex =
            normalized.findIndex(
                (
                    image
                ) =>
                    image.isMain
            );

        normalized.forEach(
            (
                image,
                index
            ) => {
                image.isMain =
                    firstMainIndex >=
                    0
                        ? index ===
                          firstMainIndex
                        : index ===
                          0;
            }
        );
    }

    return normalized;
};

// ============================================================
// NORMALIZE VARIANTS
// ============================================================

const normalizeVariants = (
    variants
) => {
    if (
        !Array.isArray(
            variants
        )
    ) {
        return undefined;
    }

    return variants.map(
        (
            variant
        ) => ({
            id:
                variant.id
                    ? Number(
                          variant.id
                      )
                    : null,

            sizeId:
                Number(
                    variant.sizeId
                ),

            colorId:
                Number(
                    variant.colorId
                ),

            sku:
                String(
                    variant.sku ||
                    ""
                )
                    .trim()
                    .toUpperCase(),

            priceAdjustment:
                variant
                    .priceAdjustment ===
                    "" ||
                variant
                    .priceAdjustment ===
                    null ||
                variant
                    .priceAdjustment ===
                    undefined
                    ? 0
                    : Number(
                          variant.priceAdjustment
                      ),

            stockQuantity:
                Number(
                    variant.stockQuantity ??
                        0
                ),

            status:
                variant.status ||
                "active",
        })
    );
};

// ============================================================
// NORMALIZE PRODUCT
// ============================================================

const normalizeProduct = (
    body
) => {
    const images =
        normalizeImages(
            body.images
        );

    let thumbnail =
        body.thumbnail ===
            undefined ||
        body.thumbnail ===
            null
            ? null
            : String(
                  body.thumbnail
              ).trim() ||
              null;

    if (
        !thumbnail &&
        images &&
        images.length >
            0
    ) {
        thumbnail =
            (
                images.find(
                    (
                        image
                    ) =>
                        image.isMain
                ) ||
                images[0]
            ).imageUrl;
    }

    return {
        categoryId:
            body.categoryId
                ? Number(
                      body.categoryId
                  )
                : null,

        brandId:
            body.brandId
                ? Number(
                      body.brandId
                  )
                : null,

        name:
            String(
                body.name ||
                ""
            ).trim(),

        slug:
            slugify(
                body.slug ||
                body.name
            ),

        sku:
            String(
                body.sku ||
                ""
            )
                .trim()
                .toUpperCase(),

        description:
            body.description
                ? String(
                      body.description
                  ).trim()
                : null,

        shortDescription:
            body.shortDescription
                ? String(
                      body.shortDescription
                  ).trim()
                : null,

        price:
            Number(
                body.price
            ),

        salePrice:
            body.salePrice ===
                "" ||
            body.salePrice ===
                null ||
            body.salePrice ===
                undefined
                ? null
                : Number(
                      body.salePrice
                  ),

        thumbnail,

        gender:
            body.gender ||
            "unisex",

        status:
            body.status ||
            "active",

        isFeatured:
            Boolean(
                body.isFeatured
            ),

        images,

        variants:
            normalizeVariants(
                body.variants
            ),
    };
};

// ============================================================
// VALIDATE PRODUCT
// ============================================================

const validateProduct =
    async (
        data,
        connection,
        excludeId = null
    ) => {
        if (!data.name) {
            throw new ApiError(
                400,
                "Tên sản phẩm không được để trống"
            );
        }

        if (!data.slug) {
            throw new ApiError(
                400,
                "Slug sản phẩm không hợp lệ"
            );
        }

        if (!data.sku) {
            throw new ApiError(
                400,
                "SKU sản phẩm không được để trống"
            );
        }

        if (
            !Number.isFinite(
                data.price
            ) ||
            data.price <
                0
        ) {
            throw new ApiError(
                400,
                "Giá sản phẩm không hợp lệ"
            );
        }

        if (
            data.salePrice !==
                null &&
            (
                !Number.isFinite(
                    data.salePrice
                ) ||
                data.salePrice <
                    0 ||
                data.salePrice >
                    data.price
            )
        ) {
            throw new ApiError(
                400,
                "Giá khuyến mãi phải từ 0 đến giá gốc"
            );
        }

        const slugConflict =
            await AdminProductModel
                .findBySlug(
                    data.slug,
                    excludeId,
                    connection
                );

        if (
            slugConflict
        ) {
            throw new ApiError(
                409,
                "Slug sản phẩm đã tồn tại"
            );
        }

        const skuConflict =
            await AdminProductModel
                .findBySku(
                    data.sku,
                    excludeId,
                    connection
                );

        if (
            skuConflict
        ) {
            throw new ApiError(
                409,
                "SKU sản phẩm đã tồn tại"
            );
        }

        if (
            data.categoryId
        ) {
            const exists =
                await AdminProductModel
                    .referenceExists(
                        "categories",
                        data.categoryId,
                        connection
                    );

            if (!exists) {
                throw new ApiError(
                    400,
                    "Danh mục không tồn tại"
                );
            }
        }

        if (
            data.brandId
        ) {
            const exists =
                await AdminProductModel
                    .referenceExists(
                        "brands",
                        data.brandId,
                        connection
                    );

            if (!exists) {
                throw new ApiError(
                    400,
                    "Thương hiệu không tồn tại"
                );
            }
        }
    };

// ============================================================
// VALIDATE VARIANTS
// ============================================================

const validateVariants =
    async (
        variants,
        productPrice,
        connection
    ) => {
        if (
            variants ===
            undefined
        ) {
            return;
        }

        const skuSet =
            new Set();

        for (
            const variant
            of variants
        ) {
            if (
                !Number.isInteger(
                    variant.sizeId
                ) ||
                variant.sizeId <=
                    0
            ) {
                throw new ApiError(
                    400,
                    "Size của biến thể không hợp lệ"
                );
            }

            if (
                !Number.isInteger(
                    variant.colorId
                ) ||
                variant.colorId <=
                    0
            ) {
                throw new ApiError(
                    400,
                    "Màu của biến thể không hợp lệ"
                );
            }

            if (
                !variant.sku
            ) {
                throw new ApiError(
                    400,
                    "SKU biến thể không được để trống"
                );
            }

            if (
                skuSet.has(
                    variant.sku
                )
            ) {
                throw new ApiError(
                    400,
                    `SKU biến thể bị trùng: ${variant.sku}`
                );
            }

            skuSet.add(
                variant.sku
            );

            if (
                !Number.isFinite(
                    variant.priceAdjustment
                )
            ) {
                throw new ApiError(
                    400,
                    "Điều chỉnh giá biến thể không hợp lệ"
                );
            }

            if (
                productPrice +
                    variant.priceAdjustment <
                0
            ) {
                throw new ApiError(
                    400,
                    "Giá cuối của biến thể không thể âm"
                );
            }

            if (
                !Number.isInteger(
                    variant.stockQuantity
                ) ||
                variant.stockQuantity <
                    0
            ) {
                throw new ApiError(
                    400,
                    "Tồn kho phải là số nguyên >= 0"
                );
            }

            const sizeExists =
                await AdminProductModel
                    .referenceExists(
                        "sizes",
                        variant.sizeId,
                        connection
                    );

            if (
                !sizeExists
            ) {
                throw new ApiError(
                    400,
                    `Size ID ${variant.sizeId} không tồn tại`
                );
            }

            const colorExists =
                await AdminProductModel
                    .referenceExists(
                        "colors",
                        variant.colorId,
                        connection
                    );

            if (
                !colorExists
            ) {
                throw new ApiError(
                    400,
                    `Color ID ${variant.colorId} không tồn tại`
                );
            }
        }
    };

// ============================================================
// DETAIL
// ============================================================

const getProductDetail =
    async (
        productId
    ) => {
        const product =
            await AdminProductModel
                .findById(
                    productId
                );

        if (!product) {
            throw new ApiError(
                404,
                "Không tìm thấy sản phẩm"
            );
        }

        const [
            images,
            variants,
        ] =
            await Promise.all([
                AdminProductModel
                    .getImages(
                        productId
                    ),

                AdminProductModel
                    .getVariants(
                        productId
                    ),
            ]);

        return {
            ...product,
            images,
            variants,
        };
    };

// ============================================================
// CREATE
// ============================================================

const createProduct =
    async (
        body
    ) => {
        const connection =
            await pool
                .getConnection();

        try {
            await connection
                .beginTransaction();

            const data =
                normalizeProduct(
                    body
                );

            await validateProduct(
                data,
                connection
            );

            await validateVariants(
                data.variants,
                data.price,
                connection
            );

            const productId =
                await AdminProductModel
                    .createProduct(
                        data,
                        connection
                    );

            if (
                data.images !==
                undefined
            ) {
                await AdminProductModel
                    .replaceImages(
                        productId,
                        data.images,
                        connection
                    );
            }

            if (
                data.variants
            ) {
                for (
                    const variant
                    of data.variants
                ) {
                    await AdminProductModel
                        .createVariant(
                            productId,
                            variant,
                            connection
                        );
                }
            }

            await connection
                .commit();

            return (
                await getProductDetail(
                    productId
                )
            );
        } catch (
            error
        ) {
            await connection
                .rollback();

            if (
                error.code ===
                "ER_DUP_ENTRY"
            ) {
                throw new ApiError(
                    409,
                    "SKU hoặc dữ liệu sản phẩm đã tồn tại"
                );
            }

            throw error;
        } finally {
            connection
                .release();
        }
    };

// ============================================================
// UPDATE
// ============================================================

const updateProduct =
    async (
        productId,
        body
    ) => {
        const connection =
            await pool
                .getConnection();

        try {
            await connection
                .beginTransaction();

            const current =
                await AdminProductModel
                    .findById(
                        productId,
                        connection
                    );

            if (!current) {
                throw new ApiError(
                    404,
                    "Không tìm thấy sản phẩm"
                );
            }

            const data =
                normalizeProduct(
                    body
                );

            await validateProduct(
                data,
                connection,
                productId
            );

            await validateVariants(
                data.variants,
                data.price,
                connection
            );

            await AdminProductModel
                .updateProduct(
                    productId,
                    data,
                    connection
                );

            if (
                data.images !==
                undefined
            ) {
                await AdminProductModel
                    .replaceImages(
                        productId,
                        data.images,
                        connection
                    );
            }

            if (
                data.variants !==
                undefined
            ) {
                const keepIds =
                    [];

                for (
                    const variant
                    of data.variants
                ) {
                    if (
                        variant.id
                    ) {
                        const existing =
                            await AdminProductModel
                                .findVariantById(
                                    variant.id,
                                    connection
                                );

                        if (
                            !existing ||
                            Number(
                                existing.product_id
                            ) !==
                                Number(
                                    productId
                                )
                        ) {
                            throw new ApiError(
                                400,
                                `Biến thể ID ${variant.id} không thuộc sản phẩm này`
                            );
                        }

                        await AdminProductModel
                            .updateVariant(
                                variant.id,
                                variant,
                                connection
                            );

                        keepIds.push(
                            Number(
                                variant.id
                            )
                        );
                    } else {
                        const newId =
                            await AdminProductModel
                                .createVariant(
                                    productId,
                                    variant,
                                    connection
                                );

                        keepIds.push(
                            Number(
                                newId
                            )
                        );
                    }
                }

                await AdminProductModel
                    .deactivateVariantsExcept(
                        productId,
                        keepIds,
                        connection
                    );
            }

            await connection
                .commit();

            return (
                await getProductDetail(
                    productId
                )
            );
        } catch (
            error
        ) {
            await connection
                .rollback();

            if (
                error.code ===
                "ER_DUP_ENTRY"
            ) {
                throw new ApiError(
                    409,
                    "SKU hoặc dữ liệu sản phẩm đã tồn tại"
                );
            }

            throw error;
        } finally {
            connection
                .release();
        }
    };

// ============================================================
// UPDATE STATUS
// ============================================================

const updateStatus =
    async (
        productId,
        status
    ) => {
        const product =
            await AdminProductModel
                .findById(
                    productId
                );

        if (!product) {
            throw new ApiError(
                404,
                "Không tìm thấy sản phẩm"
            );
        }

        await AdminProductModel
            .updateStatus(
                productId,
                status
            );

        return (
            await getProductDetail(
                productId
            )
        );
    };

// ============================================================
// EXPORT
// ============================================================

module.exports = {
    getProducts:
        AdminProductModel
            .getProducts,

    getProductDetail,

    createProduct,
    updateProduct,
    updateStatus,
};