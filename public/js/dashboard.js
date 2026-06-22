// Dashboard — KPIs and charts
window.Dashboard = (() => {
  async function load() {
    try {
      const res = await API.get('/analytics/dashboard');
      const d = res.data;
      // KPI Cards
      document.getElementById('kpi-revenue-value').textContent =
        '₹' + Number(d.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      document.getElementById('kpi-orders-value').textContent = d.totalSalesOrders;
      document.getElementById('kpi-inventory-value').textContent =
        '₹' + Number(d.inventoryValue).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      document.getElementById('kpi-low-stock-value').textContent = d.lowStockCount;

      // Revenue trend chart
      if (d.monthlyTrend && d.monthlyTrend.length > 0) drawRevenueChart(d.monthlyTrend);
      // Top products chart
      if (d.topProducts && d.topProducts.length > 0) drawTopProductsChart(d.topProducts);
      // Top customers list
      if (d.topCustomers && d.topCustomers.length > 0) renderTopCustomers(d.topCustomers);
      // Supplier performance list
      if (d.supplierPerformance && d.supplierPerformance.length > 0) renderSupplierPerformance(d.supplierPerformance);
    } catch (err) {
      console.error('Dashboard load failed:', err);
    }
  }

  function drawRevenueChart(data) {
    const canvas = document.getElementById('revenue-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 300 * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '300px';
    ctx.scale(dpr, dpr);

    const w = rect.width,
      h = 300;
    const pad = { top: 30, right: 30, bottom: 50, left: 70 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    const values = data.map((d) => parseFloat(d.net_revenue || d.gross_revenue || 0));
    const maxVal = Math.max(...values, 1);
    const labels = data.map((d) => d.year_month || d.month_name || '');

    // Background
    ctx.fillStyle = 'transparent';
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + chartH - (chartH * i) / 4;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '11px Inter';
      ctx.textAlign = 'right';
      ctx.fillText('₹' + Math.round((maxVal * i) / 4).toLocaleString(), pad.left - 8, y + 4);
    }

    // Gradient fill under line
    const gradient = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.02)');

    const points = values.map((v, i) => ({
      x: pad.left + (chartW * i) / (values.length - 1 || 1),
      y: pad.top + chartH - (chartH * v) / maxVal
    }));

    // Fill area
    ctx.beginPath();
    ctx.moveTo(points[0].x, h - pad.bottom);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, h - pad.bottom);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Dots
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#6366f1';
      ctx.fill();
      ctx.strokeStyle = '#1e1b4b';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // X labels
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    labels.forEach((l, i) => {
      if (labels.length <= 12 || i % 2 === 0) {
        ctx.fillText(l.slice(5) || l, points[i].x, h - pad.bottom + 18);
      }
    });
  }

  function drawTopProductsChart(data) {
    const canvas = document.getElementById('top-products-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 300 * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '300px';
    ctx.scale(dpr, dpr);

    const w = rect.width,
      h = 300;
    const items = data.slice(0, 8);
    const maxVal = Math.max(...items.map((i) => parseFloat(i.total_revenue)), 1);
    const barW = Math.min(40, (w - 100) / items.length - 10);
    const pad = { top: 20, right: 20, bottom: 60, left: 60 };
    const chartH = h - pad.top - pad.bottom;
    const colors = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#7c3aed', '#4f46e5', '#4338ca'];

    ctx.clearRect(0, 0, w, h);

    items.forEach((item, i) => {
      const barH = (parseFloat(item.total_revenue) / maxVal) * chartH;
      const x = pad.left + i * (barW + 10) + 10;
      const y = pad.top + chartH - barH;

      // Bar gradient
      const g = ctx.createLinearGradient(x, y, x, y + barH);
      g.addColorStop(0, colors[i % colors.length]);
      g.addColorStop(1, colors[i % colors.length] + '88');
      ctx.fillStyle = g;

      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
      ctx.fill();

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '9px Inter';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(x + barW / 2, h - pad.bottom + 12);
      ctx.rotate(-0.4);
      const name = (item.name || '').length > 12 ? item.name.slice(0, 12) + '…' : item.name;
      ctx.fillText(name, 0, 0);
      ctx.restore();

      // Value on top
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('₹' + Math.round(item.total_revenue).toLocaleString(), x + barW / 2, y - 6);
    });
  }

  function renderTopCustomers(customers) {
    const container = document.getElementById('top-customers-list');
    if (!container) return;
    container.innerHTML = customers
      .slice(0, 8)
      .map(
        (c, i) => `
      <div class="data-list-item">
        <div class="data-list-rank">${i + 1}</div>
        <div class="data-list-info">
          <span class="data-list-name">${c.customer_name}</span>
          <span class="data-list-sub">${c.total_orders} orders • ${c.customer_type}</span>
        </div>
        <div class="data-list-value">₹${Number(c.total_spent).toLocaleString()}</div>
      </div>
    `
      )
      .join('');
  }

  function renderSupplierPerformance(suppliers) {
    const container = document.getElementById('supplier-performance-list');
    if (!container) return;
    container.innerHTML = suppliers
      .slice(0, 8)
      .map((s) => {
        const score = parseFloat(s.performance_score) || 0;
        const color = score >= 70 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444';
        return `
        <div class="data-list-item">
          <div class="data-list-info">
            <span class="data-list-name">${s.supplier_name}</span>
            <span class="data-list-sub">${s.completed_orders || 0} completed • ₹${Number(s.total_spend || 0).toLocaleString()}</span>
          </div>
          <div class="data-list-score">
            <div class="score-bar"><div class="score-fill" style="width:${score}%;background:${color}"></div></div>
            <span style="color:${color}">${score.toFixed(0)}</span>
          </div>
        </div>
      `;
      })
      .join('');
  }

  return { load };
})();
