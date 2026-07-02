const paymentRepository = require('../repositories/payment.repository');
const ApiError = require('../utils/ApiError');

class PaymentService {
  async getAll(filters, pagination) {
    const [data, total] = await Promise.all([
      paymentRepository.findAll(filters, pagination),
      paymentRepository.count(filters)
    ]);
    const limit = parseInt(pagination.limit) || 20;
    const page = parseInt(pagination.page) || 1;
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  async getById(id) {
    const p = await paymentRepository.findById(id);
    if (!p) throw ApiError.notFound('Payment not found');
    return p;
  }
  async create(data) {
    return await paymentRepository.create(data);
  }
  async updateStatus(id, status) {
    const p = await paymentRepository.findById(id);
    if (!p) throw ApiError.notFound('Payment not found');
    await paymentRepository.updateStatus(id, status);
    return await paymentRepository.findById(id);
  }
}
module.exports = new PaymentService();
