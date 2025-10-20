const checkoutHTML = `
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

                <!-- NUEVOS CAMPOS DNI Y EMAIL -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="customer_dni" class="block text-sm font-medium text-gray-700">DNI</label>
                        <input type="text" id="customer_dni" name="customer_dni" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500" placeholder="Sin puntos ni espacios">
                        <p id="customer_dni-error" class="text-red-500 text-xs mt-1 hidden">Este campo es requerido.</p>
                    </div>
                    <div>
                        <label for="customer_email" class="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="customer_email" name="customer_email" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500" placeholder="tucorreo@ejemplo.com">
                        <p id="customer_email-error" class="text-red-500 text-xs mt-1 hidden">El email es requerido y debe ser válido.</p>
                    </div>
                </div>

                <div>
                    <label for="contactNumber" class="block text-sm font-medium text-gray-700">Número de Contacto</label>
                    <input type="tel" id="contactNumber" name="contactNumber" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
                    <p id="contactNumber-error" class="text-red-500 text-xs mt-1 hidden">Este campo es requerido.</p>
                </div>

                <div class="border-t pt-6">
                    <div class="flex items-center">
                        <input type="checkbox" id="pickupAtStore" name="pickupAtStore" class="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500">
                        <label for="pickupAtStore" class="ml-2 block text-sm font-bold text-gray-900">Retirar en el negocio</label>
                    </div>
                </div>

                <div id="shipping-details" class="space-y-4">
                    <h4 class="text-lg font-semibold text-gray-800 pt-4 border-t">Datos de Envío</h4>
                    
                    <!-- NUEVO: Contenedor para Código Postal y Botón de Calcular -->
                    <div>
                        <label for="zip" class="block text-sm font-medium text-gray-700">Código Postal</label>
                        <div class="flex items-start gap-2 mt-1">
                            <div class="flex-grow">
                                <input type="text" id="zip" name="zip" required class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
                                <p id="zip-error" class="text-red-500 text-xs mt-1 hidden">Este campo es requerido.</p>
                            </div>
                            <button type="button" id="calculate-shipping-btn" class="bg-gray-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-700 whitespace-nowrap">Calcular Envío</button>
                        </div>
                        <p id="shipping-message" class="text-sm mt-2"></p>
                    </div>
                    
                    <div>
                        <label for="address" class="block text-sm font-medium text-gray-700">Dirección</label>
                        <input type="text" id="address" name="address" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
                        <p id="address-error" class="text-red-500 text-xs mt-1 hidden">Este campo es requerido.</p>
                    </div>
                    
                    <div>
                        <label for="city" class="block text-sm font-medium text-gray-700">Localidad</label>
                        <input type="text" id="city" name="city" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
                        <p id="city-error" class="text-red-500 text-xs mt-1 hidden">Este campo es requerido.</p>
                    </div>
                </div>
                
                <!-- Fecha de Entrega/Retiro movida fuera de "Datos de Envío" -->
                <div>
                    <label for="deliveryDate" class="block text-sm font-medium text-gray-700">Fecha de Entrega / Retiro</label>
                    <input type="date" id="deliveryDate" name="deliveryDate" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed" readonly>
                    <p id="deliveryDate-error" class="text-red-500 text-xs mt-1 hidden">La fecha es requerida. Calcúlala con tu método de entrega.</p>
                </div>
            </form>
        </div>

        <!-- Columna del Resumen de Compra -->
        <div class="lg:w-1/3">
            <div class="bg-white p-8 rounded-lg shadow-md sticky top-28">
                <h3 class="font-display text-2xl font-bold mb-6 text-gray-800">2. Resumen de Compra</h3>
                <ul id="checkout-summary-items" class="space-y-4 max-h-60 overflow-y-auto pr-2"></ul>
                <div class="border-t mt-6 pt-6 space-y-2 text-lg">
                    <div class="flex justify-between"><span>Subtotal:</span> <span id="checkout-subtotal"></span></div>
                    <div class="flex justify-between"><span>Envío:</span> <span id="checkout-shipping"></span></div>
                    <div class="flex justify-between font-bold text-2xl mt-2"><span>Total:</span> <span id="checkout-total" class="text-pink-500"></span></div>
                </div>
                <button id="place-order-btn" class="mt-8 w-full bg-pink-500 text-white font-bold py-3 px-8 rounded-full hover:bg-pink-600 transition-colors" disabled>Realizar Pedido</button>
            </div>
        </div>
    </div>
</div>
`;

/**
 * Función para habilitar/deshabilitar los campos de envío.
 * @param {boolean} isPickup - True si se retira en tienda, false si es envío a domicilio.
 * @param {object} callbacks - Objeto de callbacks para actualizar el costo de envío.
 */
