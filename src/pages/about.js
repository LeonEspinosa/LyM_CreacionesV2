const aboutHTML = `
  <section id="about" class="page active">
    <div class="container mx-auto px-6 py-16 text-center">
        <h2 class="font-display text-4xl font-bold text-gray-800">Nuestra Historia</h2>
        <img src="https://placehold.co/300x300/FFF0F5/DB2777?text=LyM" alt="Logo de LyM Creaciones" class="w-48 h-48 rounded-full mx-auto my-8 object-cover shadow-lg">
        <p class="max-w-3xl mx-auto text-gray-600 leading-relaxed">
            ¡Hola! Somos LyM Creaciones, un espacio donde la creatividad toma forma. Nos dedicamos a elaborar todo tipo de manualidades personalizadas para darle un toque único a tus momentos especiales. Desde regalos originales y decoraciones para cumpleaños, hasta bolsas hechas a mano para invitados y detalles para cualquier tipo de evento. Nuestra pasión es transformar tus ideas en recuerdos inolvidables. ¡Cuéntanos qué tienes en mente y lo haremos realidad!
        </p>
    </div>
  </section>
`;

/**
 * Renderiza el contenido de la página "Sobre Nosotros".
 * @param {HTMLElement} appContainer - El elemento <main> donde se inyectará el HTML.
 */
export const renderAboutPage = (appContainer) => {
  appContainer.innerHTML = aboutHTML;
};
