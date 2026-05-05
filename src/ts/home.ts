import { loadProducts, Product, CartManager } from './main';

// Render product card
function renderProductCard(product: Product): string {
  return `
    <div class="product-card" data-id="${product.id}">
      ${product.salesStatus ? '<span class="product-card__badge">SALE</span>' : ''}
      <div class="product-card__image">
        <img src="${product.imageUrl}" alt="${product.name}" onerror="this.src='/placeholder.jpg'">
      </div>
      <div class="product-card__content">
        <h3 class="product-card__name">${product.name}</h3>
        <div class="product-card__rating">
          ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
          <span>(${product.rating})</span>
        </div>
        <p class="product-card__price">$${product.price}</p>
        <button class="btn btn-primary product-card__button" data-id="${product.id}">
          Add to Cart
        </button>
      </div>
    </div>
  `;
}

// Load selected products
async function loadSelectedProducts(): Promise<void> {
  const container = document.getElementById('selectedProducts');
  if (!container) return;

  const products = await loadProducts();
  const selectedProducts = products.filter(p => p.blocks.includes('Selected Products')).slice(0, 4);

  container.innerHTML = selectedProducts.map(renderProductCard).join('');

  // Add to cart handlers
  container.querySelectorAll('.product-card__button').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (button as HTMLElement).dataset.id;
      const product = selectedProducts.find(p => p.id === id);
      if (product) {
        CartManager.addItem(product);
        alert('Product added to cart!');
      }
    });
  });

  // Product card click to details
  container.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = (card as HTMLElement).dataset.id;
      window.location.href = `html/product.html?id=${id}`;
    });
  });
}

// Load new products
async function loadNewProducts(): Promise<void> {
  const container = document.getElementById('newProducts');
  if (!container) return;

  const products = await loadProducts();
  const newProducts = products.filter(p => p.blocks.includes('New Products Arrival')).slice(0, 4);

  container.innerHTML = newProducts.map(renderProductCard).join('');

  // Add to cart handlers
  container.querySelectorAll('.product-card__button').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (button as HTMLElement).dataset.id;
      const product = newProducts.find(p => p.id === id);
      if (product) {
        CartManager.addItem(product);
        alert('Product added to cart!');
      }
    });
  });

  // Product card click to details
  container.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = (card as HTMLElement).dataset.id;
      window.location.href = `html/product.html?id=${id}`;
    });
  });
}

// Initialize slider
function initSlider(): void {
  const slider = document.getElementById('suitcaseSlider');
  if (!slider) return;

  const track = slider.querySelector('.slider__track') as HTMLElement;
  let isScrolling = false;
  let startX = 0;
  let scrollLeft = 0;

  track.addEventListener('mousedown', (e) => {
    isScrolling = true;
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });

  track.addEventListener('mouseleave', () => {
    isScrolling = false;
  });

  track.addEventListener('mouseup', () => {
    isScrolling = false;
  });

  track.addEventListener('mousemove', (e) => {
    if (!isScrolling) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 2;
    track.scrollLeft = scrollLeft - walk;
  });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  loadSelectedProducts();
  loadNewProducts();
  initSlider();
});
