import axiosClient
    from "../api/axiosClient";

const unwrap = (
    response
) =>
    response?.data?.data ??
    response?.data ??
    null;

// ============================================================
// ADMIN PRODUCTS
// ============================================================

const getProducts =
    async (
        params = {}
    ) => {
        const response =
            await axiosClient.get(
                "/admin/products",
                {
                    params,
                }
            );

        const data =
            unwrap(
                response
            );

        return Array.isArray(
            data
        )
            ? data
            : [];
    };

const getProduct =
    async (
        id
    ) => {
        const response =
            await axiosClient.get(
                `/admin/products/${id}`
            );

        return unwrap(
            response
        );
    };

const createProduct =
    async (
        payload
    ) => {
        const response =
            await axiosClient.post(
                "/admin/products",
                payload
            );

        return response?.data;
    };

const updateProduct =
    async (
        id,
        payload
    ) => {
        const response =
            await axiosClient.put(
                `/admin/products/${id}`,
                payload
            );

        return response?.data;
    };

const updateStatus =
    async (
        id,
        status
    ) => {
        const response =
            await axiosClient.patch(
                `/admin/products/${id}/status`,
                {
                    status,
                }
            );

        return response?.data;
    };

// ============================================================
// INVENTORY
// ============================================================

const getInventory =
    async () => {
        const response =
            await axiosClient.get(
                "/admin/inventory"
            );

        const data =
            unwrap(
                response
            );

        return Array.isArray(
            data
        )
            ? data
            : [];
    };

// ============================================================
// CATALOG
// ============================================================

const getCategories =
    async () => {
        const response =
            await axiosClient.get(
                "/categories"
            );

        const data =
            unwrap(
                response
            );

        return Array.isArray(
            data
        )
            ? data
            : [];
    };

const getBrands =
    async () => {
        const response =
            await axiosClient.get(
                "/brands"
            );

        const data =
            unwrap(
                response
            );

        return Array.isArray(
            data
        )
            ? data
            : [];
    };

const getSizes =
    async () => {
        const response =
            await axiosClient.get(
                "/sizes"
            );

        const data =
            unwrap(
                response
            );

        return Array.isArray(
            data
        )
            ? data
            : [];
    };

const getColors =
    async () => {
        const response =
            await axiosClient.get(
                "/colors"
            );

        const data =
            unwrap(
                response
            );

        return Array.isArray(
            data
        )
            ? data
            : [];
    };

// ============================================================
// EXPORT
// ============================================================

const adminProductService = {
    getProducts,
    getProduct,

    createProduct,
    updateProduct,
    updateStatus,

    getInventory,

    getCategories,
    getBrands,
    getSizes,
    getColors,
};

export default
    adminProductService;