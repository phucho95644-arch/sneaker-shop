const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { profileUpdateValidation } = require('../validators/user.validator');
const upload = require('../middleware/upload.middleware');

router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, profileUpdateValidation, userController.updateProfile);
router.put('/avatar', authMiddleware, upload.single('avatar'), userController.updateAvatar);

module.exports = router;
