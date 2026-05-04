import { API_BASE_URL } from './config.js';

// Storage keys
const TOKEN_KEY = 'authToken';
const CART_KEY = 'cart';
const SESSION_ID_KEY = 'sessionId';

// Generate or get session ID for guest users
function getSessionId() {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

// Get authorization token
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Set authorization token
function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// Generic fetch wrapper
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API Error');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// AUTH ENDPOINTS
export const authAPI = {
  register: (email, password, firstName, lastName) =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    }),

  login: (email, password) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }).then(data => {
      setToken(data.token);
      return data;
    }),

  getCurrentUser: () => fetchAPI('/auth/me'),

  logout: () => {
    setToken(null);
  },
};

// PRODUCTS ENDPOINTS
export const productsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return fetchAPI(`/products?${params.toString()}`);
  },

  getById: (id) => fetchAPI(`/products/${id}`),

  create: (productData) =>
    fetchAPI('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),

  update: (id, productData) =>
    fetchAPI(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),

  delete: (id) =>
    fetchAPI(`/products/${id}`, {
      method: 'DELETE',
    }),
};

// CART ENDPOINTS
export const cartAPI = {
  getCart: () => {
    const sessionId = getSessionId();
    const params = new URLSearchParams();
    if (sessionId) params.append('sessionId', sessionId);
    return fetchAPI(`/cart?${params.toString()}`);
  },

  addToCart: (productId, quantity, size) => {
    const sessionId = getSessionId();
    return fetchAPI('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, size, sessionId }),
    });
  },

  updateItem: (itemId, quantity) => {
    const sessionId = getSessionId();
    return fetchAPI(`/cart/update/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity, sessionId }),
    });
  },

  removeItem: (itemId) => {
    const sessionId = getSessionId();
    return fetchAPI(`/cart/remove/${itemId}`, {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  },

  clearCart: () => {
    const sessionId = getSessionId();
    return fetchAPI('/cart/clear', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  },
};

// ORDERS ENDPOINTS
export const ordersAPI = {
  create: (orderData) =>
    fetchAPI('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  getMyOrders: () => fetchAPI('/orders'),

  getByNumber: (orderNumber) => fetchAPI(`/orders/${orderNumber}`),

  getAll: () => fetchAPI('/orders/admin/all'),

  updateStatus: (id, orderStatus, paymentStatus) =>
    fetchAPI(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ orderStatus, paymentStatus }),
    }),
};

// PAYMENT ENDPOINTS
export const paymentAPI = {
  createPaymentIntent: (amount, email) =>
    fetchAPI('/payment/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, email }),
    }),

  confirmPayment: (paymentIntentId) =>
    fetchAPI('/payment/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    }),
};

export { getSessionId, getToken, setToken };