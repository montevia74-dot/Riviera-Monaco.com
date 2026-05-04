import { cartAPI, ordersAPI, paymentAPI } from './api.js';
import { isLoggedIn, getCurrentUser } from './auth.js';

let cartData = null;
let paymentIntentData = null;

// Initialize checkout page
export async function initCheckout() {
  try {
    // Load cart
    cartData = await cartAPI.getCart();
    renderOrderSummary();

    // Setup form
    setupCheckoutForm();
  } catch (error) {
    console.error('Checkout init error:', error);
    showNotification('Erreur lors du chargement du panier', 'error');
  }
}

// Render order summary
function renderOrderSummary() {
  const summary = document.getElementById('order-summary');
  if (!summary || !cartData) return;

  const itemsHTML = cartData.items
    .map(
      (item) => `
        <div class="summary-item">
          <span>${item.productName} (${item.size}) x${item.quantity}</span>
          <span>€${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `
    )
    .join('');

  summary.innerHTML = `
    <h3>Résumé de la commande</h3>
    ${itemsHTML}
    <div class="summary-total">
      <strong>Total:</strong>
      <strong>€${cartData.total.toFixed(2)}</strong>
    </div>
  `;
}

// Setup checkout form
function setupCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  form.addEventListener('submit', handleCheckoutSubmit);
}

// Handle checkout submission
async function handleCheckoutSubmit(e) {
  e.preventDefault();

  try {
    // Get form data
    const email = document.querySelector('[name="email"]').value;
    const firstName = document.querySelector('[name="firstName"]').value;
    const lastName = document.querySelector('[name="lastName"]').value;
    const street = document.querySelector('[name="street"]').value;
    const city = document.querySelector('[name="city"]').value;
    const postalCode = document.querySelector('[name="postalCode"]').value;
    const country = document.querySelector('[name="country"]').value;
    const phone = document.querySelector('[name="phone"]').value;

    // Validate
    if (!email || !firstName || !street || !city || !postalCode) {
      showNotification('Veuillez remplir tous les champs', 'error');
      return;
    }

    // Create Stripe payment intent
    showNotification('Traitement du paiement...', 'info');
    paymentIntentData = await paymentAPI.createPaymentIntent(
      cartData.total,
      email
    );

    // Show Stripe payment form
    showPaymentForm(paymentIntentData, {
      email,
      firstName,
      lastName,
      street,
      city,
      postalCode,
      country,
      phone,
    });
  } catch (error) {
    showNotification('Erreur: ' + error.message, 'error');
  }
}

// Show payment form
function showPaymentForm(paymentIntent, addressData) {
  const paymentForm = document.getElementById('payment-form');
  if (!paymentForm) return;

  paymentForm.style.display = 'block';
  paymentForm.innerHTML = `
    <h3>Paiement sécurisé</h3>
    <p>Total: <strong>€${cartData.total.toFixed(2)}</strong></p>
    <div id="card-element"></div>
    <div id="card-errors"></div>
    <button type="button" onclick="window.checkoutModule.processPayment('${paymentIntent.clientSecret}', '${JSON.stringify(addressData).replace(/"/g, '&quot;')}')">Payer maintenant</button>
  `;
}

// Process payment with Stripe
export async function processPayment(clientSecret, addressDataStr) {
  try {
    const addressData = JSON.parse(addressDataStr.replace(/&quot;/g, '"'));

    // Confirm payment (in real app, use Stripe.js)
    const paymentResult = await paymentAPI.confirmPayment(paymentIntentData.id);

    if (!paymentResult.success) {
      throw new Error('Payment failed');
    }

    // Create order
    const order = await ordersAPI.create({
      email: addressData.email,
      items: cartData.items,
      shippingAddress: addressData,
      billingAddress: addressData,
      totalPrice: cartData.total,
      paymentIntentId: paymentIntentData.id,
    });

    // Clear cart
    await cartAPI.clearCart();

    // Redirect to confirmation
    window.location.href = `/order-confirmation.html?orderNumber=${order.orderNumber}`;
  } catch (error) {
    showNotification('Erreur lors du paiement: ' + error.message, 'error');
  }
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
window.checkoutModule = {
  initCheckout,
  processPayment,
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', initCheckout);