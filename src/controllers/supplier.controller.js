const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const supplierService = require('../services/supplier.service');

exports.getAll = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, order } = req.query;
  const result = await supplierService.getAll({ page, limit, sortBy, order });
  ApiResponse.success(res, 200, 'Suppliers retrieved', result.data, result.pagination);
});
exports.getById = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 200, 'Supplier retrieved', await supplierService.getById(req.params.id));
});
exports.create = asyncHandler(async (req, res) => {
  ApiResponse.created(res, 'Supplier created', await supplierService.create(req.body));
});
exports.update = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 200, 'Supplier updated', await supplierService.update(req.params.id, req.body));
});
exports.delete = asyncHandler(async (req, res) => {
  await supplierService.delete(req.params.id);
  ApiResponse.noContent(res);
});
