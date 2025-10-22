// 1. Importamos los componentes necesarios
import { createProductCard } from '../components/productCard.js';
import { createIcons, icons } from 'lucide';

// INICIO MODIFICACIÓN SEMÁNTICA
const homeHTML = `
  <div id="home" class="page active"> <!-- Mantenemos div como contenedor raíz de la página -->
    <section class="hero text-center py-20 px-6 bg-cover bg-center" style="background-image: linear-gradient(rgba(255, 240, 245, 0.5), rgba(255, 240, 245, 0.5)), url('https://images.unsplash.com/photo-1541692349975-9e66914571ea?q=80&w=2070&auto-format&fit=crop');" aria-labelledby="hero-title">
        <h2 id="hero-title" class="font-display text-5xl font-bold text-gray-800">Regalos únicos, hechos con el corazón.</h2>
        <p class="text-xl mt-4 text-gray-700">Tesoros artesanales que cuentan una historia.</p>
        <button id="home-view-products-btn" class="mt-8 bg-pink-500 text-white font-bold py-3 px-8 rounded-full hover:bg-pink-600 transition-colors">Ver todos los productos</button>
    </section>

    <!-- Sección del Carrusel de Videos -->
    <section id="video-carousel-section" class="container mx-auto px-6 py-12 hidden" aria-labelledby="video-carousel-title">
        <h3 id="video-carousel-title" class="font-display text-3xl text-center font-bold text-gray-800 mb-8">Nuestras Creaciones en Video</h3>
        <div class="relative w-full max-w-4xl mx-auto bg-gray-200 rounded-lg shadow-xl overflow-hidden">
            <div id="carousel-video-player" class="aspect-video w-full">
                <iframe class="w-full h-full" src="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="Reproductor de video de producto"></iframe> <!-- Añadido title -->
            </div>
            <div class="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
                <button id="carousel-prev-btn" class="p-3 bg-white/70 rounded-full shadow-md text-gray-700 hover:bg-white transition-colors pointer-events-auto" aria-label="Video anterior"> <!-- Añadido aria-label -->
                    <i data-lucide="chevron-left" class="w-6 h-6"></i>
                </button>
                <button id="carousel-next-btn" class="p-3 bg-white/70 rounded-full shadow-md text-gray-700 hover:bg-white transition-colors pointer-events-auto" aria-label="Video siguiente"> <!-- Añadido aria-label -->
                    <i data-lucide="chevron-right" class="w-6 h-6"></i>
                </button>
            </div>
            <div class="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-3 text-center">
                <p id="carousel-product-name" class="font-semibold text-lg" aria-live="polite"></p> <!-- Añadido aria-live -->
            </div>
        </div>
    </section>
    <!-- Fin Sección del Carrusel de Videos -->

    <section class="container mx-auto px-6 py-12" aria-labelledby="featured-products-title">
        <h3 id="featured-products-title" class="font-display text-3xl text-center font-bold text-gray-800 mb-8">Productos Destacados</h3>
        <ul id="featured-products" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <p class="col-span-full text-center text-gray-500">Cargando productos...</p>
        </ul>
    </section>
  </div>
`;
// FIN MODIFICACIÓN SEMÁNTICA

let currentVideoIndex = 0;
let carouselVideos = [];

const updateCarouselVideo = () => {
    // ... (lógica interna sin cambios)
    if (carouselVideos.length === 0) {
        document.getElementById('video-carousel-section').classList.add('hidden');
        return;
    }

    document.getElementById('video-carousel-section').classList.remove('hidden');
    const videoData = carouselVideos[currentVideoIndex];
    const videoIframe = document.querySelector('#carousel-video-player iframe');
    const productNameEl = document.getElementById('carousel-product-name');

    const videoId = videoData.video_url.split('v=')[1]?.split('&')[0];
    if (videoId) {
        videoIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
        productNameEl.textContent = videoData.name;
    }

};

const setupCarousel = (videos) => {
    // ... (lógica interna sin cambios)
     carouselVideos = videos;
    if (carouselVideos.length > 0) {
        currentVideoIndex = 0;
        updateCarouselVideo();
    } else {
        document.getElementById('video-carousel-section').classList.add('hidden');
    }

    const prevBtn = document.getElementById('carousel-prev-btn');
    const nextBtn = document.getElementById('carousel-next-btn');

    if (prevBtn) {
        prevBtn.onclick = () => {
            currentVideoIndex = (currentVideoIndex - 1 + carouselVideos.length) % carouselVideos.length;
            updateCarouselVideo();
        };
    }
    
    if (nextBtn) {
        nextBtn.onclick = () => {
            currentVideoIndex = (currentVideoIndex + 1) % carouselVideos.length;
            updateCarouselVideo();
        };
    }
    
    createIcons({ icons });

};

export const renderHomePage = (appContainer, featuredProducts, featuredVideos, onProductClick, onAddToCartClick) => {
    appContainer.innerHTML = homeHTML;

    // 1. Configurar el Carrusel de Videos
    setupCarousel(featuredVideos);

    const featuredProductsContainer = document.getElementById('featured-products');
    featuredProductsContainer.innerHTML = ''; // Limpiamos el "cargando".

    if (featuredProducts.length === 0) {
        featuredProductsContainer.innerHTML = '<p class="col-span-full text-center text-gray-500">No hay productos destacados en este momento.</p>';
        return;
    }

    // 3. Renderizamos las tarjetas de producto
    featuredProducts.forEach(product => {
        const card = createProductCard(product, onProductClick, onAddToCartClick);
        featuredProductsContainer.appendChild(card);
    });
    
    createIcons({ icons }); // Llamar después de añadir tarjetas y configurar carrusel
};
