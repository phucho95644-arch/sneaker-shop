const { pool } = require("../config/db");

const AdminUserModel = require(
    "../models/adminUser.model"
);

const ApiError = require(
    "../utils/ApiError"
);

// ============================================================
// FORMAT USER
// ============================================================
const formatUser = (user) => {
    if (!user) {
        return null;
    }

    return {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
    };
};

// ============================================================
// GET ALL USERS
// ============================================================
exports.getUsers = async (
    query = {}
) => {
    const page = Math.max(
        Number(query.page) || 1,
        1
    );

    const limit = Math.min(
        Math.max(
            Number(query.limit) || 20,
            1
        ),
        100
    );

    const result =
        await AdminUserModel.findAll({
            page,
            limit,

            search:
                query.search?.trim() || "",

            role:
                query.role || "",

            status:
                query.status || "",

            sort:
                query.sort || "newest",
        });

    const totalPages =
        Math.ceil(
            result.total / limit
        );

    return {
        items: result.rows.map(
            (user) => ({
                id: user.id,

                fullName:
                    user.full_name,

                email:
                    user.email,

                phone:
                    user.phone,

                avatar:
                    user.avatar,

                role:
                    user.role,

                status:
                    user.status,

                createdAt:
                    user.created_at,

                statistics: {
                    totalOrders:
                        Number(
                            user.total_orders ||
                                0
                        ),

                    deliveredOrders:
                        Number(
                            user.delivered_orders ||
                                0
                        ),

                    totalSpent:
                        Number(
                            user.total_spent ||
                                0
                        ),
                },
            })
        ),

        pagination: {
            page,
            limit,

            totalItems:
                result.total,

            totalPages,

            hasNextPage:
                page < totalPages,

            hasPreviousPage:
                page > 1,
        },
    };
};

// ============================================================
// GET USER DETAIL
// ============================================================
exports.getUserDetail = async (
    userId
) => {
    const user =
        await AdminUserModel.findById(
            userId
        );

    if (!user) {
        throw new ApiError(
            404,
            "Không tìm thấy người dùng"
        );
    }

    const [
        addresses,
        orderStatistics,
        recentOrders,
        reviewStatistics,
        favoriteCount,
    ] = await Promise.all([
        AdminUserModel.getAddresses(
            userId
        ),

        AdminUserModel.getOrderStatistics(
            userId
        ),

        AdminUserModel.getRecentOrders(
            userId,
            5
        ),

        AdminUserModel.getReviewStatistics(
            userId
        ),

        AdminUserModel.getFavoriteCount(
            userId
        ),
    ]);

    return {
        ...formatUser(user),

        addresses:
            addresses.map(
                (address) => ({
                    id:
                        address.id,

                    receiverName:
                        address.receiver_name,

                    receiverPhone:
                        address.receiver_phone,

                    province:
                        address.province,

                    district:
                        address.district,

                    ward:
                        address.ward,

                    addressDetail:
                        address.address_detail,

                    isDefault:
                        Boolean(
                            address.is_default
                        ),

                    createdAt:
                        address.created_at,
                })
            ),

        statistics: {
            totalOrders:
                Number(
                    orderStatistics
                        ?.total_orders || 0
                ),

            deliveredOrders:
                Number(
                    orderStatistics
                        ?.delivered_orders || 0
                ),

            cancelledOrders:
                Number(
                    orderStatistics
                        ?.cancelled_orders || 0
                ),

            totalSpent:
                Number(
                    orderStatistics
                        ?.total_spent || 0
                ),

            totalReviews:
                Number(
                    reviewStatistics
                        ?.total_reviews || 0
                ),

            approvedReviews:
                Number(
                    reviewStatistics
                        ?.approved_reviews || 0
                ),

            pendingReviews:
                Number(
                    reviewStatistics
                        ?.pending_reviews || 0
                ),

            hiddenReviews:
                Number(
                    reviewStatistics
                        ?.hidden_reviews || 0
                ),

            favoriteCount:
                Number(
                    favoriteCount || 0
                ),
        },

        recentOrders:
            recentOrders.map(
                (order) => ({
                    id:
                        order.id,

                    orderCode:
                        order.order_code,

                    totalAmount:
                        Number(
                            order.total_amount ||
                                0
                        ),

                    paymentMethod:
                        order.payment_method,

                    paymentStatus:
                        order.payment_status,

                    orderStatus:
                        order.order_status,

                    createdAt:
                        order.created_at,
                })
            ),
    };
};

// ============================================================
// UPDATE USER STATUS
// ============================================================
exports.updateStatus = async (
    currentAdminId,
    targetUserId,
    status
) => {
    const connection =
        await pool.getConnection();

    try {
        await connection.beginTransaction();

        const user =
            await AdminUserModel.lockById(
                targetUserId,
                connection
            );

        if (!user) {
            throw new ApiError(
                404,
                "Không tìm thấy người dùng"
            );
        }

        // Admin không được block/inactive chính mình
        if (
            Number(currentAdminId) ===
                Number(targetUserId) &&
            status !== "active"
        ) {
            throw new ApiError(
                400,
                "Bạn không thể khóa hoặc vô hiệu hóa chính tài khoản admin đang đăng nhập"
            );
        }

        // Không cho hệ thống mất admin active cuối cùng
        if (
            user.role === "admin" &&
            user.status === "active" &&
            status !== "active"
        ) {
            const activeAdmins =
                await AdminUserModel
                    .lockActiveAdmins(
                        connection
                    );

            if (
                activeAdmins.length <= 1
            ) {
                throw new ApiError(
                    400,
                    "Không thể vô hiệu hóa admin hoạt động cuối cùng"
                );
            }
        }

        await AdminUserModel.updateStatus(
            targetUserId,
            status,
            connection
        );

        await connection.commit();

        const updatedUser =
            await AdminUserModel.findById(
                targetUserId
            );

        return formatUser(
            updatedUser
        );
    } catch (error) {
        await connection.rollback();

        throw error;
    } finally {
        connection.release();
    }
};

// ============================================================
// UPDATE USER ROLE
// ============================================================
exports.updateRole = async (
    currentAdminId,
    targetUserId,
    role
) => {
    const connection =
        await pool.getConnection();

    try {
        await connection.beginTransaction();

        const user =
            await AdminUserModel.lockById(
                targetUserId,
                connection
            );

        if (!user) {
            throw new ApiError(
                404,
                "Không tìm thấy người dùng"
            );
        }

        // Admin không tự hạ quyền
        if (
            Number(currentAdminId) ===
                Number(targetUserId) &&
            role !== "admin"
        ) {
            throw new ApiError(
                400,
                "Bạn không thể tự hạ quyền admin của chính mình"
            );
        }

        // Không hạ quyền admin active cuối cùng
        if (
            user.role === "admin" &&
            user.status === "active" &&
            role !== "admin"
        ) {
            const activeAdmins =
                await AdminUserModel
                    .lockActiveAdmins(
                        connection
                    );

            if (
                activeAdmins.length <= 1
            ) {
                throw new ApiError(
                    400,
                    "Không thể hạ quyền admin hoạt động cuối cùng"
                );
            }
        }

        await AdminUserModel.updateRole(
            targetUserId,
            role,
            connection
        );

        await connection.commit();

        const updatedUser =
            await AdminUserModel.findById(
                targetUserId
            );

        return formatUser(
            updatedUser
        );
    } catch (error) {
        await connection.rollback();

        throw error;
    } finally {
        connection.release();
    }
};