import { createIcons, icons } from 'lucide';

// INICIO MODIFICACIÓN SEMÁNTICA
const productContentHTML = `
    <!-- Columna de Medios (Imágenes y Video) -->
    <aside aria-label="Galería de producto"> <!-- aside para galería -->
        <div id="main-media-container" class="w-full aspect-square bg-white rounded-lg shadow-md overflow-hidden relative mb-4">
            <div id="product-video-wrapper" class="w-full h-full hidden">
                <iframe id="product-video-iframe" class="w-full h-full" src="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="Video del producto"></iframe> <!-- Añadido title -->
            </div>
            <img id="main-product-image" src="" alt="Imagen principal del producto" class="w-full h-full object-cover cursor-pointer">
        </div>
        <div id="product-thumbnails" class="flex gap-4 overflow-x-auto pb-2" role="listbox" aria-label="Miniaturas de producto"> <!-- role="listbox" para indicar lista seleccionable -->
            <!-- Thumbnails se generarán aquí -->
        </div>
    </aside>

    <!-- Columna de Información y Acciones -->
    <article aria-labelledby="product-name"> <!-- article para agrupar info del producto -->
        <div id="product-categories" class="text-sm text-gray-500 mb-2"></div>
        <h2 id="product-name" class="font-display text-4xl font-bold text-gray-800"></h2>
        
        <!-- Contenedor de Precios -->
        <div id="product-price-container" class="my-4"></div>

        <!-- Descripción Larga -->
        <h3 class="sr-only">Descripción</h3> <!-- Título oculto -->
        <p id="product-description" class="text-gray-600 leading-relaxed"></p>
        
        <!-- Detalles Adicionales (Peso y Dimensiones) -->
        <div id="product-specs" class="mt-6 pt-4 border-t text-sm text-gray-600 space-y-2">
           <h3 class="sr-only">Especificaciones</h3> <!-- Título oculto -->
        </div>
        
        <!-- Contenedor de Acciones de Compra -->
        <div class="mt-8 pt-6 border-t">
            <h3 class="sr-only">Comprar</h3> <!-- Título oculto -->
            <div class="flex items-center gap-4">
                <label for="product-quantity" class="font-semibold">Cantidad:</label> <!-- Label ya existente -->
                <input type="number" id="product-quantity" value="1" min="1" class="w-20 text-center border-gray-300 rounded-full shadow-sm">
            </div>
            <p id="quantity-validation-message" class="text-xs text-red-500 mt-1 h-4" aria-live="polite"></p> <!-- aria-live para anunciar errores -->

            <div class="relative mt-4">
                <button id="add-to-cart-detail-btn" class="w-full bg-pink-500 text-white font-bold py-3 px-8 rounded-full hover:bg-pink-600 transition-colors">
                    Añadir al Carrito
                </button>
                <div id="detail-add-confirmation" class="add-to-cart-confirmation absolute inset-0 bg-pink-600 flex items-center justify-center opacity-0 pointer-events-none rounded-full" aria-live="polite"> <!-- aria-live -->
                    <span class="text-white font-bold flex items-center"><i data-lucide="check" class="mr-2"></i>¡Agregado!</span>
                </div>
            </div>
        </div>
    </article>
`;

const productDetailHTML = `
  <section id="product-detail" class="page active"> <!-- section principal -->
    <div class="container mx-auto px-6 py-12">
        <nav aria-label="Breadcrumb"> <!-- nav para el botón 'volver' -->
           <button id="back-to-shop-btn" class="inline-flex items-center mb-8 text-gray-600 hover:text-pink-500">
               <i data-lucide="arrow-left" class="mr-2"></i> Volver a la Tienda
           </button>
        </nav>
        <div id="product-detail-content" class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <!-- El contenido del producto se renderizará aquí -->
        </div>
    </div>
  </section>
`;
// FIN MODIFICACIÓN SEMÁNTICA

