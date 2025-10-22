import { createIcons, icons } from 'lucide'; 

// INICIO MODIFICACIÓN: Añadir botón cerrar visible
const modalHTML = `
  <div class="bg-white w-full max-w-sm h-full shadow-xl flex flex-col" 
       role="dialog" 
       aria-modal="true" 
       aria-labelledby="cart-modal-title" 
       tabindex="-1"> 
    <div class="p-6 flex justify-between items-center border-b">
        <h3 id="cart-modal-title" class="font-display text-2xl font-bold text-gray-800">Tu Carrito</h3>
        <button id="close-cart-btn" aria-label="Cerrar carrito de compras" class="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500">
          <i data-lucide="x" class="text-gray-500 pointer-events-none"></i>
        </button>
    </div>
    <ul id="cart-modal-items" class="p-6 flex-grow overflow-y-auto"></ul>
    <div class="p-6 border-t space-y-4">
        <div class="flex justify-between text-lg font-bold"><span>Subtotal:</span><span id="cart-modal-subtotal">$0.00</span></div>
        <button id="checkout-modal-btn" class="w-full bg-pink-500 text-white font-bold py-3 px-8 rounded-full hover:bg-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2">Finalizar Compra</button>
    </div>
  </div>
`;
// FIN MODIFICACIÓN

export const renderCartModal = (container) => {
    container.innerHTML = modalHTML;
    // La conexión del botón cerrar se hará en main.js donde se controla la visibilidad
};

export const updateCartModalContent = (cart, totals, callbacks) => {
  // ... (código interno sin cambios relevantes para foco, pero se mantienen aria-labels) ...
  const itemsContainer = document.getElementById('cart-modal-items');
  const subtotalEl = document.getElementById('cart-modal-subtotal');
  const checkoutBtn = document.getElementById('checkout-modal-btn');

  itemsContainer.innerHTML = '';

  if (totals.totalItems === 0) {
    itemsContainer.innerHTML = '<p class="text-gray-500">Tu carrito está vacío.</p>';
  } else {
    cart.forEach(item => {
      const imageUrl = item.images && item.images[0]
          ? (item.images[0].startsWith('http') ? item.images[0] : `http://localhost:3000/uploads/${item.images[0]}`)
          : 'https://placehold.co/100x100/FFF0F5/DB2777?text=Sin+Imagen'; 
      
      const price = item.sale_price || item.base_price;
      const taxes = item.taxes || 0;
      const finalPriceWithTaxes = price * (1 + taxes / 100);
      const itemSubtotal = finalPriceWithTaxes * item.quantity;
      
      const minQty = item.min_purchase_quantity || 1;
      const maxQty = item.max_purchase_quantity;

      const isMinReached = item.quantity <= minQty;
      const isMaxReached = maxQty && item.quantity >= maxQty;

      const li = document.createElement('li');
      li.className = "flex items-center justify-between py-2 border-b";
      li.innerHTML = `
        <img src="${imageUrl}" alt="${item.name || 'Producto del carrito'}" class="w-16 h-16 object-cover rounded-md">
        <div class="flex-grow mx-4">
          <p class="font-bold">${item.name}</p>
          <div class="flex items-center mt-2">
            <button class="w-6 h-6 rounded-full bg-gray-200 decrease-qty-btn focus:outline-none focus:ring-2 focus:ring-gray-400 ${isMinReached ? 'opacity-50 cursor-not-allowed' : ''}" data-id="${item.id}" aria-label="Disminuir cantidad de ${item.name || 'producto'}" ${isMinReached ? 'disabled' : ''}>-</button>
            <span class="mx-3" aria-live="polite">${item.quantity}</span>
            <button class="w-6 h-6 rounded-full bg-gray-200 increase-qty-btn focus:outline-none focus:ring-2 focus:ring-gray-400 ${isMaxReached ? 'opacity-50 cursor-not-allowed' : ''}" data-id="${item.id}" aria-label="Aumentar cantidad de ${item.name || 'producto'}" ${isMaxReached ? 'disabled' : ''}>+</button>
          </div>
        </div>
        <div class="text-right">
          <p class="font-bold">$${itemSubtotal.toFixed(2)}</p>
          <button class="text-red-500 mt-1 remove-item-btn focus:outline-none focus:ring-2 focus:ring-red-400 rounded p-0.5" data-id="${item.id}" aria-label="Eliminar ${item.name || 'producto'} del carrito">
            <i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i>
          </button>
        </div>`;
      
      itemsContainer.appendChild(li);
    });
  }
  
  const finalSubtotal = cart.reduce((sum, item) => {
      const price = item.sale_price || item.base_price;
      const taxes = item.taxes || 0;
      const finalPriceWithTaxes = price * (1 + taxes / 100);
      return sum + (finalPriceWithTaxes * item.quantity);
  }, 0);

  if (subtotalEl) subtotalEl.textContent = `$${finalSubtotal.toFixed(2)}`;
  if (checkoutBtn) checkoutBtn.disabled = totals.totalItems === 0;

  // Conexión de todos los botones
  itemsContainer.querySelectorAll('.increase-qty-btn').forEach(btn => btn.onclick = () => callbacks.increase(parseInt(btn.dataset.id)));
  itemsContainer.querySelectorAll('.decrease-qty-btn').forEach(btn => btn.onclick = () => callbacks.decrease(parseInt(btn.dataset.id)));
  itemsContainer.querySelectorAll('.remove-item-btn').forEach(btn => btn.onclick = () => callbacks.remove(parseInt(btn.dataset.id)));

  createIcons({ icons });
};

