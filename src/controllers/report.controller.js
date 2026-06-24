const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const reportService = require('../services/report.service');

exports.getSalesReport = asyncHandler(async (req, res) => {
  const { start_date, end_date } = req.query;
  const data = await reportService.getSalesReport(
    start_date || '2026-01-01',
    end_date || new Date().toISOString().split('T')[0]
  );
  ApiResponse.success(res, 200, 'Sales report generated', data);
});
exports.getInventoryReport = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 200, 'Inventory valuation report', await reportService.getInventoryValuation());
});
exports.getSupplierReport = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 200, 'Supplier performance report', await reportService.getSupplierPerformance());
});
exports.getProfitabilityReport = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 200, 'Profitability report', await reportService.getProductProfitability());
});
