const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');
const { findByEmail, findById, createUser, updatePassword } = require('../models/user.model');

const register = async ({ fullName, email, password, phone }) => {
    const existingUser = await findByEmail(email);

    if (existingUser) {
        throw new ApiError(409, 'Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await createUser({ fullName, email, passwordHash, phone });
    return await findById(userId);
};

const login = async ({ email, password }) => {
    const user = await findByEmail(email, { withPassword: true });

    if (!user) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
        throw new ApiError(401, 'Invalid email or password');
    }

    if (user.status === 'inactive') {
        throw new ApiError(403, 'Your account is inactive');
    }

    if (user.status === 'blocked') {
        throw new ApiError(403, 'Your account is blocked');
    }

    const token = generateToken(user);

    return {
        user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            role: user.role,
            status: user.status
        },
        token
    };
};

const getCurrentUser = async (id) => {
    const user = await findById(id);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    return user;
};

const changePassword = async ({ userId, currentPassword, newPassword }) => {
    const user = await findById(userId, { withPassword: true });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatches) {
        throw new ApiError(401, 'Current password is incorrect');
    }

    const newPasswordMatchesOld = await bcrypt.compare(newPassword, user.password);

    if (newPasswordMatchesOld) {
        throw new ApiError(400, 'New password must be different from current password');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await updatePassword(userId, passwordHash);
};

module.exports = {
    register,
    login,
    getCurrentUser,
    changePassword
};
