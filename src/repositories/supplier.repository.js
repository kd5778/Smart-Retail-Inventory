const pool = require('../config/database');

class SupplierRepository {
  async findAll(pagination = {}) {
    const limit = parseInt(pagination.limit) || 20;
    const offset = ((parseInt(pagination.page) || 1) - 1) * limit;
    const sortBy = pagination.sortBy || 'created_at';
    const order = pagination.order === 'asc' ? 'ASC' : 'DESC';
    const [rows] = await pool.query(
      `SELECT * FROM suppliers WHERE is_active = TRUE ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  }

  async count() {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM suppliers WHERE is_active = TRUE');
    return rows[0].total;
  }

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM suppliers WHERE supplier_id = ?', [id]);
    return rows[0] || null;
  }

  async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM suppliers WHERE email = ?', [email]);
    return rows[0] || null;
  }

  async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO suppliers (supplier_name, contact_person, email, phone, address_line1, city, state, country, postal_code, payment_terms)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.supplier_name,
        data.contact_person,
        data.email,
        data.phone,
        data.address_line1 || null,
        data.city || null,
        data.state || null,
        data.country || null,
        data.postal_code || null,
        data.payment_terms || 'Net 30'
      ]
    );
    return result.insertId;
  }

  async update(id, data) {
    const fields = [];
    const params = [];
    const allowed = [
      'supplier_name',
      'contact_person',
      'email',
      'phone',
      'address_line1',
      'city',
      'state',
      'country',
      'postal_code',
      'payment_terms',
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
    const [result] = await pool.execute(`UPDATE suppliers SET ${fields.join(', ')} WHERE supplier_id = ?`, params);
    return result.affectedRows > 0;
  }

  async softDelete(id) {
    const [result] = await pool.execute('UPDATE suppliers SET is_active = FALSE WHERE supplier_id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new SupplierRepository();
