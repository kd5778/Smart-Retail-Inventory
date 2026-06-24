const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const purchaseOrderService = require('../services/purchaseOrder.service');

exports.getAll = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, order, ...filters } = req.query;
  const result = await purchaseOrderService.getAll(filters, { page, limit, sortBy, order });
  ApiResponse.success(res, 200, 'Purchase orders retrieved', result.data, result.pagination);
});
exports.getById = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 200, 'Purchase order retrieved', await purchaseOrderService.getById(req.params.id));
});
exports.create = asyncHandler(async (req, res) => {
  ApiResponse.created(res, 'Purchase order created', await purchaseOrderService.create(req.body, req.user.userId));
});
exports.approve = asyncHandler(async (req, res) => {
  ApiResponse.success(
    res,
    200,
    'Purchase order approved',
    await purchaseOrderService.approve(req.params.id, req.user.userId)
  );
});
exports.receiveInventory = asyncHandler(async (req, res) => {
  ApiResponse.success(
    res,
    200,
    'Inventory received',
    await purchaseOrderService.receiveInventory(req.params.id, req.body.items, req.user.userId)
  );
});
