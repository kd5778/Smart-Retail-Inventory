// API client — wraps fetch with auth headers
const API = (() => {
  const BASE_URL = '/api/v1';

  function getToken() { return localStorage.getItem('auth_token'); }
  function setToken(token) { localStorage.setItem('auth_token', token); }
  function removeToken() { localStorage.removeItem('auth_token'); localStorage.removeItem('user_data'); }
  function getUser() { try { return JSON.parse(localStorage.getItem('user_data')); } catch { return null; } }
  function setUser(user) { localStorage.setItem('user_data', JSON.stringify(user)); }

  async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { method: options.method || 'GET', headers, ...options };
    if (options.body) config.body = JSON.stringify(options.body);

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const error = new Error(data?.message || `HTTP ${response.status}`);
        error.status = response.status;
        error.data = data;
        if (response.status === 401) { removeToken(); window.location.href = '/login.html'; }
        throw error;
      }
      return data;
    } catch (err) {
      if (!err.status) { err.message = 'Network error. Please check your connection.'; }
      throw err;
    }
  }

  return {
    get: (url, params) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(url + qs);
    },
    post: (url, body) => request(url, { method: 'POST', body }),
    put: (url, body) => request(url, { method: 'PUT', body }),
    patch: (url, body) => request(url, { method: 'PATCH', body }),
    delete: (url) => request(url, { method: 'DELETE' }),
    getToken, setToken, removeToken, getUser, setUser
  };
})();
