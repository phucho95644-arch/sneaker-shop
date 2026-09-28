const ApiError =
    require(
        "../utils/ApiError"
    );

const brandModel =
    require(
        "../models/adminBrand.model"
    );

// ============================================================
// HELPERS
// ============================================================

const cleanText =
    (
        value
    ) => {
        if (
            value ===
                undefined ||
            value === null
        ) {
            return null;
        }

        const result =
            String(
                value
            ).trim();

        return (
            result ||
            null
        );
    };

const slugify =
    (
        value
    ) => {
        return String(
            value ||
                ""
        )
            .normalize(
                "NFD"
            )
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

const parseId =
    (
        value
    ) => {
        const id =
            Number(
                value
            );

        if (
            !Number.isInteger(
                id
            ) ||
            id <= 0
        ) {
            throw new ApiError(
                400,
                "ID thương hiệu không hợp lệ."
            );
        }

        return id;
    };

const validateStatus =
    (
        status
    ) => {
        if (
            ![
                "active",
                "inactive",
            ].includes(
                status
            )
        ) {
            throw new ApiError(
                400,
                "Trạng thái thương hiệu không hợp lệ."
            );
        }
    };

// ============================================================
// LIST
// ============================================================

const getBrands =
    async (
        filters = {}
    ) => {
        return brandModel
            .getBrands({
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

const getBrandById =
    async (
        brandId
    ) => {
        const id =
            parseId(
                brandId
            );

        const brand =
            await brandModel
                .getBrandById(
                    id
                );

        if (!brand) {
            throw new ApiError(
                404,
                "Không tìm thấy thương hiệu."
            );
        }

        return brand;
    };

// ============================================================
// CREATE
// ============================================================

const createBrand =
    async (
        body = {}
    ) => {
        const name =
            cleanText(
                body.name
            );

        if (!name) {
            throw new ApiError(
                400,
                "Tên thương hiệu là bắt buộc."
            );
        }

        const slug =
            cleanText(
                body.slug
            ) ||
            slugify(
                name
            );

        if (!slug) {
            throw new ApiError(
                400,
                "Không thể tạo slug thương hiệu."
            );
        }

        const status =
            body.status ||
            "active";

        validateStatus(
            status
        );

        const [
            sameSlug,
            sameName,
        ] =
            await Promise.all([
                brandModel
                    .findBySlug(
                        slug
                    ),

                brandModel
                    .findByName(
                        name
                    ),
            ]);

        if (sameSlug) {
            throw new ApiError(
                409,
                "Slug thương hiệu đã tồn tại."
            );
        }

        if (sameName) {
            throw new ApiError(
                409,
                "Tên thương hiệu đã tồn tại."
            );
        }

        try {
            const id =
                await brandModel
                    .createBrand({
                        name,
                        slug,

                        logo:
                            cleanText(
                                body.logo
                            ),

                        description:
                            cleanText(
                                body.description
                            ),

                        status,
                    });

            return getBrandById(
                id
            );
        } catch (
            error
        ) {
            if (
                error?.code ===
                "ER_DUP_ENTRY"
            ) {
                throw new ApiError(
                    409,
                    "Tên hoặc slug thương hiệu đã tồn tại."
                );
            }

            throw error;
        }
    };

// ============================================================
// UPDATE
// ============================================================

const updateBrand =
    async (
        brandId,
        body = {}
    ) => {
        const id =
            parseId(
                brandId
            );

        const current =
            await brandModel
                .getBrandById(
                    id
                );

        if (!current) {
            throw new ApiError(
                404,
                "Không tìm thấy thương hiệu."
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
                "Tên thương hiệu là bắt buộc."
            );
        }

        const slug =
            body.slug !==
            undefined
                ? (
                      cleanText(
                          body.slug
                      ) ||
                      slugify(
                          name
                      )
                  )
                : current.slug;

        const status =
            body.status ||
            current.status;

        validateStatus(
            status
        );

        const [
            sameSlug,
            sameName,
        ] =
            await Promise.all([
                brandModel
                    .findBySlug(
                        slug,
                        id
                    ),

                brandModel
                    .findByName(
                        name,
                        id
                    ),
            ]);

        if (sameSlug) {
            throw new ApiError(
                409,
                "Slug thương hiệu đã được sử dụng."
            );
        }

        if (sameName) {
            throw new ApiError(
                409,
                "Tên thương hiệu đã được sử dụng."
            );
        }

        try {
            await brandModel
                .updateBrand(
                    id,
                    {
                        name,
                        slug,

                        logo:
                            body.logo !==
                            undefined
                                ? cleanText(
                                      body.logo
                                  )
                                : current.logo,

                        description:
                            body.description !==
                            undefined
                                ? cleanText(
                                      body.description
                                  )
                                : current.description,

                        status,
                    }
                );

            return getBrandById(
                id
            );
        } catch (
            error
        ) {
            if (
                error?.code ===
                "ER_DUP_ENTRY"
            ) {
                throw new ApiError(
                    409,
                    "Tên hoặc slug thương hiệu đã tồn tại."
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
        brandId,
        status
    ) => {
        const id =
            parseId(
                brandId
            );

        validateStatus(
            status
        );

        const current =
            await brandModel
                .getBrandById(
                    id
                );

        if (!current) {
            throw new ApiError(
                404,
                "Không tìm thấy thương hiệu."
            );
        }

        await brandModel
            .updateStatus(
                id,
                status
            );

        return getBrandById(
            id
        );
    };

// ============================================================
// DELETE
// ============================================================

const deleteBrand =
    async (
        brandId
    ) => {
        const id =
            parseId(
                brandId
            );

        const current =
            await brandModel
                .getBrandById(
                    id
                );

        if (!current) {
            throw new ApiError(
                404,
                "Không tìm thấy thương hiệu."
            );
        }

        const productCount =
            await brandModel
                .countProducts(
                    id
                );

        if (
            productCount >
            0
        ) {
            throw new ApiError(
                409,
                `Không thể xóa thương hiệu vì đang có ${productCount} sản phẩm sử dụng. Hãy chuyển thương hiệu sang trạng thái tạm ngừng.`
            );
        }

        try {
            await brandModel
                .deleteBrand(
                    id
                );

            return {
                id,
                deleted:
                    true,
            };
        } catch (
            error
        ) {
            if (
                error?.code ===
                "ER_ROW_IS_REFERENCED_2"
            ) {
                throw new ApiError(
                    409,
                    "Thương hiệu đang được dữ liệu khác sử dụng."
                );
            }

            throw error;
        }
    };

module.exports = {
    getBrands,
    getBrandById,
    createBrand,
    updateBrand,
    updateStatus,
    deleteBrand,
};