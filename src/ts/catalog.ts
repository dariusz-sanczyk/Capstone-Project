import { loadProducts, Product, CartManager } from './main';

let allProducts: Product[] = [];
let filteredProducts: Product[] = [];
let currentPage = 1;
const productsPerPage = 12;
let activeFilters = {
  category: '',
  color: '',
  size: '',
  salesStatus: ''
};

async function initCatalog() {
  console.log('Catalog init started');
  allProducts = await loadProducts();
  console.log('Products loaded:', allProducts.length);
  filteredProducts = [...allProducts];
  renderProducts();
  setupEventListeners();
  setupFilters();
  setupSearch();
  renderTopBestSets();
  console.log('Catalog init complete');
}

function renderTopBestSets() {
  const container = document.getElementById('bestSetsGrid');
  if (!container) return;

  // Get random sets (3-4 products displayed as "sets")
  const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
  const randomSets = shuffled.slice(0, 3);

  container.innerHTML = randomSets.map(product => `
    <div class="best-set-card">
      <div class="best-set-card__image">
        <img src="${product.imageUrl}" alt="${product.name}" onerror="this.src='/placeholder.jpg'">
      </div>
      <div class="best-set-card__content">
        <h3>${product.name} Set</h3>
        <p class="best-set-card__price">From $${product.price * 2}</p>
        <p class="best-set-card__description">Complete travel set with matching accessories</p>
        <a href="product.html?id=${product.id}" class="btn btn-outline">View Set</a>
      </div>
    </div>
  `).join('');
}

function renderProducts() {
  const container = document.getElementById('catalogProducts');
  if (!container) return;

  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const productsToShow = filteredProducts.slice(startIndex, endIndex);

  if (productsToShow.length === 0) {
    container.innerHTML = '<div class="no-products"><h3>No products found</h3><p>Try adjusting your filters</p></div>';
    return;
  }

  container.innerHTML = productsToShow.map(product => `
    <div class="product-card" data-id="${product.id}">
      ${product.salesStatus ? '<span class="product-card__badge">SALE</span>' : ''}
      <div class="product-card__image">
        <img src="${product.imageUrl}" alt="${product.name}" onerror="this.src='/placeholder.jpg'">
      </div>
      <div class="product-card__content">
        <h3 class="product-card__name">${product.name}</h3>
        <div class="product-card__rating">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5-Math.floor(product.rating))}</div>
        <p class="product-card__price">$${product.price}</p>
        <button class="btn btn-primary product-card__button" data-id="${product.id}">Add to Cart</button>
      </div>
    </div>
  `).join('');

  updateResultsInfo();
  renderPagination();
  attachProductHandlers();
}

function updateResultsInfo() {
  const info = document.getElementById('resultsInfo');
  if (!info) return;

  if (filteredProducts.length === 0) {
    info.textContent = 'No results found';
    return;
  }

  const start = (currentPage - 1) * productsPerPage + 1;
  const end = Math.min(currentPage * productsPerPage, filteredProducts.length);
  info.textContent = `Showing ${start}-${end} of ${filteredProducts.length} results`;
}

function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const pageNumbers = document.getElementById('pageNumbers');
  if (!pageNumbers) return;

  pageNumbers.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = `pagination__button ${i === currentPage ? 'pagination__button--active' : ''}`;
    btn.textContent = i.toString();
    btn.addEventListener('click', () => {
      currentPage = i;
      renderProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    pageNumbers.appendChild(btn);
  }

  const prevBtn = document.getElementById('prevPage') as HTMLButtonElement;
  const nextBtn = document.getElementById('nextPage') as HTMLButtonElement;
  
  if (prevBtn) {
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        renderProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
  }
  
  if (nextBtn) {
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    nextBtn.onclick = () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
  }
}

function attachProductHandlers() {
  document.querySelectorAll('.product-card__button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.id;
      const product = allProducts.find(p => p.id === id);
      if (product) {
        CartManager.addItem(product);
        alert('Added to cart!');
      }
    });
  });

  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = (card as HTMLElement).dataset.id;
      window.location.href = `product.html?id=${id}`;
    });
  });
}

// Setup filters with HOVER functionality
function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-dropdown__button');
  
  filterButtons.forEach(button => {
    const dropdown = button.parentElement;
    const menu = dropdown?.querySelector('.filter-dropdown__menu');
    
    if (!dropdown || !menu) return;

    // Open on HOVER
    dropdown.addEventListener('mouseenter', () => {
      menu.classList.add('active');
      button.classList.add('active');
    });

    // Close on mouse leave
    dropdown.addEventListener('mouseleave', () => {
      menu.classList.remove('active');
      button.classList.remove('active');
    });

    const filterType = (button as HTMLElement).dataset.filter;
    if (!filterType) return;

    // Populate filter options
    populateFilterMenu(menu as HTMLElement, filterType);
  });
}

