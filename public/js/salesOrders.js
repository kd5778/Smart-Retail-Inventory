/**
 * Sales Orders Module — with manual order creation
 */
window.SalesOrders = (() => {
  let currentPage = 1;

  async function load() {
    const container = document.getElementById('sales-orders-content');
    container.innerHTML = `
      <div class="section-header">
        <h3>Sales Orders</h3>
        <div class="section-actions">
          <select class="filter-select" id="so-status-filter">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Dispatched to Customer</option>
            <option value="delivered">Received by Customer</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button class="btn btn-primary btn-sm" id="create-so-btn">+ Create Order</button>
        </div>
      </div>
      <div class="table-container glass-card" id="so-table-container"><p class="loading-text">Loading...</p></div>
      <div class="pagination" id="so-pagination"></div>`;
    document.getElementById('so-status-filter').addEventListener('change', () => {
      currentPage = 1;
      fetchData();
    });
    document.getElementById('create-so-btn').addEventListener('click', showCreateForm);
    await fetchData();
  }

  async function fetchData() {
    const status = document.getElementById('so-status-filter')?.value || '';
    try {
      const res = await API.get('/sales-orders', { page: currentPage, limit: 15, ...(status ? { status } : {}) });
      renderTable(res.data, res.pagination);
    } catch (e) {
      document.getElementById('so-table-container').innerHTML = `<p class="error-text">${e.message}</p>`;
    }
  }

  function renderTable(data, pagination) {
    const c = document.getElementById('so-table-container');
    if (!data || !data.length) {
      c.innerHTML = '<p class="empty-text">No sales orders yet. Click "+ Create Order" to add one.</p>';
      return;
    }
    const statusColors = {
      draft: 'badge-default',
      confirmed: 'badge-info',
      processing: 'badge-warning',
      shipped: 'badge-primary',
      delivered: 'badge-success',
      cancelled: 'badge-danger'
    };
    const statusLabels = {
      draft: 'Draft',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Dispatched',
      delivered: 'Received',
      cancelled: 'Cancelled'
    };
    c.innerHTML = `<table class="data-table"><thead><tr><th>SO Number</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead><tbody>${data
      .map(
        (so) => `
      <tr>
        <td><strong>${so.so_number}</strong></td>
        <td>${so.customer_name}</td>
        <td>${new Date(so.order_date).toLocaleDateString('en-IN')}</td>
        <td class="text-right">₹${Number(so.grand_total || 0).toLocaleString('en-IN')}</td>
        <td><span class="badge ${statusColors[so.status] || 'badge-default'}">${(statusLabels[so.status] || so.status).toUpperCase()}</span></td>
        <td class="actions-cell">
          <button class="btn btn-xs btn-outline" onclick="window.SalesOrders.view(${so.so_id})">View</button>
        </td>
      </tr>`
      )
      .join('')}</tbody></table>`;
    renderPagination('so-pagination', pagination, (p) => {
      currentPage = p;
      fetchData();
    });
  }

  async function showCreateForm() {
    let customers = [],
      products = [];
    try {
      const r = await API.get('/customers', { limit: 200 });
      customers = r.data || [];
    } catch (e) {}
    try {
      const r = await API.get('/products', { limit: 200 });
      products = r.data || [];
    } catch (e) {}

    const custOpts =
      customers.map((c) => `<option value="${c.customer_id}">${c.customer_name}</option>`).join('') ||
      '<option value="">No customers yet — add one first</option>';
    const productOpts =
      products
        .map(
          (p) =>
            `<option value="${p.product_id}" data-price="${p.unit_price}">${p.name} (${p.sku}) — ₹${Number(p.unit_price).toFixed(2)}</option>`
        )
        .join('') || '<option value="">No products yet</option>';

    openModal(
      'Create Sales Order',
      `
      <form class="modal-form" id="so-form">
        <div class="form-row">
          <div class="form-group"><label>Customer *</label><select id="so-customer">${custOpts}</select></div>
          <div class="form-group"><label>Order Date</label><input type="date" id="so-date" value="${new Date().toISOString().split('T')[0]}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Discount (₹)</label><input type="number" id="so-discount" value="0" min="0" step="0.01"></div>
          <div class="form-group"><label>Tax Amount (₹)</label><input type="number" id="so-tax" value="0" min="0" step="0.01"></div>
        </div>
        <div class="form-group"><label>Notes</label><textarea id="so-notes" placeholder="Optional notes..."></textarea></div>
        <hr style="border-color:rgba(255,255,255,0.1);margin:12px 0;">
        <h4 style="margin-bottom:10px;">Order Items</h4>
        <div id="so-items"></div>
        <button type="button" class="btn btn-outline btn-sm" id="so-add-item" style="margin-top:8px;">+ Add Item</button>
      </form>
    `,
      `<button class="btn btn-primary" id="so-submit">Create Sales Order</button>`
    );

    addSOItemRow(productOpts);
    document.getElementById('so-add-item').addEventListener('click', () => addSOItemRow(productOpts));

    document.getElementById('so-submit').addEventListener('click', async () => {
      const customer_id = n('so-customer');
      if (!customer_id) {
        showToast('Please select a customer', 'error');
        return;
      }

      const itemRows = document.querySelectorAll('.so-item-row');
      const items = [];
      for (const row of itemRows) {
        const pid = parseInt(row.querySelector('.so-item-product').value);
        const qty = parseInt(row.querySelector('.so-item-qty').value);
        const price = parseFloat(row.querySelector('.so-item-price').value);
        if (pid && qty > 0 && price >= 0) {
          items.push({ product_id: pid, quantity: qty, unit_price: price });
        }
      }
      if (items.length === 0) {
        showToast('Add at least one item', 'error');
        return;
      }

      const data = {
        customer_id,
        order_date: v('so-date') || new Date().toISOString().split('T')[0],
        discount_amount: parseFloat(v('so-discount')) || 0,
        tax_amount: parseFloat(v('so-tax')) || 0,
        notes: v('so-notes') || null,
        items
      };

      try {
        await API.post('/sales-orders', data);
        closeModal();
        showToast('Sales order created!', 'success');
        fetchData();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  function addSOItemRow(productOpts) {
    const container = document.getElementById('so-items');
    const row = document.createElement('div');
    row.className = 'so-item-row';
    row.style.cssText =
      'display:grid;grid-template-columns:1fr 80px 100px 32px;gap:8px;margin-bottom:8px;align-items:center;';
    row.innerHTML = `
      <select class="so-item-product">${productOpts}</select>
      <input type="number" class="so-item-qty" placeholder="Qty" value="1" min="1">
      <input type="number" class="so-item-price" placeholder="Price ₹" step="0.01" min="0">
      <button type="button" style="background:rgba(239,68,68,0.2);border:1px solid #ef4444;color:#ef4444;border-radius:6px;cursor:pointer;padding:4px 8px;" onclick="this.parentElement.remove()">✕</button>`;

    const sel = row.querySelector('.so-item-product');
    const priceInput = row.querySelector('.so-item-price');
    sel.addEventListener('change', () => {
      const opt = sel.options[sel.selectedIndex];
      if (opt?.dataset?.price) priceInput.value = parseFloat(opt.dataset.price).toFixed(2);
    });
    const opt = sel.options[sel.selectedIndex];
    if (opt?.dataset?.price) priceInput.value = parseFloat(opt.dataset.price).toFixed(2);

    container.appendChild(row);
  }

  async function view(id) {
    try {
      const res = await API.get(`/sales-orders/${id}`);
      const so = res.data;
      const transitions = {
        draft: ['confirmed', 'cancelled'],
        confirmed: ['processing', 'cancelled'],
        processing: ['shipped', 'cancelled'],
        shipped: ['delivered']
      };
      const actions = transitions[so.status] || [];
      const statusColors = {
        draft: 'badge-default',
        confirmed: 'badge-info',
        processing: 'badge-warning',
        shipped: 'badge-primary',
        delivered: 'badge-success',
        cancelled: 'badge-danger'
      };
      const statusLabels = {
        draft: 'Draft',
        confirmed: 'Confirmed',
        processing: 'Processing',
        shipped: 'Dispatched',
        delivered: 'Received',
        cancelled: 'Cancelled'
      };
      const actionLabels = {
        confirmed: 'Confirm Order',
        processing: 'Prepare Order',
        shipped: 'Dispatch Order',
        delivered: 'Mark Received by Customer',
        cancelled: 'Cancel Order'
      };

      openModal(
        `SO: ${so.so_number}`,
        `<div class="detail-grid">
          <div><strong>Customer:</strong> ${so.customer_name}</div>
          <div><strong>Date:</strong> ${new Date(so.order_date).toLocaleDateString('en-IN')}</div>
          <div><strong>Status:</strong> <span class="badge ${statusColors[so.status] || ''}">${(statusLabels[so.status] || so.status).toUpperCase()}</span></div>
          <div><strong>Total:</strong> ₹${Number(so.grand_total || 0).toLocaleString('en-IN')}</div>
        </div>
        <h4 style="margin:16px 0 8px;">Line Items</h4>
        <table class="data-table"><thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
        <tbody>${(so.items || []).map((i) => `<tr><td>${i.product_name}</td><td>${i.quantity}</td><td>₹${Number(i.unit_price).toFixed(2)}</td><td>₹${Number(i.line_total).toLocaleString('en-IN')}</td></tr>`).join('')}</tbody></table>`,
        actions
          .map(
            (s) =>
              `<button class="btn btn-sm ${s === 'cancelled' ? 'btn-danger' : 'btn-primary'}" onclick="window.SalesOrders.changeStatus(${so.so_id},'${s}')">${actionLabels[s] || s}</button>`
          )
          .join(' ')
      );
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  async function changeStatus(id, status) {
    try {
      await API.patch(`/sales-orders/${id}/status`, { status });
      closeModal();
      showToast(`Order ${status}`, 'success');
      fetchData();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  return { load, view, changeStatus };
})();
