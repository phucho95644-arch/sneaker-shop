import axiosClient from "../api/axiosClient";

// ============================================================
// GET PROFILE
// GET /api/users/profile
// ============================================================

const getProfile = async () => {
    const response =
        await axiosClient.get(
            "/users/profile"
        );

    return response.data;
};

// ============================================================
// UPDATE PROFILE
// PUT /api/users/profile
// ============================================================

const updateProfile = async (
    payload
) => {
    const response =
        await axiosClient.put(
            "/users/profile",
            payload
        );

    return response.data;
};

const userService = {
    getProfile,
    updateProfile,
};

export default userService;