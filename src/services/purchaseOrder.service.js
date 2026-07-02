const pool = require('../config/database');
const purchaseOrderRepository = require('../repositories/purchaseOrder.repository');
const inventoryRepository = require('../repositories/inventory.repository');
const supplierRepository = require('../repositories/supplier.repository');
const ApiError = require('../utils/ApiError');

class PurchaseOrderService {
  async getAll(filters, pagination) {
    const [data, total] = await Promise.all([
      purchaseOrderRepository.findAll(filters, pagination),
      purchaseOrderRepository.count(filters)
    ]);
    const limit = parseInt(pagination.limit) || 20;
    const page = parseInt(pagination.page) || 1;
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id) {
    const po = await purchaseOrderRepository.findById(id);
    if (!po) throw ApiError.notFound('Purchase order not found');
    po.items = await purchaseOrderRepository.getItems(id);
    return po;
  }

  async create(data, userId) {
    const supplier = await supplierRepository.findById(data.supplier_id);
    if (!supplier || !supplier.is_active) throw ApiError.badRequest('Invalid or inactive supplier');

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      let totalAmount = 0;
      const { id: poId, po_number } = await purchaseOrderRepository.create({ ...data, created_by: userId }, connection);

      for (const item of data.items) {
        const lineTotal = item.quantity_ordered * item.unit_cost;
        totalAmount += lineTotal;
        await purchaseOrderRepository.createItem({ po_id: poId, ...item }, connection);
      }

      await purchaseOrderRepository.updateTotal(poId, totalAmount, connection);
      await connection.commit();
      return await this.getById(poId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async approve(poId, userId) {
    const po = await purchaseOrderRepository.findById(poId);
    if (!po) throw ApiError.notFound('Purchase order not found');
    if (!['draft', 'submitted'].includes(po.status))
      throw ApiError.badRequest(`Cannot approve PO in '${po.status}' status`);
    await purchaseOrderRepository.updateStatus(poId, 'approved', userId);
    return await this.getById(poId);
  }

  async receiveInventory(poId, items, userId) {
    const po = await purchaseOrderRepository.findById(poId);
    if (!po) throw ApiError.notFound('Purchase order not found');
    if (!['approved', 'submitted'].includes(po.status))
      throw ApiError.badRequest(`Cannot receive PO in '${po.status}' status`);

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const poItems = await purchaseOrderRepository.getItems(poId);
      let allReceived = true;

      // Default to receiving all remaining items if items array is missing or empty
      if (!items || !Array.isArray(items) || items.length === 0) {
        items = poItems
          .map((i) => ({
            purchase_order_item_id: i.po_item_id,
            quantity_received: i.quantity_ordered - i.quantity_received
          }))
          .filter((i) => i.quantity_received > 0);
      }

      for (const receivedItem of items) {
        const poItem = poItems.find((i) => i.po_item_id === receivedItem.purchase_order_item_id);
        if (!poItem) continue;
        const newReceived = poItem.quantity_received + receivedItem.quantity_received;
        if (newReceived > poItem.quantity_ordered)
          throw ApiError.badRequest(`Cannot receive more than ordered for product ${poItem.product_name}`);

        await purchaseOrderRepository.updateItemReceived(poItem.po_item_id, newReceived, connection);
        if (newReceived < poItem.quantity_ordered) allReceived = false;
      }

      if (!allReceived) {
        const updatedItems = await purchaseOrderRepository.getItems(poId);
        allReceived = updatedItems.every((i) => i.quantity_received >= i.quantity_ordered);
      }

      await purchaseOrderRepository.updateStatus(poId, allReceived ? 'received' : po.status, null, connection);
      await connection.commit();
      return await this.getById(poId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new PurchaseOrderService();