export const renderProductDetailPage = (appContainer, product, onBack, onAddToCart, onImageClick) => {
    appContainer.innerHTML = productDetailHTML;
    
    const contentContainer = document.getElementById('product-detail-content');
    if (!product) {
        contentContainer.innerHTML = '<p class="col-span-full text-center text-red-500">Producto no encontrado.</p>';
        return;
    }
    
    contentContainer.innerHTML = productContentHTML;

    // --- Poblar datos del producto ---
    // ... (sin cambios en esta parte)
     document.getElementById('product-categories').textContent = product.category ? product.category.join(' / ') : '';
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-description').textContent = product.long_description || '';


    // --- Lógica de Precios ---
    // ... (sin cambios en esta parte)
    const priceContainer = document.getElementById('product-price-container');
    const taxes = product.taxes || 0;
    const finalPriceWithTaxes = product.base_price * (1 + taxes / 100);
    const hasOffer = product.sale_price && product.sale_price < product.base_price;

    if (hasOffer) {
        const finalSalePriceWithTaxes = product.sale_price * (1 + taxes / 100);
        const discountPercentage = ((product.base_price - product.sale_price) / product.base_price) * 100;
        priceContainer.innerHTML = `
            <div class="flex items-center gap-4">
                <p class="text-4xl font-bold text-pink-600">$${finalSalePriceWithTaxes.toFixed(2)}</p>
                <span class="text-base font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">${discountPercentage.toFixed(0)}% OFF</span>
            </div>
            <p class="text-base text-gray-500 mt-1">Precio original: <del>$${finalPriceWithTaxes.toFixed(2)}</del></p>
        `;
    } else {
        priceContainer.innerHTML = `<p class="text-3xl font-semibold text-gray-800">$${finalPriceWithTaxes.toFixed(2)}</p>`;
    }

    // --- Lógica de Detalles Adicionales ---
    // ... (sin cambios en esta parte)
     const specsContainer = document.getElementById('product-specs');
    let specsHTML = '';
    if(product.weight) specsHTML += `<div><strong>Peso:</strong> ${product.weight} kg</div>`;
    if(product.dimensions) specsHTML += `<div><strong>Dimensiones:</strong> ${product.dimensions}</div>`;
    specsContainer.innerHTML = specsHTML;


    // --- Lógica de Validación de Cantidad ---
    // ... (sin cambios en esta parte)
    const quantityInput = document.getElementById('product-quantity');
    const addToCartBtn = document.getElementById('add-to-cart-detail-btn');
    const validationMessage = document.getElementById('quantity-validation-message');
    
    const minQty = product.min_purchase_quantity || 1;
    const maxQty = product.max_purchase_quantity;

    quantityInput.value = minQty;
    quantityInput.min = minQty;
    if (maxQty) {
        quantityInput.max = maxQty;
    }

    quantityInput.addEventListener('input', () => {
        const value = parseInt(quantityInput.value);
        let message = '';
        let isValid = true;
        if (isNaN(value)) {
            message = 'Cantidad inválida.'; isValid = false;
        } else if (value < minQty) {
            message = `La cantidad mínima es ${minQty}.`; isValid = false;
        } else if (maxQty && value > maxQty) {
            message = `La cantidad máxima es ${maxQty}.`; isValid = false;
        }
        validationMessage.textContent = message;
        addToCartBtn.disabled = !isValid;
    });

    // --- Lógica de Galería ---
    const mainImageEl = document.getElementById('main-product-image');
    const videoWrapper = document.getElementById('product-video-wrapper');
    const videoIframe = document.getElementById('product-video-iframe');
    const thumbnailsContainer = document.getElementById('product-thumbnails');
    
    const setActiveThumb = (thumbToActivate) => {
        document.querySelectorAll('#product-thumbnails > *').forEach(t => {
             t.classList.remove('thumbnail-active');
             t.setAttribute('aria-selected', 'false'); // ARIA para selección
        });
        if (thumbToActivate) {
             thumbToActivate.classList.add('thumbnail-active');
             thumbToActivate.setAttribute('aria-selected', 'true'); // ARIA para selección
        }
    };

    let firstThumbnail = null; // Guardar referencia al primer thumb
    
    // Crear thumbnail para el video
    if (product.video_url && product.video_url.includes('youtube.com')) {
        const videoThumb = document.createElement('div');
        videoThumb.className = "relative w-20 h-20 rounded-md cursor-pointer border-2 border-transparent hover:border-pink-300 flex-shrink-0";
        videoThumb.setAttribute('role', 'option'); // ARIA
        videoThumb.setAttribute('aria-selected', 'false'); // ARIA
        videoThumb.setAttribute('tabindex', '0'); // Hacer enfocable
        // INICIO MODIFICACIÓN ALT TEXT
        videoThumb.innerHTML = `
            <img src="https://placehold.co/80x80/FFF0F5/DB2777?text=Video" alt="Miniatura de video para ${product.name || 'producto'}" class="w-full h-full object-cover rounded-md">
            <div class="absolute inset-0 bg-black/30 flex items-center justify-center"><i data-lucide="play-circle" class="text-white w-8 h-8" aria-hidden="true"></i></div> <!-- Icono decorativo -->
        `;
        // FIN MODIFICACIÓN ALT TEXT
        thumbnailsContainer.appendChild(videoThumb);
        videoThumb.onclick = () => {
            const videoId = product.video_url.split('v=')[1]?.split('&')[0];
            videoIframe.src = `https://www.youtube.com/embed/${videoId}`;
            videoWrapper.classList.remove('hidden');
            mainImageEl.classList.add('hidden');
            setActiveThumb(videoThumb);
        };
        videoThumb.onkeydown = (e) => { if(e.key === 'Enter' || e.key === ' ') videoThumb.click(); }; // Activar con teclado
        if (!firstThumbnail) firstThumbnail = videoThumb;
    }

    // Crear thumbnails para imágenes
    if (product.images && product.images.length > 0) {
        product.images.forEach((img, index) => {
            const thumb = document.createElement('img');
            const thumbUrl = img.startsWith('http') ? img : `http://localhost:3000/uploads/${img}`;
            thumb.src = thumbUrl;
            // INICIO MODIFICACIÓN ALT TEXT
            // Alt más descriptivo para miniaturas
            thumb.alt = `Ver imagen ${index + 1} de ${product.name || 'producto'}`; 
            // FIN MODIFICACIÓN ALT TEXT
            thumb.className = "w-20 h-20 object-cover rounded-md cursor-pointer border-2 border-transparent hover:border-pink-300 flex-shrink-0";
            thumb.setAttribute('role', 'option'); // ARIA
            thumb.setAttribute('aria-selected', 'false'); // ARIA
            thumb.setAttribute('tabindex', '0'); // Hacer enfocable
            
            thumb.onclick = () => {
                videoIframe.src = ''; 
                videoWrapper.classList.add('hidden');
                mainImageEl.classList.remove('hidden');
                mainImageEl.src = thumbUrl;
                // INICIO MODIFICACIÓN ALT TEXT
                // Actualizar alt de la imagen principal al cambiar
                mainImageEl.alt = `${product.name || 'Producto'} - Imagen ${index + 1}`; 
                // FIN MODIFICACIÓN ALT TEXT
                setActiveThumb(thumb);
            };
             thumb.onkeydown = (e) => { if(e.key === 'Enter' || e.key === ' ') thumb.click(); }; // Activar con teclado
            thumbnailsContainer.appendChild(thumb);
            if (!firstThumbnail) firstThumbnail = thumb; // Guardar el primero (imagen o video)
        });
    }

    // Activar el primer thumbnail (video si existe, si no, la primera imagen)
    if (firstThumbnail) {
        firstThumbnail.click();
    } else {
        // Si no hay video ni imágenes, ocultar el contenedor principal
        mainImageEl.classList.add('hidden');
         if (videoWrapper) videoWrapper.classList.add('hidden');
         // Añadir un alt vacío si la imagen principal queda visible pero sin src válido
         mainImageEl.alt = ""; 
    }


    // --- Conectar eventos ---
    // ... (sin cambios en esta parte)
     document.getElementById('back-to-shop-btn').addEventListener('click', onBack);
    // Solo añadir listener si la imagen principal es visible
    if (!mainImageEl.classList.contains('hidden')) {
        mainImageEl.addEventListener('click', () => onImageClick(mainImageEl.src));
    }
    addToCartBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value);
        onAddToCart(product.id, quantity);
    });


    createIcons({ icons });
};
