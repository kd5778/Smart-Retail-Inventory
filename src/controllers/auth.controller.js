const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/auth.service');

exports.register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  ApiResponse.created(res, 'User registered successfully', user);
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body.email, req.body.password);
  ApiResponse.success(res, 200, 'Login successful', result);
});

exports.getProfile = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user.userId);
  ApiResponse.success(res, 200, 'Profile retrieved', profile);
});
