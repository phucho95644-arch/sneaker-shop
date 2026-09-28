const asyncHandler = require('../utils/asyncHandler');
const cartService = require('../services/cart.service');

const getCart = asyncHandler(async (req, res) => {
    const cart = await cartService.getCart(req.user.id);
    res.status(200).json({ success: true, data: cart });
});

const getCartCount = asyncHandler(async (req, res) => {
    const counts = await cartService.getCartCount(req.user.id);
    res.status(200).json({ success: true, data: counts });
});

const addItem = asyncHandler(async (req, res) => {
    const { productVariantId, quantity } = req.body;
    const result = await cartService.addItem(req.user.id, Number(productVariantId), Number(quantity));
    res.status(200).json({ success: true, message: 'Đã thêm vào giỏ hàng', data: { id: result.id } });
});

const updateItem = asyncHandler(async (req, res) => {
    const itemId = Number(req.params.id);
    const { quantity } = req.body;
    await cartService.updateItem(req.user.id, itemId, Number(quantity));
    res.status(200).json({ success: true, message: 'Cập nhật số lượng thành công' });
});

const removeItem = asyncHandler(async (req, res) => {
    const itemId = Number(req.params.id);
    await cartService.removeItem(req.user.id, itemId);
    res.status(200).json({ success: true, message: 'Đã xóa mục khỏi giỏ hàng' });
});

const clearCart = asyncHandler(async (req, res) => {
    await cartService.clearCart(req.user.id);
    res.status(200).json({ success: true, message: 'Đã xóa toàn bộ giỏ hàng' });
});

module.exports = {
    getCart,
    getCartCount,
    addItem,
    updateItem,
    removeItem,
    clearCart
};
