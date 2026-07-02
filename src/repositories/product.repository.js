const pool = require('../config/database');

class ProductRepository {
  async findAll(filters = {}, pagination = {}) {
    let query = `SELECT p.*, c.category_name, b.brand_name
                 FROM products p
                 LEFT JOIN categories c ON p.category_id = c.category_id
                 LEFT JOIN brands b ON p.brand_id = b.brand_id
                 WHERE 1=1`;
    const params = [];

    if (filters.category_id) {
      query += ' AND p.category_id = ?';
      params.push(filters.category_id);
    }
    if (filters.brand_id) {
      query += ' AND p.brand_id = ?';
      params.push(filters.brand_id);
    }
    if (filters.is_active !== undefined) {
      query += ' AND p.is_active = ?';
      params.push(filters.is_active);
    }
    if (filters.search) {
      query += ' AND (p.name LIKE ? OR p.sku LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.min_price) {
      query += ' AND p.unit_price >= ?';
      params.push(filters.min_price);
    }
    if (filters.max_price) {
      query += ' AND p.unit_price <= ?';
      params.push(filters.max_price);
    }

    const sortBy = pagination.sortBy || 'p.created_at';
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
    let query = 'SELECT COUNT(*) AS total FROM products p WHERE 1=1';
    const params = [];
    if (filters.category_id) {
      query += ' AND p.category_id = ?';
      params.push(filters.category_id);
    }
    if (filters.brand_id) {
      query += ' AND p.brand_id = ?';
      params.push(filters.brand_id);
    }
    if (filters.is_active !== undefined) {
      query += ' AND p.is_active = ?';
      params.push(filters.is_active);
    }
    if (filters.search) {
      query += ' AND (p.name LIKE ? OR p.sku LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT p.*, c.category_name, b.brand_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       LEFT JOIN brands b ON p.brand_id = b.brand_id
       WHERE p.product_id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async findBySku(sku) {
    const [rows] = await pool.execute('SELECT * FROM products WHERE sku = ?', [sku]);
    return rows[0] || null;
  }

  async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO products (sku, name, description, category_id, brand_id, unit_price, cost_price,
       reorder_level, reorder_qty, unit_of_measure, weight_kg)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.sku,
        data.name,
        data.description || null,
        data.category_id || null,
        data.brand_id || null,
        data.unit_price,
        data.cost_price,
        data.reorder_level || 10,
        data.reorder_qty || 25,
        data.unit_of_measure || 'EACH',
        data.weight_kg || null
      ]
    );
    return result.insertId;
  }

  async update(id, data) {
    const fields = [];
    const params = [];
    const allowed = [
      'sku',
      'name',
      'description',
      'category_id',
      'brand_id',
      'unit_price',
      'cost_price',
      'reorder_level',
      'reorder_qty',
      'unit_of_measure',
      'weight_kg',
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
    const [result] = await pool.execute(`UPDATE products SET ${fields.join(', ')} WHERE product_id = ?`, params);
    return result.affectedRows > 0;
  }

  async softDelete(id) {
    const [result] = await pool.execute('UPDATE products SET is_active = FALSE WHERE product_id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new ProductRepository();
