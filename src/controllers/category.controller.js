const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const categoryService = require('../services/category.service');
exports.getAll = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 200, 'Categories retrieved', await categoryService.getAll());
});
exports.getById = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 200, 'Category retrieved', await categoryService.getById(req.params.id));
});
exports.create = asyncHandler(async (req, res) => {
  ApiResponse.created(res, 'Category created', await categoryService.create(req.body));
});
exports.update = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 200, 'Category updated', await categoryService.update(req.params.id, req.body));
});
exports.delete = asyncHandler(async (req, res) => {
  await categoryService.delete(req.params.id);
  ApiResponse.noContent(res);
});
