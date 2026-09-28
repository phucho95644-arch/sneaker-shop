const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const {
    registerValidation,
    loginValidation,
    changePasswordValidation
} = require('../validators/auth.validator');

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/me', authMiddleware, authController.me);
router.put('/change-password', authMiddleware, changePasswordValidation, authController.changePassword);

module.exports = router;
