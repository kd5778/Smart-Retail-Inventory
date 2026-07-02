const pool = require('../config/database');

class CategoryRepository {
  async findAll() {
    const [rows] = await pool.execute('SELECT * FROM categories WHERE is_active = TRUE ORDER BY category_name');
    return rows;
  }
  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM categories WHERE category_id = ?', [id]);
    return rows[0] || null;
  }
  async findChildren(parentId) {
    const [rows] = await pool.execute('SELECT * FROM categories WHERE parent_category_id = ? AND is_active = TRUE', [
      parentId
    ]);
    return rows;
  }
  async create(data) {
    const [result] = await pool.execute(
      'INSERT INTO categories (category_name, description, parent_category_id) VALUES (?, ?, ?)',
      [data.category_name, data.description || null, data.parent_category_id || null]
    );
    return result.insertId;
  }
  async update(id, data) {
    const fields = [];
    const params = [];
    if (data.category_name !== undefined) {
      fields.push('category_name = ?');
      params.push(data.category_name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      params.push(data.description);
    }
    if (data.parent_category_id !== undefined) {
      fields.push('parent_category_id = ?');
      params.push(data.parent_category_id);
    }
    if (fields.length === 0) return false;
    params.push(id);
    const [result] = await pool.execute(`UPDATE categories SET ${fields.join(', ')} WHERE category_id = ?`, params);
    return result.affectedRows > 0;
  }
  async softDelete(id) {
    const [result] = await pool.execute('UPDATE categories SET is_active = FALSE WHERE category_id = ?', [id]);
    return result.affectedRows > 0;
  }
}
module.exports = new CategoryRepository();
