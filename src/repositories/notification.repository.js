const pool = require('../config/database');

class NotificationRepository {
  async findByUser(userId, pagination = {}) {
    const limit = parseInt(pagination.limit) || 20;
    const offset = ((parseInt(pagination.page) || 1) - 1) * limit;
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );
    return rows;
  }
  async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO notifications (user_id, title, message, notification_type, is_read, reference_type, reference_id)
       VALUES (?, ?, ?, ?, FALSE, ?, ?)`,
      [
        data.user_id,
        data.title,
        data.message,
        data.notification_type || 'info',
        data.reference_type || null,
        data.reference_id || null
      ]
    );
    return result.insertId;
  }
  async markAsRead(id) {
    const [result] = await pool.execute('UPDATE notifications SET is_read = TRUE WHERE notification_id = ?', [id]);
    return result.affectedRows > 0;
  }
  async markAllAsRead(userId) {
    await pool.execute('UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE', [userId]);
  }
  async countUnread(userId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    return rows[0].count;
  }
}
module.exports = new NotificationRepository();