function populateFilterMenu(menu: HTMLElement, filterType: string) {
  let options: string[] = [];
  
  switch(filterType) {
    case 'category':
      options = [...new Set(allProducts.map(p => p.category))];
      break;
    case 'color':
      options = ['red', 'blue', 'green', 'black', 'grey', 'yellow', 'pink', 'brown', 'orange'];
      break;
    case 'size':
      options = ['S', 'M', 'L', 'XL'];
      break;
    case 'salesStatus':
      options = ['On Sale', 'Regular'];
      break;
  }

  menu.innerHTML = options.map(option => 
    `<div class="filter-dropdown__item" data-filter="${filterType}" data-value="${option}">
      ${option}
    </div>`
  ).join('');

  // Add click handlers
  menu.querySelectorAll('.filter-dropdown__item').forEach(item => {
    item.addEventListener('click', () => {
      const filterType = (item as HTMLElement).dataset.filter!;
      const value = (item as HTMLElement).dataset.value!;
      
      // Remove previous selection
      menu.querySelectorAll('.filter-dropdown__item').forEach(i => i.classList.remove('selected'));
      
      // Add selection and highlight
      item.classList.add('selected');
      
      applyFilter(filterType, value);
    });
  });
}

function applyFilter(filterType: string, value: string) {
  if (filterType === 'salesStatus') {
    if (value === 'On Sale') {
      activeFilters[filterType] = 'true';
    } else if (value === 'Regular') {
      activeFilters[filterType] = 'false';
    } else {
      activeFilters[filterType] = '';
    }
  } else {
    activeFilters[filterType as keyof typeof activeFilters] = value.toLowerCase();
  }
  
  filterProducts();
}

function filterProducts() {
  filteredProducts = allProducts.filter(product => {
    if (activeFilters.category && product.category !== activeFilters.category) return false;
    if (activeFilters.color && product.color !== activeFilters.color) return false;
    if (activeFilters.size && product.size !== activeFilters.size) return false;
    if (activeFilters.salesStatus !== '') {
      const expectedStatus = activeFilters.salesStatus === 'true';
      if (product.salesStatus !== expectedStatus) return false;
    }
    return true;
  });
  
  currentPage = 1;
  renderProducts();
}

// Search functionality
function setupSearch() {
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;

  const performSearch = () => {
    const query = searchInput.value.trim().toLowerCase();
    
    if (!query) {
      showNotFoundPopup('Please enter a search term');
      return;
    }

    const foundProducts = allProducts.filter(p => 
      p.name.toLowerCase().includes(query)
    );

    if (foundProducts.length === 1) {
      // Redirect to product details
      window.location.href = `product.html?id=${foundProducts[0].id}`;
    } else if (foundProducts.length > 1) {
      // Show filtered results
      filteredProducts = foundProducts;
      currentPage = 1;
      renderProducts();
    } else {
      showNotFoundPopup('Product not found');
    }
  };

  searchBtn?.addEventListener('click', performSearch);
  searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
}

function showNotFoundPopup(message: string) {
  const popup = document.createElement('div');
  popup.className = 'search-popup';
  popup.innerHTML = `
    <div class="search-popup__overlay"></div>
    <div class="search-popup__content">
      <h3>⚠️ ${message}</h3>
      <button class="btn btn-primary" onclick="this.closest('.search-popup').remove()">OK</button>
    </div>
  `;
  document.body.appendChild(popup);
  
  popup.querySelector('.search-popup__overlay')?.addEventListener('click', () => popup.remove());
  
  setTimeout(() => popup.remove(), 3000);
}

function setupEventListeners() {
  const sortSelect = document.getElementById('sortSelect') as HTMLSelectElement;
  sortSelect?.addEventListener('change', () => {
    const value = sortSelect.value;
    filteredProducts.sort((a, b) => {
      switch(value) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        case 'popularity': return b.popularity - a.popularity;
        default: return 0;
      }
    });
    currentPage = 1;
    renderProducts();
  });

  const resetBtn = document.getElementById('resetFilters');
  resetBtn?.addEventListener('click', () => {
    activeFilters = { category: '', color: '', size: '', salesStatus: '' };
    filteredProducts = [...allProducts];
    currentPage = 1;
    renderProducts();
    
    // Clear all selected items
    document.querySelectorAll('.filter-dropdown__item.selected').forEach(item => {
      item.classList.remove('selected');
    });
    
    // Clear search
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    if (searchInput) searchInput.value = '';
  });
}

document.addEventListener('DOMContentLoaded', initCatalog);
