const pool = require('../config/database');
const salesOrderRepository = require('../repositories/salesOrder.repository');
const inventoryRepository = require('../repositories/inventory.repository');
const paymentRepository = require('../repositories/payment.repository');
const customerRepository = require('../repositories/customer.repository');
const ApiError = require('../utils/ApiError');

class SalesOrderService {
  async getAll(filters, pagination) {
    const [data, total] = await Promise.all([
      salesOrderRepository.findAll(filters, pagination),
      salesOrderRepository.count(filters)
    ]);
    const limit = parseInt(pagination.limit) || 20;
    const page = parseInt(pagination.page) || 1;
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id) {
    const so = await salesOrderRepository.findById(id);
    if (!so) throw ApiError.notFound('Sales order not found');
    so.items = await salesOrderRepository.getItems(id);
    return so;
  }

  async create(data, userId) {
    const customer = await customerRepository.findById(data.customer_id);
    if (!customer || !customer.is_active) throw ApiError.badRequest('Invalid or inactive customer');

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Validation of stock removed to allow backordering / negative stock

      // Calculate totals
      let subtotal = 0;
      for (const item of data.items) {
        subtotal += item.quantity * item.unit_price * (1 - (item.discount_pct || 0) / 100);
      }
      const discountAmount = parseFloat(data.discount_amount) || 0;
      const taxAmount = parseFloat(data.tax_amount) || (subtotal - discountAmount) * 0.18;
      const grandTotal = subtotal - discountAmount + taxAmount;

      // Create order
      const { id: soId, so_number } = await salesOrderRepository.create(
        {
          ...data,
          subtotal,
          discount_amount: discountAmount,
          tax_amount: taxAmount,
          grand_total: grandTotal,
          created_by: userId
        },
        connection
      );

      // Create items and reserve stock
      for (const item of data.items) {
        await salesOrderRepository.createItem({ so_id: soId, ...item }, connection);
        // Reserve stock (upsert if inventory record doesn't exist)
        const [res] = await connection.execute(
          'UPDATE inventory SET quantity_reserved = quantity_reserved + ? WHERE product_id = ? AND warehouse_id = (SELECT warehouse_id FROM warehouses WHERE is_active = TRUE LIMIT 1)',
          [item.quantity, item.product_id]
        );
        if (res.affectedRows === 0) {
          await connection.execute(
            'INSERT INTO inventory (product_id, warehouse_id, quantity_on_hand, quantity_reserved) SELECT ?, warehouse_id, 0, ? FROM warehouses WHERE is_active = TRUE LIMIT 1',
            [item.product_id, item.quantity]
          );
        }
      }

      await connection.commit();
      return await this.getById(soId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateStatus(soId, status, userId) {
    const so = await salesOrderRepository.findById(soId);
    if (!so) throw ApiError.notFound('Sales order not found');

    const validTransitions = {
      draft: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: []
    };

    if (!validTransitions[so.status] || !validTransitions[so.status].includes(status)) {
      throw ApiError.badRequest(`Cannot transition from '${so.status}' to '${status}'`);
    }

    await salesOrderRepository.updateStatus(soId, status);
    return await this.getById(soId);
  }

  async generateInvoice(soId) {
    const so = await salesOrderRepository.findById(soId);
    if (!so) throw ApiError.notFound('Sales order not found');
    if (so.status === 'cancelled') throw ApiError.badRequest('Cannot generate invoice for cancelled order');

    const existingPayments = await paymentRepository.findByReference('sales_order', soId);
    if (existingPayments.length > 0)
      return { order: so, payment: existingPayments[0], items: await salesOrderRepository.getItems(soId) };

    const payment = await paymentRepository.create({
      reference_type: 'sales_order',
      reference_id: soId,
      amount: so.grand_total,
      payment_method: 'bank_transfer',
      status: 'pending',
      created_by: so.created_by
    });

    return { order: so, payment, items: await salesOrderRepository.getItems(soId) };
  }
}

module.exports = new SalesOrderService();
