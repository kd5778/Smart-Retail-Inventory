const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const notificationService = require('../services/notification.service');

exports.getNotifications = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const data = await notificationService.getUserNotifications(req.user.userId, { page, limit });
  const unreadCount = await notificationService.getUnreadCount(req.user.userId);
  ApiResponse.success(res, 200, 'Notifications retrieved', { notifications: data, unreadCount });
});
exports.markAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAsRead(req.params.id);
  ApiResponse.success(res, 200, 'Marked as read');
});
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user.userId);
  ApiResponse.success(res, 200, 'All marked as read');
});
