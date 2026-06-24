const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const auditLogService = require('../services/auditLog.service');

exports.getLogs = asyncHandler(async (req, res) => {
  const { page, limit, ...filters } = req.query;
  const result = await auditLogService.getLogs(filters, { page, limit });
  ApiResponse.success(res, 200, 'Audit logs retrieved', result.data, result.pagination);
});
