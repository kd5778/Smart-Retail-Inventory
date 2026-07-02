const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');
const userRepository = require('../repositories/user.repository');
const ApiError = require('../utils/ApiError');

class AuthService {
  async register(userData) {
    const existing = await userRepository.findByEmail(userData.email);
    if (existing) throw ApiError.conflict('Email already registered');

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(userData.password, salt);

    const userId = await userRepository.create({ ...userData, password_hash });

    // Assign default role: Warehouse Staff (role_id = 3)
    await userRepository.assignRole(userId, 3);

    return { id: userId, email: userData.email, first_name: userData.first_name, last_name: userData.last_name };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw ApiError.unauthorized('Invalid email or password');
    if (!user.is_active) throw ApiError.unauthorized('Account is deactivated');

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw ApiError.unauthorized('Invalid email or password');

    const roles = await userRepository.findUserRoles(user.user_id);
    const token = jwt.sign({ userId: user.user_id, email: user.email, roles }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    await userRepository.updateLastLogin(user.user_id);

    return {
      token,
      user: { id: user.user_id, email: user.email, first_name: user.first_name, last_name: user.last_name, roles }
    };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    const roles = await userRepository.findUserRoles(userId);
    const permissions = await userRepository.findUserPermissions(userId);
    return { ...user, roles, permissions };
  }
}

module.exports = new AuthService();
