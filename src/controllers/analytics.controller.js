const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const analyticsService = require('../services/analytics.service');
exports.getDashboard = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 200, 'Dashboard metrics', await analyticsService.getDashboardMetrics());
});
