const pool = require('../config/database');

class WarehouseRepository {
  async findAll() {
    const [rows] = await pool.execute(
      `SELECT w.*, u.first_name AS manager_first_name, u.last_name AS manager_last_name
       FROM warehouses w LEFT JOIN users u ON w.manager_id = u.user_id
       WHERE w.is_active = TRUE ORDER BY w.warehouse_name`
    );
    return rows;
  }
  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT w.*, u.first_name AS manager_first_name, u.last_name AS manager_last_name
       FROM warehouses w LEFT JOIN users u ON w.manager_id = u.user_id WHERE w.warehouse_id = ?`,
      [id]
    );
    return rows[0] || null;
  }
  async create(data) {
    const [result] = await pool.execute(
      'INSERT INTO warehouses (warehouse_name, warehouse_code, address_line1, city, state, capacity, manager_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        data.warehouse_name,
        data.warehouse_code,
        data.address_line1 || null,
        data.city || null,
        data.state || null,
        data.capacity,
        data.manager_id || null
      ]
    );
    return result.insertId;
  }
  async update(id, data) {
    const fields = [];
    const params = [];
    const allowed = [
      'warehouse_name',
      'warehouse_code',
      'address_line1',
      'city',
      'state',
      'capacity',
      'manager_id',
      'is_active'
    ];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }
    if (fields.length === 0) return false;
    params.push(id);
    const [result] = await pool.execute(`UPDATE warehouses SET ${fields.join(', ')} WHERE warehouse_id = ?`, params);
    return result.affectedRows > 0;
  }
  async softDelete(id) {
    const [result] = await pool.execute('UPDATE warehouses SET is_active = FALSE WHERE warehouse_id = ?', [id]);
    return result.affectedRows > 0;
  }
}
module.exports = new WarehouseRepository();
