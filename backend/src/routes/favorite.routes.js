const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { productIdParam } = require('../validators/favorite.validator');

router.use(authMiddleware);

router.get('/', favoriteController.getFavorites);
router.post('/:productId', productIdParam, favoriteController.addFavorite);
router.delete('/:productId', productIdParam, favoriteController.removeFavorite);
router.get('/check/:productId', productIdParam, favoriteController.checkFavorite);

module.exports = router;
