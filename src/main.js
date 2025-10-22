import './style.css';
import { createIcons, icons } from 'lucide';

// Importación de Componentes
import { renderHeader, updateHeaderCartCount } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { renderCartModal, updateCartModalContent } from './components/cartModal.js';
import * as Lightbox from './components/lightbox.js';

// Importación de Páginas
import { renderHomePage } from './pages/home.js';
import { renderShopPage } from './pages/shop.js';
import { renderAboutPage } from './pages/about.js';
import { renderProductDetailPage } from './pages/productDetail.js';
import { renderCheckoutPage, updateCheckoutSummary } from './pages/checkout.js';
import { renderThanksPage } from './pages/thanks.js';

// Importación de Lógica de Negocio
import * as Cart from './js/cart.js';

// --- INICIO: Variables y funciones para gestión de foco del CARRITO ---
let cartModalContainer = null;
let cartModalElement = null; // El div interno con role="dialog"
let cartCloseButton = null;
let cartFocusableElements = [];
let cartFirstFocusable = null;
let cartLastFocusable = null;
let cartPreviouslyFocused = null;

const openCartModal = () => {
  if (!cartModalContainer || !cartModalElement) return;
  cartPreviouslyFocused = document.activeElement; // Guardar foco
  cartModalContainer.classList.remove('hidden');
  
  // Encontrar elementos enfocables DENTRO del modal del carrito
  cartFocusableElements = Array.from(cartModalElement.querySelectorAll(
    'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ));
  // El botón de cerrar es usualmente el primero o uno de los primeros
  cartCloseButton = document.getElementById('close-cart-btn'); 
  cartFirstFocusable = cartCloseButton || cartFocusableElements[0]; // Priorizar botón cerrar
  cartLastFocusable = cartFocusableElements[cartFocusableElements.length - 1];
  
  // Añadir listener para atrapar el foco
  cartModalContainer.addEventListener('keydown', trapCartFocus);

  // Mover foco al modal (o a su botón de cerrar)
  setTimeout(() => { 
      if(cartCloseButton) {
          cartCloseButton.focus();
      } else if (cartModalElement) {
           cartModalElement.focus(); // Enfocar el contenedor si no hay botón
      }
  }, 100); 
};

const closeCartModal = () => {
  if (!cartModalContainer) return;
  cartModalContainer.classList.add('hidden');
  cartModalContainer.removeEventListener('keydown', trapCartFocus); // Quitar listener
  
  // Devolver foco al elemento que lo tenía antes
  if (cartPreviouslyFocused) {
      cartPreviouslyFocused.focus();
  }
};

// Función para atrapar el foco dentro del modal del carrito
const trapCartFocus = (e) => {
    if (e.key !== 'Tab') {
       if(e.key === 'Escape') { // Añadir cierre con Escape
           closeCartModal();
       }
       return; 
    }

    // Si no hay elementos enfocables (carrito vacío?), no hacer nada
    if(cartFocusableElements.length === 0) {
        e.preventDefault();
        return;
    }

    // Asegurarse de tener referencias válidas
    cartFirstFocusable = cartFocusableElements[0];
    cartLastFocusable = cartFocusableElements[cartFocusableElements.length - 1];


    if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === cartFirstFocusable) {
            cartLastFocusable.focus(); 
            e.preventDefault();
        }
    } else { // Tab
        if (document.activeElement === cartLastFocusable) {
            cartFirstFocusable.focus(); 
            e.preventDefault();
        }
    }
};
// --- FIN: Variables y funciones para gestión de foco del CARRITO ---

