// 1. Importamos el componente que acabamos de crear.
import { createProductCard } from '../components/productCard.js';

const homeHTML = `
  <section id="home" class="page active">
    <div class="hero text-center py-20 px-6 bg-cover bg-center" style="background-image: linear-gradient(rgba(255, 240, 245, 0.5), rgba(255, 240, 245, 0.5)), url('https://images.unsplash.com/photo-1541692349975-9e66914571ea?q=80&w=2070&auto-format&fit=crop');">
        <h2 class="font-display text-5xl font-bold text-gray-800">Regalos únicos, hechos con el corazón.</h2>
        <p class="text-xl mt-4 text-gray-700">Tesoros artesanales que cuentan una historia.</p>
        <button id="home-view-products-btn" class="mt-8 bg-pink-500 text-white font-bold py-3 px-8 rounded-full hover:bg-pink-600 transition-colors">Ver todos los productos</button>
    </div>
    <div class="container mx-auto px-6 py-12">
        <h3 class="font-display text-3xl text-center font-bold text-gray-800 mb-8">Productos Destacados</h3>
        <ul id="featured-products" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Mensaje de carga inicial -->
          <p class="col-span-full text-center text-gray-500">Cargando productos...</p>
        </ul>
    </div>
  </section>
`;

/**
 * Dibuja la página de inicio y la puebla con los productos destacados.
 * @param {HTMLElement} appContainer - El elemento <main> donde se inyectará el HTML.
 * @param {Array} products - La lista completa de productos de la tienda.
 * @param {function} onProductClick - La función a ejecutar cuando se hace clic en una tarjeta de producto.
 * @param {function} onAddToCartClick - La función a ejecutar para añadir al carrito.
 */
export const renderHomePage = (appContainer, products, onProductClick, onAddToCartClick) => {
  appContainer.innerHTML = homeHTML;

  const featuredProductsContainer = document.getElementById('featured-products');
  const featuredProducts = products.filter(p => p.featured);

  featuredProductsContainer.innerHTML = ''; // Limpiamos el "cargando".

  if (featuredProducts.length === 0) {
    featuredProductsContainer.innerHTML = '<p class="col-span-full text-center text-gray-500">No hay productos destacados en este momento.</p>';
    return;
  }

  // 2. Por cada producto destacado, usamos nuestro componente para crear una tarjeta.
  // AHORA le pasamos las funciones que recibimos como parámetro.
  featuredProducts.forEach(product => {
    const card = createProductCard(product, onProductClick, onAddToCartClick);
    featuredProductsContainer.appendChild(card);
  });
};
