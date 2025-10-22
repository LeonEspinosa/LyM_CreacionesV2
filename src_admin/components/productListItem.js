import { createIcons, icons } from 'lucide';

export const createProductListItem = (product, apiBaseUrl) => {
    const li = document.createElement('li');
    li.className = `p-4 border rounded-md hover:bg-gray-50 ${!product.enabled ? 'opacity-50 bg-gray-100' : 'bg-white'}`;
    li.dataset.productId = product.id;

    const statusColors = {
        'activo': 'bg-green-100 text-green-800',
        'inactivo': 'bg-gray-200 text-gray-800',
        'agotado': 'bg-yellow-100 text-yellow-800'
    };
    const statusBadge = `<span class="px-2 py-1 text-xs font-medium rounded-full ${statusColors[product.status] || 'bg-gray-100'}">${product.status}</span>`;
    
    const imageUrl = product.images && product.images[0]
        ? (product.images[0].startsWith('http') ? product.images[0] : `${apiBaseUrl}/uploads/${product.images[0]}`)
        : 'https://placehold.co/100x100';

    li.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-4 min-w-0">
                <!-- Línea ~18: Modificar el atributo alt -->
                <img src="${imageUrl}" alt="Miniatura de ${product.name}" class="w-16 h-16 object-cover rounded-md flex-shrink-0">
                <div class="min-w-0">
                    <p class="font-bold text-gray-800 truncate">${product.name}</p>
                    <p class="text-sm text-gray-600 font-bold text-pink-600">$${(product.final_price || 0).toFixed(2)}</p>
                    <div class="flex items-center gap-2 mt-1">
                        ${statusBadge}
                        <span class="text-xs text-gray-500">Stock: <span class="font-bold stock-display">${product.stock}</span></span>
                    </div>
                </div>
            </div>
            <div class="flex gap-2 flex-shrink-0">
                <!-- Línea ~31: Modificar el botón de editar -->
                <button aria-label="Editar ${product.name}" class="p-2 text-blue-600 hover:bg-blue-100 rounded-full edit-btn"><i data-lucide="pencil" class="pointer-events-none"></i></button>
                <!-- Línea ~33: Modificar el botón de eliminar -->
                <button aria-label="Eliminar ${product.name}" class="p-2 text-red-600 hover:bg-red-100 rounded-full delete-btn"><i data-lucide="trash-2" class="pointer-events-none"></i></button>
            </div>
        </div>
        <!-- Sección de Stock -->
        <div class="mt-3 pt-3 border-t flex items-center gap-2">
             <!-- Línea ~39: Modificar el input de stock -->
            <input type="number" class="w-24 p-1 border border-gray-300 rounded-md text-sm stock-change-input" placeholder="Ej: 10 o -5" aria-label="Cantidad a agregar o quitar al stock de ${product.name}">
            <button class="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-semibold update-stock-btn">Actualizar</button>
        </div>`;

    return li;
};

