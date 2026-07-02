const customerRepository = require('../repositories/customer.repository');
const ApiError = require('../utils/ApiError');

class CustomerService {
  async getAll(filters, pagination) {
    const [data, total] = await Promise.all([
      customerRepository.findAll(filters, pagination),
      customerRepository.count(filters)
    ]);
    const limit = parseInt(pagination.limit) || 20;
    const page = parseInt(pagination.page) || 1;
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  async getById(id) {
    const c = await customerRepository.findById(id);
    if (!c) throw ApiError.notFound('Customer not found');
    return c;
  }
  async create(data) {
    const existing = await customerRepository.findByEmail(data.email);
    if (existing) {
      if (!existing.is_active) {
        await customerRepository.update(existing.customer_id, { ...data, is_active: true });
        return await customerRepository.findById(existing.customer_id);
      }
      throw ApiError.conflict('Customer with this email already exists');
    }
    const id = await customerRepository.create(data);
    return await customerRepository.findById(id);
  }
  async update(id, data) {
    const existing = await customerRepository.findById(id);
    if (!existing) throw ApiError.notFound('Customer not found');
    if (data.email && data.email !== existing.email) {
      const dup = await customerRepository.findByEmail(data.email);
      if (dup) throw ApiError.conflict('Email already in use');
    }
    await customerRepository.update(id, data);
    return await customerRepository.findById(id);
  }
  async delete(id) {
    const existing = await customerRepository.findById(id);
    if (!existing) throw ApiError.notFound('Customer not found');
    await customerRepository.softDelete(id);
  }
}
module.exports = new CustomerService();
