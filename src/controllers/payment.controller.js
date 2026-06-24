const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const paymentService = require('../services/payment.service');

exports.getAll = asyncHandler(async (req, res) => {
  const { page, limit, ...filters } = req.query;
  const result = await paymentService.getAll(filters, { page, limit });
  ApiResponse.success(res, 200, 'Payments retrieved', result.data, result.pagination);
});
exports.getById = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 200, 'Payment retrieved', await paymentService.getById(req.params.id));
});
exports.create = asyncHandler(async (req, res) => {
  ApiResponse.created(res, 'Payment recorded', await paymentService.create(req.body));
});
