const categoryRepository = require('../repositories/category.repository');
const ApiError = require('../utils/ApiError');
class CategoryService {
  async getAll() {
    return await categoryRepository.findAll();
  }
  async getById(id) {
    const c = await categoryRepository.findById(id);
    if (!c) throw ApiError.notFound('Category not found');
    return c;
  }
  async create(data) {
    const id = await categoryRepository.create(data);
    return await categoryRepository.findById(id);
  }
  async update(id, data) {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw ApiError.notFound('Category not found');
    await categoryRepository.update(id, data);
    return await categoryRepository.findById(id);
  }
  async delete(id) {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw ApiError.notFound('Category not found');
    await categoryRepository.softDelete(id);
  }
}
module.exports = new CategoryService();
