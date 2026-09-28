import axiosClient from "../api/axiosClient";

// ============================================================
// GET CART
// GET /api/cart
// ============================================================

const getCart = async () => {
    const response =
        await axiosClient.get(
            "/cart"
        );

    return response.data;
};

// ============================================================
// ADD ITEM
// POST /api/cart/items
// ============================================================

const addItem = async (
    productVariantId,
    quantity = 1
) => {
    const response =
        await axiosClient.post(
            "/cart/items",
            {
                productVariantId,
                quantity,
            }
        );

    return response.data;
};

// ============================================================
// UPDATE QUANTITY
// PUT /api/cart/items/:id
// ============================================================

const updateItem = async (
    itemId,
    quantity
) => {
    const response =
        await axiosClient.put(
            `/cart/items/${itemId}`,
            {
                quantity,
            }
        );

    return response.data;
};

// ============================================================
// REMOVE ITEM
// DELETE /api/cart/items/:id
// ============================================================

const removeItem = async (
    itemId
) => {
    const response =
        await axiosClient.delete(
            `/cart/items/${itemId}`
        );

    return response.data;
};

// ============================================================
// CLEAR CART
// DELETE /api/cart
// ============================================================

const clearCart = async () => {
    const response =
        await axiosClient.delete(
            "/cart"
        );

    return response.data;
};

const cartService = {
    getCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
};

export default cartService;