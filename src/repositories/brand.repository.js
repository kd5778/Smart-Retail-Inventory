const pool = require('../config/database');

class BrandRepository {
  async findAll() {
    const [rows] = await pool.execute('SELECT * FROM brands WHERE is_active = TRUE ORDER BY brand_name');
    return rows;
  }
  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM brands WHERE brand_id = ?', [id]);
    return rows[0] || null;
  }
  async create(data) {
    const [result] = await pool.execute('INSERT INTO brands (brand_name, logo_url, website) VALUES (?, ?, ?)', [
      data.brand_name,
      data.logo_url || null,
      data.website || null
    ]);
    return result.insertId;
  }
  async update(id, data) {
    const fields = [];
    const params = [];
    if (data.brand_name !== undefined) {
      fields.push('brand_name = ?');
      params.push(data.brand_name);
    }
    if (data.logo_url !== undefined) {
      fields.push('logo_url = ?');
      params.push(data.logo_url);
    }
    if (data.website !== undefined) {
      fields.push('website = ?');
      params.push(data.website);
    }
    if (fields.length === 0) return false;
    params.push(id);
    const [result] = await pool.execute(`UPDATE brands SET ${fields.join(', ')} WHERE brand_id = ?`, params);
    return result.affectedRows > 0;
  }
  async softDelete(id) {
    const [result] = await pool.execute('UPDATE brands SET is_active = FALSE WHERE brand_id = ?', [id]);
    return result.affectedRows > 0;
  }
}
module.exports = new BrandRepository();
