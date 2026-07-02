const pool = require('../config/database');

class UserRepository {
  async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT user_id, email, first_name, last_name, phone, is_active, created_at, updated_at FROM users WHERE user_id = ?',
      [id]
    );
    return rows[0] || null;
  }

  async create(userData) {
    const username = userData.email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [
        username,
        userData.email,
        userData.password_hash,
        userData.first_name,
        userData.last_name,
        userData.phone || null
      ]
    );
    return result.insertId;
  }

  async assignRole(userId, roleId, connection = null) {
    const conn = connection || pool;
    await conn.execute('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, roleId]);
  }

  async updateLastLogin(userId) {
    await pool.execute('UPDATE users SET last_login = NOW() WHERE user_id = ?', [userId]);
  }

  async findUserPermissions(userId) {
    const [rows] = await pool.execute(
      `SELECT DISTINCT p.permission_name
       FROM users u
       INNER JOIN user_roles ur ON u.user_id = ur.user_id
       INNER JOIN role_permissions rp ON ur.role_id = rp.role_id
       INNER JOIN permissions p ON rp.permission_id = p.permission_id
       WHERE u.user_id = ? AND u.is_active = TRUE`,
      [userId]
    );
    return rows.map((r) => r.permission_name);
  }

  async findUserRoles(userId) {
    const [rows] = await pool.execute(
      `SELECT r.role_name FROM roles r
       INNER JOIN user_roles ur ON r.role_id = ur.role_id
       WHERE ur.user_id = ?`,
      [userId]
    );
    return rows.map((r) => r.role_name);
  }
}

module.exports = new UserRepository();
