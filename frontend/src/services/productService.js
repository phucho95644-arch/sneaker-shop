import axiosClient from "../api/axiosClient";

// ============================================================
// PRODUCT SERVICE
// ============================================================

const getProducts = async (
    params = {}
) => {
    const response =
        await axiosClient.get(
            "/products",
            {
                params,
            }
        );

    return response.data;
};

const getProductById = async (
    id
) => {
    const response =
        await axiosClient.get(
            `/products/${id}`
        );

    return response.data;
};

const productService = {
    getProducts,
    getProductById,
};

export default productService;