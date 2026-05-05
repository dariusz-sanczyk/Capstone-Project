import { CartManager, CartItem } from './main.js';

function renderCart() {
  const container = document.getElementById('cartContainer');
  const summary = document.getElementById('cartSummary');
  if (!container) return;

  const cart = CartManager.getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-page__empty">
        <h2>Your cart is empty</h2>
        <p>Use the <a href="catalog.html">catalog</a> to add new items.</p>
      </div>
    `;
    if (summary) summary.style.display = 'none';
    return;
  }

  container.innerHTML = `
    <div class="cart-items">
      ${cart.map((item, index) => renderCartItem(item, index)).join('')}
    </div>
  `;

  if (summary) summary.style.display = 'block';
  updateSummary();
  attachHandlers();
}

function renderCartItem(item: CartItem, index: number): string {
  return `
    <div class="cart-item">
      <div class="cart-item__image">
        <img src="${item.imageUrl}" alt="${item.name}">
      </div>
      <div class="cart-item__info">
        <h3>${item.name}</h3>
        <p>Color: ${item.selectedColor ?? item.color}</p>
        <p>Size: ${item.selectedSize ?? item.size}</p>
      </div>
      <div class="cart-item__quantity">
        <button class="qty-btn" data-action="decrease" data-index="${index}">-</button>
        <input type="number" value="${item.quantity}" min="1" data-index="${index}" readonly>
        <button class="qty-btn" data-action="increase" data-index="${index}">+</button>
      </div>
      <div class="cart-item__price">$${(item.price * item.quantity).toFixed(2)}</div>
      <button class="cart-item__remove" data-index="${index}">🗑️</button>
    </div>
  `;
}

function updateSummary() {
  const cart = CartManager.getCart();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = subtotal > 3000 ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  const subtotalEl = document.getElementById('subtotal');
  const discountEl = document.getElementById('discount');
  const totalEl = document.getElementById('total');

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (discountEl) discountEl.textContent = discount > 0 ? `-$${discount.toFixed(2)}` : '$0';
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

function attachHandlers() {
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = (btn as HTMLElement).dataset.action;
      const index = parseInt((btn as HTMLElement).dataset.index ?? '0');
      const cart = CartManager.getCart();

      if (action === 'increase') {
        CartManager.updateQuantity(index, cart[index].quantity + 1);
      } else if (action === 'decrease' && cart[index].quantity > 1) {
        CartManager.updateQuantity(index, cart[index].quantity - 1);
      }

      renderCart();
    });
  });

  document.querySelectorAll('.cart-item__remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt((btn as HTMLElement).dataset.index ?? '0');
      CartManager.removeItem(index);
      renderCart();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();

  const clearBtn = document.getElementById('clearCartBtn');
  clearBtn?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      CartManager.clearCart();
      renderCart();
    }
  });

  const checkoutBtn = document.getElementById('checkoutBtn');
  checkoutBtn?.addEventListener('click', () => {
    CartManager.clearCart();
    alert('Thank you for your purchase!');
    renderCart();
  });
});
