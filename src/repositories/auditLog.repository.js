const pool = require('../config/database');

class AuditLogRepository {
  async findAll(filters = {}, pagination = {}) {
    let query = `SELECT al.*, u.first_name, u.last_name, u.email FROM audit_logs al
                 LEFT JOIN users u ON al.changed_by = u.user_id WHERE 1=1`;
    const params = [];
    if (filters.table_name) {
      query += ' AND al.table_name = ?';
      params.push(filters.table_name);
    }
    if (filters.action) {
      query += ' AND al.action = ?';
      params.push(filters.action);
    }
    if (filters.changed_by) {
      query += ' AND al.changed_by = ?';
      params.push(filters.changed_by);
    }
    if (filters.start_date) {
      query += ' AND al.created_at >= ?';
      params.push(filters.start_date);
    }
    if (filters.end_date) {
      query += ' AND al.created_at <= ?';
      params.push(filters.end_date);
    }
    query += ' ORDER BY al.created_at DESC';
    const limit = parseInt(pagination.limit) || 20;
    const offset = ((parseInt(pagination.page) || 1) - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    const [rows] = await pool.query(query, params);
    return rows;
  }

  async count(filters = {}) {
    let query = 'SELECT COUNT(*) AS total FROM audit_logs al WHERE 1=1';
    const params = [];
    if (filters.table_name) {
      query += ' AND al.table_name = ?';
      params.push(filters.table_name);
    }
    if (filters.action) {
      query += ' AND al.action = ?';
      params.push(filters.action);
    }
    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO audit_logs (changed_by, action, table_name, record_id, old_values, new_values, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.changed_by,
        data.action,
        data.table_name,
        data.record_id,
        data.old_values ? JSON.stringify(data.old_values) : null,
        data.new_values ? JSON.stringify(data.new_values) : null,
        data.ip_address || null
      ]
    );
    return result.insertId;
  }
}
module.exports = new AuditLogRepository();
