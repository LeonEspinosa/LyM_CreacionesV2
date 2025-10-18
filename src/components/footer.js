    /**
     * Este componente es muy simple. Solo se encarga de renderizar el pie de página.
     */
    const footerHTML = `
      <div class="container mx-auto px-6 text-center">
        <p class="font-bold">LyM Creaciones</p>
        <p class="text-gray-400 text-sm mt-2">San Salvador de Jujuy, Localidad de Lozano, 50 viviendas AP2 L4</p>
        <p class="text-gray-500 text-xs mt-4">&copy; 2025 LyM Creaciones. Todos los derechos reservados.</p>
      </div>
    `;
    
    export const renderFooter = (container) => {
      container.innerHTML = footerHTML;
    };
    

