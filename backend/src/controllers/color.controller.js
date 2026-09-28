const asyncHandler =
    require(
        "../utils/asyncHandler"
    );

const colorService =
    require(
        "../services/color.service"
    );

// ============================================================
// GET ALL COLORS
//
// GET /api/admin/colors
// ============================================================

const getColors =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await colorService
                    .getColors(
                        req.query
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
// GET COLOR DETAIL
//
// GET /api/admin/colors/:id
// ============================================================

const getColor =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await colorService
                    .getColorById(
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
// CREATE COLOR
//
// POST /api/admin/colors
// ============================================================

const createColor =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await colorService
                    .createColor(
                        req.body
                    );

            res.status(
                201
            ).json({
                success: true,
                message:
                    "Thêm màu sắc thành công.",
                data,
            });
        }
    );

// ============================================================
// UPDATE COLOR
//
// PUT /api/admin/colors/:id
// ============================================================

const updateColor =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await colorService
                    .updateColor(
                        req.params.id,
                        req.body
                    );

            res.status(
                200
            ).json({
                success: true,
                message:
                    "Cập nhật màu sắc thành công.",
                data,
            });
        }
    );

// ============================================================
// UPDATE STATUS
//
// PATCH /api/admin/colors/:id/status
// ============================================================

const updateStatus =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await colorService
                    .updateStatus(
                        req.params.id,
                        req.body.status
                    );

            res.status(
                200
            ).json({
                success: true,
                message:
                    "Cập nhật trạng thái màu sắc thành công.",
                data,
            });
        }
    );

// ============================================================
// DELETE COLOR
//
// DELETE /api/admin/colors/:id
// ============================================================

const deleteColor =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const data =
                await colorService
                    .deleteColor(
                        req.params.id
                    );

            res.status(
                200
            ).json({
                success: true,
                message:
                    "Xóa màu sắc thành công.",
                data,
            });
        }
    );

// ============================================================
// EXPORT
// ============================================================

module.exports = {
    getColors,
    getColor,
    createColor,
    updateColor,
    updateStatus,
    deleteColor,
};