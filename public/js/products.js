import { productsAPI } from './api.js';
import { addToCart } from './cart.js';

// Load and display products
export async function loadProducts(filters = {}) {
  try {
    const products = await productsAPI.getAll(filters);
    renderProducts(products);
  } catch (error) {
    console.error('Error loading products:', error);
    showNotification('Erreur lors du chargement des produits', 'error');
  }
}

// Render products
function renderProducts(products) {
  const grid = document.querySelector('.products-grid');
  if (!grid) return;

  grid.innerHTML = products
    .map(
      (product) => `
        <div class="product-card">
          <div class="product-img-placeholder" style="background: linear-gradient(135deg, #0d1b2e 0%, #1e3a5f 100%);">
            <div class="product-icon" data-letter="${product.name[0]}"></div>
            <span class="product-type-label">${product.category}</span>
          </div>
          <div class="product-overlay">
            <button onclick="window.productsModule.showProductModal('${product._id}')">Ajouter au panier</button>
            <a href="#" class="wishlist">♡ Favoris</a>
          </div>
          <div class="product-info">
            <p class="product-category">${product.category}</p>
            <p class="product-name">${product.name}</p>
            <p class="product-price">€${product.price.toFixed(2)}</p>
          </div>
        </div>
      `
    )
    .join('');
}

// Show product modal for selection
export async function showProductModal(productId) {
  try {
    const product = await productsAPI.getById(productId);
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" onclick="this.parentElement.parentElement.remove()">✕</button>
        <h2>${product.name}</h2>
        <p>${product.description}</p>
        <p class="product-price">€${product.price.toFixed(2)}</p>
        <div class="size-selector">
          <label>Taille:</label>
          <select id="size-select">
            ${product.sizes
              .map(
                (s) =>
                  `<option value="${s.size}" ${s.stock > 0 ? '' : 'disabled'}>${s.size} ${s.stock > 0 ? '' : '(Rupture)'}</option>`
              )
              .join('')}
          </select>
        </div>
        <div class="quantity-selector">
          <label>Quantité:</label>
          <input type="number" id="quantity-input" min="1" max="10" value="1">
        </div>
        <button class="btn-primary" onclick="window.productsModule.addToCartFromModal('${product._id}')">Ajouter au panier</button>
      </div>
    `;
    document.body.appendChild(modal);
  } catch (error) {
    showNotification('Erreur lors du chargement du produit', 'error');
  }
}

// Add to cart from modal
export async function addToCartFromModal(productId) {
  const size = document.getElementById('size-select')?.value;
  const quantity = parseInt(document.getElementById('quantity-input')?.value || 1);

  if (!size) {
    showNotification('Veuillez sélectionner une taille', 'error');
    return;
  }

  await addToCart(productId, size, quantity);
  document.querySelector('.product-modal')?.remove();
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
window.productsModule = {
  loadProducts,
  showProductModal,
  addToCartFromModal,
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});