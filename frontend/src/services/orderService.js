import axiosClient from "../api/axiosClient";

// ============================================================
// CREATE ORDER
// POST /api/orders
// ============================================================

const createOrder = async (
    payload
) => {
    const response =
        await axiosClient.post(
            "/orders",
            payload
        );

    return response.data;
};

// ============================================================
// GET MY ORDERS
//
// Project đã từng có nhiều phiên bản route:
// GET /orders
// GET /orders/my
// GET /orders/my-orders
//
// Chỉ fallback khi route không tồn tại.
// ============================================================

const getMyOrders = async (
    params = {}
) => {
    const endpoints = [
        "/orders",
        "/orders/my",
        "/orders/my-orders",
    ];

    let lastError = null;

    for (
        const endpoint
        of endpoints
    ) {
        try {
            const response =
                await axiosClient.get(
                    endpoint,
                    {
                        params,
                    }
                );

            return response.data;
        } catch (error) {
            lastError =
                error;

            const status =
                error.response
                    ?.status;

            // Nếu route tồn tại nhưng request lỗi thật
            // thì không thử route khác.
            if (
                status !== 404 &&
                status !== 405
            ) {
                throw error;
            }
        }
    }

    throw lastError;
};

// ============================================================
// GET ORDER DETAIL
// GET /api/orders/:id
// ============================================================

const getOrderById = async (
    id
) => {
    const response =
        await axiosClient.get(
            `/orders/${id}`
        );

    return response.data;
};

// ============================================================
// CANCEL ORDER
// PUT /api/orders/:id/cancel
// ============================================================

const cancelOrder = async (
    id
) => {
    const response =
        await axiosClient.put(
            `/orders/${id}/cancel`
        );

    return response.data;
};

const orderService = {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
};

export default orderService;