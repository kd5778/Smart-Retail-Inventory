/**
 * Inventory Module - Stock levels and movements
 */
window.Inventory = (() => {
  let currentPage = 1;
  async function load() {
    const container = document.getElementById('inventory-content');
    container.innerHTML = `<div class="section-header"><h3>Inventory Stock Levels</h3><div class="section-actions"><input type="text" class="search-input" id="inv-search" placeholder="Search by product..."><button class="btn btn-warning btn-sm" id="low-stock-btn">⚠ Low Stock</button><button class="btn btn-outline btn-sm" id="movements-btn">Movements</button></div></div><div class="table-container glass-card" id="inv-table-container"><p class="loading-text">Loading...</p></div><div class="pagination" id="inv-pagination"></div>`;
    document.getElementById('inv-search').addEventListener(
      'input',
      debounce(() => {
        currentPage = 1;
        fetchData();
      }, 400)
    );
    document.getElementById('low-stock-btn').addEventListener('click', () => {
      currentPage = 1;
      fetchData({ low_stock: true });
    });
    document.getElementById('movements-btn').addEventListener('click', loadMovements);
    await fetchData();
  }
  async function fetchData(extraFilters = {}) {
    const search = document.getElementById('inv-search')?.value || '';
    try {
      const res = await API.get('/inventory/stock', { page: currentPage, limit: 15, search, ...extraFilters });
      renderTable(res.data, res.pagination);
    } catch (e) {
      document.getElementById('inv-table-container').innerHTML = `<p class="error-text">${e.message}</p>`;
    }
  }
  function renderTable(data, pagination) {
    const c = document.getElementById('inv-table-container');
    if (!data || !data.length) {
      c.innerHTML = '<p class="empty-text">No inventory records found</p>';
      return;
    }
    c.innerHTML = `<table class="data-table"><thead><tr><th>SKU</th><th>Product</th><th>Warehouse</th><th>On Hand</th><th>Reserved</th><th>Available</th><th>Reorder Lvl</th><th>Status</th></tr></thead><tbody>${data
      .map((i) => {
        const available = i.quantity_on_hand - i.quantity_reserved;
        const isLow = i.quantity_on_hand <= (i.reorder_level || 0);
        return `<tr class="${isLow ? 'row-warning' : ''}"><td><code>${i.sku}</code></td><td>${i.product_name}</td><td>${i.warehouse_name}</td><td class="text-right">${i.quantity_on_hand}</td><td class="text-right">${i.quantity_reserved}</td><td class="text-right">${available}</td><td class="text-right">${i.reorder_level || '-'}</td><td><span class="badge ${isLow ? 'badge-danger' : 'badge-success'}">${isLow ? 'Low' : 'OK'}</span></td></tr>`;
      })
      .join('')}</tbody></table>`;
    renderPagination('inv-pagination', pagination, (p) => {
      currentPage = p;
      fetchData();
    });
  }
  async function loadMovements() {
    try {
      const res = await API.get('/inventory/movements', { limit: 30 });
      const movements = res.data || [];
      openModal(
        'Inventory Movements',
        `<div class="movements-list">${movements.map((m) => `<div class="data-list-item"><div class="data-list-info"><span class="data-list-name">${m.product_name} — ${m.warehouse_name}</span><span class="data-list-sub">${m.movement_type} • ${m.quantity} units • ${new Date(m.created_at).toLocaleDateString()}</span></div><span class="badge ${m.movement_type.includes('in') ? 'badge-success' : 'badge-danger'}">${m.movement_type}</span></div>`).join('')}</div>`,
        ''
      );
    } catch (e) {
      showToast(e.message, 'error');
    }
  }
  return { load };
})();
