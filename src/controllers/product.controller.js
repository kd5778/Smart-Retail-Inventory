const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const productService = require('../services/product.service');

exports.getAll = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, order, ...filters } = req.query;
  const result = await productService.getAll(filters, { page, limit, sortBy, order });
  ApiResponse.success(res, 200, 'Products retrieved', result.data, result.pagination);
});

exports.getById = asyncHandler(async (req, res) => {
  const product = await productService.getById(req.params.id);
  ApiResponse.success(res, 200, 'Product retrieved', product);
});

exports.create = asyncHandler(async (req, res) => {
  const product = await productService.create(req.body, req.user.userId);
  ApiResponse.created(res, 'Product created', product);
});

exports.update = asyncHandler(async (req, res) => {
  const product = await productService.update(req.params.id, req.body, req.user.userId);
  ApiResponse.success(res, 200, 'Product updated', product);
});

exports.delete = asyncHandler(async (req, res) => {
  await productService.delete(req.params.id, req.user.userId);
  ApiResponse.noContent(res);
});
