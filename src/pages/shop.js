import { createProductCard } from '../components/productCard.js';
import { createIcons, icons } from 'lucide';

// Estado para mantener los filtros y ordenamiento actual
const filterState = {
    searchTerm: '',
    selectedCategories: [],
    minPrice: '',
    maxPrice: '',
    sortBy: 'default', // Opciones: 'default', 'price-asc', 'price-desc', 'offer-desc'
};

const shopHTML = `
  <section id="shop" class="page active">
    <div class="container mx-auto px-6 py-12">
      <h2 class="font-display text-4xl text-center font-bold text-gray-800 mb-12">Nuestra Tienda</h2>
      
      <div class="flex flex-col lg:flex-row gap-8">
        
        <!-- Barra Lateral de Filtros -->
        <aside class="w-full lg:w-1/4 xl:w-1/5 space-y-8">
            <!-- Buscador -->
            <div id="search-filter">
                <h3 class="font-bold text-lg mb-4 border-b pb-2">Buscar</h3>
                <div class="relative">
                    <input type="text" id="search-input" placeholder="Nombre o categoría..." class="w-full border-gray-300 rounded-full pl-4 pr-10 py-2 focus:ring-pink-500 focus:border-pink-500">
                    <button id="search-btn" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-pink-600">
                        <i data-lucide="search" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>

            <!-- Filtro de Categorías -->
            <div id="category-filter">
                <h3 class="font-bold text-lg mb-4 border-b pb-2">Categorías</h3>
                <div id="category-list" class="space-y-2 max-h-60 overflow-y-auto pr-2">
                    <!-- Las categorías se generarán aquí -->
                    <p class="text-sm text-gray-500">Cargando...</p>
                </div>
            </div>

            <!-- Filtro de Precios -->
            <div id="price-filter">
                <h3 class="font-bold text-lg mb-4 border-b pb-2">Precio</h3>
                <div class="flex items-center gap-2">
                    <input type="number" id="min-price" placeholder="Min" class="w-full border-gray-300 rounded-md text-sm p-2">
                    <span>-</span>
                    <input type="number" id="max-price" placeholder="Max" class="w-full border-gray-300 rounded-md text-sm p-2">
                </div>
            </div>
            
            <!-- Ordenamiento -->
            <div id="sort-options">
                <h3 class="font-bold text-lg mb-4 border-b pb-2">Ordenar por</h3>
                <select id="sort-by-select" class="w-full border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500">
                    <option value="default">Relevancia</option>
                    <option value="price-asc">Precio: Menor a Mayor</option>
                    <option value="price-desc">Precio: Mayor a Menor</option>
                    <option value="offer-desc">Mejores Ofertas</option>
                </select>
            </div>
        </aside>

        <!-- Contenedor de Productos -->
        <main class="w-full lg:w-3/4 xl:w-4/5">
            <div id="products-header" class="mb-4">
                <p id="product-count" class="text-sm text-gray-600">Cargando productos...</p>
            </div>
            <ul id="all-products" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <!-- Los productos filtrados se renderizarán aquí -->
            </ul>
        </main>

      </div>
    </div>
  </section>
`;

/**
 * Aplica todos los filtros y el ordenamiento a la lista de productos.
 * @param {Array} allProducts - La lista completa de productos.
 * @returns {Array} La lista de productos filtrada y ordenada.
 */
