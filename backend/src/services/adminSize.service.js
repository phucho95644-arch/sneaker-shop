const ApiError =
    require("../utils/ApiError");

const sizeModel =
    require("../models/adminSize.model");

// ============================================================
// HELPERS
// ============================================================

const parseId = (
    value
) => {
    const id =
        Number(value);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        throw new ApiError(
            400,
            "ID size không hợp lệ."
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
            "Trạng thái size không hợp lệ."
        );
    }
};

const normalizeSortOrder = (
    value
) => {
    const result =
        Number(
            value ?? 0
        );

    if (
        !Number.isInteger(
            result
        ) ||
        result < 0
    ) {
        throw new ApiError(
            400,
            "Thứ tự hiển thị phải là số nguyên từ 0 trở lên."
        );
    }

    return result;
};

// ============================================================
// LIST
// ============================================================

const getSizes =
    async (
        filters = {}
    ) => {
        return sizeModel
            .getSizes({
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

const getSizeById =
    async (
        sizeId
    ) => {
        const id =
            parseId(
                sizeId
            );

        const size =
            await sizeModel
                .getSizeById(
                    id
                );

        if (!size) {
            throw new ApiError(
                404,
                "Không tìm thấy size."
            );
        }

        return size;
    };

// ============================================================
// CREATE
// ============================================================

const createSize =
    async (
        body = {}
    ) => {
        const sizeName =
            String(
                body.sizeName ||
                    ""
            ).trim();

        if (!sizeName) {
            throw new ApiError(
                400,
                "Tên size là bắt buộc."
            );
        }

        const sortOrder =
            normalizeSortOrder(
                body.sortOrder
            );

        const status =
            body.status ||
            "active";

        validateStatus(
            status
        );

        const exists =
            await sizeModel
                .findByName(
                    sizeName
                );

        if (exists) {
            throw new ApiError(
                409,
                "Size này đã tồn tại."
            );
        }

        try {
            const id =
                await sizeModel
                    .createSize({
                        sizeName,
                        sortOrder,
                        status,
                    });

            return getSizeById(
                id
            );
        } catch (error) {
            if (
                error?.code ===
                "ER_DUP_ENTRY"
            ) {
                throw new ApiError(
                    409,
                    "Size này đã tồn tại."
                );
            }

            throw error;
        }
    };

// ============================================================
// UPDATE
// ============================================================

const updateSize =
    async (
        sizeId,
        body = {}
    ) => {
        const id =
            parseId(
                sizeId
            );

        const current =
            await sizeModel
                .getSizeById(
                    id
                );

        if (!current) {
            throw new ApiError(
                404,
                "Không tìm thấy size."
            );
        }

        const sizeName =
            body.sizeName !==
            undefined
                ? String(
                      body.sizeName
                  ).trim()
                : current.size_name;

        if (!sizeName) {
            throw new ApiError(
                400,
                "Tên size là bắt buộc."
            );
        }

        const sortOrder =
            body.sortOrder !==
            undefined
                ? normalizeSortOrder(
                      body.sortOrder
                  )
                : Number(
                      current.sort_order ||
                          0
                  );

        const status =
            body.status ||
            current.status;

        validateStatus(
            status
        );

        const duplicate =
            await sizeModel
                .findByName(
                    sizeName,
                    id
                );

        if (duplicate) {
            throw new ApiError(
                409,
                "Size này đã tồn tại."
            );
        }

        await sizeModel
            .updateSize(
                id,
                {
                    sizeName,
                    sortOrder,
                    status,
                }
            );

        return getSizeById(
            id
        );
    };

// ============================================================
// STATUS
// ============================================================

const updateStatus =
    async (
        sizeId,
        status
    ) => {
        const id =
            parseId(
                sizeId
            );

        validateStatus(
            status
        );

        await getSizeById(
            id
        );

        await sizeModel
            .updateStatus(
                id,
                status
            );

        return getSizeById(
            id
        );
    };

// ============================================================
// DELETE
// ============================================================

const deleteSize =
    async (
        sizeId
    ) => {
        const id =
            parseId(
                sizeId
            );

        await getSizeById(
            id
        );

        const variantCount =
            await sizeModel
                .countVariants(
                    id
                );

        if (
            variantCount > 0
        ) {
            throw new ApiError(
                409,
                `Không thể xóa size vì đang có ${variantCount} biến thể sản phẩm sử dụng. Hãy chuyển sang trạng thái tạm ngừng.`
            );
        }

        try {
            await sizeModel
                .deleteSize(
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
                    "Size đang được sản phẩm sử dụng."
                );
            }

            throw error;
        }
    };

module.exports = {
    getSizes,
    getSizeById,
    createSize,
    updateSize,
    updateStatus,
    deleteSize,
};