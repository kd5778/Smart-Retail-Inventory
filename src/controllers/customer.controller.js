const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const customerService = require('../services/customer.service');

exports.getAll = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, order, ...filters } = req.query;
  const result = await customerService.getAll(filters, { page, limit, sortBy, order });
  ApiResponse.success(res, 200, 'Customers retrieved', result.data, result.pagination);
});
exports.getById = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 200, 'Customer retrieved', await customerService.getById(req.params.id));
});
exports.create = asyncHandler(async (req, res) => {
  ApiResponse.created(res, 'Customer created', await customerService.create(req.body));
});
exports.update = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 200, 'Customer updated', await customerService.update(req.params.id, req.body));
});
exports.delete = asyncHandler(async (req, res) => {
  await customerService.delete(req.params.id);
  ApiResponse.noContent(res);
});
