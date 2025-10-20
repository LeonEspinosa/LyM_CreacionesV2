/**
 * Crea el elemento HTML para un ítem de pedido en la lista de administración.
 * @param {object} order - El objeto del pedido con todos sus datos.
 * @returns {HTMLElement} El elemento <li> de la tarjeta del pedido.
 */
export function createOrderListItem(order) {
    const li = document.createElement('li');
    li.className = "bg-white border rounded-lg shadow-sm";
    li.dataset.orderId = order.id;

    const statusColors = {
        'pendiente': 'bg-gray-200 text-gray-800',
        'confirmado': 'bg-blue-100 text-blue-800',
        'en proceso': 'bg-yellow-100 text-yellow-800',
        'entregado': 'bg-green-100 text-green-800',
        'cancelado': 'bg-red-100 text-red-800'
    };
    const statusText = order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1);

    const paymentStatusColors = {
        'pendiente': 'text-yellow-600',
        'pagado': 'text-green-600',
        'fallido': 'text-red-600',
        'reembolsado': 'text-blue-600'
    };

    li.innerHTML = `
        <div class="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <!-- Información Principal del Pedido -->
            <div class="flex-grow min-w-0 mb-4 sm:mb-0">
                <div class="flex items-center gap-3">
                    <p class="font-bold text-gray-800">Pedido #${order.id}</p>
                    <span class="px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[order.order_status] || 'bg-gray-100'}">${statusText}</span>
                </div>
                <p class="text-sm text-gray-600">${order.customer_firstName} ${order.customer_lastName}</p>
                <p class="text-xs text-gray-500 mt-1">${new Date(order.order_date).toLocaleString('es-AR')}</p>
            </div>

            <!-- Información Financiera y de Pago -->
            <div class="text-left sm:text-right flex-shrink-0 w-full sm:w-auto">
                 <p class="font-bold text-lg text-pink-600">$${order.total_amount.toFixed(2)}</p>
                 <p class="text-sm font-semibold ${paymentStatusColors[order.payment_status] || 'text-gray-600'}">${order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}</p>
            </div>
        </div>
        
        <!-- Barra de Acciones -->
        <div class="bg-gray-50 border-t p-2 flex items-center justify-end gap-2">
            <!-- Menú Rápido para Cambiar Estado -->
            <div class="relative quick-status-dropdown">
                <button class="quick-status-toggle flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-black px-3 py-1 rounded-md hover:bg-gray-200">
                    <span>Cambiar Estado</span>
                    <i data-lucide="chevron-down" class="w-4 h-4"></i>
                </button>
                <div class="quick-status-menu hidden absolute right-0 bottom-full mb-2 w-48 bg-white rounded-md shadow-lg z-20 border">
                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-status="pendiente">Pendiente</a>
                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-status="confirmado">Confirmado</a>
                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-status="en proceso">En Proceso</a>
                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-status="entregado">Entregado</a>
                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-status="cancelado">Cancelado</a>
                </div>
            </div>

            <button aria-label="Editar Pedido" class="p-2 text-blue-600 hover:bg-blue-100 rounded-full edit-order-btn">
                <i data-lucide="pencil" class="w-5 h-5 pointer-events-none"></i>
            </button>
            <button aria-label="Eliminar Pedido" class="p-2 text-red-600 hover:bg-red-100 rounded-full delete-order-btn">
                <i data-lucide="trash-2" class="w-5 h-5 pointer-events-none"></i>
            </button>
        </div>
    `;
    return li;
}

