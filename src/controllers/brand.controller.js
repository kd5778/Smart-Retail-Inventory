const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const brandService = require('../services/brand.service');
exports.getAll = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 200, 'Brands retrieved', await brandService.getAll());
});
exports.getById = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 200, 'Brand retrieved', await brandService.getById(req.params.id));
});
exports.create = asyncHandler(async (req, res) => {
  ApiResponse.created(res, 'Brand created', await brandService.create(req.body));
});
exports.update = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 200, 'Brand updated', await brandService.update(req.params.id, req.body));
});
exports.delete = asyncHandler(async (req, res) => {
  await brandService.delete(req.params.id);
  ApiResponse.noContent(res);
});
