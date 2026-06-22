// Reports — sales, inventory, supplier, profitability
window.Reports = (() => {
  async function load() {
    const container = document.getElementById('reports-content');
    container.innerHTML = `<div class="section-header"><h3>Business Reports</h3></div>
      <div class="reports-grid">
        <div class="report-card glass-card" id="report-sales" onclick="Reports.showSales()"><div class="report-icon">📊</div><h4>Sales Report</h4><p>Revenue trends and order analysis</p></div>
        <div class="report-card glass-card" id="report-inventory" onclick="Reports.showInventory()"><div class="report-icon">📦</div><h4>Inventory Valuation</h4><p>Stock value by warehouse and product</p></div>
        <div class="report-card glass-card" id="report-supplier" onclick="Reports.showSupplier()"><div class="report-icon">🤝</div><h4>Supplier Performance</h4><p>Delivery rates and vendor scoring</p></div>
        <div class="report-card glass-card" id="report-profit" onclick="Reports.showProfitability()"><div class="report-icon">💰</div><h4>Product Profitability</h4><p>Margin analysis per product</p></div>
      </div>`;
  }

  async function showSales() {
    try {
      const res = await API.get('/reports/sales', { start_date: '2026-01-01', end_date: '2026-12-31' });
      const data = res.data || [];
      let totalRev = 0,
        totalOrders = 0;
      data.forEach((d) => {
        totalRev += parseFloat(d.revenue);
        totalOrders += parseInt(d.order_count);
      });
      openModal(
        'Sales Report',
        `<div class="report-summary"><div><strong>Total Revenue:</strong> ₹${totalRev.toLocaleString()}</div><div><strong>Total Orders:</strong> ${totalOrders}</div></div><table class="data-table"><thead><tr><th>Date</th><th>Orders</th><th>Revenue</th><th>Discounts</th><th>Tax</th></tr></thead><tbody>${data.map((d) => `<tr><td>${d.date}</td><td>${d.order_count}</td><td class="text-right">₹${Number(d.revenue).toLocaleString()}</td><td class="text-right">₹${Number(d.discounts).toLocaleString()}</td><td class="text-right">₹${Number(d.taxes).toLocaleString()}</td></tr>`).join('')}</tbody></table>`,
        ''
      );
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  async function showInventory() {
    try {
      const res = await API.get('/reports/inventory');
      const data = res.data || [];
      openModal(
        'Inventory Valuation',
        `<table class="data-table"><thead><tr><th>Warehouse</th><th>Product</th><th>On Hand</th><th>Cost Value</th><th>Retail Value</th><th>Potential Profit</th></tr></thead><tbody>${data
          .slice(0, 30)
          .map(
            (d) =>
              `<tr><td>${d.warehouse_name}</td><td>${d.product_name}</td><td>${d.quantity_on_hand}</td><td class="text-right">₹${Number(d.stock_cost_value).toLocaleString()}</td><td class="text-right">₹${Number(d.stock_retail_value).toLocaleString()}</td><td class="text-right text-success">₹${Number(d.potential_profit).toLocaleString()}</td></tr>`
          )
          .join('')}</tbody></table>`,
        ''
      );
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  async function showSupplier() {
    try {
      const res = await API.get('/reports/suppliers');
      const data = res.data || [];
      openModal(
        'Supplier Performance',
        `<table class="data-table"><thead><tr><th>Company</th><th>Orders</th><th>Completed</th><th>Total Spend</th><th>Completion %</th><th>Score</th></tr></thead><tbody>${data.map((d) => `<tr><td>${d.supplier_name}</td><td>${d.total_orders}</td><td>${d.completed_orders}</td><td class="text-right">₹${Number(d.total_spend).toLocaleString()}</td><td class="text-right">${d.completion_rate_pct}%</td><td><span class="badge ${parseFloat(d.performance_score) >= 70 ? 'badge-success' : parseFloat(d.performance_score) >= 40 ? 'badge-warning' : 'badge-danger'}">${d.performance_score}</span></td></tr>`).join('')}</tbody></table>`,
        ''
      );
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  async function showProfitability() {
    try {
      const res = await API.get('/reports/profitability');
      const data = res.data || [];
      openModal(
        'Product Profitability',
        `<table class="data-table"><thead><tr><th>Product</th><th>Revenue</th><th>COGS</th><th>Gross Profit</th><th>Margin %</th></tr></thead><tbody>${data
          .slice(0, 25)
          .map(
            (d) =>
              `<tr><td>${d.product_name}</td><td class="text-right">₹${Number(d.total_revenue).toLocaleString()}</td><td class="text-right">₹${Number(d.total_cost_of_goods).toLocaleString()}</td><td class="text-right text-success">₹${Number(d.gross_profit).toLocaleString()}</td><td class="text-right"><span class="badge ${parseFloat(d.margin_percentage) >= 30 ? 'badge-success' : 'badge-warning'}">${d.margin_percentage}%</span></td></tr>`
          )
          .join('')}</tbody></table>`,
        ''
      );
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  return { load, showSales, showInventory, showSupplier, showProfitability };
})();
