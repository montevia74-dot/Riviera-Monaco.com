import { cartAPI, productsAPI } from './api.js';

let cartState = {
  items: [],
  total: 0,
  itemCount: 0,
};

// Update cart display
export async function updateCartDisplay() {
  try {
    const cartData = await cartAPI.getCart();
    cartState = {
      items: cartData.items || [],
      total: cartData.total || 0,
      itemCount: (cartData.items || []).length,
    };

    renderCart();
    updateCartBadge();
  } catch (error) {
    console.error('Error updating cart:', error);
  }
}

// Add product to cart
export async function addToCart(productId, size, quantity = 1) {
  try {
    await cartAPI.addToCart(productId, quantity, size);
    await updateCartDisplay();
    showNotification('✓ Ajouté au panier', 'success');
  } catch (error) {
    showNotification('Erreur: ' + error.message, 'error');
  }
}

// Update item quantity
export async function updateCartItem(itemId, quantity) {
  try {
    if (quantity <= 0) {
      await removeCartItem(itemId);
    } else {
      await cartAPI.updateItem(itemId, quantity);
      await updateCartDisplay();
    }
  } catch (error) {
    showNotification('Erreur: ' + error.message, 'error');
  }
}

// Remove item from cart
export async function removeCartItem(itemId) {
  try {
    await cartAPI.removeItem(itemId);
    await updateCartDisplay();
    showNotification('Supprimé du panier', 'info');
  } catch (error) {
    showNotification('Erreur: ' + error.message, 'error');
  }
}

// Clear entire cart
export async function clearCart() {
  try {
    if (confirm('Voulez-vous vraiment vider votre panier?')) {
      await cartAPI.clearCart();
      await updateCartDisplay();
      showNotification('Panier vidé', 'info');
    }
  } catch (error) {
    showNotification('Erreur: ' + error.message, 'error');
  }
}

// Render cart UI
function renderCart() {
  const cartContainer = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');

  if (!cartContainer) return;

  if (cartState.items.length === 0) {
    cartContainer.innerHTML = '<p style="text-align: center; padding: 40px;">Votre panier est vide</p>';
    if (cartTotal) cartTotal.textContent = '€0.00';
    return;
  }

  cartContainer.innerHTML = cartState.items
    .map(
      (item) => `
        <div class="cart-item">
          <div class="item-info">
            <h4>${item.productName}</h4>
            <p class="item-size">Taille: ${item.size}</p>
            <p class="item-price">€${item.price.toFixed(2)}</p>
          </div>
          <div class="item-quantity">
            <button class="qty-btn" onclick="window.cartModule.updateCartItem('${item._id}', ${item.quantity - 1})">-</button>
            <input type="number" value="${item.quantity}" min="1" onchange="window.cartModule.updateCartItem('${item._id}', this.value)">
            <button class="qty-btn" onclick="window.cartModule.updateCartItem('${item._id}', ${item.quantity + 1})">+</button>
          </div>
          <div class="item-total">€${(item.price * item.quantity).toFixed(2)}</div>
          <button class="remove-btn" onclick="window.cartModule.removeCartItem('${item._id}')">✕</button>
        </div>
      `
    )
    .join('');

  if (cartTotal) {
    cartTotal.textContent = `€${cartState.total.toFixed(2)}`;
  }
}

// Update cart badge
function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  if (badge) {
    badge.textContent = cartState.itemCount;
    badge.style.display = cartState.itemCount > 0 ? 'flex' : 'none';
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
window.cartModule = {
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  updateCartDisplay,
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', updateCartDisplay);