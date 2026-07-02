const brandRepository = require('../repositories/brand.repository');
const ApiError = require('../utils/ApiError');
class BrandService {
  async getAll() {
    return await brandRepository.findAll();
  }
  async getById(id) {
    const b = await brandRepository.findById(id);
    if (!b) throw ApiError.notFound('Brand not found');
    return b;
  }
  async create(data) {
    const id = await brandRepository.create(data);
    return await brandRepository.findById(id);
  }
  async update(id, data) {
    const existing = await brandRepository.findById(id);
    if (!existing) throw ApiError.notFound('Brand not found');
    await brandRepository.update(id, data);
    return await brandRepository.findById(id);
  }
  async delete(id) {
    const existing = await brandRepository.findById(id);
    if (!existing) throw ApiError.notFound('Brand not found');
    await brandRepository.softDelete(id);
  }
}
module.exports = new BrandService();
