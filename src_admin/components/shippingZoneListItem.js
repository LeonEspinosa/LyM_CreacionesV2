export function createZoneListItem(zone) {
    const li = document.createElement('li');
    li.className = `p-3 border rounded-md flex items-center justify-between hover:bg-gray-50 ${!zone.active ? 'opacity-50 bg-gray-100' : ''}`;
    li.dataset.zoneId = zone.id;

    const statusIndicator = zone.active
        ? '<span class="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0" title="Activa"></span>'
        : '<span class="w-2 h-2 bg-gray-400 rounded-full mr-3 flex-shrink-0" title="Inactiva"></span>';

    li.innerHTML = `
        <div class="flex items-center min-w-0">
            ${statusIndicator}
            <div class="min-w-0">
                <p class="font-bold text-gray-800 truncate">${zone.zone_name}</p>
                <p class="text-sm text-gray-500 truncate">${zone.province || 'Sin provincia'}</p>
                <div class="text-xs text-gray-600 mt-1">
                    <span>CP: ${zone.postal_code_start || '?'} - ${zone.postal_code_end || '?'}</span> |
                    <span class="font-semibold text-pink-600 ml-1">$${zone.base_cost.toFixed(2)}</span>
                </div>
            </div>
        </div>
        <div class="flex gap-2 flex-shrink-0 ml-4">
            <button aria-label="Editar" class="p-2 text-blue-600 hover:bg-blue-100 rounded-full edit-btn"><i data-lucide="pencil"></i></button>
            <button aria-label="Eliminar" class="p-2 text-red-600 hover:bg-red-100 rounded-full delete-btn"><i data-lucide="trash-2"></i></button>
        </div>
    `;

    // Se ha eliminado la llamada a createIcons de aquí.
    return li;
}

