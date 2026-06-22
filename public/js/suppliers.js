/**
 * Suppliers Module
 */
window.Suppliers = (() => {
  let currentPage = 1;

  async function load() {
    const container = document.getElementById('suppliers-content');
    container.innerHTML = `
      <div class="section-header">
        <h3>Suppliers</h3>
        <div class="section-actions">
          <input type="text" class="search-input" id="supplier-search" placeholder="Search suppliers...">
          <button class="btn btn-primary btn-sm" id="add-supplier-btn">+ Add Supplier</button>
        </div>
      </div>
      <div class="table-container glass-card" id="suppliers-table-container"><p class="loading-text">Loading...</p></div>
      <div class="pagination" id="suppliers-pagination"></div>`;
    document.getElementById('add-supplier-btn').addEventListener('click', () => showForm());
    document.getElementById('supplier-search').addEventListener(
      'input',
      debounce(() => {
        currentPage = 1;
        fetchData();
      }, 400)
    );
    await fetchData();
  }

  async function fetchData() {
    const search = document.getElementById('supplier-search')?.value || '';
    try {
      const res = await API.get('/suppliers', { page: currentPage, limit: 15, ...(search ? { search } : {}) });
      renderTable(res.data, res.pagination);
    } catch (e) {
      document.getElementById('suppliers-table-container').innerHTML = `<p class="error-text">${e.message}</p>`;
    }
  }

  function renderTable(data, pagination) {
    const c = document.getElementById('suppliers-table-container');
    if (!data || !data.length) {
      c.innerHTML = '<p class="empty-text">No suppliers yet. Click "+ Add Supplier" to get started.</p>';
      return;
    }
    c.innerHTML = `<table class="data-table">
      <thead><tr><th>Company</th><th>Contact</th><th>Email</th><th>City</th><th>Terms</th><th>Actions</th></tr></thead>
      <tbody>${data
        .map(
          (s) => `
        <tr>
          <td><strong>${s.supplier_name || ''}</strong></td>
          <td>${s.contact_person || '—'}</td>
          <td>${s.email || ''}</td>
          <td>${s.city || '—'}</td>
          <td><span class="badge badge-info">${s.payment_terms || 'Net 30'}</span></td>
          <td class="actions-cell">
            <button class="btn btn-xs btn-outline" onclick="window.Suppliers.edit(${s.supplier_id})">Edit</button>
            <button class="btn btn-xs btn-danger" onclick="window.Suppliers.remove(${s.supplier_id}, '${(s.supplier_name || '').replace(/'/g, "\\'")}')">Delete</button>
          </td>
        </tr>`
        )
        .join('')}
      </tbody></table>`;
    renderPagination('suppliers-pagination', pagination, (p) => {
      currentPage = p;
      fetchData();
    });
  }

  function showForm(s = null) {
    const isEdit = !!(s && s.supplier_id);
    openModal(
      isEdit ? 'Edit Supplier' : 'Add Supplier',
      `
      <form class="modal-form">
        <div class="form-row">
          <div class="form-group"><label>Company Name *</label><input type="text" id="sf-name" value="${isEdit ? s.supplier_name || '' : ''}" placeholder="e.g. Amul Dairy" required></div>
          <div class="form-group"><label>Contact Person *</label><input type="text" id="sf-contact" value="${isEdit ? s.contact_person || '' : ''}" placeholder="e.g. Rahul Sharma" required></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Email *</label><input type="email" id="sf-email" value="${isEdit ? s.email || '' : ''}" placeholder="supplier@email.com" required></div>
          <div class="form-group"><label>Phone</label><input type="text" id="sf-phone" value="${isEdit ? s.phone || '' : ''}" placeholder="+91-XXXXXXXXXX"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>City</label><input type="text" id="sf-city" value="${isEdit ? s.city || '' : ''}" placeholder="Mumbai"></div>
          <div class="form-group"><label>Country</label><input type="text" id="sf-country" value="${isEdit ? s.country || 'India' : 'India'}" placeholder="India"></div>
        </div>
        <div class="form-group"><label>Payment Terms</label>
          <select id="sf-terms">
            <option value="Net 30" ${!isEdit || s.payment_terms === 'Net 30' ? 'selected' : ''}>Net 30</option>
            <option value="Net 60" ${isEdit && s.payment_terms === 'Net 60' ? 'selected' : ''}>Net 60</option>
            <option value="Net 15" ${isEdit && s.payment_terms === 'Net 15' ? 'selected' : ''}>Net 15</option>
            <option value="Net 45" ${isEdit && s.payment_terms === 'Net 45' ? 'selected' : ''}>Net 45</option>
            <option value="COD" ${isEdit && s.payment_terms === 'COD' ? 'selected' : ''}>COD</option>
          </select>
        </div>
      </form>
    `,
      `<button class="btn btn-primary" id="sf-submit">${isEdit ? 'Update Supplier' : 'Create Supplier'}</button>`
    );

    document.getElementById('sf-submit').addEventListener('click', async () => {
      const supplierName = v('sf-name');
      const contactPerson = v('sf-contact');
      const email = v('sf-email');
      if (!supplierName) {
        showToast('Company name is required', 'error');
        return;
      }
      if (!contactPerson) {
        showToast('Contact person is required', 'error');
        return;
      }
      if (!email) {
        showToast('Email is required', 'error');
        return;
      }

      // Build data — only include non-empty values
      const data = { supplier_name: supplierName, contact_person: contactPerson, email };
      const phone = v('sf-phone');
      if (phone) data.phone = phone;
      const city = v('sf-city');
      if (city) data.city = city;
      const country = v('sf-country');
      if (country) data.country = country;
      const terms = v('sf-terms');
      if (terms) data.payment_terms = terms;

      try {
        if (isEdit) {
          await API.put(`/suppliers/${s.supplier_id}`, data);
          showToast('Supplier updated successfully!', 'success');
        } else {
          await API.post('/suppliers', data);
          showToast('Supplier created successfully!', 'success');
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
      const res = await API.get(`/suppliers/${id}`);
      if (!res || !res.data) {
        showToast('Could not load supplier data', 'error');
        return;
      }
      showForm(res.data);
    } catch (e) {
      showToast('Error loading supplier: ' + e.message, 'error');
    }
  }

  async function remove(id, name) {
    if (!confirm(`Delete supplier "${name}"?\n\nThis action cannot be undone.`)) return;
    try {
      await API.delete(`/suppliers/${id}`);
      showToast('Supplier deleted successfully', 'success');
      fetchData();
    } catch (e) {
      showToast('Error deleting: ' + e.message, 'error');
    }
  }

  return { load, edit, remove };
})();
