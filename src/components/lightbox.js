const lightboxHTML = `
  <div id="lightbox-modal" class="hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-zoom-out">
    <button id="close-lightbox-btn" class="absolute top-4 right-6 text-white text-4xl font-bold">&times;</button>
    <div id="lightbox-content" class="relative overflow-hidden cursor-crosshair" style="--x-mouse: 50%; --y-mouse: 50%;">
        <img id="lightbox-image" src="" class="max-w-[90vw] max-h-[90vh] transition-transform duration-200 ease-out">
    </div>
  </div>
`;

// Variables para mantener referencias a los elementos del DOM y evitar búsquedas repetidas
let lightboxModal = null;
let lightboxContent = null;
let lightboxImage = null;

// Funciones privadas del módulo para manejar el zoom
const handleZoom = (event) => {
    if (!lightboxContent) return;
    const rect = lightboxContent.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    lightboxContent.style.setProperty('--x-mouse', `${x}%`);
    lightboxContent.style.setProperty('--y-mouse', `${y}%`);
};

const resetZoom = () => {
    if (!lightboxContent || !lightboxImage) return;
    lightboxContent.style.removeProperty('--x-mouse');
    lightboxContent.style.removeProperty('--y-mouse');
    lightboxImage.style.transform = 'scale(1)';
};

// Función pública para renderizar el componente y configurar sus eventos
export const renderLightbox = (container) => {
    container.innerHTML = lightboxHTML;
    
    // Guardamos las referencias
    lightboxModal = document.getElementById('lightbox-modal');
    lightboxContent = document.getElementById('lightbox-content');
    lightboxImage = document.getElementById('lightbox-image');

    // Asignamos los eventos una sola vez
    lightboxModal.addEventListener('click', hideLightbox);
    document.getElementById('close-lightbox-btn').addEventListener('click', hideLightbox);
    lightboxContent.addEventListener('click', (e) => e.stopPropagation()); // Evita que el modal se cierre al hacer clic en la imagen
    lightboxContent.addEventListener('mousemove', handleZoom);
    lightboxContent.addEventListener('mouseleave', resetZoom);
};

// Función pública para mostrar el lightbox con una imagen específica
export const showLightbox = (imageUrl) => {
    if (lightboxModal && lightboxImage) {
        lightboxImage.src = imageUrl;
        lightboxModal.classList.remove('hidden');
    }
};

// Función pública para ocultar el lightbox
export const hideLightbox = () => {
    if (lightboxModal && lightboxImage) {
        lightboxImage.src = '';
        lightboxModal.classList.add('hidden');
        resetZoom();
    }
};
