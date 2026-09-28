const asyncHandler =
    require("../utils/asyncHandler");

const sizeService =
    require("../services/adminSize.service");

// ============================================================
// LIST
// ============================================================

const getSizes =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await sizeService
                    .getSizes({
                        search:
                            req.query.search,

                        status:
                            req.query.status,
                    });

            res.status(
                200
            ).json({
                success: true,
                data,
            });
        }
    );

// ============================================================
// DETAIL
// ============================================================

const getSize =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await sizeService
                    .getSizeById(
                        req.params.id
                    );

            res.status(
                200
            ).json({
                success: true,
                data,
            });
        }
    );

// ============================================================
// CREATE
// ============================================================

const createSize =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await sizeService
                    .createSize(
                        req.body
                    );

            res.status(
                201
            ).json({
                success: true,
                message:
                    "Thêm size thành công.",
                data,
            });
        }
    );

// ============================================================
// UPDATE
// ============================================================

const updateSize =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await sizeService
                    .updateSize(
                        req.params.id,
                        req.body
                    );

            res.status(
                200
            ).json({
                success: true,
                message:
                    "Cập nhật size thành công.",
                data,
            });
        }
    );

// ============================================================
// STATUS
// ============================================================

const updateStatus =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await sizeService
                    .updateStatus(
                        req.params.id,
                        req.body.status
                    );

            res.status(
                200
            ).json({
                success: true,
                message:
                    "Cập nhật trạng thái size thành công.",
                data,
            });
        }
    );

// ============================================================
// DELETE
// ============================================================

const deleteSize =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await sizeService
                    .deleteSize(
                        req.params.id
                    );

            res.status(
                200
            ).json({
                success: true,
                message:
                    "Xóa size thành công.",
                data,
            });
        }
    );

module.exports = {
    getSizes,
    getSize,
    createSize,
    updateSize,
    updateStatus,
    deleteSize,
};