const app = {
  state: {
    products: [],
    cart: [],
    currentPage: 'home',
    currentProduct: null,
    shippingCost: 0,
    minimumDeliveryDate: '', // <-- AÑADIDO: Para la nueva lógica de envío
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
    // --- MODIFICACIÓN: Guardar referencia al contenedor y al modal interno ---
    cartModalContainer = document.getElementById('cart-modal'); 
    // --- FIN MODIFICACIÓN ---
    const lightboxContainer = document.getElementById('lightbox-container');

    renderHeader(headerContainer, (page) => this.navigateTo(page), () => this.toggleCartModal(true));
    renderFooter(footerContainer);
    renderCartModal(cartModalContainer);
    // --- MODIFICACIÓN: Obtener referencia al modal interno y conectar botón cerrar ---
    if (cartModalContainer) {
        cartModalElement = cartModalContainer.querySelector('[role="dialog"]'); // Busca el div con role dialog
        cartCloseButton = document.getElementById('close-cart-btn'); // Busca el botón por ID
        if(cartCloseButton) {
           cartCloseButton.addEventListener('click', () => this.toggleCartModal(false));
        }
        // Cerrar al hacer clic fuera (en el overlay)
        cartModalContainer.addEventListener('click', (e) => {
          if (e.target === cartModalContainer) this.toggleCartModal(false);
        });
    }
    // --- FIN MODIFICACIÓN ---

    Lightbox.renderLightbox(lightboxContainer); // Renderizar Lightbox

    // El listener del botón checkout se mantiene, pero ahora está dentro del dialog
    const checkoutBtn = document.getElementById('checkout-modal-btn');
     if (checkoutBtn) {
         checkoutBtn.addEventListener('click', () => {
             this.toggleCartModal(false);
             this.navigateTo('checkout');
         });
     }


    createIcons({ icons }); // Renderizar iconos iniciales
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
    // Si la nueva página es diferente, limpiar el contenedor principal
    if (page !== this.state.currentPage) {
        const appContainer = document.getElementById('app');
        if(appContainer) appContainer.innerHTML = ''; // Limpiar contenido anterior
    }
    this.state.currentPage = page;
    window.scrollTo(0, 0);
    const appContainer = document.getElementById('app');
    const onProductClick = (id) => this.showProductDetail(id);
    const onAddToCartClick = (id, el) => this.handleAddToCart(id, el);

    switch (page) {
      case 'home':
        const featuredProducts = this.state.products.filter(p => p.featured);
        const featuredProductsWithVideos = featuredProducts.filter(p => p.video_url && p.video_url.includes('youtube.com'));
        renderHomePage(appContainer, featuredProducts, featuredProductsWithVideos, onProductClick, onAddToCartClick);
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
        renderProductDetailPage(appContainer, product, () => this.navigateTo('shop'), (id, qty) => this.handleAddToCartFromDetail(id, qty), (imageUrl) => Lightbox.showLightbox(imageUrl));
        break;

      case 'checkout':
        // --- INICIO DE LA MODIFICACIÓN ---
        renderCheckoutPage(appContainer, { cart: this.state.cart, shippingCost: this.state.shippingCost }, { 
            onPlaceOrder: (shippingInfo) => this.placeOrder(shippingInfo), 
            onToggleShipping: (isPickup) => this.toggleShippingFields(isPickup), 
            onCalculateShipping: () => this.calculateShipping(), 
            onValidate: () => this.validateCheckout() 
        });
        // --- FIN DE LA MODIFICACIÓN ---
        break;

      case 'thanks':
        renderThanksPage(appContainer, () => this.navigateTo('home'));
        break;

      default:
        this.navigateTo('home');
        break;
    }
  },

  showProductDetail(productId) {
    this.state.currentProduct = this.state.products.find(p => p.id === productId);
    if (this.state.currentProduct) {
        this.navigateTo('product-detail');
    }
  },

  handleAddToCart(productId, buttonElement) {
    const product = this.state.products.find(p => p.id === productId);
    const cardElement = buttonElement.closest('li');
    const quantityInput = cardElement.querySelector('.quantity-input');
    const quantity = parseInt(quantityInput.value);
    if (isNaN(quantity) || quantity < 1) return;
    if (product) {
      Cart.addToCart(product, quantity);
      this.updateCartUI();
      const confirmation = cardElement.querySelector('.add-to-cart-confirmation');
      if (confirmation) {
        confirmation.classList.remove('opacity-0');
        createIcons({ icons });
        setTimeout(() => confirmation.classList.add('opacity-0'), 1500);
      }
      quantityInput.value = product.min_purchase_quantity || 1;
    }
  },

  handleAddToCartFromDetail(productId, quantity) {
    const product = this.state.products.find(p => p.id === productId);
    if (isNaN(quantity) || quantity < 1) return;
    if (product) {
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
    if (this.state.currentPage === 'checkout') {
        updateCheckoutSummary(this.state.cart, this.state.shippingCost);
    }
  },

  // --- MODIFICACIÓN: Usar nuevas funciones para abrir/cerrar modal ---
  toggleCartModal(show) {
    if (show) {
      this.updateCartUI(); // Actualizar contenido ANTES de mostrar
      openCartModal();
    } else {
      closeCartModal();
    }
  },
  // --- FIN MODIFICACIÓN ---
  // --- INICIO: SECCIÓN DE CHECKOUT ACTUALIZADA ---
  async calculateShipping() {
    const zipInput = document.getElementById('zip');
    const postalCode = zipInput.value.trim();
    const btn = document.getElementById('calculate-shipping-btn');
    const msgEl = document.getElementById('shipping-message');

    if (!postalCode) {
        msgEl.textContent = "Por favor, ingresa un código postal.";
        msgEl.className = 'text-sm mt-2 text-red-500';
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Calculando...';
    msgEl.textContent = '';

    try {
        const response = await fetch('http://localhost:3000/api/shipping/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postalCode, cart: this.state.cart.map(i => ({id: i.id, quantity: i.quantity})) })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        this.state.shippingCost = data.shippingCost;
        this.state.minimumDeliveryDate = data.minimumDeliveryDate;

        msgEl.textContent = `Costo de envío: $${data.shippingCost.toFixed(2)}`;
        msgEl.className = 'text-sm mt-2 text-green-600';
        
        const deliveryDateInput = document.getElementById('deliveryDate');
        deliveryDateInput.value = data.minimumDeliveryDate;
        deliveryDateInput.min = data.minimumDeliveryDate;

    } catch (error) {
        this.state.shippingCost = 0;
        this.state.minimumDeliveryDate = '';
        msgEl.textContent = error.message;
        msgEl.className = 'text-sm mt-2 text-red-500';
        document.getElementById('deliveryDate').value = '';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Calcular Envío';
        updateCheckoutSummary(this.state.cart, this.state.shippingCost);
        this.validateCheckout();
    }
  },

  toggleShippingFields(isPickup) {
    const details = document.getElementById('shipping-details');
    details.classList.toggle('hidden', isPickup);
    
    ['address', 'city', 'zip'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.required = !isPickup;
    });

    if (isPickup) {
        this.state.shippingCost = 0;
        const deliveryDateInput = document.getElementById('deliveryDate');
        deliveryDateInput.value = '';
        deliveryDateInput.readOnly = false;
        deliveryDateInput.classList.remove('bg-gray-100', 'cursor-not-allowed');
    } else {
        const deliveryDateInput = document.getElementById('deliveryDate');
        deliveryDateInput.value = '';
        deliveryDateInput.readOnly = true;
        deliveryDateInput.classList.add('bg-gray-100', 'cursor-not-allowed');
    }
    updateCheckoutSummary(this.state.cart, this.state.shippingCost);
    this.validateCheckout();
  },
  
  validateCheckout() {
    const form = document.getElementById('shipping-form');
    if (!form) return;
    const pickup = form.elements.pickupAtStore.checked;
    const btn = document.getElementById('place-order-btn');
    
    let isFormValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    let fieldsToValidate = ['firstName', 'lastName', 'customer_dni', 'customer_email', 'contactNumber'];
    if (pickup) {
        fieldsToValidate.push('deliveryDate');
    }

    fieldsToValidate.forEach(id => {
        const input = form.elements[id];
        const errorEl = document.getElementById(`${id}-error`);
        let isValid = input && input.value.trim() !== '';
        
        if (id === 'customer_email' && isValid) {
            isValid = emailRegex.test(input.value.trim());
        }

        if (!isValid) isFormValid = false;
        if(errorEl) errorEl.classList.toggle('hidden', isValid);
    });

    if (!pickup) {
        ['address', 'city', 'zip'].forEach(id => {
            const input = form.elements[id];
            if (input && !input.value.trim()) isFormValid = false;
        });
        if(!this.state.minimumDeliveryDate) isFormValid = false;
    }

    if (this.state.cart.length === 0) isFormValid = false;
    if (btn) btn.disabled = !isFormValid;
  },

  async placeOrder(shippingInfo) {
    const cartItemsForOrder = this.state.cart.map(item => ({ id: item.id, quantity: item.quantity, is_customized: item.is_customized || 0, custom_detail: item.custom_detail || null }));
    
    // --- INICIO DE LA CORRECCIÓN ---
    // Creamos un nuevo objeto que incluye tanto la info del formulario
    // como el costo de envío calculado que está en el estado de la app.
    const finalShippingInfo = {
        ...shippingInfo,
        shippingCost: this.state.shippingCost
    };
    // --- FIN DE LA CORRECCIÓN ---

    try {
        const response = await fetch('http://localhost:3000/api/orders', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            // Enviamos el objeto corregido
            body: JSON.stringify({ cart: cartItemsForOrder, shippingInfo: finalShippingInfo }) 
        });
        if (!response.ok) throw new Error((await response.json()).error || 'Error del servidor');
        
        this.navigateTo('thanks');
        Cart.emptyCart();
        this.updateCartUI(); 
    } catch (error) {
        console.error('No se pudo completar tu pedido: ' + error.message);
        const msgEl = document.getElementById('shipping-message');
        if(msgEl) {
            msgEl.textContent = `Error al realizar el pedido: ${error.message}`;
            msgEl.className = 'text-sm mt-2 text-red-500';
        }
    }
  },
  // --- FIN: SECCIÓN DE CHECKOUT ACTUALIZADA ---
};

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

