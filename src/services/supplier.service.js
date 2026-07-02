const supplierRepository = require('../repositories/supplier.repository');
const ApiError = require('../utils/ApiError');

class SupplierService {
  async getAll(pagination) {
    const [data, total] = await Promise.all([supplierRepository.findAll(pagination), supplierRepository.count()]);
    const limit = parseInt(pagination.limit) || 20;
    const page = parseInt(pagination.page) || 1;
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  async getById(id) {
    const supplier = await supplierRepository.findById(id);
    if (!supplier) throw ApiError.notFound('Supplier not found');
    return supplier;
  }
  async create(data) {
    const existing = await supplierRepository.findByEmail(data.email);
    if (existing) throw ApiError.conflict('Supplier with this email already exists');
    const id = await supplierRepository.create(data);
    return await supplierRepository.findById(id);
  }
  async update(id, data) {
    const existing = await supplierRepository.findById(id);
    if (!existing) throw ApiError.notFound('Supplier not found');
    if (data.email && data.email !== existing.email) {
      const dup = await supplierRepository.findByEmail(data.email);
      if (dup) throw ApiError.conflict('Email already in use');
    }
    await supplierRepository.update(id, data);
    return await supplierRepository.findById(id);
  }
  async delete(id) {
    const existing = await supplierRepository.findById(id);
    if (!existing) throw ApiError.notFound('Supplier not found');
    await supplierRepository.softDelete(id);
  }
}
module.exports = new SupplierService();
