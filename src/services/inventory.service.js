const pool = require('../config/database');
const inventoryRepository = require('../repositories/inventory.repository');
const ApiError = require('../utils/ApiError');

class InventoryService {
  async getStockLevels(filters, pagination) {
    const [data, total] = await Promise.all([
      inventoryRepository.findAll(filters, pagination),
      inventoryRepository.count(filters)
    ]);
    const limit = parseInt(pagination.limit) || 20;
    const page = parseInt(pagination.page) || 1;
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async adjustStock(data, userId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await inventoryRepository.updateStock(data.product_id, data.warehouse_id, data.quantity, connection);
      await inventoryRepository.createMovement(
        {
          product_id: data.product_id,
          warehouse_id: data.warehouse_id,
          movement_type: 'adjustment',
          quantity: Math.abs(data.quantity),
          reference_type: 'manual',
          reason: data.reason,
          performed_by: userId
        },
        connection
      );
      await connection.commit();
      return await inventoryRepository.findByProductAndWarehouse(data.product_id, data.warehouse_id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getMovements(filters, pagination) {
    const [data, total] = await Promise.all([
      inventoryRepository.getMovements(filters, pagination),
      inventoryRepository.countMovements(filters)
    ]);
    const limit = parseInt(pagination.limit) || 20;
    const page = parseInt(pagination.page) || 1;
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getReorderSuggestions() {
    return await inventoryRepository.getLowStockProducts();
  }

  async createReorderRequest(data, userId) {
    const inventory = await inventoryRepository.findByProductAndWarehouse(data.product_id, data.warehouse_id);
    if (!inventory) throw ApiError.notFound('No inventory record found');
    return await inventoryRepository.createReorderRequest({
      ...data,
      current_qty: inventory.quantity_on_hand,
      reorder_level: data.reorder_level || inventory.quantity_on_hand,
      requested_by: userId
    });
  }
}
module.exports = new InventoryService();