const toggleShippingDetails = (isPickup, callbacks) => {
    const shippingDetails = document.getElementById('shipping-details');
    const zipInput = document.getElementById('zip');
    const addressInput = document.getElementById('address');
    const cityInput = document.getElementById('city');
    const calculateShippingBtn = document.getElementById('calculate-shipping-btn');

    const fieldsToToggle = [zipInput, addressInput, cityInput];

    if (isPickup) {
        // --- LÓGICA PARA CUANDO SE RETIRA EN EL NEGOCIO ---
        shippingDetails.style.display = 'none';
        calculateShippingBtn.disabled = true;
        
        fieldsToToggle.forEach(field => {
            field.disabled = true;
            field.required = false; // Quitar el 'required' para que el formulario valide
        });

        // Llama a un callback para poner el costo de envío en 0
        if (callbacks && typeof callbacks.onUpdateShippingCost === 'function') {
            callbacks.onUpdateShippingCost(0);
        }

    } else {
        // --- LÓGICA PARA CUANDO ES ENVÍO A DOMICILIO (LA PARTE QUE FALTABA) ---
        shippingDetails.style.display = 'block';
        calculateShippingBtn.disabled = false;
        
        fieldsToToggle.forEach(field => {
            field.disabled = false; // ¡Clave! Habilitar los campos de nuevo
            field.required = true;  // Volver a hacerlos requeridos
        });

        // Llama a un callback para recalcular o resetear el costo de envío
         if (callbacks && typeof callbacks.onResetShipping === 'function') {
            callbacks.onResetShipping();
        }
    }
     // Validar el formulario después de cada cambio
    if (callbacks && typeof callbacks.onValidate === 'function') {
        callbacks.onValidate();
    }
};


export const renderCheckoutPage = (appContainer, data, callbacks) => {
    appContainer.innerHTML = checkoutHTML;

    // Conectar eventos del formulario
    const form = document.getElementById('shipping-form');
    form.addEventListener('input', callbacks.onValidate);

    const pickupCheckbox = document.getElementById('pickupAtStore');
    // Se pasa el objeto de callbacks completo a la función de toggle
    pickupCheckbox.addEventListener('change', (e) => toggleShippingDetails(e.target.checked, callbacks));

    document.getElementById('calculate-shipping-btn').addEventListener('click', callbacks.onCalculateShipping);
    document.getElementById('place-order-btn').addEventListener('click', () => {
        // Recolectar datos del formulario para enviarlos al main.js
        const formData = new FormData(form);
        const shippingInfo = Object.fromEntries(formData.entries());
        shippingInfo.pickupAtStore = form.elements.pickupAtStore.checked;
        callbacks.onPlaceOrder(shippingInfo);
    });
    
    // Renderizar resumen inicial y validar
    updateCheckoutSummary(data.cart, data.shippingCost);
    // Llamada inicial para establecer el estado correcto al cargar la página
    toggleShippingDetails(pickupCheckbox.checked, callbacks); 
};

export const updateCheckoutSummary = (cart, shippingCost) => {
    const subtotalEl = document.getElementById('checkout-subtotal');
    const shippingEl = document.getElementById('checkout-shipping');
    const totalEl = document.getElementById('checkout-total');
    const summaryItemsEl = document.getElementById('checkout-summary-items');

    const finalSubtotal = cart.reduce((sum, item) => {
        const price = item.sale_price || item.base_price;
        const taxes = item.taxes || 0;
        const finalPriceWithTaxes = price * (1 + taxes / 100);
        return sum + (finalPriceWithTaxes * item.quantity);
    }, 0);

    const total = finalSubtotal + shippingCost;
    
    if(subtotalEl) subtotalEl.textContent = `$${finalSubtotal.toFixed(2)}`;
    if(shippingEl) shippingEl.textContent = `$${shippingCost.toFixed(2)}`;
    if(totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

    if (summaryItemsEl) {
        summaryItemsEl.innerHTML = cart.length === 0 
            ? '<p class="text-sm text-gray-500">No hay productos.</p>' 
            : cart.map(item => {
                const price = item.sale_price || item.base_price;
                const taxes = item.taxes || 0;
                const finalPriceWithTaxes = price * (1 + taxes / 100);
                const itemSubtotal = finalPriceWithTaxes * item.quantity;
                return `<li class="flex justify-between text-sm py-2 border-b"><div><span class="font-bold mr-2">${item.quantity}x</span><span>${item.name}</span></div><span>$${itemSubtotal.toFixed(2)}</span></li>`;
            }).join('');
    }
};
