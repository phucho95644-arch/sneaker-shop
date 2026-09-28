import axiosClient from "../api/axiosClient";

// ============================================================
// HELPERS
// ============================================================

const unwrap = (response) =>
    response?.data?.data ??
    response?.data ??
    null;

// ============================================================
// USERS
// ============================================================

const getUsers = async (params = {}) => {
    const response =
        await axiosClient.get(
            "/admin/users",
            {
                params,
            }
        );

    return unwrap(response);
};

const getUser = async (id) => {
    const response =
        await axiosClient.get(
            `/admin/users/${id}`
        );

    return unwrap(response);
};

const getUserById = async (id) => {
    return getUser(id);
};

// ============================================================
// STATUS
// ============================================================

const updateStatus = async (
    id,
    status
) => {
    const response =
        await axiosClient.patch(
            `/admin/users/${id}/status`,
            {
                status,
            }
        );

    return (
        response?.data ??
        null
    );
};

const updateUserStatus = async (
    id,
    status
) => {
    return updateStatus(
        id,
        status
    );
};

// ============================================================
// ROLE
// ============================================================

const updateRole = async (
    id,
    role
) => {
    const response =
        await axiosClient.patch(
            `/admin/users/${id}/role`,
            {
                role,
            }
        );

    return (
        response?.data ??
        null
    );
};

const updateUserRole = async (
    id,
    role
) => {
    return updateRole(
        id,
        role
    );
};

// ============================================================
// EXPORT
// ============================================================

const adminUserService = {
    getUsers,

    getUser,
    getUserById,

    updateStatus,
    updateUserStatus,

    updateRole,
    updateUserRole,
};

export default adminUserService;