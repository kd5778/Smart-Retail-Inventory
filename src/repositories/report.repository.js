const pool = require('../config/database');

class ReportRepository {
  async getSalesReport(startDate, endDate) {
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(so.order_date, '%Y-%m-%d') AS date, COUNT(*) AS order_count,
       SUM(so.grand_total) AS revenue, SUM(so.discount_amount) AS discounts, SUM(so.tax_amount) AS taxes
       FROM sales_orders so WHERE so.status != 'cancelled'
       AND so.order_date BETWEEN ? AND ? GROUP BY DATE_FORMAT(so.order_date, '%Y-%m-%d') ORDER BY date`,
      [startDate, endDate]
    );
    return rows;
  }

  async getInventoryValuation() {
    const [rows] = await pool.query('SELECT * FROM vw_inventory_valuation');
    return rows;
  }

  async getSupplierPerformance() {
    const [rows] = await pool.query('SELECT * FROM vw_supplier_performance');
    return rows;
  }

  async getProductProfitability() {
    const [rows] = await pool.query('SELECT * FROM vw_product_profitability ORDER BY gross_profit DESC LIMIT 50');
    return rows;
  }

  async getMonthlySalesTrend(months = 12) {
    const [rows] = await pool.query(
      `SELECT * FROM vw_monthly_revenue ORDER BY revenue_year DESC, revenue_month DESC LIMIT ?`,
      [Number(months)]
    );
    return rows.reverse();
  }

  async getTopProducts(limit = 10) {
    const [rows] = await pool.query(
      `SELECT p.product_id, p.sku, p.name, SUM(soi.quantity) AS total_sold, SUM(soi.line_total) AS total_revenue
       FROM sales_order_items soi INNER JOIN products p ON soi.product_id = p.product_id
       INNER JOIN sales_orders so ON soi.so_id = so.so_id
       WHERE so.status != 'cancelled' GROUP BY p.product_id, p.sku, p.name ORDER BY total_revenue DESC LIMIT ?`,
      [Number(limit)]
    );
    return rows;
  }

  async getTopCustomers(limit = 10) {
    const [rows] = await pool.query(
      `SELECT c.customer_id, c.customer_name, c.customer_type,
       COUNT(DISTINCT so.so_id) AS total_orders, SUM(so.grand_total) AS total_spent
       FROM customers c INNER JOIN sales_orders so ON c.customer_id = so.customer_id
       WHERE so.status != 'cancelled' GROUP BY c.customer_id, c.customer_name, c.customer_type
       ORDER BY total_spent DESC LIMIT ?`,
      [Number(limit)]
    );
    return rows;
  }
}

module.exports = new ReportRepository();
