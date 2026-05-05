import { loadProducts, CartManager, Product } from './main';

async function loadProductDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    window.location.href = 'catalog.html';
    return;
  }

  const products = await loadProducts();
  const product = products.find(p => p.id === id);
  
  if (!product) {
    alert('Product not found');
    window.location.href = 'catalog.html';
    return;
  }

  renderProduct(product);
  renderYouMayAlsoLike(products, id);
  setupTabs();
  setupQuantity();
  setupAddToCart(product);
  setupReviewForm();
}

function renderProduct(product: Product) {
  const container = document.getElementById('productContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="product-details__grid">
      <div class="product-details__gallery">
        <img src="${product.imageUrl}" alt="${product.name}" onerror="this.src='/placeholder.jpg'">
      </div>
      <div class="product-details__info">
        <h1>${product.name}</h1>
        <div class="product-details__rating">
          ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
          <span>(${product.rating})</span>
        </div>
        <p class="product-details__price">$${product.price}</p>
        <div class="product-details__meta">
          <p><strong>Color:</strong> ${product.color}</p>
          <p><strong>Size:</strong> ${product.size}</p>
          <p><strong>Category:</strong> ${product.category}</p>
          ${product.salesStatus ? '<span class="product-details__sale">ON SALE!</span>' : ''}
        </div>
        <div class="product-details__quantity">
          <label>Quantity:</label>
          <button id="decreaseQty" class="qty-btn">-</button>
          <input type="number" id="quantity" value="1" min="1" readonly>
          <button id="increaseQty" class="qty-btn">+</button>
        </div>
        <button class="btn btn-primary btn-block" id="addToCart">Add to Cart</button>
      </div>
    </div>

    <div class="product-details__tabs">
      <div class="tab-buttons">
        <button class="tab-button active" data-tab="description">Description</button>
        <button class="tab-button" data-tab="reviews">Reviews</button>
      </div>
      <div class="tab-content active" id="descriptionTab">
        <h3>Product Description</h3>
        <p>This ${product.name} is perfect for your travel needs. Made with high-quality materials and designed for durability.</p>
        <ul>
          <li>Durable construction</li>
          <li>Spacious interior</li>
          <li>Smooth rolling wheels</li>
          <li>TSA-approved locks</li>
        </ul>
      </div>
      <div class="tab-content" id="reviewsTab">
        <h3>Customer Reviews</h3>
        <div class="review-form">
          <h4>Write a Review</h4>
          <form id="reviewForm">
            <div class="form-group">
              <label for="reviewName">Your Name</label>
              <input type="text" id="reviewName" required>
            </div>
            <div class="form-group">
              <label for="reviewRating">Rating</label>
              <select id="reviewRating" required>
                <option value="">Select rating</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <div class="form-group">
              <label for="reviewText">Your Review</label>
              <textarea id="reviewText" rows="4" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Submit Review</button>
            <div id="reviewMessage" style="margin-top: 1rem;"></div>
          </form>
        </div>
      </div>
    </div>

    <div class="you-may-like">
      <h2 class="section-title">You May Also Like</h2>
      <div class="products-grid" id="alsoLikeGrid"></div>
    </div>
  `;
}

function renderYouMayAlsoLike(products: Product[], currentId: string) {
  const container = document.getElementById('alsoLikeGrid');
  if (!container) return;

  const otherProducts = products.filter(p => p.id !== currentId);
  const shuffled = [...otherProducts].sort(() => 0.5 - Math.random());
  const randomProducts = shuffled.slice(0, 4);

  container.innerHTML = randomProducts.map(product => `
    <div class="product-card" data-id="${product.id}">
      ${product.salesStatus ? '<span class="product-card__badge">SALE</span>' : ''}
      <div class="product-card__image">
        <img src="${product.imageUrl}" alt="${product.name}" onerror="this.src='/placeholder.jpg'">
      </div>
      <div class="product-card__content">
        <h3 class="product-card__name">${product.name}</h3>
        <div class="product-card__rating">${'★'.repeat(Math.floor(product.rating))}</div>
        <p class="product-card__price">$${product.price}</p>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = (card as HTMLElement).dataset.id;
      window.location.href = `product.html?id=${id}`;
    });
  });
}

function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = (button as HTMLElement).dataset.tab;
      
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      button.classList.add('active');
      document.getElementById(`${tabName}Tab`)?.classList.add('active');
    });
  });
}

function setupQuantity() {
  let quantity = 1;
  const input = document.getElementById('quantity') as HTMLInputElement;
  
  document.getElementById('decreaseQty')?.addEventListener('click', () => {
    if (quantity > 1) {
      quantity--;
      input.value = quantity.toString();
    }
  });

  document.getElementById('increaseQty')?.addEventListener('click', () => {
    quantity++;
    input.value = quantity.toString();
  });
}

function setupAddToCart(product: Product) {
  document.getElementById('addToCart')?.addEventListener('click', async () => {
    const quantityInput = document.getElementById('quantity') as HTMLInputElement;
    const quantity = parseInt(quantityInput.value);
    
    CartManager.addItem(product, quantity);
    alert(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart!`);
  });
}

function setupReviewForm() {
  const form = document.getElementById('reviewForm') as HTMLFormElement;
  const message = document.getElementById('reviewMessage');
  
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = (document.getElementById('reviewName') as HTMLInputElement).value;
    const rating = (document.getElementById('reviewRating') as HTMLSelectElement).value;
    const text = (document.getElementById('reviewText') as HTMLTextAreaElement).value;
    
    if (!name || !rating || !text) {
      if (message) {
        message.innerHTML = '<p class="form-error">Please fill in all fields</p>';
      }
      return;
    }
    
    if (message) {
      message.innerHTML = '<p class="form-success">✓ Thank you for your review! It has been submitted successfully.</p>';
    }
    
    form.reset();
    
    setTimeout(() => {
      if (message) message.innerHTML = '';
    }, 3000);
  });
}

document.addEventListener('DOMContentLoaded', loadProductDetails);
