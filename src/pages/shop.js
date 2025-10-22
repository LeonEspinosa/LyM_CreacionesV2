import { createProductCard } from '../components/productCard.js';
import { createIcons, icons } from 'lucide';

// Estado para mantener los filtros y ordenamiento actual
const filterState = {
    searchTerm: '',
    selectedCategories: [],
    minPrice: '',
    maxPrice: '',
    sortBy: 'default', 
};

// INICIO MODIFICACIÓN SEMÁNTICA
const shopHTML = `
  <section id="shop" class="page active" aria-labelledby="shop-title"> <!-- section como contenedor principal de la página -->
    <div class="container mx-auto px-6 py-12">
      <h2 id="shop-title" class="font-display text-4xl text-center font-bold text-gray-800 mb-12">Nuestra Tienda</h2>
      
      <div class="flex flex-col lg:flex-row gap-8">
        
        <!-- Barra Lateral de Filtros -->
        <aside class="w-full lg:w-1/4 xl:w-1/5 space-y-8" aria-labelledby="filters-title"> <!-- aside para contenido complementario -->
            <h3 id="filters-title" class="sr-only">Filtros de productos</h3> <!-- Título oculto para lectores de pantalla -->
            <!-- Buscador -->
            <div id="search-filter" role="search"> <!-- role="search" para el buscador -->
                <label for="search-input" class="font-bold text-lg mb-4 border-b pb-2 block">Buscar</label> <!-- Cambiado h3 por label -->
                <div class="relative">
                    <input type="text" id="search-input" placeholder="Nombre o categoría..." class="w-full border-gray-300 rounded-full pl-4 pr-10 py-2 focus:ring-pink-500 focus:border-pink-500">
                    <button id="search-btn" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-pink-600" aria-label="Buscar productos"> <!-- aria-label -->
                        <i data-lucide="search" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>

            <!-- Filtro de Categorías -->
            <fieldset id="category-filter"> <!-- fieldset para agrupar filtros -->
                <legend class="font-bold text-lg mb-4 border-b pb-2 w-full">Categorías</legend> <!-- legend para el título del grupo -->
                <div id="category-list" class="space-y-2 max-h-60 overflow-y-auto pr-2">
                    <p class="text-sm text-gray-500">Cargando...</p>
                </div>
            </fieldset>

            <!-- Filtro de Precios -->
            <fieldset id="price-filter"> <!-- fieldset -->
                <legend class="font-bold text-lg mb-4 border-b pb-2 w-full">Precio</legend> <!-- legend -->
                <div class="flex items-center gap-2">
                    <label for="min-price" class="sr-only">Precio mínimo</label> <!-- sr-only label -->
                    <input type="number" id="min-price" placeholder="Min $" class="w-full border-gray-300 rounded-md text-sm p-2" aria-label="Precio mínimo">
                    <span>-</span>
                    <label for="max-price" class="sr-only">Precio máximo</label> <!-- sr-only label -->
                    <input type="number" id="max-price" placeholder="Max $" class="w-full border-gray-300 rounded-md text-sm p-2" aria-label="Precio máximo">
                </div>
            </fieldset>
            
            <!-- Ordenamiento -->
            <div id="sort-options">
                <label for="sort-by-select" class="font-bold text-lg mb-4 border-b pb-2 block">Ordenar por</label> <!-- Cambiado h3 por label -->
                <select id="sort-by-select" class="w-full border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500">
                    <option value="default">Relevancia</option>
                    <option value="price-asc">Precio: Menor a Mayor</option>
                    <option value="price-desc">Precio: Mayor a Menor</option>
                    <option value="offer-desc">Mejores Ofertas</option>
                </select>
            </div>
        </aside>

        <!-- Contenedor de Productos -->
        <div class="w-full lg:w-3/4 xl:w-4/5"> <!-- div en lugar de main, ya que main está en index.html -->
            <div id="products-header" class="mb-4" aria-live="polite"> <!-- aria-live para anunciar cambios en el contador -->
                <p id="product-count" class="text-sm text-gray-600">Cargando productos...</p>
            </div>
            <ul id="all-products" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <!-- Los productos filtrados se renderizarán aquí -->
            </ul>
        </div>

      </div>
    </div>
  </section>
`;
// FIN MODIFICACIÓN SEMÁNTICA