function applyFiltersAndSorting(allProducts) {
    let filtered = [...allProducts];

    // 1. Filtrar por término de búsqueda (nombre o categoría)
    const searchTerm = filterState.searchTerm.toLowerCase().trim();
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            (p.category && p.category.some(c => c.toLowerCase().includes(searchTerm)))
        );
    }

    // 2. Filtrar por categorías seleccionadas
    if (filterState.selectedCategories.length > 0) {
        filtered = filtered.filter(p => 
            p.category && p.category.some(c => filterState.selectedCategories.includes(c))
        );
    }

    // 3. Filtrar por rango de precios
    const minPrice = parseFloat(filterState.minPrice);
    const maxPrice = parseFloat(filterState.maxPrice);
    if (!isNaN(minPrice)) {
        filtered = filtered.filter(p => (p.sale_price || p.base_price) >= minPrice);
    }
    if (!isNaN(maxPrice)) {
        filtered = filtered.filter(p => (p.sale_price || p.base_price) <= maxPrice);
    }

    // 4. Ordenar
    switch (filterState.sortBy) {
        case 'price-asc':
            filtered.sort((a, b) => (a.sale_price || a.base_price) - (b.sale_price || b.base_price));
            break;
        case 'price-desc':
            filtered.sort((a, b) => (b.sale_price || b.base_price) - (a.sale_price || a.base_price));
            break;
        case 'offer-desc':
            filtered = filtered.filter(p => p.sale_price && p.sale_price < p.base_price);
            filtered.sort((a, b) => {
                const discountA = (a.base_price - a.sale_price) / a.base_price;
                const discountB = (b.base_price - b.sale_price) / b.base_price;
                return discountB - discountA;
            });
            break;
        default:
            // Sin orden específico (o podrías ordenar por ID, etc.)
            break;
    }

    return filtered;
}

/**
 * Renderiza la lista de productos en la UI.
 */
function renderFilteredProducts(products, onProductClick, onAddToCartClick) {
    const allProductsContainer = document.getElementById('all-products');
    const productCountEl = document.getElementById('product-count');
    allProductsContainer.innerHTML = '';

    if (products.length === 0) {
        allProductsContainer.innerHTML = '<p class="col-span-full text-center text-gray-500">No se encontraron productos con estos filtros.</p>';
        productCountEl.textContent = '0 productos encontrados.';
    } else {
        productCountEl.textContent = `${products.length} producto(s) encontrado(s).`;
        products.forEach(product => {
            const card = createProductCard(product, onProductClick, onAddToCartClick);
            allProductsContainer.appendChild(card);
        });
    }
    createIcons({ icons });
}

/**
 * Extrae y renderiza los filtros de categoría.
 */
function renderCategoryFilters(products, onFilterChange) {
    const categoryListContainer = document.getElementById('category-list');
    const allCategories = new Set();
    products.forEach(p => {
        if (p.category) {
            p.category.forEach(cat => allCategories.add(cat));
        }
    });

    if (allCategories.size === 0) {
        categoryListContainer.innerHTML = '<p class="text-sm text-gray-500">No hay categorías.</p>';
        return;
    }
    
    categoryListContainer.innerHTML = '';
    [...allCategories].sort().forEach(category => {
        const div = document.createElement('div');
        div.className = 'flex items-center';
        div.innerHTML = `
            <input type="checkbox" id="cat-${category}" name="category" value="${category}" class="h-4 w-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500 cursor-pointer">
            <label for="cat-${category}" class="ml-3 text-sm text-gray-600 cursor-pointer">${category}</label>
        `;
        div.querySelector('input').addEventListener('change', onFilterChange);
        categoryListContainer.appendChild(div);
    });
}


export const renderShopPage = (appContainer, allProducts, onProductClick, onAddToCartClick) => {
    appContainer.innerHTML = shopHTML;
    
    const onFilterChange = () => {
        // Actualizar el estado de los filtros
        filterState.searchTerm = document.getElementById('search-input').value;
        filterState.selectedCategories = [...document.querySelectorAll('#category-list input:checked')].map(el => el.value);
        filterState.minPrice = document.getElementById('min-price').value;
        filterState.maxPrice = document.getElementById('max-price').value;
        filterState.sortBy = document.getElementById('sort-by-select').value;
        
        // Aplicar filtros y re-renderizar
        const filteredProducts = applyFiltersAndSorting(allProducts);
        renderFilteredProducts(filteredProducts, onProductClick, onAddToCartClick);
    };

    // Renderizado inicial
    renderCategoryFilters(allProducts, onFilterChange);
    onFilterChange(); // Llama una vez para mostrar todos los productos al inicio

    // Conectar eventos
    document.getElementById('search-btn').addEventListener('click', onFilterChange);
    document.getElementById('search-input').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') onFilterChange();
    });
    document.getElementById('min-price').addEventListener('input', onFilterChange);
    document.getElementById('max-price').addEventListener('input', onFilterChange);
    document.getElementById('sort-by-select').addEventListener('change', onFilterChange);
};

