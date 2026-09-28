const asyncHandler = require('../utils/asyncHandler');
const addressService = require('../services/address.service');

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressService.getAddresses(req.user.id);
  res.status(200).json({
    success: true,
    message: 'Danh sách địa chỉ được tải thành công',
    data: addresses
  });
});

const createAddress = asyncHandler(async (req, res) => {
  const address = await addressService.createAddress(req.user.id, req.body);
  res.status(201).json({
    success: true,
    message: 'Tạo địa chỉ thành công',
    data: address
  });
});

const updateAddress = asyncHandler(async (req, res) => {
  const address = await addressService.updateAddress(req.user.id, Number(req.params.id), req.body);
  res.status(200).json({
    success: true,
    message: 'Cập nhật địa chỉ thành công',
    data: address
  });
});

const deleteAddress = asyncHandler(async (req, res) => {
  await addressService.deleteAddress(req.user.id, Number(req.params.id));
  res.status(200).json({
    success: true,
    message: 'Xóa địa chỉ thành công',
    data: null
  });
});

const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await addressService.setDefaultAddress(req.user.id, Number(req.params.id));
  res.status(200).json({
    success: true,
    message: 'Cập nhật địa chỉ mặc định thành công',
    data: address
  });
});

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
