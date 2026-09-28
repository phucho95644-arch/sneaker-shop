const AdminUserService = require(
    "../services/adminUser.service"
);

const asyncHandler = require(
    "../utils/asyncHandler"
);

// ============================================================
// GET USERS
// ============================================================
exports.getUsers = asyncHandler(
    async (req, res) => {
        const data =
            await AdminUserService.getUsers(
                req.query
            );

        return res.status(200).json({
            success: true,

            message:
                "Lấy danh sách người dùng thành công",

            data,
        });
    }
);

// ============================================================
// GET USER DETAIL
// ============================================================
exports.getUserDetail = asyncHandler(
    async (req, res) => {
        const data =
            await AdminUserService.getUserDetail(
                Number(req.params.id)
            );

        return res.status(200).json({
            success: true,

            message:
                "Lấy chi tiết người dùng thành công",

            data,
        });
    }
);

// ============================================================
// UPDATE STATUS
// ============================================================
exports.updateStatus = asyncHandler(
    async (req, res) => {
        const data =
            await AdminUserService.updateStatus(
                req.user.id,
                Number(req.params.id),
                req.body.status
            );

        return res.status(200).json({
            success: true,

            message:
                "Cập nhật trạng thái người dùng thành công",

            data,
        });
    }
);

// ============================================================
// UPDATE ROLE
// ============================================================
exports.updateRole = asyncHandler(
    async (req, res) => {
        const data =
            await AdminUserService.updateRole(
                req.user.id,
                Number(req.params.id),
                req.body.role
            );

        return res.status(200).json({
            success: true,

            message:
                "Cập nhật quyền người dùng thành công",

            data,
        });
    }
);