const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { JWT_SECRET } = require('../config/jwt');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Verify JWT and attach user to req.user
const authenticate = asyncHandler(async (req, res, next) => {
  // 1. Extract token from Authorization header
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Access denied. No authentication token provided.');
  }

  // 2. Verify the token
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Authentication token has expired. Please log in again.');
    }
    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Invalid authentication token.');
    }
    throw ApiError.unauthorized('Authentication failed.');
  }

  // 3. Check if user still exists and is active
  const [users] = await pool.execute(
    'SELECT user_id, email, first_name, last_name, is_active FROM users WHERE user_id = ?',
    [decoded.userId]
  );

  if (users.length === 0) {
    throw ApiError.unauthorized('The user associated with this token no longer exists.');
  }

  const user = users[0];

  if (!user.is_active) {
    throw ApiError.unauthorized('Your account has been deactivated. Please contact an administrator.');
  }

  // 4. Attach user to request object
  req.user = {
    userId: user.user_id,
    id: user.user_id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name
  };

  next();
});

module.exports = { authenticate };
