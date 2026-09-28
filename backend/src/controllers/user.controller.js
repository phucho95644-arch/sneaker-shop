const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/user.service');

const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  res.status(200).json({
    success: true,
    message: 'Lấy thông tin cá nhân thành công',
    data: user
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Cập nhật hồ sơ thành công',
    data: user
  });
});

const updateAvatar = asyncHandler(async (req, res) => {
  const user = await userService.updateAvatar(req.user.id, req.file);
  res.status(200).json({
    success: true,
    message: 'Cập nhật avatar thành công',
    data: user
  });
});

module.exports = {
  getProfile,
  updateProfile,
  updateAvatar
};
