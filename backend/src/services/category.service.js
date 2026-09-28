const ApiError =
    require("../utils/ApiError");

const categoryModel =
    require("../models/adminCategory.model");

// ============================================================
// HELPERS
// ============================================================

const cleanText = (
    value
) => {
    if (
        value === undefined ||
        value === null
    ) {
        return null;
    }

    const result =
        String(value).trim();

    return result || null;
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

const parseId = (
    value
) => {
    const id = Number(value);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        throw new ApiError(
            400,
            "ID danh mục không hợp lệ."
        );
    }

    return id;
};

const validateStatus = (
    status
) => {
    if (
        ![
            "active",
            "inactive",
        ].includes(status)
    ) {
        throw new ApiError(
            400,
            "Trạng thái danh mục không hợp lệ."
        );
    }
};

// ============================================================
// LIST
// ============================================================

const getCategories =
    async (filters = {}) => {
        return categoryModel
            .getCategories({
                search:
                    String(
                        filters.search ||
                            ""
                    ).trim(),

                status:
                    String(
                        filters.status ||
                            ""
                    ).trim(),
            });
    };

// ============================================================
// DETAIL
// ============================================================

const getCategoryById =
    async (categoryId) => {
        const id =
            parseId(
                categoryId
            );

        const category =
            await categoryModel
                .getCategoryById(
                    id
                );

        if (!category) {
            throw new ApiError(
                404,
                "Không tìm thấy danh mục."
            );
        }

        return category;
    };

// ============================================================
// CREATE
// ============================================================

const createCategory =
    async (body) => {
        const name =
            cleanText(
                body.name
            );

        if (!name) {
            throw new ApiError(
                400,
                "Tên danh mục là bắt buộc."
            );
        }

        const slug =
            cleanText(
                body.slug
            ) ||
            slugify(name);

        if (!slug) {
            throw new ApiError(
                400,
                "Không thể tạo slug danh mục."
            );
        }

        const status =
            body.status ||
            "active";

        validateStatus(
            status
        );

        const duplicated =
            await categoryModel
                .findBySlug(
                    slug
                );

        if (duplicated) {
            throw new ApiError(
                409,
                "Slug danh mục đã tồn tại."
            );
        }

        try {
            const id =
                await categoryModel
                    .createCategory({
                        name,
                        slug,

                        description:
                            cleanText(
                                body.description
                            ),

                        image:
                            cleanText(
                                body.image
                            ),

                        status,
                    });

            return getCategoryById(
                id
            );
        } catch (error) {
            if (
                error?.code ===
                "ER_DUP_ENTRY"
            ) {
                throw new ApiError(
                    409,
                    "Danh mục hoặc slug đã tồn tại."
                );
            }

            throw error;
        }
    };

// ============================================================
// UPDATE
// ============================================================

const updateCategory =
    async (
        categoryId,
        body
    ) => {
        const id =
            parseId(
                categoryId
            );

        const current =
            await categoryModel
                .getCategoryById(
                    id
                );

        if (!current) {
            throw new ApiError(
                404,
                "Không tìm thấy danh mục."
            );
        }

        const name =
            body.name !==
            undefined
                ? cleanText(
                      body.name
                  )
                : current.name;

        if (!name) {
            throw new ApiError(
                400,
                "Tên danh mục là bắt buộc."
            );
        }

        let slug;

        if (
            body.slug !==
            undefined
        ) {
            slug =
                cleanText(
                    body.slug
                ) ||
                slugify(name);
        } else {
            slug =
                current.slug;
        }

        const status =
            body.status ||
            current.status;

        validateStatus(
            status
        );

        const duplicated =
            await categoryModel
                .findBySlug(
                    slug,
                    id
                );

        if (duplicated) {
            throw new ApiError(
                409,
                "Slug danh mục đã được sử dụng."
            );
        }

        try {
            await categoryModel
                .updateCategory(
                    id,
                    {
                        name,
                        slug,

                        description:
                            body.description !==
                            undefined
                                ? cleanText(
                                      body.description
                                  )
                                : current.description,

                        image:
                            body.image !==
                            undefined
                                ? cleanText(
                                      body.image
                                  )
                                : current.image,

                        status,
                    }
                );

            return getCategoryById(
                id
            );
        } catch (error) {
            if (
                error?.code ===
                "ER_DUP_ENTRY"
            ) {
                throw new ApiError(
                    409,
                    "Danh mục hoặc slug đã tồn tại."
                );
            }

            throw error;
        }
    };

// ============================================================
// STATUS
// ============================================================

const updateStatus =
    async (
        categoryId,
        status
    ) => {
        const id =
            parseId(
                categoryId
            );

        validateStatus(
            status
        );

        const category =
            await categoryModel
                .getCategoryById(
                    id
                );

        if (!category) {
            throw new ApiError(
                404,
                "Không tìm thấy danh mục."
            );
        }

        await categoryModel
            .updateStatus(
                id,
                status
            );

        return getCategoryById(
            id
        );
    };

// ============================================================
// DELETE
// ============================================================

const deleteCategory =
    async (
        categoryId
    ) => {
        const id =
            parseId(
                categoryId
            );

        const category =
            await categoryModel
                .getCategoryById(
                    id
                );

        if (!category) {
            throw new ApiError(
                404,
                "Không tìm thấy danh mục."
            );
        }

        const productCount =
            await categoryModel
                .countProducts(
                    id
                );

        if (
            productCount > 0
        ) {
            throw new ApiError(
                409,
                `Không thể xóa danh mục vì đang có ${productCount} sản phẩm sử dụng. Hãy chuyển danh mục sang trạng thái tạm ngừng.`
            );
        }

        try {
            await categoryModel
                .deleteCategory(
                    id
                );

            return {
                id,
                deleted: true,
            };
        } catch (error) {
            if (
                error?.code ===
                "ER_ROW_IS_REFERENCED_2"
            ) {
                throw new ApiError(
                    409,
                    "Danh mục đang được dữ liệu khác sử dụng."
                );
            }

            throw error;
        }
    };

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    updateStatus,
    deleteCategory,
};