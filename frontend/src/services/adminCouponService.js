import axiosClient from "../api/axiosClient";

const extractData = (response) => {
    return (
        response?.data?.data ??
        response?.data ??
        null
    );
};

const extractList = (response) => {
    const data = extractData(response);

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.coupons)) {
        return data.coupons;
    }

    if (Array.isArray(data?.items)) {
        return data.items;
    }

    return [];
};

const getCoupons = async (params = {}) => {
    const response = await axiosClient.get(
        "/admin/coupons",
        {
            params,
        }
    );

    return extractList(response);
};

const createCoupon = async (payload) => {
    const response = await axiosClient.post(
        "/admin/coupons",
        payload
    );

    return response?.data;
};

const updateCoupon = async (
    id,
    payload
) => {
    const response = await axiosClient.put(
        `/admin/coupons/${id}`,
        payload
    );

    return response?.data;
};

const updateStatus = async (
    id,
    status
) => {
    const response = await axiosClient.patch(
        `/admin/coupons/${id}/status`,
        {
            status,
        }
    );

    return response?.data;
};

const adminCouponService = {
    getCoupons,
    createCoupon,
    updateCoupon,
    updateStatus,
};

export default adminCouponService;