// --- Las funciones applyFiltersAndSorting, renderFilteredProducts, renderCategoryFilters no cambian su lógica interna ---
// (Solo se ajustan las referencias a los elementos si cambiaron de etiqueta, pero en este caso usamos IDs que se mantienen)
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

    // 3. Filtrar por rango de precios (Usando final_price calculado en el backend)
    const minPrice = parseFloat(filterState.minPrice);
    const maxPrice = parseFloat(filterState.maxPrice);
     if (!isNaN(minPrice)) {
        filtered = filtered.filter(p => p.final_price >= minPrice);
    }
    if (!isNaN(maxPrice)) {
        filtered = filtered.filter(p => p.final_price <= maxPrice);
    }


    // 4. Ordenar (Usando final_price calculado en el backend)
    switch (filterState.sortBy) {
        case 'price-asc':
            filtered.sort((a, b) => a.final_price - b.final_price);
            break;
        case 'price-desc':
            filtered.sort((a, b) => b.final_price - a.final_price);
            break;
        case 'offer-desc':
            // Filtrar productos con descuento real
             filtered = filtered.filter(p => p.discount_percentage && p.discount_percentage > 0);
            // Ordenar por el porcentaje de descuento descendente
             filtered.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0));
            break;
        default:
            // Orden por defecto (ID descendente como en la API)
             filtered.sort((a, b) => b.id - a.id);
            break;
    }


    return filtered;
}

function renderFilteredProducts(products, onProductClick, onAddToCartClick) {
    const allProductsContainer = document.getElementById('all-products');
    const productCountEl = document.getElementById('product-count');
    allProductsContainer.innerHTML = '';

    if (products.length === 0) {
        allProductsContainer.innerHTML = '<p class="col-span-full text-center text-gray-500">No se encontraron productos con estos filtros.</p>';
        productCountEl.textContent = '0 productos encontrados.';
    } else {
        productCountEl.textContent = `${products.length} producto${products.length > 1 ? 's' : ''} encontrado${products.length > 1 ? 's' : ''}.`;
        products.forEach(product => {
            const card = createProductCard(product, onProductClick, onAddToCartClick);
            allProductsContainer.appendChild(card);
        });
    }
    createIcons({ icons }); // Asegúrate que esto se llama después de añadir elementos con data-lucide
}


function renderCategoryFilters(products, onFilterChange) {
    const categoryListContainer = document.getElementById('category-list');
    const allCategories = new Set();
    products.forEach(p => {
        if (p.category) {
            // Asegurarse de que category es un array antes de iterar
            const categories = Array.isArray(p.category) ? p.category : JSON.parse(p.category || '[]');
            categories.forEach(cat => allCategories.add(cat.trim()));
        }
    });


    if (allCategories.size === 0) {
        categoryListContainer.innerHTML = '<p class="text-sm text-gray-500">No hay categorías.</p>';
        return;
    }
    
    categoryListContainer.innerHTML = '';
    [...allCategories].sort().forEach(category => {
        // Asegurarse de que la categoría no esté vacía
        if (!category) return;
        
        const categoryId = `cat-${category.toLowerCase().replace(/\s+/g, '-')}`; // Crear un ID más robusto
        const div = document.createElement('div');
        div.className = 'flex items-center';
        div.innerHTML = `
            <input type="checkbox" id="${categoryId}" name="category" value="${category}" class="h-4 w-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500 cursor-pointer">
            <label for="${categoryId}" class="ml-3 text-sm text-gray-600 cursor-pointer">${category}</label>
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
    document.getElementById('search-input').addEventListener('input', onFilterChange); // Filtrar mientras escribe
    document.getElementById('min-price').addEventListener('input', onFilterChange);
    document.getElementById('max-price').addEventListener('input', onFilterChange);
    document.getElementById('sort-by-select').addEventListener('change', onFilterChange);
    
    createIcons({ icons }); // Para íconos estáticos como el de búsqueda
};
