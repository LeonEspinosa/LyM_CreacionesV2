/**
 * Módulo para la página de la tienda.
 * Su única responsabilidad es renderizar la lista completa de productos.
 */
import { createProductCard } from '../components/productCard.js';

const shopHTML = `
  <section id="shop" class="page active">
    <div class="container mx-auto px-6 py-12">
      <h2 class="font-display text-4xl text-center font-bold text-gray-800 mb-12">Nuestra Tienda</h2>
      <ul id="all-products" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Los productos se renderizarán aquí -->
      </ul>
    </div>
  </section>
`;

/**
 * Dibuja y añade la lógica a la página de la tienda.
 * @param {HTMLElement} appContainer - El elemento <main> donde se inyectará el HTML.
 * @param {Array} products - La lista completa de productos.
 * @param {function} onProductClick - La función a ejecutar cuando se hace clic en una tarjeta de producto.
 * @param {function} onAddToCartClick - La función a ejecutar para añadir al carrito.
 */
export const renderShopPage = (appContainer, products, onProductClick, onAddToCartClick) => {
  appContainer.innerHTML = shopHTML;

  const allProductsContainer = document.getElementById('all-products');
  allProductsContainer.innerHTML = '';

  if (products.length === 0) {
    allProductsContainer.innerHTML = '<p class="col-span-full text-center text-gray-500">No hay productos disponibles en este momento.</p>';
    return;
  }

  // Reutilizamos el componente productCard para cada producto,
  // pasándole las funciones que recibimos.
  products.forEach(product => {
    const card = createProductCard(product, onProductClick, onAddToCartClick);
    allProductsContainer.appendChild(card);
  });
};
