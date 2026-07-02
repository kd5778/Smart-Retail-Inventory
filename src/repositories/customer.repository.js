const pool = require('../config/database');

class CustomerRepository {
  async findAll(filters = {}, pagination = {}) {
    let query = 'SELECT * FROM customers WHERE is_active = TRUE';
    const params = [];
    if (filters.customer_type) {
      query += ' AND customer_type = ?';
      params.push(filters.customer_type);
    }
    if (filters.search) {
      query += ' AND (customer_name LIKE ? OR email LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    const sortBy = pagination.sortBy || 'created_at';
    const order = pagination.order === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortBy} ${order}`;
    const limit = parseInt(pagination.limit) || 20;
    const offset = ((parseInt(pagination.page) || 1) - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    const [rows] = await pool.query(query, params);
    return rows;
  }

  async count(filters = {}) {
    let query = 'SELECT COUNT(*) AS total FROM customers WHERE is_active = TRUE';
    const params = [];
    if (filters.customer_type) {
      query += ' AND customer_type = ?';
      params.push(filters.customer_type);
    }
    if (filters.search) {
      query += ' AND (customer_name LIKE ? OR email LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM customers WHERE customer_id = ?', [id]);
    return rows[0] || null;
  }

  async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM customers WHERE email = ?', [email]);
    return rows[0] || null;
  }

  async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO customers (customer_name, email, phone, address_line1, city, state, country, postal_code, customer_type, credit_limit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.customer_name,
        data.email,
        data.phone || null,
        data.address_line1 || null,
        data.city || null,
        data.state || null,
        data.country || 'India',
        data.postal_code || null,
        data.customer_type || 'retail',
        data.credit_limit || 5000
      ]
    );
    return result.insertId;
  }

  async update(id, data) {
    const fields = [];
    const params = [];
    const allowed = [
      'customer_name',
      'email',
      'phone',
      'address_line1',
      'city',
      'state',
      'country',
      'postal_code',
      'customer_type',
      'credit_limit',
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
    const [result] = await pool.execute(`UPDATE customers SET ${fields.join(', ')} WHERE customer_id = ?`, params);
    return result.affectedRows > 0;
  }

  async softDelete(id) {
    const [result] = await pool.execute('UPDATE customers SET is_active = FALSE WHERE customer_id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new CustomerRepository();
