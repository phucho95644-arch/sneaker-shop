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
// GET BRANDS
// ============================================================

const getBrands = async (
    params = {}
) => {
    const response =
        await axiosClient.get(
            "/admin/brands",
            {
                params,
            }
        );

    const data =
        unwrap(response);

    return Array.isArray(data)
        ? data
        : [];
};

// ============================================================
// GET DETAIL
// ============================================================

const getBrand = async (id) => {
    const response =
        await axiosClient.get(
            `/admin/brands/${id}`
        );

    return unwrap(response);
};

// ============================================================
// CREATE
// ============================================================

const createBrand = async (
    payload
) => {
    const response =
        await axiosClient.post(
            "/admin/brands",
            payload
        );

    return response.data;
};

// ============================================================
// UPDATE
// ============================================================

const updateBrand = async (
    id,
    payload
) => {
    const response =
        await axiosClient.put(
            `/admin/brands/${id}`,
            payload
        );

    return response.data;
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
            `/admin/brands/${id}/status`,
            {
                status,
            }
        );

    return response.data;
};

// ============================================================
// DELETE
// ============================================================

const deleteBrand = async (
    id
) => {
    const response =
        await axiosClient.delete(
            `/admin/brands/${id}`
        );

    return response.data;
};

// ============================================================
// EXPORT
// ============================================================

const adminBrandService = {
    getBrands,
    getBrand,
    createBrand,
    updateBrand,
    updateStatus,
    deleteBrand,
};

export default adminBrandService;