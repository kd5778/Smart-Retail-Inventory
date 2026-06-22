// Main app — nav, modals, toasts
document.addEventListener('DOMContentLoaded', () => {
  // Auth guard - redirect if no token
  if (!API.getToken()) {
    window.location.href = '/login.html';
    return;
  }

  // Load user info from stored token
  const user = API.getUser();
  if (user) {
    const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || 'User';
    document.getElementById('user-name').textContent = name;
    document.getElementById('user-role').textContent = (user.roles || []).join(', ') || 'Admin';
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    document.getElementById('user-avatar').textContent = initials || 'AD';

    // Show User Management nav item for admins
    const rolesArr = user.roles || [];
    const isAdmin = rolesArr.some((r) => r.toLowerCase().includes('admin')) || true; // show for all for now
    if (isAdmin) {
      const navUsersLi = document.getElementById('nav-users-li');
      if (navUsersLi) navUsersLi.style.display = '';
    }
  }

  // Sidebar navigation
  document.querySelectorAll('.menu-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(item.dataset.section);
    });
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', Auth.logout);

  // Sidebar toggle
  const sidebar = document.getElementById('sidebar');
  document.getElementById('sidebar-toggle-btn')?.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => sidebar.classList.toggle('open'));

  // Modal close
  document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  });

  // Load dashboard by default
  Dashboard.load();
});

function navigateTo(section) {
  // Update active menu
  document.querySelectorAll('.menu-item').forEach((m) => m.classList.remove('active'));
  document.querySelector(`[data-section="${section}"]`)?.classList.add('active');

  // Hide all sections, show target
  document.querySelectorAll('.section').forEach((s) => s.classList.add('hidden'));
  const target = document.getElementById(`section-${section}`);
  if (target) target.classList.remove('hidden');

  // Update page title
  const titles = {
    dashboard: 'Dashboard',
    products: 'Products',
    suppliers: 'Suppliers',
    customers: 'Customers',
    inventory: 'Inventory',
    'purchase-orders': 'Purchase Orders',
    'sales-orders': 'Sales Orders',
    reports: 'Reports',
    users: 'User Management'
  };
  document.getElementById('page-title').textContent = titles[section] || section;

  // Load section data
  const loaders = {
    dashboard: Dashboard.load,
    products: Products.load,
    suppliers: Suppliers.load,
    customers: Customers.load,
    inventory: Inventory.load,
    'purchase-orders': PurchaseOrders.load,
    'sales-orders': SalesOrders.load,
    reports: Reports.load,
    users: Users.load
  };
  if (loaders[section]) loaders[section]();

  // Close mobile sidebar
  document.getElementById('sidebar')?.classList.remove('open');
}

// ====== Utility Functions (global) ======

function openModal(title, body, footer) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = body;
  document.getElementById('modal-footer').innerHTML = footer || '';
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span><button class="toast-close" onclick="this.parentElement.remove()">&times;</button>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, 8000);
}

function renderPagination(containerId, pagination, callback) {
  const container = document.getElementById(containerId);
  if (!container || !pagination) return;
  const { page, totalPages } = pagination;
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }
  let html = '';
  if (page > 1) html += `<button class="btn btn-xs btn-outline" data-page="${page - 1}">‹ Prev</button>`;
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
    html += `<button class="btn btn-xs ${i === page ? 'btn-primary' : 'btn-outline'}" data-page="${i}">${i}</button>`;
  }
  if (page < totalPages) html += `<button class="btn btn-xs btn-outline" data-page="${page + 1}">Next ›</button>`;
  container.innerHTML = html;
  container.querySelectorAll('button[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => callback(parseInt(btn.dataset.page)));
  });
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
function v(id) {
  return document.getElementById(id)?.value?.trim() || '';
}
function n(id) {
  const val = parseInt(v(id));
  return isNaN(val) ? null : val;
}
