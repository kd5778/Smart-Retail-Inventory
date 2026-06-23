// Auth — login, register, logout
const Auth = (() => {
  function init() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const togglePasswordBtn = document.getElementById('toggle-password-btn');
    if (loginForm) {
      // Redirect if already logged in
      if (API.getToken()) {
        window.location.href = '/';
        return;
      }
      loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm) {
      if (API.getToken()) {
        window.location.href = '/';
        return;
      }
      registerForm.addEventListener('submit', handleRegister);
    }
    if (togglePasswordBtn) {
      togglePasswordBtn.addEventListener('click', () => {
        const pw = document.getElementById('login-password');
        pw.type = pw.type === 'password' ? 'text' : 'password';
      });
    }
  }
  async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');
    const alert = document.getElementById('login-alert');
    if (!email || !password) {
      showAlert(alert, 'Please fill in all fields', 'error');
      return;
    }
    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = 'Signing in...';
    try {
      const res = await API.post('/auth/login', { email, password });
      API.setToken(res.data.token);
      API.setUser(res.data.user);
      window.location.href = '/';
    } catch (err) {
      showAlert(alert, err.message || 'Login failed', 'error');
    } finally {
      btn.disabled = false;
      btn.querySelector('.btn-text').textContent = 'Sign In';
    }
  }
  async function handleRegister(e) {
    e.preventDefault();
    const first_name = document.getElementById('register-first-name').value.trim();
    const last_name = document.getElementById('register-last-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const phone = document.getElementById('register-phone').value.trim();
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm-password').value;
    const btn = document.getElementById('register-btn');
    const alert = document.getElementById('register-alert');
    if (!first_name || !last_name || !email || !password) {
      showAlert(alert, 'Please fill in all required fields', 'error');
      return;
    }
    if (password !== confirm) {
      showAlert(alert, 'Passwords do not match', 'error');
      return;
    }
    if (password.length < 8) {
      showAlert(alert, 'Password must be at least 8 characters', 'error');
      return;
    }
    btn.disabled = true;
    try {
      await API.post('/auth/register', { first_name, last_name, email, phone, password });
      showAlert(alert, 'Account created! Flipping to sign in...', 'success');
      setTimeout(function() {
        var fc = document.getElementById('flip-container');
        if (!fc) return;
        fc.classList.remove('flipped');
        // Re-sync height to the front (login) face
        var front = fc.querySelector('.flip-front');
        var flipCard = fc.querySelector('.flip-card');
        if (front) {
          var h = front.scrollHeight;
          fc.style.height = h + 'px';
          if (flipCard) flipCard.style.height = h + 'px';
        }
      }, 1500);
    } catch (err) {
      showAlert(alert, err.message || 'Registration failed', 'error');
    } finally {
      btn.disabled = false;
    }
  }
  function showAlert(el, message, type) {
    if (!el) return;
    el.textContent = message;
    el.className = `auth-alert ${type}`;
    el.style.display = 'block';
  }
  function logout() {
    API.removeToken();
    window.location.href = '/';
  }
  document.addEventListener('DOMContentLoaded', init);
  return { logout };
})();