/**
 * Customers Module
 */
window.Customers = (() => {
  let currentPage = 1;

  async function load() {
    const container = document.getElementById('customers-content');
    container.innerHTML = `
      <div class="section-header">
        <h3>Customers</h3>
        <div class="section-actions">
          <input type="text" class="search-input" id="customer-search" placeholder="Search customers...">
          <button class="btn btn-primary btn-sm" id="add-customer-btn">+ Add Customer</button>
        </div>
      </div>
      <div class="table-container glass-card" id="customers-table-container"><p class="loading-text">Loading...</p></div>
      <div class="pagination" id="customers-pagination"></div>`;
    document.getElementById('add-customer-btn').addEventListener('click', () => showForm());
    document.getElementById('customer-search').addEventListener(
      'input',
      debounce(() => {
        currentPage = 1;
        fetchData();
      }, 400)
    );
    await fetchData();
  }

  async function fetchData() {
    const search = document.getElementById('customer-search')?.value || '';
    try {
      const res = await API.get('/customers', { page: currentPage, limit: 15, ...(search ? { search } : {}) });
      renderTable(res.data, res.pagination);
    } catch (e) {
      document.getElementById('customers-table-container').innerHTML = `<p class="error-text">${e.message}</p>`;
    }
  }

  function renderTable(data, pagination) {
    const c = document.getElementById('customers-table-container');
    if (!data || !data.length) {
      c.innerHTML = '<p class="empty-text">No customers yet. Click "+ Add Customer" to get started.</p>';
      return;
    }
    c.innerHTML = `<table class="data-table">
      <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Type</th><th>Credit Limit</th><th>Actions</th></tr></thead>
      <tbody>${data
        .map(
          (cu) => `
        <tr>
          <td><strong>${cu.customer_name || ''}</strong></td>
          <td>${cu.email || ''}</td>
          <td>${cu.phone || '—'}</td>
          <td><span class="badge ${cu.customer_type === 'wholesale' ? 'badge-info' : 'badge-success'}">${cu.customer_type || 'retail'}</span></td>
          <td class="text-right">₹${Number(cu.credit_limit || 0).toLocaleString('en-IN')}</td>
          <td class="actions-cell">
            <button class="btn btn-xs btn-outline" onclick="window.Customers.edit(${cu.customer_id})">Edit</button>
            <button class="btn btn-xs btn-danger" onclick="window.Customers.remove(${cu.customer_id}, '${(cu.customer_name || '').replace(/'/g, "\\'")}')">Delete</button>
          </td>
        </tr>`
        )
        .join('')}
      </tbody></table>`;
    renderPagination('customers-pagination', pagination, (p) => {
      currentPage = p;
      fetchData();
    });
  }

  function showForm(cu = null) {
    const isEdit = !!(cu && cu.customer_id);
    openModal(
      isEdit ? 'Edit Customer' : 'Add Customer',
      `
      <form class="modal-form">
        <div class="form-group"><label>Full Name *</label><input type="text" id="cf-name" value="${isEdit ? cu.customer_name || '' : ''}" placeholder="e.g. Rajesh Kumar" required></div>
        <div class="form-row">
          <div class="form-group"><label>Email *</label><input type="email" id="cf-email" value="${isEdit ? cu.email || '' : ''}" placeholder="customer@email.com" required></div>
          <div class="form-group"><label>Phone</label><input type="text" id="cf-phone" value="${isEdit ? cu.phone || '' : ''}" placeholder="+91-XXXXXXXXXX"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Customer Type</label>
            <select id="cf-type">
              <option value="retail" ${!isEdit || cu.customer_type === 'retail' ? 'selected' : ''}>Retail</option>
              <option value="wholesale" ${isEdit && cu.customer_type === 'wholesale' ? 'selected' : ''}>Wholesale</option>
            </select>
          </div>
          <div class="form-group"><label>Credit Limit (₹)</label><input type="number" id="cf-limit" value="${isEdit ? cu.credit_limit || 0 : 5000}" min="0"></div>
        </div>
        <div class="form-group"><label>City</label><input type="text" id="cf-city" value="${isEdit ? cu.city || '' : ''}" placeholder="Mumbai"></div>
      </form>
    `,
      `<button class="btn btn-primary" id="cf-submit">${isEdit ? 'Update Customer' : 'Create Customer'}</button>`
    );

    document.getElementById('cf-submit').addEventListener('click', async () => {
      const customerName = v('cf-name');
      const email = v('cf-email');
      if (!customerName) {
        showToast('Customer name is required', 'error');
        return;
      }
      if (!email) {
        showToast('Email is required', 'error');
        return;
      }

      // Only send non-empty values
      const data = {
        customer_name: customerName,
        email,
        customer_type: v('cf-type') || 'retail',
        credit_limit: parseFloat(v('cf-limit')) || 0
      };
      const phone = v('cf-phone');
      if (phone) data.phone = phone;
      const city = v('cf-city');
      if (city) data.city = city;

      try {
        if (isEdit) {
          await API.put(`/customers/${cu.customer_id}`, data);
          showToast('Customer updated successfully!', 'success');
        } else {
          await API.post('/customers', data);
          showToast('Customer created successfully!', 'success');
        }
        closeModal();
        fetchData();
      } catch (e) {
        showToast('Error: ' + e.message, 'error');
      }
    });
  }

  async function edit(id) {
    try {
      const res = await API.get(`/customers/${id}`);
      if (!res || !res.data) {
        showToast('Could not load customer data', 'error');
        return;
      }
      showForm(res.data);
    } catch (e) {
      showToast('Error loading customer: ' + e.message, 'error');
    }
  }

  async function remove(id, name) {
    if (!confirm(`Delete customer "${name}"?\n\nThis action cannot be undone.`)) return;
    try {
      await API.delete(`/customers/${id}`);
      showToast('Customer deleted successfully', 'success');
      fetchData();
    } catch (e) {
      showToast('Error deleting: ' + e.message, 'error');
    }
  }

  return { load, edit, remove };
})();
