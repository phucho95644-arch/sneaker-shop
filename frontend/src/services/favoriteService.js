import axiosClient from "../api/axiosClient";

// ============================================================
// GET FAVORITES
// GET /api/favorites
// ============================================================

const getFavorites = async () => {
    const response =
        await axiosClient.get(
            "/favorites"
        );

    return response.data;
};

// ============================================================
// ADD FAVORITE
// POST /api/favorites/:productId
// ============================================================

const addFavorite = async (
    productId
) => {
    const response =
        await axiosClient.post(
            `/favorites/${productId}`
        );

    return response.data;
};

// ============================================================
// REMOVE FAVORITE
// DELETE /api/favorites/:productId
// ============================================================

const removeFavorite = async (
    productId
) => {
    const response =
        await axiosClient.delete(
            `/favorites/${productId}`
        );

    return response.data;
};

// ============================================================
// CHECK FAVORITE
// GET /api/favorites/check/:productId
// ============================================================

const checkFavorite = async (
    productId
) => {
    const response =
        await axiosClient.get(
            `/favorites/check/${productId}`
        );

    return response.data;
};

const favoriteService = {
    getFavorites,
    addFavorite,
    removeFavorite,
    checkFavorite,
};

export default favoriteService;