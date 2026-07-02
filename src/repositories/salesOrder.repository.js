const pool = require('../config/database');
const { generateSONumber } = require('../utils/helpers');

class SalesOrderRepository {
  async findAll(filters = {}, pagination = {}) {
    let query = `SELECT so.*, c.customer_name FROM sales_orders so
                 INNER JOIN customers c ON so.customer_id = c.customer_id WHERE 1=1`;
    const params = [];
    if (filters.status) {
      query += ' AND so.status = ?';
      params.push(filters.status);
    }
    if (filters.customer_id) {
      query += ' AND so.customer_id = ?';
      params.push(filters.customer_id);
    }
    if (filters.start_date) {
      query += ' AND so.order_date >= ?';
      params.push(filters.start_date);
    }
    if (filters.end_date) {
      query += ' AND so.order_date <= ?';
      params.push(filters.end_date);
    }
    const sortBy = pagination.sortBy || 'so.created_at';
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
    let query = 'SELECT COUNT(*) AS total FROM sales_orders WHERE 1=1';
    const params = [];
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.customer_id) {
      query += ' AND customer_id = ?';
      params.push(filters.customer_id);
    }
    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT so.*, c.customer_name, c.email AS customer_email
       FROM sales_orders so INNER JOIN customers c ON so.customer_id = c.customer_id WHERE so.so_id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async create(data, connection) {
    const conn = connection || pool;
    const soNumber = generateSONumber();
    const [result] = await conn.execute(
      `INSERT INTO sales_orders (so_number, customer_id, warehouse_id, order_date, status, subtotal, discount_amount, tax_amount, grand_total, created_by, notes)
       VALUES (?, ?, ?, CURDATE(), 'draft', ?, ?, ?, ?, ?, ?)`,
      [
        soNumber,
        data.customer_id,
        data.warehouse_id || 1,
        data.subtotal || 0,
        data.discount_amount || 0,
        data.tax_amount || 0,
        data.grand_total || 0,
        data.created_by,
        data.notes || null
      ]
    );
    return { id: result.insertId, so_number: soNumber };
  }

  async createItem(data, connection) {
    const conn = connection || pool;
    const lineTotal = data.quantity * data.unit_price * (1 - (data.discount_pct || 0) / 100);
    const [result] = await conn.execute(
      `INSERT INTO sales_order_items (so_id, product_id, quantity, unit_price, discount_pct, line_total)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.so_id, data.product_id, data.quantity, data.unit_price, data.discount_pct || 0, lineTotal]
    );
    return result.insertId;
  }

  async updateStatus(id, status, connection = null) {
    const conn = connection || pool;
    let query = 'UPDATE sales_orders SET status = ?, updated_at = NOW()';
    const params = [status];
    if (status === 'shipped') {
      query += ', shipped_date = CURDATE()';
    }
    query += ' WHERE so_id = ?';
    params.push(id);
    const [result] = await conn.execute(query, params);
    return result.affectedRows > 0;
  }

  async updateTotals(id, totals, connection = null) {
    const conn = connection || pool;
    await conn.execute(
      'UPDATE sales_orders SET subtotal = ?, discount_amount = ?, tax_amount = ?, grand_total = ?, updated_at = NOW() WHERE so_id = ?',
      [totals.subtotal, totals.discount_amount, totals.tax_amount, totals.grand_total, id]
    );
  }

  async getItems(soId) {
    const [rows] = await pool.execute(
      `SELECT soi.*, p.sku, p.name AS product_name FROM sales_order_items soi
       INNER JOIN products p ON soi.product_id = p.product_id WHERE soi.so_id = ?`,
      [soId]
    );
    return rows;
  }
}

module.exports = new SalesOrderRepository();
