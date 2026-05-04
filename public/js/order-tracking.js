import { ordersAPI } from './api.js';

// Track order by number
export async function trackOrder(orderNumber) {
  try {
    const order = await ordersAPI.getByNumber(orderNumber);
    renderOrderDetails(order);
  } catch (error) {
    showNotification('Commande non trouvée', 'error');
  }
}

// Render order details
function renderOrderDetails(order) {
  const container = document.getElementById('order-details');
  if (!container) return;

  const statusSteps = [
    { status: 'pending', label: 'Commande reçue' },
    { status: 'processing', label: 'Traitement' },
    { status: 'shipped', label: 'Expédié' },
    { status: 'delivered', label: 'Livré' },
  ];

  const currentStatusIndex = statusSteps.findIndex(
    (s) => s.status === order.orderStatus
  );

  const timelineHTML = statusSteps
    .map(
      (step, index) => `
        <div class="status-step ${index <= currentStatusIndex ? 'completed' : ''}">
          <div class="status-circle">✓</div>
          <div class="status-label">${step.label}</div>
        </div>
      `
    )
    .join('');

  const itemsHTML = order.items
    .map(
      (item) => `
        <div class="order-item">
          <span>${item.productName} (${item.size})</span>
          <span>x${item.quantity}</span>
          <span>€${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `
    )
    .join('');

  container.innerHTML = `
    <div class="order-header">
      <h2>Commande #${order.orderNumber}</h2>
      <p>Date: ${new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
    </div>

    <div class="order-timeline">
      <h3>Suivi du statut</h3>
      <div class="timeline">${timelineHTML}</div>
      <p class="current-status">Statut actuel: <strong>${getStatusLabel(order.orderStatus)}</strong></p>
    </div>

    <div class="order-items">
      <h3>Articles commandés</h3>
      ${itemsHTML}
      <div class="order-total">
        <strong>Total: €${order.totalPrice.toFixed(2)}</strong>
      </div>
    </div>

    <div class="shipping-address">
      <h3>Adresse de livraison</h3>
      <p>
        ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
        ${order.shippingAddress.street}<br>
        ${order.shippingAddress.postalCode} ${order.shippingAddress.city}<br>
        ${order.shippingAddress.country}
      </p>
    </div>
  `;
}

// Get status label in French
function getStatusLabel(status) {
  const labels = {
    pending: 'En attente',
    processing: 'En traitement',
    shipped: 'Expédié',
    delivered: 'Livré',
  };
  return labels[status] || status;
}

// Search order form
export function initOrderSearchForm() {
  const form = document.getElementById('order-search-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const orderNumber = form.querySelector('[name="orderNumber"]').value;
    if (orderNumber) {
      trackOrder(orderNumber);
    }
  });
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

// Export for global access
window.orderTrackingModule = {
  trackOrder,
  initOrderSearchForm,
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initOrderSearchForm();
  const params = new URLSearchParams(window.location.search);
  const orderNumber = params.get('orderNumber');
  if (orderNumber) {
    trackOrder(orderNumber);
  }
});