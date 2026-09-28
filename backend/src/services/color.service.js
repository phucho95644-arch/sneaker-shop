const ApiError =
    require(
        "../utils/ApiError"
    );

const colorModel =
    require(
        "../models/adminColor.model"
    );

// ============================================================
// PARSE ID
// ============================================================

const parseId = (
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
            "ID màu sắc không hợp lệ."
        );
    }

    return id;
};

// ============================================================
// NORMALIZE STATUS
// ============================================================

const normalizeStatus = (
    value
) => {
    const status =
        String(
            value ||
                "active"
        )
            .trim()
            .toLowerCase();

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
            "Trạng thái màu sắc không hợp lệ."
        );
    }

    return status;
};

// ============================================================
// NORMALIZE HEX
// ============================================================

const normalizeHex =
    (
        value
    ) => {
        if (
            value ===
                undefined ||
            value === null ||
            String(
                value
            ).trim() === ""
        ) {
            return null;
        }

        let hex =
            String(
                value
            )
                .trim()
                .toUpperCase();

        if (
            !hex.startsWith(
                "#"
            )
        ) {
            hex =
                `#${hex}`;
        }

        if (
            !/^#[0-9A-F]{6}$/.test(
                hex
            )
        ) {
            throw new ApiError(
                400,
                "Mã màu phải có dạng #RRGGBB. Ví dụ: #FF0000."
            );
        }

        return hex;
    };

// ============================================================
// GET COLORS
// ============================================================

const getColors =
    async (
        query = {}
    ) => {
        return colorModel
            .getColors({
                search:
                    String(
                        query.search ||
                            ""
                    ).trim(),

                status:
                    String(
                        query.status ||
                            ""
                    )
                        .trim()
                        .toLowerCase(),
            });
    };

// ============================================================
// GET DETAIL
// ============================================================

const getColorById =
    async (
        rawId
    ) => {
        const id =
            parseId(
                rawId
            );

        const color =
            await colorModel
                .getColorById(
                    id
                );

        if (!color) {
            throw new ApiError(
                404,
                "Không tìm thấy màu sắc."
            );
        }

        return color;
    };

// ============================================================
// CREATE
// ============================================================

const createColor =
    async (
        payload
    ) => {
        const name =
            String(
                payload.name ||
                    ""
            ).trim();

        if (!name) {
            throw new ApiError(
                400,
                "Tên màu sắc là bắt buộc."
            );
        }

        const duplicate =
            await colorModel
                .findByName(
                    name
                );

        if (duplicate) {
            throw new ApiError(
                409,
                "Tên màu sắc đã tồn tại."
            );
        }

        const hex_code =
            normalizeHex(
                payload.hex_code
            );

        const status =
            normalizeStatus(
                payload.status
            );

        const id =
            await colorModel
                .createColor({
                    name,
                    hex_code,
                    status,
                });

        return getColorById(
            id
        );
    };

// ============================================================
// UPDATE
// ============================================================

const updateColor =
    async (
        rawId,
        payload
    ) => {
        const id =
            parseId(
                rawId
            );

        const current =
            await colorModel
                .getColorById(
                    id
                );

        if (!current) {
            throw new ApiError(
                404,
                "Không tìm thấy màu sắc."
            );
        }

        const name =
            String(
                payload.name ??
                    current.name
            ).trim();

        if (!name) {
            throw new ApiError(
                400,
                "Tên màu sắc là bắt buộc."
            );
        }

        const duplicate =
            await colorModel
                .findByName(
                    name,
                    id
                );

        if (duplicate) {
            throw new ApiError(
                409,
                "Tên màu sắc đã tồn tại."
            );
        }

        const hex_code =
            normalizeHex(
                payload.hex_code ??
                    current.hex_code
            );

        const status =
            normalizeStatus(
                payload.status ??
                    current.status
            );

        await colorModel
            .updateColor(
                id,
                {
                    name,
                    hex_code,
                    status,
                }
            );

        return getColorById(
            id
        );
    };

// ============================================================
// UPDATE STATUS
// ============================================================

const updateStatus =
    async (
        rawId,
        rawStatus
    ) => {
        const id =
            parseId(
                rawId
            );

        const current =
            await colorModel
                .getColorById(
                    id
                );

        if (!current) {
            throw new ApiError(
                404,
                "Không tìm thấy màu sắc."
            );
        }

        const status =
            normalizeStatus(
                rawStatus
            );

        await colorModel
            .updateStatus(
                id,
                status
            );

        return getColorById(
            id
        );
    };

// ============================================================
// DELETE
// ============================================================

const deleteColor =
    async (
        rawId
    ) => {
        const id =
            parseId(
                rawId
            );

        const current =
            await colorModel
                .getColorById(
                    id
                );

        if (!current) {
            throw new ApiError(
                404,
                "Không tìm thấy màu sắc."
            );
        }

        const variantCount =
            await colorModel
                .countVariants(
                    id
                );

        if (
            variantCount >
            0
        ) {
            throw new ApiError(
                409,
                `Không thể xóa màu sắc vì đang được sử dụng bởi ${variantCount} biến thể sản phẩm. Hãy chuyển trạng thái sang inactive.`
            );
        }

        await colorModel
            .deleteColor(
                id
            );

        return {
            id,
        };
    };

// ============================================================
// EXPORT
// ============================================================

module.exports = {
    getColors,
    getColorById,
    createColor,
    updateColor,
    updateStatus,
    deleteColor,
};