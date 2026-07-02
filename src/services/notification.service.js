const notificationRepository = require('../repositories/notification.repository');
class NotificationService {
  async getUserNotifications(userId, pagination) {
    return await notificationRepository.findByUser(userId, pagination);
  }
  async markAsRead(id) {
    return await notificationRepository.markAsRead(id);
  }
  async markAllAsRead(userId) {
    return await notificationRepository.markAllAsRead(userId);
  }
  async getUnreadCount(userId) {
    return await notificationRepository.countUnread(userId);
  }
}
module.exports = new NotificationService();
