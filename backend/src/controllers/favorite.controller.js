const asyncHandler = require('../utils/asyncHandler');
const favoriteService = require('../services/favorite.service');

const getFavorites = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const result = await favoriteService.getFavorites(req.user.id, page, limit);

    res.status(200).json({
        success: true,
        message: 'Lấy danh sách yêu thích thành công',
        data: result
    });
});

const addFavorite = asyncHandler(async (req, res) => {
    const productId = Number(req.params.productId);
    const result = await favoriteService.addFavorite(req.user.id, productId);

    res.status(200).json({
        success: true,
        message: result.already ? 'Sản phẩm đã có trong yêu thích' : 'Đã thêm vào yêu thích',
        data: { id: result.id }
    });
});

const removeFavorite = asyncHandler(async (req, res) => {
    const productId = Number(req.params.productId);
    await favoriteService.removeFavorite(req.user.id, productId);

    res.status(200).json({
        success: true,
        message: 'Đã xóa khỏi yêu thích',
        data: null
    });
});

const checkFavorite = asyncHandler(async (req, res) => {
    const productId = Number(req.params.productId);
    const isFavorite = await favoriteService.checkFavorite(req.user.id, productId);

    res.status(200).json({ success: true, data: { isFavorite } });
});

module.exports = {
    getFavorites,
    addFavorite,
    removeFavorite,
    checkFavorite
};
