/**
 * Products Module - Full CRUD with inline category/brand creation
 */
window.Products = (() => {
  let currentPage = 1;

  async function load() {
    const container = document.getElementById('products-content');
    container.innerHTML = `
      <div class="section-header">
        <h3>Products Catalog</h3>
        <div class="section-actions">
          <input type="text" class="search-input" id="product-search" placeholder="Search products...">
          <button class="btn btn-primary btn-sm" id="add-product-btn">+ Add Product</button>
        </div>
      </div>
      <div class="table-container glass-card" id="products-table-container"><p class="loading-text">Loading products...</p></div>
      <div class="pagination" id="products-pagination"></div>
    `;
    document.getElementById('add-product-btn').addEventListener('click', () => showProductForm());
    document.getElementById('product-search').addEventListener(
      'input',
      debounce(() => {
        currentPage = 1;
        fetchProducts();
      }, 400)
    );
    await fetchProducts();
  }

  async function fetchProducts() {
    const search = document.getElementById('product-search')?.value || '';
    try {
      const res = await API.get('/products', { page: currentPage, limit: 15, search });
      renderTable(res.data, res.pagination);
    } catch (err) {
      document.getElementById('products-table-container').innerHTML = `<p class="error-text">${err.message}</p>`;
    }
  }

  function renderTable(products, pagination) {
    const container = document.getElementById('products-table-container');
    if (!products || products.length === 0) {
      container.innerHTML = '<p class="empty-text">No products yet. Click "+ Add Product" to get started.</p>';
      return;
    }
    container.innerHTML = `
      <table class="data-table">
        <thead><tr><th>SKU</th><th>Product Name</th><th>Category</th><th>Brand</th><th>Price</th><th>Cost</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${products
          .map(
            (p) => `
          <tr>
            <td><code>${p.sku}</code></td>
            <td>${p.name}</td>
            <td>${p.category_name || '<span style="opacity:0.4">—</span>'}</td>
            <td>${p.brand_name || '<span style="opacity:0.4">—</span>'}</td>
            <td class="text-right">₹${Number(p.unit_price).toFixed(2)}</td>
            <td class="text-right">₹${Number(p.cost_price).toFixed(2)}</td>
            <td><span class="badge ${p.is_active ? 'badge-success' : 'badge-danger'}">${p.is_active ? 'ACTIVE' : 'INACTIVE'}</span></td>
            <td class="actions-cell">
              <button class="btn btn-xs btn-outline" onclick="window.Products.edit(${p.product_id})">Edit</button>
              <button class="btn btn-xs btn-danger" onclick="window.Products.remove(${p.product_id}, '${p.name.replace(/'/g, "\\'")}')">Delete</button>
            </td>
          </tr>`
          )
          .join('')}
        </tbody>
      </table>`;
    renderPagination('products-pagination', pagination, (page) => {
      currentPage = page;
      fetchProducts();
    });
  }

  async function showProductForm(product = null) {
    const isEdit = product && product.product_id;

    // Load categories and brands for dropdowns
    let cats = [],
      brands = [];
    try {
      const r = await API.get('/categories');
      cats = r.data || [];
    } catch (e) {}
    try {
      const r = await API.get('/brands');
      brands = r.data || [];
    } catch (e) {}

    const catOptions = [
      '<option value="">— None / Create Below —</option>',
      ...cats.map(
        (c) =>
          `<option value="${c.category_id}" ${isEdit && product.category_id == c.category_id ? 'selected' : ''}>${c.category_name}</option>`
      )
    ].join('');
    const brandOptions = [
      '<option value="">— None / Create Below —</option>',
      ...brands.map(
        (b) =>
          `<option value="${b.brand_id}" ${isEdit && product.brand_id == b.brand_id ? 'selected' : ''}>${b.brand_name}</option>`
      )
    ].join('');

    openModal(
      isEdit ? 'Edit Product' : 'Add Product',
      `
      <form class="modal-form">
        <div class="form-row">
          <div class="form-group"><label>SKU *</label><input type="text" id="pf-sku" value="${isEdit ? product.sku : ''}" placeholder="e.g. MILK-001" required></div>
          <div class="form-group"><label>Product Name *</label><input type="text" id="pf-name" value="${isEdit ? product.name : ''}" placeholder="e.g. Full Cream Milk" required></div>
        </div>
        <div class="form-group"><label>Description</label><textarea id="pf-description" placeholder="Optional description...">${isEdit ? product.description || '' : ''}</textarea></div>
        <div class="form-row">
          <div class="form-group">
            <label>Category</label>
            <select id="pf-category">${catOptions}</select>
            <input type="text" id="pf-new-category" placeholder="Or type new category name..." style="margin-top:6px;">
          </div>
          <div class="form-group">
            <label>Brand</label>
            <select id="pf-brand">${brandOptions}</select>
            <input type="text" id="pf-new-brand" placeholder="Or type new brand name..." style="margin-top:6px;">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Selling Price (₹) *</label><input type="number" step="0.01" id="pf-price" value="${isEdit ? product.unit_price : ''}" placeholder="0.00" required></div>
          <div class="form-group"><label>Cost Price (₹) *</label><input type="number" step="0.01" id="pf-cost" value="${isEdit ? product.cost_price : ''}" placeholder="0.00" required></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Reorder Level</label><input type="number" id="pf-reorder-level" value="${isEdit ? product.reorder_level : '10'}" placeholder="10"></div>
          <div class="form-group"><label>Reorder Qty</label><input type="number" id="pf-reorder-qty" value="${isEdit ? product.reorder_qty : '25'}" placeholder="25"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Unit of Measure</label><input type="text" id="pf-uom" value="${isEdit ? product.unit_of_measure || 'EACH' : 'EACH'}" placeholder="EACH / KG / L / PCS"></div>
          ${isEdit ? '<div class="form-group"><label>Status</label><select id="pf-active"><option value="1" ' + (product.is_active ? 'selected' : '') + '>Active</option><option value="0" ' + (!product.is_active ? 'selected' : '') + '>Inactive</option></select></div>' : ''}
        </div>
      </form>
    `,
      `<button class="btn btn-primary" id="pf-submit">${isEdit ? 'Update Product' : 'Create Product'}</button>`
    );

    document.getElementById('pf-submit').addEventListener('click', async () => {
      const sku = v('pf-sku');
      const name = v('pf-name');
      if (!sku || !name) {
        showToast('SKU and Name are required', 'error');
        return;
      }
      const price = parseFloat(v('pf-price'));
      const cost = parseFloat(v('pf-cost'));
      if (isNaN(price) || isNaN(cost)) {
        showToast('Selling price and cost price are required', 'error');
        return;
      }

      // Handle new category creation
      let category_id = n('pf-category') || null;
      const newCatName = v('pf-new-category');
      if (!category_id && newCatName) {
        const existing = cats.find((c) => c.category_name.toLowerCase() === newCatName.toLowerCase());
        if (existing) {
          category_id = existing.category_id;
        } else {
          try {
            const cr = await API.post('/categories', { category_name: newCatName });
            category_id = cr.data?.category_id || null;
          } catch (e) {
            showToast('Could not create category: ' + e.message, 'error');
            return;
          }
        }
      }

      // Handle new brand creation
      let brand_id = n('pf-brand') || null;
      const newBrandName = v('pf-new-brand');
      if (!brand_id && newBrandName) {
        const existing = brands.find((b) => b.brand_name.toLowerCase() === newBrandName.toLowerCase());
        if (existing) {
          brand_id = existing.brand_id;
        } else {
          try {
            const br = await API.post('/brands', { brand_name: newBrandName });
            brand_id = br.data?.brand_id || null;
          } catch (e) {
            showToast('Could not create brand: ' + e.message, 'error');
            return;
          }
        }
      }

      const data = {
        sku,
        name,
        description: v('pf-description') || null,
        category_id,
        brand_id,
        unit_price: price,
        cost_price: cost,
        reorder_level: n('pf-reorder-level') || 10,
        reorder_qty: n('pf-reorder-qty') || 25,
        unit_of_measure: v('pf-uom') || 'EACH'
      };
      if (isEdit) {
        const activeVal = document.getElementById('pf-active')?.value;
        if (activeVal !== undefined) data.is_active = activeVal === '1';
      }

      try {
        if (isEdit) await API.put(`/products/${product.product_id}`, data);
        else await API.post('/products', data);
        closeModal();
        showToast(isEdit ? 'Product updated!' : 'Product created!', 'success');
        fetchProducts();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  async function edit(id) {
    try {
      const res = await API.get(`/products/${id}`);
      showProductForm(res.data);
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  async function remove(id, name) {
    if (!confirm(`Delete product "${name}"?\n\nThis will mark it as inactive.`)) return;
    try {
      await API.delete(`/products/${id}`);
      showToast('Product deleted', 'success');
      fetchProducts();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  return { load, edit, remove };
})();
