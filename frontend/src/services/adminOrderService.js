    import axiosClient from "../api/axiosClient";

// ============================================================
// HELPERS
// ============================================================

const unwrap = (response) => {
    return (
        response?.data?.data ??
        response?.data ??
        null
    );
};

// ============================================================
// GET ORDERS
// ============================================================

const getOrders = async (params = {}) => {
    const response =
        await axiosClient.get(
            "/admin/orders",
            {
                params,
            }
        );

    return unwrap(response);
};

// ============================================================
// GET ORDER DETAIL
// ============================================================

const getOrder = async (id) => {
    const response =
        await axiosClient.get(
            `/admin/orders/${id}`
        );

    return unwrap(response);
};

// ============================================================
// UPDATE ORDER STATUS
// ============================================================

const updateStatus = async (
    id,
    status
) => {
    const response =
        await axiosClient.patch(
            `/admin/orders/${id}/status`,
            {
                status,
            }
        );

    return response?.data;
};

// ============================================================
// UPDATE PAYMENT STATUS
// ============================================================

const updatePaymentStatus = async (
    id,
    {
        paymentStatus,
        transactionCode = null,
    }
) => {
    const response =
        await axiosClient.patch(
            `/admin/orders/${id}/payment-status`,
            {
                paymentStatus,
                transactionCode,
            }
        );

    return response?.data;
};

// ============================================================
// EXPORT
// ============================================================

const adminOrderService = {
    getOrders,
    getOrder,
    updateStatus,
    updatePaymentStatus,
};

export default adminOrderService;