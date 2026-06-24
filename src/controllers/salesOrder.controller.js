const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const salesOrderService = require('../services/salesOrder.service');

exports.getAll = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, order, ...filters } = req.query;
  const result = await salesOrderService.getAll(filters, { page, limit, sortBy, order });
  ApiResponse.success(res, 200, 'Sales orders retrieved', result.data, result.pagination);
});
exports.getById = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 200, 'Sales order retrieved', await salesOrderService.getById(req.params.id));
});
exports.create = asyncHandler(async (req, res) => {
  ApiResponse.created(res, 'Sales order created', await salesOrderService.create(req.body, req.user.userId));
});
exports.updateStatus = asyncHandler(async (req, res) => {
  ApiResponse.success(
    res,
    200,
    'Status updated',
    await salesOrderService.updateStatus(req.params.id, req.body.status, req.user.userId)
  );
});
exports.generateInvoice = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 200, 'Invoice generated', await salesOrderService.generateInvoice(req.params.id));
});
