/**
 * Purchase Orders Module — with manual order creation
 */
window.PurchaseOrders = (() => {
  let currentPage = 1;

  async function load() {
    const container = document.getElementById('purchase-orders-content');
    container.innerHTML = `
      <div class="section-header">
        <h3>Purchase Orders</h3>
        <div class="section-actions">
          <select class="filter-select" id="po-status-filter">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button class="btn btn-primary btn-sm" id="create-po-btn">+ Create Order</button>
        </div>
      </div>
      <div class="table-container glass-card" id="po-table-container"><p class="loading-text">Loading...</p></div>
      <div class="pagination" id="po-pagination"></div>`;
    document.getElementById('po-status-filter').addEventListener('change', () => {
      currentPage = 1;
      fetchData();
    });
    document.getElementById('create-po-btn').addEventListener('click', showCreateForm);
    await fetchData();
  }

  async function fetchData() {
    const status = document.getElementById('po-status-filter')?.value || '';
    try {
      const res = await API.get('/purchase-orders', { page: currentPage, limit: 15, ...(status ? { status } : {}) });
      renderTable(res.data, res.pagination);
    } catch (e) {
      document.getElementById('po-table-container').innerHTML = `<p class="error-text">${e.message}</p>`;
    }
  }

  function renderTable(data, pagination) {
    const c = document.getElementById('po-table-container');
    if (!data || !data.length) {
      c.innerHTML = '<p class="empty-text">No purchase orders yet. Click "+ Create Order" to add one.</p>';
      return;
    }
    const statusColors = {
      draft: 'badge-default',
      submitted: 'badge-info',
      approved: 'badge-warning',
      received: 'badge-success',
      cancelled: 'badge-danger'
    };
    c.innerHTML = `<table class="data-table"><thead><tr><th>PO Number</th><th>Supplier</th><th>Warehouse</th><th>Date</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead><tbody>${data
      .map(
        (po) => `
      <tr>
        <td><strong>${po.po_number}</strong></td>
        <td>${po.supplier_name}</td>
        <td>${po.warehouse_name}</td>
        <td>${new Date(po.order_date).toLocaleDateString('en-IN')}</td>
        <td class="text-right">₹${Number(po.grand_total || 0).toLocaleString('en-IN')}</td>
        <td><span class="badge ${statusColors[po.status] || 'badge-default'}">${po.status.toUpperCase()}</span></td>
        <td class="actions-cell">
          <button class="btn btn-xs btn-outline" onclick="window.PurchaseOrders.view(${po.po_id})">View</button>
          ${['draft', 'submitted'].includes(po.status) ? `<button class="btn btn-xs btn-success" onclick="window.PurchaseOrders.approve(${po.po_id})">Approve</button>` : ''}
          ${po.status === 'approved' ? `<button class="btn btn-xs btn-primary" onclick="window.PurchaseOrders.receive(${po.po_id})">Mark Received</button>` : ''}
        </td>
      </tr>`
      )
      .join('')}</tbody></table>`;
    renderPagination('po-pagination', pagination, (p) => {
      currentPage = p;
      fetchData();
    });
  }

  async function showCreateForm() {
    // Load suppliers, warehouses, products
    let suppliers = [],
      warehouses = [],
      products = [];
    try {
      const r = await API.get('/suppliers');
      suppliers = r.data || [];
    } catch (e) {}
    try {
      const r = await API.get('/warehouses');
      warehouses = r.data || [];
    } catch (e) {}
    try {
      const r = await API.get('/products', { limit: 200 });
      products = r.data || [];
    } catch (e) {}

    const supplierOpts =
      suppliers.map((s) => `<option value="${s.supplier_id}">${s.supplier_name}</option>`).join('') ||
      '<option value="">No suppliers yet — add one first</option>';
    const warehouseOpts =
      warehouses.map((w) => `<option value="${w.warehouse_id}">${w.warehouse_name}</option>`).join('') ||
      '<option value="">No warehouses</option>';
    const productOpts =
      products
        .map((p) => `<option value="${p.product_id}" data-price="${p.cost_price}">${p.name} (${p.sku})</option>`)
        .join('') || '<option value="">No products yet — add products first</option>';

    openModal(
      'Create Purchase Order',
      `
      <form class="modal-form" id="po-form">
        <div class="form-row">
          <div class="form-group"><label>Supplier *</label><select id="po-supplier">${supplierOpts}</select></div>
          <div class="form-group"><label>Warehouse *</label><select id="po-warehouse">${warehouseOpts}</select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Order Date</label><input type="date" id="po-date" value="${new Date().toISOString().split('T')[0]}"></div>
          <div class="form-group"><label>Expected Delivery</label><input type="date" id="po-expected"></div>
        </div>
        <div class="form-group"><label>Notes</label><textarea id="po-notes" placeholder="Optional notes..."></textarea></div>
        <hr style="border-color:rgba(255,255,255,0.1);margin:12px 0;">
        <h4 style="margin-bottom:10px;">Order Items</h4>
        <div id="po-items"></div>
        <button type="button" class="btn btn-outline btn-sm" id="po-add-item" style="margin-top:8px;">+ Add Item</button>
      </form>
    `,
      `<button class="btn btn-primary" id="po-submit">Create Purchase Order</button>`
    );

    // Add first item row by default
    addItemRow(productOpts);
    document.getElementById('po-add-item').addEventListener('click', () => addItemRow(productOpts));

    document.getElementById('po-submit').addEventListener('click', async () => {
      const supplier_id = n('po-supplier');
      const warehouse_id = n('po-warehouse');
      if (!supplier_id) {
        showToast('Please select a supplier', 'error');
        return;
      }
      if (!warehouse_id) {
        showToast('Please select a warehouse', 'error');
        return;
      }

      const itemRows = document.querySelectorAll('.po-item-row');
      const items = [];
      for (const row of itemRows) {
        const pid = parseInt(row.querySelector('.po-item-product').value);
        const qty = parseInt(row.querySelector('.po-item-qty').value);
        const cost = parseFloat(row.querySelector('.po-item-cost').value);
        if (pid && qty > 0 && cost >= 0) {
          items.push({ product_id: pid, quantity_ordered: qty, unit_cost: cost });
        }
      }
      if (items.length === 0) {
        showToast('Add at least one item', 'error');
        return;
      }

      const data = {
        supplier_id,
        warehouse_id,
        order_date: v('po-date') || new Date().toISOString().split('T')[0],
        expected_delivery_date: v('po-expected') || null,
        notes: v('po-notes') || null,
        items
      };

      try {
        await API.post('/purchase-orders', data);
        closeModal();
        showToast('Purchase order created!', 'success');
        fetchData();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  function addItemRow(productOpts) {
    const container = document.getElementById('po-items');
    const row = document.createElement('div');
    row.className = 'po-item-row';
    row.style.cssText =
      'display:grid;grid-template-columns:1fr 80px 100px 32px;gap:8px;margin-bottom:8px;align-items:center;';
    row.innerHTML = `
      <select class="po-item-product">${productOpts}</select>
      <input type="number" class="po-item-qty" placeholder="Qty" value="1" min="1">
      <input type="number" class="po-item-cost" placeholder="Cost ₹" step="0.01" min="0">
      <button type="button" style="background:rgba(239,68,68,0.2);border:1px solid #ef4444;color:#ef4444;border-radius:6px;cursor:pointer;padding:4px 8px;" onclick="this.parentElement.remove()">✕</button>`;

    // Auto-fill cost from product data
    const sel = row.querySelector('.po-item-product');
    const costInput = row.querySelector('.po-item-cost');
    sel.addEventListener('change', () => {
      const opt = sel.options[sel.selectedIndex];
      const price = opt?.dataset?.price;
      if (price) costInput.value = parseFloat(price).toFixed(2);
    });
    // Trigger on load
    const opt = sel.options[sel.selectedIndex];
    if (opt?.dataset?.price) costInput.value = parseFloat(opt.dataset.price).toFixed(2);

    container.appendChild(row);
  }

  async function view(id) {
    try {
      const res = await API.get(`/purchase-orders/${id}`);
      const po = res.data;
      const statusColors = {
        draft: 'badge-default',
        submitted: 'badge-info',
        approved: 'badge-warning',
        received: 'badge-success',
        cancelled: 'badge-danger'
      };
      openModal(
        `PO: ${po.po_number}`,
        `<div class="detail-grid">
          <div><strong>Supplier:</strong> ${po.supplier_name}</div>
          <div><strong>Warehouse:</strong> ${po.warehouse_name}</div>
          <div><strong>Status:</strong> <span class="badge ${statusColors[po.status] || ''}">${po.status?.toUpperCase()}</span></div>
          <div><strong>Total:</strong> ₹${Number(po.grand_total || 0).toLocaleString('en-IN')}</div>
        </div>
        <h4 style="margin:16px 0 8px;">Line Items</h4>
        <table class="data-table"><thead><tr><th>SKU</th><th>Product</th><th>Ordered</th><th>Received</th><th>Unit Cost</th><th>Total</th></tr></thead>
        <tbody>${(po.items || []).map((i) => `<tr><td><code>${i.sku || '—'}</code></td><td>${i.product_name}</td><td>${i.quantity_ordered}</td><td>${i.quantity_received}</td><td>₹${Number(i.unit_cost).toFixed(2)}</td><td>₹${Number(i.line_total).toLocaleString('en-IN')}</td></tr>`).join('')}</tbody></table>`,
        `${['draft', 'submitted'].includes(po.status) ? `<button class="btn btn-success" onclick="window.PurchaseOrders.approve(${po.po_id}); closeModal();">Approve</button>` : ''}
         ${po.status === 'approved' ? `<button class="btn btn-primary" onclick="window.PurchaseOrders.receive(${po.po_id}); closeModal();">Mark as Received</button>` : ''}`
      );
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  async function approve(id) {
    if (!confirm('Approve this purchase order?')) return;
    try {
      await API.patch(`/purchase-orders/${id}/approve`);
      showToast('PO approved!', 'success');
      fetchData();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  async function receive(id) {
    if (!confirm('Mark this PO as received? This will update inventory stock levels.')) return;
    try {
      await API.patch(`/purchase-orders/${id}/receive`);
      showToast('PO marked as received! Stock updated.', 'success');
      fetchData();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  return { load, view, approve, receive };
})();
