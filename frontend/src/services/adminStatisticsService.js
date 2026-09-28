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
// REVENUE
// ============================================================

const getRevenue = async (params = {}) => {
    const response = await axiosClient.get(
        "/admin/statistics/revenue",
        {
            params,
        }
    );

    return unwrap(response);
};

// ============================================================
// ORDERS
// ============================================================

const getOrders = async (params = {}) => {
    const response = await axiosClient.get(
        "/admin/statistics/orders",
        {
            params,
        }
    );

    return unwrap(response);
};

// ============================================================
// PRODUCTS
// ============================================================

const getProducts = async () => {
    const response = await axiosClient.get(
        "/admin/statistics/products"
    );

    return unwrap(response);
};

// ============================================================
// CUSTOMERS
// ============================================================

const getCustomers = async () => {
    const response = await axiosClient.get(
        "/admin/statistics/customers"
    );

    return unwrap(response);
};

// ============================================================
// CUSTOMER GROWTH
// ============================================================

const getCustomerGrowth = async (params = {}) => {
    const response = await axiosClient.get(
        "/admin/statistics/customers/growth",
        {
            params,
        }
    );

    return unwrap(response);
};

// ============================================================
// TOP PRODUCTS
// ============================================================

const getTopProducts = async (params = {}) => {
    const response = await axiosClient.get(
        "/admin/statistics/top-products",
        {
            params,
        }
    );

    return unwrap(response);
};

// ============================================================
// TOP CUSTOMERS
// ============================================================

const getTopCustomers = async (params = {}) => {
    const response = await axiosClient.get(
        "/admin/statistics/top-customers",
        {
            params,
        }
    );

    return unwrap(response);
};

// ============================================================
// SALES
// ============================================================

const getSales = async (params = {}) => {
    const response = await axiosClient.get(
        "/admin/statistics/sales",
        {
            params,
        }
    );

    return unwrap(response);
};

// ============================================================
// RECENT ORDERS
// ============================================================

const getRecentOrders = async (params = {}) => {
    const response = await axiosClient.get(
        "/admin/orders/recent",
        {
            params,
        }
    );

    return unwrap(response);
};

// ============================================================
// EXPORT
// ============================================================

const adminStatisticsService = {
    getRevenue,
    getOrders,
    getProducts,
    getCustomers,
    getCustomerGrowth,
    getTopProducts,
    getTopCustomers,
    getSales,
    getRecentOrders,
};

export default adminStatisticsService;