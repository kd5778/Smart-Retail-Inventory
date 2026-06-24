const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const inventoryService = require('../services/inventory.service');

exports.getStockLevels = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, order, ...filters } = req.query;
  const result = await inventoryService.getStockLevels(filters, { page, limit, sortBy, order });
  ApiResponse.success(res, 200, 'Stock levels retrieved', result.data, result.pagination);
});

exports.adjustStock = asyncHandler(async (req, res) => {
  const result = await inventoryService.adjustStock(req.body, req.user.userId);
  ApiResponse.success(res, 200, 'Stock adjusted', result);
});

exports.getMovements = asyncHandler(async (req, res) => {
  const { page, limit, ...filters } = req.query;
  const result = await inventoryService.getMovements(filters, { page, limit });
  ApiResponse.success(res, 200, 'Movements retrieved', result.data, result.pagination);
});

exports.getReorderSuggestions = asyncHandler(async (req, res) => {
  const suggestions = await inventoryService.getReorderSuggestions();
  ApiResponse.success(res, 200, 'Reorder suggestions retrieved', suggestions);
});

exports.createReorderRequest = asyncHandler(async (req, res) => {
  const id = await inventoryService.createReorderRequest(req.body, req.user.userId);
  ApiResponse.created(res, 'Reorder request created', { id });
});
