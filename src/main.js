import './style.css';
import { createIcons, icons } from 'lucide';

// Importación de Componentes
import { renderHeader, updateHeaderCartCount } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { renderCartModal, updateCartModalContent } from './components/cartModal.js';

// Importación de Páginas
import { renderHomePage } from './pages/home.js';
import { renderShopPage } from './pages/shop.js';
import { renderAboutPage } from './pages/about.js';
import { renderProductDetailPage } from './pages/productDetail.js';
import { renderCheckoutPage, updateCheckoutSummary } from './pages/checkout.js';
import { renderThanksPage } from './pages/thanks.js';

// Importación de Lógica de Negocio
import * as Cart from './js/cart.js';

const app = {
  state: {
    products: [],
    cart: [],
    currentPage: 'home',
    currentProduct: null,
    shippingCost: 0,
    // Puedes ajustar estos códigos postales y costos según tus zonas
    shippingZones: { '4616': 500, '4600': 550, '4000': 800 }, 
  },

  async init() {
    console.log("Aplicación inicializada.");
    this.state.cart = Cart.loadCart();
    this.renderLayout();
    await this.fetchProducts();
    this.navigateTo(this.state.currentPage);
    this.updateCartUI();
  },

  renderLayout() {
    const headerContainer = document.getElementById('main-header');
    const footerContainer = document.getElementById('main-footer');
    const cartModalContainer = document.getElementById('cart-modal');

    renderHeader(
        headerContainer, 
        (page) => this.navigateTo(page),
        () => this.toggleCartModal(true)
    );
    renderFooter(footerContainer);
    renderCartModal(cartModalContainer);

    // Conectar eventos del modal del carrito
    document.getElementById('close-cart-btn').addEventListener('click', () => this.toggleCartModal(false));
    cartModalContainer.addEventListener('click', (e) => {
        if (e.target.id === 'cart-modal') this.toggleCartModal(false);
    });
    document.getElementById('checkout-modal-btn').addEventListener('click', () => {
        this.toggleCartModal(false);
        this.navigateTo('checkout');
    });

    createIcons({ icons });
  },

  async fetchProducts() {
    try {
      const response = await fetch('http://localhost:3000/api/products');
      if (!response.ok) throw new Error('La respuesta de la red no fue exitosa.');
      this.state.products = await response.json();
    } catch (error) {
      console.error("Error al obtener los productos:", error);
      document.getElementById('app').innerHTML = `<p class="text-center text-red-500 mt-10">Error al cargar los productos. Asegúrate de que el servidor backend esté funcionando.</p>`;
    }
  },

  navigateTo(page) {
    this.state.currentPage = page;
    window.scrollTo(0, 0);
    const appContainer = document.getElementById('app');
    const onProductClick = (id) => this.showProductDetail(id);
    const onAddToCartClick = (id, el) => this.handleAddToCart(id, el);

    switch (page) {
      case 'home':
        renderHomePage(appContainer, this.state.products, onProductClick, onAddToCartClick);
        document.getElementById('home-view-products-btn').addEventListener('click', () => this.navigateTo('shop'));
        break;
      
      case 'shop':
        renderShopPage(appContainer, this.state.products, onProductClick, onAddToCartClick);
        break;

      case 'about':
        renderAboutPage(appContainer);
        break;

      case 'product-detail':
        const product = this.state.products.find(p => p.id === this.state.currentProduct?.id);
        renderProductDetailPage(
          appContainer,
          product,
          () => this.navigateTo('shop'),
          (id, qty) => this.handleAddToCartFromDetail(id, qty)
        );
        break;

      case 'checkout':
        renderCheckoutPage(
            appContainer,
            { cart: this.state.cart, shippingCost: this.state.shippingCost },
            {
                onFormInput: () => this.validateCheckoutForm(),
                onShippingToggle: (e) => this.handleShippingToggle(e.target.checked),
                onZipChange: () => this.calculateShipping(),
                onPlaceOrder: () => this.placeOrder()
            }
        );
        break;

      case 'thanks':
        renderThanksPage(appContainer, () => this.navigateTo('home'));
        break;

      default:
        this.navigateTo('home');
        break;
    }
    createIcons({ icons });
  },

  showProductDetail(productId) {
    this.state.currentProduct = this.state.products.find(p => p.id === productId);
    if (this.state.currentProduct) {
        this.navigateTo('product-detail');
    }
  },

  // --- Lógica del Carrito ---
  handleAddToCart(productId, buttonElement) {
    const product = this.state.products.find(p => p.id === productId);
    const cardElement = buttonElement.closest('li');
    const quantityInput = cardElement.querySelector('.quantity-input');
    const quantity = parseInt(quantityInput.value);

    if (product && quantity > 0) {
      Cart.addToCart(product, quantity);
      this.updateCartUI();
      const confirmation = cardElement.querySelector('.add-to-cart-confirmation');
      if (confirmation) {
        confirmation.classList.remove('opacity-0');
        createIcons({ icons });
        setTimeout(() => confirmation.classList.add('opacity-0'), 1500);
      }
      quantityInput.value = 1;
    }
  },

  handleAddToCartFromDetail(productId, quantity) {
      const product = this.state.products.find(p => p.id === productId);
      if (product && quantity > 0) {
          Cart.addToCart(product, quantity);
          this.updateCartUI();
          const confirmation = document.getElementById('detail-add-confirmation');
          if (confirmation) {
              confirmation.classList.remove('opacity-0');
              createIcons({ icons });
              setTimeout(() => confirmation.classList.add('opacity-0'), 1500);
          }
      }
  },

  updateCartUI() {
    this.state.cart = Cart.getCart();
    const totals = Cart.getCartTotals();
    updateHeaderCartCount(totals.totalItems);
    updateCartModalContent(this.state.cart, totals, {
      increase: (id) => { Cart.increaseQuantity(id); this.updateCartUI(); },
      decrease: (id) => { Cart.decreaseQuantity(id); this.updateCartUI(); },
      remove: (id) => { Cart.removeFromCart(id); this.updateCartUI(); },
    });
    // Si estamos en la página de checkout, también actualizamos su resumen
    if (this.state.currentPage === 'checkout') {
        updateCheckoutSummary(this.state.cart, this.state.shippingCost);
    }
    createIcons({ icons });
  },

  toggleCartModal(show) {
    document.getElementById('cart-modal').classList.toggle('hidden', !show);
    if (show) this.updateCartUI();
  },

  // --- Lógica de Checkout ---
  handleShippingToggle(isPickup) {
      const details = document.getElementById('shipping-details');
      ['address', 'city', 'zip'].forEach(id => {
          const el = document.getElementById(id);
          el.disabled = isPickup;
          el.required = !isPickup;
          if (isPickup) el.value = '';
      });
      details.style.opacity = isPickup ? '0.4' : '1';
      document.getElementById('shipping-message').textContent = isPickup ? 'Retiro en el negocio.' : '';
      this.state.shippingCost = isPickup ? 0 : this.state.shippingCost;
      if (!isPickup) this.calculateShipping(); else updateCheckoutSummary(this.state.cart, 0);
      this.validateCheckoutForm();
  },

  calculateShipping() {
      if (document.getElementById('pickupAtStore').checked) return;
      const zip = document.getElementById('zip').value;
      const msgEl = document.getElementById('shipping-message');
      const cost = this.state.shippingZones[zip];

      if (cost !== undefined) {
          this.state.shippingCost = cost;
          msgEl.textContent = `Costo de envío: $${this.state.shippingCost.toFixed(2)}`;
          msgEl.className = 'text-sm mt-2 text-green-600';
      } else {
          this.state.shippingCost = 0;
          msgEl.textContent = zip.length >= 3 ? 'Lo sentimos, no hacemos envíos a esta zona.' : '';
          if (zip.length >= 3) msgEl.className = 'text-sm mt-2 text-red-600';
      }
      updateCheckoutSummary(this.state.cart, this.state.shippingCost);
  },

  validateCheckoutForm() {
      const form = document.getElementById('shipping-form');
      if (!form) return;
      const pickup = form.elements.pickupAtStore.checked;
      let isFormValid = true;
      
      const fieldsToValidate = ['firstName', 'lastName', 'contactNumber', 'deliveryDate'];
      if (!pickup) fieldsToValidate.push('address', 'city', 'zip');

      fieldsToValidate.forEach(id => {
          const input = form.elements[id];
          const errorEl = document.getElementById(`${id}-error`);
          const isValid = input.value.trim() !== '';
          if (!isValid) isFormValid = false;
          errorEl.classList.toggle('hidden', isValid);
      });

      if (this.state.cart.length === 0) isFormValid = false;
      if (!pickup && this.state.shippingCost === 0 && form.elements.zip.value.length >= 3) isFormValid = false;
      
      document.getElementById('place-order-btn').disabled = !isFormValid;
  },

  async placeOrder() {
      const form = document.getElementById('shipping-form');
      const pickup = form.elements.pickupAtStore.checked;
      const shippingInfo = {
          firstName: form.elements.firstName.value.trim(),
          lastName: form.elements.lastName.value.trim(),
          contactNumber: form.elements.contactNumber.value.trim(),
          deliveryDate: form.elements.deliveryDate.value,
          pickupAtStore: pickup,
          address: pickup ? null : form.elements.address.value.trim(),
          city: pickup ? null : form.elements.city.value.trim(),
          zip: pickup ? null : form.elements.zip.value.trim()
      };
      
      const total = Cart.getCartTotals().subtotal + this.state.shippingCost;
      
      try {
          const response = await fetch('http://localhost:3000/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cart: this.state.cart, shippingInfo, total })
          });
          if (!response.ok) throw new Error((await response.json()).error || 'Error del servidor');
          
          this.navigateTo('thanks');
          Cart.removeFromCart(); // Vacía el carrito
          this.updateCartUI();
      } catch (error) {
          alert('No se pudo completar tu pedido. Detalle: ' + error.message);
      }
  },
};

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

