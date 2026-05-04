import { authAPI, getToken, setToken } from './api.js';

// Check if user is logged in
export function isLoggedIn() {
  return !!getToken();
}

// Get current user
export async function getCurrentUser() {
  try {
    if (!isLoggedIn()) return null;
    return await authAPI.getCurrentUser();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Register new user
export async function register(email, password, firstName, lastName) {
  try {
    const data = await authAPI.register(email, password, firstName, lastName);
    setToken(data.token);
    showNotification('✓ Compte créé avec succès!', 'success');
    return data;
  } catch (error) {
    showNotification('Erreur: ' + error.message, 'error');
    throw error;
  }
}

// Login user
export async function login(email, password) {
  try {
    const data = await authAPI.login(email, password);
    showNotification('✓ Connecté avec succès!', 'success');
    return data;
  } catch (error) {
    showNotification('Erreur: ' + error.message, 'error');
    throw error;
  }
}

// Logout user
export function logout() {
  authAPI.logout();
  setToken(null);
  showNotification('✓ Déconnecté', 'info');
  window.location.href = '/';
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Handle login form
export function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;

    try {
      await login(email, password);
      window.location.href = '/checkout.html';
    } catch (error) {
      console.error('Login failed:', error);
    }
  });
}

// Handle register form
export function initRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;
    const firstName = form.querySelector('[name="firstName"]').value;
    const lastName = form.querySelector('[name="lastName"]').value;

    try {
      await register(email, password, firstName, lastName);
      window.location.href = '/';
    } catch (error) {
      console.error('Registration failed:', error);
    }
  });
}

// Update UI based on auth state
export async function updateAuthUI() {
  const user = await getCurrentUser();
  const authButtons = document.getElementById('auth-buttons');
  const userMenu = document.getElementById('user-menu');

  if (user && authButtons && userMenu) {
    authButtons.innerHTML = `
      <div class="user-menu-button" onclick="toggleUserMenu()">
        <span>${user.firstName}</span>
        <div id="user-dropdown" class="user-dropdown">
          <a href="/my-orders.html">Mes Commandes</a>
          <a href="#" onclick="window.authModule.logout()">Déconnexion</a>
        </div>
      </div>
    `;
  } else if (authButtons) {
    authButtons.innerHTML = `
      <a href="/login.html" class="btn-secondary">Connexion</a>
      <a href="/register.html" class="btn-primary">Créer un compte</a>
    `;
  }
}

function toggleUserMenu() {
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) {
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  }
}

// Export for global access
window.authModule = {
  register,
  login,
  logout,
  isLoggedIn,
  getCurrentUser,
  updateAuthUI,
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', updateAuthUI);