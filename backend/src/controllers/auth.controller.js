const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
    const { fullName, email, password, phone } = req.body;
    const user = await authService.register({ fullName, email, password, phone });

    res.status(201).json({
        success: true,
        message: 'Đăng ký thành công',
        data: { user }
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        data: result
    });
});

const me = asyncHandler(async (req, res) => {
    const user = await authService.getCurrentUser(req.user.id);

    res.status(200).json({
        success: true,
        message: 'Current user loaded',
        data: { user }
    });
});

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword({ userId: req.user.id, currentPassword, newPassword });

    res.status(200).json({
        success: true,
        message: 'Password changed successfully',
        data: null
    });
});

module.exports = {
    register,
    login,
    me,
    changePassword
};
