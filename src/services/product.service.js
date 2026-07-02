const productRepository = require('../repositories/product.repository');
const auditLogRepository = require('../repositories/auditLog.repository');
const ApiError = require('../utils/ApiError');

class ProductService {
  async getAll(filters, pagination) {
    const [data, total] = await Promise.all([
      productRepository.findAll(filters, pagination),
      productRepository.count(filters)
    ]);
    const limit = parseInt(pagination.limit) || 20;
    const page = parseInt(pagination.page) || 1;
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id) {
    const product = await productRepository.findById(id);
    if (!product) throw ApiError.notFound('Product not found');
    return product;
  }

  async create(data, userId) {
    const existing = await productRepository.findBySku(data.sku);
    if (existing) throw ApiError.conflict(`Product with SKU '${data.sku}' already exists`);
    const id = await productRepository.create(data);
    await auditLogRepository.create({
      changed_by: userId,
      action: 'INSERT',
      table_name: 'products',
      record_id: id,
      new_values: data
    });
    return await productRepository.findById(id);
  }

  async update(id, data, userId) {
    const existing = await productRepository.findById(id);
    if (!existing) throw ApiError.notFound('Product not found');
    if (data.sku && data.sku !== existing.sku) {
      const dup = await productRepository.findBySku(data.sku);
      if (dup) throw ApiError.conflict(`SKU '${data.sku}' already in use`);
    }
    await productRepository.update(id, data);
    await auditLogRepository.create({
      changed_by: userId,
      action: 'UPDATE',
      table_name: 'products',
      record_id: id,
      old_values: existing,
      new_values: data
    });
    return await productRepository.findById(id);
  }

  async delete(id, userId) {
    const existing = await productRepository.findById(id);
    if (!existing) throw ApiError.notFound('Product not found');
    await productRepository.softDelete(id);
    await auditLogRepository.create({
      changed_by: userId,
      action: 'DELETE',
      table_name: 'products',
      record_id: id,
      old_values: existing
    });
  }
}

module.exports = new ProductService();
