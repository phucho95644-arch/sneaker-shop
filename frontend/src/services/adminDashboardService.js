import axiosClient from "../api/axiosClient";

// ============================================================
// ADMIN DASHBOARD SERVICE
// ============================================================

const getDashboard = async () => {
    const response =
        await axiosClient.get(
            "/admin/dashboard"
        );

    return response.data;
};

const adminDashboardService = {
    getDashboard,
};

export default adminDashboardService;
