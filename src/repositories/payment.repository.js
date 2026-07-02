const pool = require('../config/database');
const { generatePaymentNumber } = require('../utils/helpers');

class PaymentRepository {
  async findAll(filters = {}, pagination = {}) {
    let query = 'SELECT * FROM payments WHERE 1=1';
    const params = [];
    if (filters.reference_type) {
      query += ' AND reference_type = ?';
      params.push(filters.reference_type);
    }
    if (filters.reference_id) {
      query += ' AND reference_id = ?';
      params.push(filters.reference_id);
    }
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.payment_method) {
      query += ' AND payment_method = ?';
      params.push(filters.payment_method);
    }
    query += ' ORDER BY created_at DESC';
    const limit = parseInt(pagination.limit) || 20;
    const offset = ((parseInt(pagination.page) || 1) - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    const [rows] = await pool.query(query, params);
    return rows;
  }

  async count(filters = {}) {
    let query = 'SELECT COUNT(*) AS total FROM payments WHERE 1=1';
    const params = [];
    if (filters.reference_type) {
      query += ' AND reference_type = ?';
      params.push(filters.reference_type);
    }
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM payments WHERE payment_id = ?', [id]);
    return rows[0] || null;
  }

  async create(data, connection = null) {
    const conn = connection || pool;
    const paymentNumber = generatePaymentNumber();
    const [result] = await conn.execute(
      `INSERT INTO payments (payment_number, reference_type, reference_id, amount, payment_date, payment_method, status, transaction_ref, created_by)
       VALUES (?, ?, ?, ?, CURDATE(), ?, ?, ?, ?)`,
      [
        paymentNumber,
        data.reference_type,
        data.reference_id,
        data.amount,
        data.payment_method,
        data.status || 'pending',
        data.transaction_ref || null,
        data.created_by
      ]
    );
    return { id: result.insertId, payment_number: paymentNumber };
  }

  async updateStatus(id, status) {
    const [result] = await pool.execute('UPDATE payments SET status = ?, updated_at = NOW() WHERE payment_id = ?', [
      status,
      id
    ]);
    return result.affectedRows > 0;
  }

  async findByReference(refType, refId) {
    const [rows] = await pool.execute('SELECT * FROM payments WHERE reference_type = ? AND reference_id = ?', [
      refType,
      refId
    ]);
    return rows;
  }
}

module.exports = new PaymentRepository();
