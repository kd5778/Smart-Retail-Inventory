const reportRepository = require('../repositories/report.repository');
class ReportService {
  async getSalesReport(startDate, endDate) {
    return await reportRepository.getSalesReport(startDate, endDate);
  }
  async getInventoryValuation() {
    return await reportRepository.getInventoryValuation();
  }
  async getSupplierPerformance() {
    return await reportRepository.getSupplierPerformance();
  }
  async getProductProfitability() {
    return await reportRepository.getProductProfitability();
  }
}
module.exports = new ReportService();
