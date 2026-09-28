import axiosClient from "../api/axiosClient";

// ============================================================
// HELPERS
// ============================================================

const unwrap = (
    response
) =>
    response?.data?.data ??
    response?.data ??
    null;

// ============================================================
// GET CATEGORIES
// ============================================================

const getCategories =
    async (
        params = {}
    ) => {
        const response =
            await axiosClient.get(
                "/admin/categories",
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

// ============================================================
// GET DETAIL
// ============================================================

const getCategory =
    async (
        id
    ) => {
        const response =
            await axiosClient.get(
                `/admin/categories/${id}`
            );

        return unwrap(
            response
        );
    };

// ============================================================
// CREATE
// ============================================================

const createCategory =
    async (
        payload
    ) => {
        const response =
            await axiosClient.post(
                "/admin/categories",
                payload
            );

        return response?.data;
    };

// ============================================================
// UPDATE
// ============================================================

const updateCategory =
    async (
        id,
        payload
    ) => {
        const response =
            await axiosClient.put(
                `/admin/categories/${id}`,
                payload
            );

        return response?.data;
    };

// ============================================================
// STATUS
// ============================================================

const updateStatus =
    async (
        id,
        status
    ) => {
        const response =
            await axiosClient.patch(
                `/admin/categories/${id}/status`,
                {
                    status,
                }
            );

        return response?.data;
    };

// ============================================================
// DELETE
// ============================================================

const deleteCategory =
    async (
        id
    ) => {
        const response =
            await axiosClient.delete(
                `/admin/categories/${id}`
            );

        return response?.data;
    };

// ============================================================
// EXPORT
// ============================================================

const adminCategoryService = {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    updateStatus,
    deleteCategory,
};

export default
    adminCategoryService;