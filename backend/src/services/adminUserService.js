import axiosClient from "../api/axiosClient";

// ============================================================
// HELPERS
// ============================================================

const unwrap = (response) =>
    response?.data?.data ??
    response?.data ??
    null;

// ============================================================
// GET USERS
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

// ============================================================
// GET USER DETAIL
// ============================================================

const getUser = async (id) => {
    const response =
        await axiosClient.get(
            `/admin/users/${id}`
        );

    return unwrap(response);
};

// ============================================================
// UPDATE STATUS
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

    return response?.data;
};

// ============================================================
// UPDATE ROLE
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

    return response?.data;
};

// ============================================================
// EXPORT
// ============================================================

const adminUserService = {
    getUsers,
    getUser,
    updateStatus,
    updateRole,
};

export default adminUserService;