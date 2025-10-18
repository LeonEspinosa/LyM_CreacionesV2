/**
 * Módulo para la página de detalle de un producto.
 */

const productDetailHTML = `
  <section id="product-detail" class="page active">
    <div class="container mx-auto px-6 py-12">
        <button id="back-to-shop-btn" class="inline-flex items-center mb-8 text-gray-600 hover:text-pink-500">
            <i data-lucide="arrow-left" class="mr-2"></i> Volver a la Tienda
        </button>
        <div id="product-detail-content" class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <!-- El contenido del producto se renderizará aquí -->
        </div>
    </div>
  </section>
`;

const productContentHTML = (product) => `
    <!-- Columna de Medios (Imágenes y Video) -->
    <div>
        <div id="main-media-container" class="w-full aspect-square bg-white rounded-lg shadow-md overflow-hidden relative mb-4">
            <div id="product-video-wrapper" class="w-full h-full hidden">
                <iframe id="product-video-iframe" class="w-full h-full" src="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
            <img id="main-product-image" src="" alt="Imagen principal del producto" class="w-full h-full object-cover cursor-pointer">
        </div>
        <div id="product-thumbnails" class="flex gap-4 overflow-x-auto pb-2">
        </div>
    </div>
    <!-- Columna de Información y Acciones -->
    <div>
        <div id="product-categories" class="text-sm text-gray-500 mb-2"></div>
        <h2 id="product-name" class="font-display text-4xl font-bold text-gray-800"></h2>
        <p id="product-price" class="text-3xl text-pink-500 my-4"></p>
        <div id="product-customizable-tag" class="hidden"></div>
        <p id="product-description" class="text-gray-600 leading-relaxed"></p>
        
        <div class="mt-8 pt-6 border-t">
            <div class="flex items-center gap-4">
                <label for="product-quantity" class="font-semibold">Cantidad:</label>
                <input type="number" id="product-quantity" value="1" min="1" class="w-20 text-center border-gray-300 rounded-full shadow-sm">
            </div>
            <div class="relative mt-4">
                <button id="add-to-cart-detail-btn" class="w-full bg-pink-500 text-white font-bold py-3 px-8 rounded-full hover:bg-pink-600 transition-colors">
                    Añadir al Carrito
                </button>
                <div id="detail-add-confirmation" class="add-to-cart-confirmation absolute inset-0 bg-pink-600 flex items-center justify-center opacity-0 pointer-events-none rounded-full">
                    <span class="text-white font-bold flex items-center"><i data-lucide="check" class="mr-2"></i>¡Agregado!</span>
                </div>
            </div>
        </div>
    </div>
`;

export const renderProductDetailPage = (appContainer, product, onBack, onAddToCart, onImageClick) => {
    appContainer.innerHTML = productDetailHTML;
    
    const contentContainer = document.getElementById('product-detail-content');
    if (!product) {
        contentContainer.innerHTML = '<p class="col-span-full text-center text-red-500">Producto no encontrado.</p>';
        return;
    }
    
    contentContainer.innerHTML = productContentHTML(product);

    // Poblar datos
    document.getElementById('product-name').textContent = product.name;
    const displayPrice = product.sale_price || product.base_price;
    document.getElementById('product-price').textContent = `$${(displayPrice || 0).toFixed(2)}`;
    document.getElementById('product-description').textContent = product.long_description || product.short_description || '';
    document.getElementById('product-categories').textContent = product.category ? product.category.join(' / ') : '';

    const customizableTag = document.getElementById('product-customizable-tag');
    if (product.customizable) {
        customizableTag.innerHTML = `<p class="text-green-600 font-bold my-4 flex items-center"><i data-lucide="sparkles" class="w-5 h-5 mr-2"></i>¡Este producto es personalizable!</p>`;
        customizableTag.classList.remove('hidden');
    }

    // Lógica de Galería
    const mainImageEl = document.getElementById('main-product-image');
    mainImageEl.addEventListener('click', (e) => onImageClick(e.target.src)); // <-- CONECTAR EVENTO

    const videoWrapper = document.getElementById('product-video-wrapper');
    const videoIframe = document.getElementById('product-video-iframe');
    const thumbnailsContainer = document.getElementById('product-thumbnails');
    
    const setActiveThumb = (thumbToActivate) => {
        document.querySelectorAll('#product-thumbnails > *').forEach(t => t.classList.remove('thumbnail-active'));
        if (thumbToActivate) thumbToActivate.classList.add('thumbnail-active');
    };

    if (product.video_url && product.video_url.includes('youtube.com')) {
        const videoThumb = document.createElement('div');
        videoThumb.className = "relative w-20 h-20 rounded-md cursor-pointer border-2 border-transparent hover:border-pink-300 flex-shrink-0";
        videoThumb.innerHTML = `
            <img src="https://placehold.co/80x80/FFF0F5/DB2777?text=Video" class="w-full h-full object-cover rounded-md">
            <div class="absolute inset-0 bg-black/30 flex items-center justify-center"><i data-lucide="play-circle" class="text-white w-8 h-8"></i></div>
        `;
        thumbnailsContainer.appendChild(videoThumb);
        videoThumb.onclick = () => {
            const videoId = product.video_url.split('v=')[1]?.split('&')[0];
            videoIframe.src = `https://www.youtube.com/embed/${videoId}`;
            videoWrapper.classList.remove('hidden');
            mainImageEl.classList.add('hidden');
            setActiveThumb(videoThumb);
        };
    }

    if (product.images && product.images.length > 0) {
        product.images.forEach((img, index) => {
            const thumb = document.createElement('img');
            const thumbUrl = img.startsWith('http') ? img : `http://localhost:3000/uploads/${img}`;
            thumb.src = thumbUrl;
            thumb.className = "w-20 h-20 object-cover rounded-md cursor-pointer border-2 border-transparent hover:border-pink-300 flex-shrink-0";
            
            thumb.onclick = () => {
                videoIframe.src = ''; 
                videoWrapper.classList.add('hidden');
                mainImageEl.classList.remove('hidden');
                mainImageEl.src = thumbUrl;
                setActiveThumb(thumb);
            };
            thumbnailsContainer.appendChild(thumb);

            if (index === 0) {
              thumb.click();
            }
        });
    } else {
         mainImageEl.classList.add('hidden');
    }

    // Conectar eventos de botones de acción
    document.getElementById('back-to-shop-btn').addEventListener('click', onBack);
    document.getElementById('add-to-cart-detail-btn').addEventListener('click', () => {
        const quantity = parseInt(document.getElementById('product-quantity').value);
        onAddToCart(product.id, quantity);
    });
};
