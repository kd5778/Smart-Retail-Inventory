const reportRepository = require('../repositories/report.repository');
const pool = require('../config/database');

class AnalyticsService {
  async getDashboardMetrics() {
    const [monthlyTrend, topProducts, topCustomers, supplierPerformance] = await Promise.all([
      reportRepository.getMonthlySalesTrend(12),
      reportRepository.getTopProducts(10),
      reportRepository.getTopCustomers(10),
      reportRepository.getSupplierPerformance()
    ]);

    // Total revenue (current month)
    const [revRows] = await pool.execute(
      `SELECT COALESCE(SUM(grand_total), 0) AS total_revenue FROM sales_orders
       WHERE status != 'cancelled' AND MONTH(order_date) = MONTH(CURDATE()) AND YEAR(order_date) = YEAR(CURDATE())`
    );

    // Total orders counts
    const [orderRows] = await pool.execute(
      `SELECT
        (SELECT COUNT(*) FROM sales_orders WHERE status != 'cancelled') AS total_sales_orders,
        (SELECT COUNT(*) FROM purchase_orders) AS total_purchase_orders`
    );

    // Inventory value
    const [invRows] = await pool.execute(
      'SELECT COALESCE(SUM(i.quantity_on_hand * p.cost_price), 0) AS inventory_value FROM inventory i INNER JOIN products p ON i.product_id = p.product_id'
    );

    // Low stock count
    const [lowRows] = await pool.execute(
      'SELECT COUNT(*) AS low_stock_count FROM inventory i INNER JOIN products p ON i.product_id = p.product_id WHERE i.quantity_on_hand <= p.reorder_level AND p.is_active = TRUE'
    );

    return {
      totalRevenue: revRows[0].total_revenue,
      totalSalesOrders: orderRows[0].total_sales_orders,
      totalPurchaseOrders: orderRows[0].total_purchase_orders,
      inventoryValue: invRows[0].inventory_value,
      lowStockCount: lowRows[0].low_stock_count,
      monthlyTrend,
      topProducts,
      topCustomers,
      supplierPerformance
    };
  }
}
module.exports = new AnalyticsService();
