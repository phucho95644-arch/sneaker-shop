import axiosClient from "../api/axiosClient";

// ============================================================
// AUTH SERVICE
// ============================================================

const register = async (payload) => {
    const response =
        await axiosClient.post(
            "/auth/register",
            payload
        );

    return response.data;
};

const login = async (payload) => {
    const response =
        await axiosClient.post(
            "/auth/login",
            payload
        );

    return response.data;
};

const getMe = async () => {
    const response =
        await axiosClient.get(
            "/auth/me"
        );

    return response.data;
};

const changePassword = async (
    payload
) => {
    const response =
        await axiosClient.put(
            "/auth/change-password",
            payload
        );

    return response.data;
};

const authService = {
    register,
    login,
    getMe,
    changePassword,
};

export default authService;