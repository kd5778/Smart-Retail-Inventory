/**
 * User Management Module — Admin Only
 */
window.Users = (() => {
  let roles = [];

  async function load() {
    const container = document.getElementById('users-content');
    container.innerHTML = `
      <div class="section-header">
        <h3>User Management</h3>
        <div class="section-actions">
          <button class="btn btn-primary btn-sm" id="add-user-btn">+ Add User</button>
        </div>
      </div>
      <div class="table-container glass-card" id="users-table-container"><p class="loading-text">Loading users...</p></div>`;
    document.getElementById('add-user-btn').addEventListener('click', () => showForm());
    // Load roles for the dropdown
    try {
      const rRes = await API.get('/users/roles');
      roles = rRes.data || [];
    } catch (e) {
      roles = [];
    }
    await fetchData();
  }

  async function fetchData() {
    try {
      const res = await API.get('/users');
      renderTable(res.data);
    } catch (e) {
      document.getElementById('users-table-container').innerHTML = `<p class="error-text">${e.message}</p>`;
    }
  }

  function renderTable(data) {
    const c = document.getElementById('users-table-container');
    if (!data || !data.length) {
      c.innerHTML = '<p class="empty-text">No users found</p>';
      return;
    }
    const currentUser = API.getUser();
    c.innerHTML = `
      <table class="data-table">
        <thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${data
          .map(
            (u) => `
          <tr>
            <td>${u.first_name || ''} ${u.last_name || ''}</td>
            <td><code>${u.username}</code></td>
            <td>${u.email}</td>
            <td><span class="badge badge-info">${u.roles || 'No Role'}</span></td>
            <td><span class="badge ${u.is_active ? 'badge-success' : 'badge-danger'}">${u.is_active ? 'Active' : 'Inactive'}</span></td>
            <td class="actions-cell">
              <button class="btn btn-xs btn-outline" onclick="Users.edit(${u.user_id})">Edit</button>
              ${u.user_id !== currentUser?.user_id ? `<button class="btn btn-xs btn-danger" onclick="Users.remove(${u.user_id}, '${u.username}')">Deactivate</button>` : '<span class="badge badge-default">You</span>'}
            </td>
          </tr>`
          )
          .join('')}
        </tbody>
      </table>`;
  }

  function showForm(u = null) {
    const isEdit = u && u.user_id;
    const roleOptions = roles
      .map(
        (r) =>
          `<option value="${r.role_id}" ${isEdit && u.role_id == r.role_id ? 'selected' : !isEdit && r.role_id == 3 ? 'selected' : ''}>${r.role_name}</option>`
      )
      .join('');

    openModal(
      isEdit ? 'Edit User' : 'Add New User',
      `
      <form class="modal-form" id="uf">
        <div class="form-row">
          <div class="form-group"><label>First Name</label><input type="text" id="uf-fn" value="${isEdit ? u.first_name || '' : ''}"></div>
          <div class="form-group"><label>Last Name</label><input type="text" id="uf-ln" value="${isEdit ? u.last_name || '' : ''}"></div>
        </div>
        ${!isEdit ? `<div class="form-group"><label>Username *</label><input type="text" id="uf-username" required></div>` : ''}
        <div class="form-group"><label>Email *</label><input type="email" id="uf-email" value="${isEdit ? u.email : ''}" required></div>
        <div class="form-group"><label>${isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</label><input type="password" id="uf-password" placeholder="${isEdit ? 'Leave blank to keep current' : 'Min 6 characters'}" ${isEdit ? '' : 'required'}></div>
        <div class="form-group"><label>Phone</label><input type="text" id="uf-phone" value="${isEdit ? u.phone || '' : ''}"></div>
        <div class="form-group"><label>Role *</label><select id="uf-role">${roleOptions}</select></div>
      </form>`,
      `<button class="btn btn-primary" id="uf-submit">${isEdit ? 'Update User' : 'Create User'}</button>`
    );

    document.getElementById('uf-submit').addEventListener('click', async () => {
      const data = {
        first_name: v('uf-fn'),
        last_name: v('uf-ln'),
        email: v('uf-email'),
        phone: v('uf-phone'),
        role_id: parseInt(v('uf-role'))
      };
      const pw = v('uf-password');
      if (pw) data.password = pw;

      if (!isEdit) {
        data.username = v('uf-username');
        if (!data.username) {
          showToast('Username is required', 'error');
          return;
        }
        if (!pw || pw.length < 6) {
          showToast('Password must be at least 6 characters', 'error');
          return;
        }
      }

      try {
        if (isEdit) await API.put(`/users/${u.user_id}`, data);
        else await API.post('/users', data);
        closeModal();
        showToast(isEdit ? 'User updated successfully!' : 'User created successfully!', 'success');
        fetchData();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  async function edit(id) {
    try {
      const res = await API.get('/users');
      const user = res.data.find((u) => u.user_id === id);
      if (!user) {
        showToast('User not found', 'error');
        return;
      }
      showForm(user);
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  async function remove(id, username) {
    if (!confirm(`Deactivate user "${username}"? They will no longer be able to log in.`)) return;
    try {
      await API.delete(`/users/${id}`);
      showToast('User deactivated', 'success');
      fetchData();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  return { load, edit, remove };
})();
