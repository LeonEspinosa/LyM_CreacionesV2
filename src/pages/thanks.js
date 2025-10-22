// INICIO MODIFICACIÓN SEMÁNTICA
const thanksHTML = `
<section id="thanks" class="page active" aria-labelledby="thanks-title">
  <div class="container mx-auto px-6 py-20 text-center">
      <i data-lucide="party-popper" class="mx-auto text-pink-500" style="width: 80px; height: 80px;" aria-hidden="true"></i> <!-- Icono decorativo -->
      <h2 id="thanks-title" class="font-display text-4xl font-bold text-gray-800 mt-8">¡Gracias por tu compra!</h2>
      <p class="max-w-2xl mx-auto mt-4 text-gray-600 text-lg">Tu pedido ha sido reservado.</p>
      <div class="mt-8 bg-white p-6 rounded-lg shadow-md inline-block text-left" role="region" aria-labelledby="payment-info-title"> <!-- role region para info importante -->
          <h3 id="payment-info-title" class="sr-only">Información de pago</h3> <!-- Título oculto -->
          <p><strong>Alias:</strong> <span class="text-pink-500">ALIAS.DE.EJEMPLO</span></p>
          <p><strong>CBU:</strong> <span class="text-pink-500">1234567890123456789012</span></p>
          <p><strong>Titular:</strong> <span class="text-pink-500">Nombre Completo del Titular</span></p>
      </div>
      <p class="mt-8 text-gray-600">Una vez hecha la transferencia, envía el comprobante a nuestro <br><strong>WhatsApp <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer" class="text-pink-500 underline">+54 9 11 1234-5678</a></strong>.</p> <!-- Enlace funcional -->
      <button id="back-to-home-btn" class="mt-12 bg-pink-500 text-white font-bold py-3 px-8 rounded-full hover:bg-pink-600 transition-colors">Volver a la Tienda</button>
  </div>
</section>
`;
// FIN MODIFICACIÓN SEMÁNTICA

/**
 * Renderiza la página de agradecimiento.
 * @param {HTMLElement} appContainer - El contenedor principal.
 * @param {function} onBackToHome - Callback para el botón de volver al inicio.
 */
export const renderThanksPage = (appContainer, onBackToHome) => {
    appContainer.innerHTML = thanksHTML;
    document.getElementById('back-to-home-btn').addEventListener('click', onBackToHome);
    // Asegurarse de que el ícono se renderice
    lucide.createIcons(); 
};
