const pool = require('../config/database');

class InventoryRepository {
  async findAll(filters = {}, pagination = {}) {
    let query = `SELECT i.*, p.sku, p.name AS product_name, p.unit_price, p.cost_price, p.reorder_level,
                 w.warehouse_name, c.category_name
                 FROM inventory i
                 INNER JOIN products p ON i.product_id = p.product_id
                 INNER JOIN warehouses w ON i.warehouse_id = w.warehouse_id
                 LEFT JOIN categories c ON p.category_id = c.category_id WHERE 1=1`;
    const params = [];
    if (filters.warehouse_id) {
      query += ' AND i.warehouse_id = ?';
      params.push(filters.warehouse_id);
    }
    if (filters.product_id) {
      query += ' AND i.product_id = ?';
      params.push(filters.product_id);
    }
    if (filters.low_stock) {
      query += ' AND i.quantity_on_hand <= p.reorder_level';
    }
    if (filters.search) {
      query += ' AND (p.name LIKE ? OR p.sku LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    const sortBy = pagination.sortBy || 'p.name';
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
    let query = `SELECT COUNT(*) AS total FROM inventory i
                 INNER JOIN products p ON i.product_id = p.product_id WHERE 1=1`;
    const params = [];
    if (filters.warehouse_id) {
      query += ' AND i.warehouse_id = ?';
      params.push(filters.warehouse_id);
    }
    if (filters.low_stock) {
      query += ' AND i.quantity_on_hand <= p.reorder_level';
    }
    if (filters.search) {
      query += ' AND (p.name LIKE ? OR p.sku LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  async findByProductAndWarehouse(productId, warehouseId) {
    const [rows] = await pool.execute('SELECT * FROM inventory WHERE product_id = ? AND warehouse_id = ?', [
      productId,
      warehouseId
    ]);
    return rows[0] || null;
  }

  async updateStock(productId, warehouseId, quantityChange, connection = null) {
    const conn = connection || pool;
    await conn.execute(
      `INSERT INTO inventory (product_id, warehouse_id, quantity_on_hand, quantity_reserved, last_counted_at)
       VALUES (?, ?, GREATEST(0, ?), 0, NOW())
       ON DUPLICATE KEY UPDATE quantity_on_hand = GREATEST(0, quantity_on_hand + ?), updated_at = NOW()`,
      [productId, warehouseId, quantityChange, quantityChange]
    );
  }

  async getLowStockProducts() {
    const [rows] = await pool.execute(
      `SELECT i.*, p.sku, p.name AS product_name, p.reorder_level, p.reorder_qty, p.cost_price,
       w.warehouse_name
       FROM inventory i
       INNER JOIN products p ON i.product_id = p.product_id
       INNER JOIN warehouses w ON i.warehouse_id = w.warehouse_id
       WHERE i.quantity_on_hand <= p.reorder_level AND p.is_active = TRUE
       ORDER BY (i.quantity_on_hand - p.reorder_level) ASC`
    );
    return rows;
  }

  async createMovement(data, connection = null) {
    const conn = connection || pool;
    const [result] = await conn.execute(
      `INSERT INTO inventory_movements (product_id, warehouse_id, movement_type, quantity, reference_type, reference_id, reason, performed_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.product_id,
        data.warehouse_id,
        data.movement_type,
        data.quantity,
        data.reference_type || null,
        data.reference_id || null,
        data.reason || null,
        data.performed_by || null
      ]
    );
    return result.insertId;
  }

  async getMovements(filters = {}, pagination = {}) {
    let query = `SELECT im.*, p.sku, p.name AS product_name, w.warehouse_name
                 FROM inventory_movements im
                 INNER JOIN products p ON im.product_id = p.product_id
                 INNER JOIN warehouses w ON im.warehouse_id = w.warehouse_id WHERE 1=1`;
    const params = [];
    if (filters.product_id) {
      query += ' AND im.product_id = ?';
      params.push(filters.product_id);
    }
    if (filters.warehouse_id) {
      query += ' AND im.warehouse_id = ?';
      params.push(filters.warehouse_id);
    }
    if (filters.movement_type) {
      query += ' AND im.movement_type = ?';
      params.push(filters.movement_type);
    }
    if (filters.start_date) {
      query += ' AND im.created_at >= ?';
      params.push(filters.start_date);
    }
    if (filters.end_date) {
      query += ' AND im.created_at <= ?';
      params.push(filters.end_date);
    }
    query += ' ORDER BY im.created_at DESC';
    const limit = parseInt(pagination.limit) || 20;
    const offset = ((parseInt(pagination.page) || 1) - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    const [rows] = await pool.query(query, params);
    return rows;
  }

  async countMovements(filters = {}) {
    let query = 'SELECT COUNT(*) AS total FROM inventory_movements im WHERE 1=1';
    const params = [];
    if (filters.product_id) {
      query += ' AND im.product_id = ?';
      params.push(filters.product_id);
    }
    if (filters.warehouse_id) {
      query += ' AND im.warehouse_id = ?';
      params.push(filters.warehouse_id);
    }
    if (filters.movement_type) {
      query += ' AND im.movement_type = ?';
      params.push(filters.movement_type);
    }
    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  async createReorderRequest(data) {
    const [result] = await pool.execute(
      `INSERT INTO stock_reorder_requests (product_id, warehouse_id, current_qty, reorder_level, suggested_qty, status, requested_by)
       VALUES (?, ?, ?, ?, ?, 'open', ?)`,
      [data.product_id, data.warehouse_id, data.current_qty, data.reorder_level, data.suggested_qty, data.requested_by]
    );
    return result.insertId;
  }

  async getReorderRequests(filters = {}) {
    let query = `SELECT srr.*, p.sku, p.name AS product_name, w.warehouse_name
                 FROM stock_reorder_requests srr
                 INNER JOIN products p ON srr.product_id = p.product_id
                 INNER JOIN warehouses w ON srr.warehouse_id = w.warehouse_id WHERE 1=1`;
    const params = [];
    if (filters.status) {
      query += ' AND srr.status = ?';
      params.push(filters.status);
    }
    query += ' ORDER BY srr.created_at DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  }

  async updateReorderStatus(id, status, approvedBy = null) {
    const [result] = await pool.execute(
      'UPDATE stock_reorder_requests SET status = ?, approved_by = ?, updated_at = NOW() WHERE reorder_id = ?',
      [status, approvedBy, id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new InventoryRepository();
