const checkoutHTML = `
<section id="checkout" class="page active">
  <div class="container mx-auto px-6 py-12">
    <h2 class="font-display text-4xl text-center font-bold text-gray-800 mb-12">Finalizar Compra</h2>
    <div class="flex flex-col lg:flex-row gap-12">
      
      <!-- Columna del Formulario -->
      <div class="lg:w-2/3 bg-white p-8 rounded-lg shadow-md">
        <h3 class="font-display text-2xl font-bold mb-6 text-gray-800">1. Tus Datos</h3>
        <form id="shipping-form" class="space-y-6" novalidate>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700">Nombre</label>
              <input type="text" id="firstName" name="firstName" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
              <p id="firstName-error" class="text-red-500 text-xs mt-1 hidden">Este campo es requerido.</p>
            </div>
            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700">Apellido</label>
              <input type="text" id="lastName" name="lastName" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
              <p id="lastName-error" class="text-red-500 text-xs mt-1 hidden">Este campo es requerido.</p>
            </div>
          </div>
          <div>
            <label for="contactNumber" class="block text-sm font-medium text-gray-700">Número de Contacto</label>
            <input type="tel" id="contactNumber" name="contactNumber" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
            <p id="contactNumber-error" class="text-red-500 text-xs mt-1 hidden">Este campo es requerido.</p>
          </div>
          <div>
            <label for="deliveryDate" class="block text-sm font-medium text-gray-700">Fecha de Entrega / Retiro</label>
            <input type="date" id="deliveryDate" name="deliveryDate" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
            <p id="deliveryDate-error" class="text-red-500 text-xs mt-1 hidden">Este campo es requerido.</p>
          </div>
          <div class="border-t pt-6">
            <div class="flex items-center">
              <input type="checkbox" id="pickupAtStore" class="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500">
              <label for="pickupAtStore" class="ml-2 block text-sm font-bold text-gray-900">Retirar en el negocio (Sin costo de envío)</label>
            </div>
          </div>
          <div id="shipping-details" class="space-y-4">
            <h4 class="text-lg font-semibold text-gray-800 pt-4 border-t">Datos de Envío</h4>
            <div>
              <label for="address" class="block text-sm font-medium text-gray-700">Dirección (Calle y Número)</label>
              <input type="text" id="address" name="address" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
              <p id="address-error" class="text-red-500 text-xs mt-1 hidden">Este campo es requerido.</p>
            </div>
            <div>
              <label for="city" class="block text-sm font-medium text-gray-700">Localidad</label>
              <input type="text" id="city" name="city" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
              <p id="city-error" class="text-red-500 text-xs mt-1 hidden">Este campo es requerido.</p>
            </div>
            <div>
              <label for="zip" class="block text-sm font-medium text-gray-700">Código Postal</label>
              <input type="text" id="zip" name="zip" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
              <p id="zip-error" class="text-red-500 text-xs mt-1 hidden">Este campo es requerido.</p>
              <p id="shipping-message" class="text-sm mt-2"></p>
            </div>
          </div>
        </form>
      </div>

      <!-- Columna del Resumen de Compra -->
      <div class="lg:w-1/3">
        <div class="bg-white p-8 rounded-lg shadow-md sticky top-28">
          <h3 class="font-display text-2xl font-bold mb-6 text-gray-800">2. Resumen de Compra</h3>
          <div id="checkout-summary-items" class="space-y-4 max-h-64 overflow-y-auto pr-2 border-b pb-4 mb-4"></div>
          <div class="space-y-2 text-lg">
            <div class="flex justify-between"><span>Subtotal:</span> <span id="checkout-subtotal"></span></div>
            <div class="flex justify-between"><span>Envío:</span> <span id="checkout-shipping"></span></div>
            <div class="flex justify-between font-bold"><span>Total:</span> <span id="checkout-total" class="text-pink-500"></span></div>
          </div>
          <button id="place-order-btn" class="mt-8 w-full bg-pink-500 text-white font-bold py-3 px-8 rounded-full hover:bg-pink-600 transition-colors" disabled>Realizar Pedido</button>
        </div>
      </div>

    </div>
  </div>
</section>
`;

// Función para actualizar solo el resumen del pedido
export const updateCheckoutSummary = (cart, shippingCost) => {
    const subtotal = cart.reduce((s, i) => s + ((i.sale_price || i.base_price) * i.quantity), 0);
    const total = subtotal + shippingCost;
    
    document.getElementById('checkout-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('checkout-shipping').textContent = `$${shippingCost.toFixed(2)}`;
    document.getElementById('checkout-total').textContent = `$${total.toFixed(2)}`;

    const itemsContainer = document.getElementById('checkout-summary-items');
    itemsContainer.innerHTML = cart.length === 0 
        ? '<p>No hay productos.</p>' 
        : cart.map(i => `
            <div class="flex justify-between text-sm">
                <div>
                    <span class="font-bold mr-2">${i.quantity}x</span>
                    <span>${i.name}</span>
                </div>
                <span>$${((i.sale_price || i.base_price) * i.quantity).toFixed(2)}</span>
            </div>
        `).join('');
};

/**
 * Renderiza la página de checkout y conecta sus eventos.
 * @param {HTMLElement} appContainer - El contenedor principal de la app.
 * @param {object} state - El estado actual de la aplicación (carrito, costo de envío).
 * @param {object} callbacks - Funciones a ejecutar en los eventos del formulario.
 */
export const renderCheckoutPage = (appContainer, state, callbacks) => {
    appContainer.innerHTML = checkoutHTML;

    // Establecer la fecha mínima para la entrega
    document.getElementById('deliveryDate').min = new Date().toISOString().split("T")[0];
    
    // Renderizar el resumen inicial
    updateCheckoutSummary(state.cart, state.shippingCost);

    // Conectar eventos del formulario a los callbacks
    const form = document.getElementById('shipping-form');
    form.addEventListener('input', callbacks.onFormInput);

    document.getElementById('pickupAtStore').addEventListener('change', callbacks.onShippingToggle);
    document.getElementById('zip').addEventListener('input', callbacks.onZipChange);
    document.getElementById('place-order-btn').addEventListener('click', callbacks.onPlaceOrder);

    // Ejecutar una validación inicial para establecer el estado del botón
    callbacks.onFormInput();
};
