const pool = require('../config/database');
const { generatePONumber } = require('../utils/helpers');

class PurchaseOrderRepository {
  async findAll(filters = {}, pagination = {}) {
    let query = `SELECT po.*, s.supplier_name, w.warehouse_name,
                 u.first_name AS created_by_name FROM purchase_orders po
                 INNER JOIN suppliers s ON po.supplier_id = s.supplier_id
                 INNER JOIN warehouses w ON po.warehouse_id = w.warehouse_id
                 LEFT JOIN users u ON po.created_by = u.user_id WHERE 1=1`;
    const params = [];
    if (filters.status) {
      query += ' AND po.status = ?';
      params.push(filters.status);
    }
    if (filters.supplier_id) {
      query += ' AND po.supplier_id = ?';
      params.push(filters.supplier_id);
    }
    if (filters.start_date) {
      query += ' AND po.order_date >= ?';
      params.push(filters.start_date);
    }
    if (filters.end_date) {
      query += ' AND po.order_date <= ?';
      params.push(filters.end_date);
    }
    const sortBy = pagination.sortBy || 'po.created_at';
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
    let query = 'SELECT COUNT(*) AS total FROM purchase_orders po WHERE 1=1';
    const params = [];
    if (filters.status) {
      query += ' AND po.status = ?';
      params.push(filters.status);
    }
    if (filters.supplier_id) {
      query += ' AND po.supplier_id = ?';
      params.push(filters.supplier_id);
    }
    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT po.*, s.supplier_name, w.warehouse_name
       FROM purchase_orders po
       INNER JOIN suppliers s ON po.supplier_id = s.supplier_id
       INNER JOIN warehouses w ON po.warehouse_id = w.warehouse_id WHERE po.po_id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async create(data, connection) {
    const conn = connection || pool;
    const poNumber = generatePONumber();
    const [result] = await conn.execute(
      `INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, order_date, expected_date, status, total_amount, grand_total, created_by, notes)
       VALUES (?, ?, ?, CURDATE(), ?, 'draft', ?, ?, ?, ?)`,
      [
        poNumber,
        data.supplier_id,
        data.warehouse_id,
        data.expected_date || null,
        data.total_amount || 0,
        data.total_amount || 0,
        data.created_by,
        data.notes || null
      ]
    );
    return { id: result.insertId, po_number: poNumber };
  }

  async createItem(data, connection) {
    const conn = connection || pool;
    const lineTotal = data.quantity_ordered * data.unit_cost;
    const [result] = await conn.execute(
      `INSERT INTO purchase_order_items (po_id, product_id, quantity_ordered, quantity_received, unit_cost, line_total)
       VALUES (?, ?, ?, 0, ?, ?)`,
      [data.po_id, data.product_id, data.quantity_ordered, data.unit_cost, lineTotal]
    );
    return result.insertId;
  }

  async updateStatus(id, status, approvedBy = null, connection = null) {
    const conn = connection || pool;
    let query = 'UPDATE purchase_orders SET status = ?, updated_at = NOW()';
    const params = [status];
    if (approvedBy) {
      query += ', approved_by = ?';
      params.push(approvedBy);
    }
    query += ' WHERE po_id = ?';
    params.push(id);
    const [result] = await conn.execute(query, params);
    return result.affectedRows > 0;
  }

  async updateTotal(id, total, connection = null) {
    const conn = connection || pool;
    await conn.execute(
      'UPDATE purchase_orders SET total_amount = ?, grand_total = ?, updated_at = NOW() WHERE po_id = ?',
      [total, total, id]
    );
  }

  async getItems(poId) {
    const [rows] = await pool.execute(
      `SELECT poi.*, p.sku, p.name AS product_name FROM purchase_order_items poi
       INNER JOIN products p ON poi.product_id = p.product_id WHERE poi.po_id = ?`,
      [poId]
    );
    return rows;
  }

  async updateItemReceived(itemId, quantityReceived, connection = null) {
    const conn = connection || pool;
    const [result] = await conn.execute('UPDATE purchase_order_items SET quantity_received = ? WHERE po_item_id = ?', [
      quantityReceived,
      itemId
    ]);
    return result.affectedRows > 0;
  }
}

module.exports = new PurchaseOrderRepository();
