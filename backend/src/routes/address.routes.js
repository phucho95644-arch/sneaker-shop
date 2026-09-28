const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controller');
const authMiddleware = require('../middleware/auth.middleware');
const {
    addressCreateValidation,
    addressUpdateValidation,
    addressIdValidation
} = require('../validators/address.validator');

router.get('/', authMiddleware, addressController.getAddresses);
router.post('/', authMiddleware, addressCreateValidation, addressController.createAddress);
router.put('/:id', authMiddleware, addressUpdateValidation, addressController.updateAddress);
router.delete('/:id', authMiddleware, addressIdValidation, addressController.deleteAddress);
router.patch('/:id/default', authMiddleware, addressIdValidation, addressController.setDefaultAddress);

module.exports = router;
