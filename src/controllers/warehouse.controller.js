const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const warehouseService = require('../services/warehouse.service');
exports.getAll = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 200, 'Warehouses retrieved', await warehouseService.getAll());
});
exports.getById = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 200, 'Warehouse retrieved', await warehouseService.getById(req.params.id));
});
exports.create = asyncHandler(async (req, res) => {
  ApiResponse.created(res, 'Warehouse created', await warehouseService.create(req.body));
});
exports.update = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 200, 'Warehouse updated', await warehouseService.update(req.params.id, req.body));
});
exports.delete = asyncHandler(async (req, res) => {
  await warehouseService.delete(req.params.id);
  ApiResponse.noContent(res);
});
