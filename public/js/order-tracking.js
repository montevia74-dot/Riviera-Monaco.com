import { orderModule } from './api.js';

class OrderTracking {
  constructor() {
    this.order = null;
    this.init();
  }

  async init() {
    const params = new URLSearchParams(window.location.search);
    const orderNumber = params.get('orderNumber');

    if (orderNumber) {
      await this.loadOrder(orderNumber);
      this.renderTracking();
    } else {
      this.showTrackingForm();
    }

    this.attachEventListeners();
  }

  showTrackingForm() {
    const container = document.querySelector('.tracking-container');
    if (container) {
      container.innerHTML = `
        <div class="tracking-form-wrapper">
          <h1>Suivre ma commande</h1>
          <form id="tracking-form" class="tracking-form">
            <input 
              type="text" 
              id="orderNumber" 
              placeholder="Entrez votre numéro de commande (ex: RM-1234567890-1)" 
              required
            >
            <button type="submit" class="btn-primary">Suivre</button>
          </form>
        </div>
      `;
    }
  }

  async loadOrder(orderNumber) {
    try {
      const response = await orderModule.getOrderByNumber(orderNumber);
      this.order = response.data;
    } catch (error) {
      console.error('Error loading order:', error);
      this.showError('Commande non trouvée. Vérifiez votre numéro de commande.');
    }
  }

  renderTracking() {
    if (!this.order) return;

    const container = document.querySelector('.tracking-container');
    if (!container) return;

    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    const currentStatusIndex = statuses.indexOf(this.order.orderStatus);

    container.innerHTML = `
      <div class="tracking-content">
        <div class="tracking-header">
          <h1>Suivi de commande</h1>
          <p class="order-number">Commande: ${this.order.orderNumber}</p>
        </div>

        <div class="tracking-timeline">
          ${statuses.map((status, index) => {
            const statusLabels = {
              pending: 'En attente',
              processing: 'En préparation',
              shipped: 'Expédiée',
              delivered: 'Livrée'
            };
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;

            return `
              <div class="timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
                <div class="timeline-dot"></div>
                <div class="timeline-label">
                  <p class="status-name">${statusLabels[status]}</p>
                  ${isCurrent ? '<p class="status-date">Actuellement</p>' : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="tracking-details">
          <div class="detail-section">
            <h3>Informations de commande</h3>
            <div class="detail-row">
              <span>Numéro de commande</span>
              <strong>${this.order.orderNumber}</strong>
            </div>
            <div class="detail-row">
              <span>Date</span>
              <strong>${new Date(this.order.createdAt).toLocaleDateString('fr-FR')}</strong>
            </div>
            <div class="detail-row">
              <span>Statut de paiement</span>
              <strong>${this.order.paymentStatus === 'completed' ? 'Payé' : 'En attente'}</strong>
            </div>
          </div>

          <div class="detail-section">
            <h3>Adresse de livraison</h3>
            <p>${this.order.shippingAddress.firstName} ${this.order.shippingAddress.lastName}</p>
            <p>${this.order.shippingAddress.street}</p>
            <p>${this.order.shippingAddress.postalCode} ${this.order.shippingAddress.city}</p>
            <p>${this.order.shippingAddress.country}</p>
            ${this.order.trackingNumber ? `<p class="tracking-number">Numéro de suivi: <strong>${this.order.trackingNumber}</strong></p>` : ''}
          </div>

          <div class="detail-section">
            <h3>Articles commandés</h3>
            ${this.order.items.map(item => `
              <div class="tracking-item">
                <p class="item-name">${item.productName} (Taille: ${item.size})</p>
                <p class="item-qty">Quantité: ${item.quantity} × €${item.price.toFixed(2)} = €${(item.quantity * item.price).toFixed(2)}</p>
              </div>
            `).join('')}
            <div class="tracking-item-total">
              <strong>Total: €${this.order.totalPrice.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div class="tracking-actions">
          <a href="/" class="btn-primary">Retour à l'accueil</a>
          <button onclick="location.reload()" class="btn-secondary">Actualiser</button>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    document.querySelector('#tracking-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const orderNumber = document.querySelector('#orderNumber').value;
      window.location.href = `/order-tracking.html?orderNumber=${orderNumber}`;
    });
  }

  showError(message) {
    const container = document.querySelector('.tracking-container');
    if (container) {
      container.innerHTML = `
        <div class="tracking-error">
          <h1>Erreur</h1>
          <p>${message}</p>
          <a href="/" class="btn-primary">Retour à l'accueil</a>
        </div>
      `;
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  new OrderTracking();
});

export default OrderTracking;
