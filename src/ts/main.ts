// Types
export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  color: string;
  size: string;
  salesStatus: boolean;
  rating: number;
  popularity: number;
  blocks: string[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export async function loadProducts(): Promise<Product[]> {
  try {
    console.log('Loading products from JSON file via fetch');
    const response = await fetch('/dist/assets/data.json');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jsonData = await response.json();
    console.log('Products loaded successfully:', jsonData.data?.length || 0);
    return jsonData.data || [];
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}

// Cart Management
export class CartManager {
  private static readonly CART_KEY = 'bestshop_cart';

  static getCart(): CartItem[] {
    const cart = localStorage.getItem(this.CART_KEY);
    return cart ? JSON.parse(cart) : [];
  }

  static saveCart(cart: CartItem[]): void {
    localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
    this.updateCartCounter();
  }

  static addItem(product: Product, quantity: number = 1, size?: string, color?: string): void {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(item =>
      item.id === product.id &&
      item.selectedSize === (size ?? product.size) &&
      item.selectedColor === (color ?? product.color)
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        ...product,
        quantity,
        selectedSize: size ?? product.size,
        selectedColor: color ?? product.color
      });
    }

    this.saveCart(cart);
  }

  static removeItem(index: number): void {
    const cart = this.getCart();
    cart.splice(index, 1);
    this.saveCart(cart);
  }

  static updateQuantity(index: number, quantity: number): void {
    const cart = this.getCart();
    if (cart[index] && quantity > 0) {
      cart[index].quantity = quantity;
      this.saveCart(cart);
    }
  }

  static clearCart(): void {
    localStorage.removeItem(this.CART_KEY);
    this.updateCartCounter();
  }

  static getTotalItems(): number {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  static getTotalPrice(): number {
    const cart = this.getCart();
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Apply 10% discount if total exceeds $3000
    if (subtotal > 3000) {
      return subtotal * 0.9;
    }

    return subtotal;
  }

  static updateCartCounter(): void {
    const counter = document.getElementById('cartCounter');
    if (counter) {
      const totalItems = this.getTotalItems();
      if (totalItems > 0) {
        counter.textContent = totalItems.toString();
        counter.style.display = 'flex';
      } else {
        counter.style.display = 'none';
      }
    }
  }
}

// Modal Management
export function initModal(): void {
  const modal = document.getElementById('loginModal');
  const accountBtn = document.getElementById('accountBtn');
  const closeModal = document.getElementById('closeModal');
  const overlay = modal?.querySelector('.modal__overlay');
  const loginForm = document.getElementById('loginForm') as HTMLFormElement;

  if (!modal || !accountBtn) return;

  // Ensure modal is closed on init
  modal.classList.remove('active');

  // Function to close modal
  const closeModalFn = () => {
    modal.classList.remove('active');
    if (loginForm) loginForm.reset();
    // Clear any errors
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    if (emailError) emailError.textContent = '';
    if (passwordError) passwordError.textContent = '';
  };

  // Open modal - ONLY when account button is clicked
  accountBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    modal.classList.add('active');
  });

  // Close button
  closeModal?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeModalFn();
  });

  // Overlay click
  overlay?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeModalFn();
  });

  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModalFn();
    }
  });

  // Prevent clicks inside modal content from closing modal
  const modalContent = modal.querySelector('.modal__content');
  modalContent?.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Password toggle
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password') as HTMLInputElement;

  togglePassword?.addEventListener('click', (e) => {
    e.preventDefault();
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
  });

  // Form validation
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('email') as HTMLInputElement;
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      const emailError = document.getElementById('emailError');
      const passwordError = document.getElementById('passwordError');

      // Reset errors
      if (emailError) emailError.textContent = '';
      if (passwordError) passwordError.textContent = '';

      let isValid = true;

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value)) {
        if (emailError) emailError.textContent = 'Please enter a valid email address';
        isValid = false;
      }

      // Password validation
      if (!passwordInput.value) {
        if (passwordError) passwordError.textContent = 'Password is required';
        isValid = false;
      }

      if (isValid) {
        // Close modal and reset form
        closeModalFn();
        // Show success message
        alert('Login successful!');
      }
    });
  }
}

// Hamburger menu
export function initHamburger(): void {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.querySelector('.nav-menu');

  hamburger?.addEventListener('click', () => {
    navMenu?.classList.toggle('active');
    hamburger?.classList.toggle('active');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (navMenu?.classList.contains('active') &&
      !target.closest('.nav-menu') &&
      !target.closest('.hamburger')) {
      navMenu?.classList.remove('active');
      hamburger?.classList.remove('active');
    }
  });

  // Close menu when clicking on a link
  navMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu?.classList.remove('active');
      hamburger?.classList.remove('active');
    });
  });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  CartManager.updateCartCounter();
  initModal();
  initHamburger();
});
