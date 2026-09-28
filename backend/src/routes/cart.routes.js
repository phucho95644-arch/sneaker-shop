const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { addItemValidation, updateItemValidation, itemIdParam, pagination } = require('../validators/cart.validator');

router.use(authMiddleware);

router.get('/', pagination, cartController.getCart);
router.get('/count', cartController.getCartCount);
router.post('/items', addItemValidation, cartController.addItem);
router.put('/items/:id', updateItemValidation, cartController.updateItem);
router.delete('/items/:id', itemIdParam, cartController.removeItem);
router.delete('/', cartController.clearCart);

module.exports = router;
