const warehouseRepository = require('../repositories/warehouse.repository');
const ApiError = require('../utils/ApiError');
class WarehouseService {
  async getAll() {
    return await warehouseRepository.findAll();
  }
  async getById(id) {
    const w = await warehouseRepository.findById(id);
    if (!w) throw ApiError.notFound('Warehouse not found');
    return w;
  }
  async create(data) {
    const id = await warehouseRepository.create(data);
    return await warehouseRepository.findById(id);
  }
  async update(id, data) {
    const existing = await warehouseRepository.findById(id);
    if (!existing) throw ApiError.notFound('Warehouse not found');
    await warehouseRepository.update(id, data);
    return await warehouseRepository.findById(id);
  }
  async delete(id) {
    const existing = await warehouseRepository.findById(id);
    if (!existing) throw ApiError.notFound('Warehouse not found');
    await warehouseRepository.softDelete(id);
  }
}
module.exports = new WarehouseService();
