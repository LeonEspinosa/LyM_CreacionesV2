import { createIcons, icons } from 'lucide';
import { showNotification } from './components/notification.js';
import { createZoneListItem } from './components/shippingZoneListItem.js';
import { API_BASE_URL, AUTH_TOKEN_KEY } from '../src/config.js'; // <-- Importar config

// --- INICIO: VERIFICACIÓN DE AUTENTICACIÓN ---
const token = localStorage.getItem(AUTH_TOKEN_KEY);
if (!token) {
    window.location.href = '/admin-login.html';
    throw new Error("No autenticado. Redirigiendo al login."); 
}
// --- FIN: VERIFICACIÓN DE AUTENTICACIÓN ---

const shippingApp = {
    apiBaseUrl: `${API_BASE_URL}/api/shipping`, // <-- Usar constante
    //adminSecret: 'tu-clave-secreta-aqui',
    allZones: [], // Almacenará todas las zonas para filtrar en el frontend

    // --- FUNCIÓN AUXILIAR PARA OBTENER HEADERS CON TOKEN ---
    getAuthHeaders() {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        return {
            'Authorization': `Bearer ${token}`,
        };
    },
    
    init() {
        this.addEventListeners();
        this.loadZones();
        createIcons({ icons }); // Para los íconos estáticos de la página
    },

    addEventListeners() {
        document.getElementById('zone-form').addEventListener('submit', this.handleFormSubmit.bind(this));
        document.getElementById('cancel-edit-btn').addEventListener('click', () => this.resetForm());
        document.getElementById('zone-list').addEventListener('click', this.handleListClick.bind(this));
        document.getElementById('search-btn').addEventListener('click', () => this.renderZoneList());
        document.getElementById('search-input').addEventListener('keyup', () => this.renderZoneList());
    },

    async loadZones() {
        try {
            // --- MODIFICADO: Añadir cabecera ---
            const response = await fetch(this.apiBaseUrl, { headers: this.getAuthHeaders() });
            // --- FIN MODIFICACIÓN ---
            if (!response.ok) { //... (manejo de errores igual que antes, incluyendo redirección) ...
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem(AUTH_TOKEN_KEY);
                    window.location.href = '/admin-login.html';
                }
                throw new Error('No se pudieron cargar las zonas de envío.');
            }
            this.allZones = await response.json();
            this.renderZoneList();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    },

    renderZoneList() {
        const listContainer = document.getElementById('zone-list');
        listContainer.innerHTML = '';

        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const filteredZones = this.allZones.filter(zone => {
            const postalCode = parseInt(searchTerm, 10);
            const nameMatch = zone.zone_name.toLowerCase().includes(searchTerm);
            const provinceMatch = zone.province && zone.province.toLowerCase().includes(searchTerm);
            const codeMatch = !isNaN(postalCode) && (postalCode >= zone.postal_code_start && postalCode <= zone.postal_code_end);
            return nameMatch || provinceMatch || codeMatch;
        });

        if (filteredZones.length === 0) {
            listContainer.innerHTML = '<li><p class="text-gray-500">No se encontraron zonas.</p></li>';
            return;
        }

        filteredZones.forEach(zone => {
            const listItem = createZoneListItem(zone);
            listContainer.appendChild(listItem);
        });

        // --- INICIO DE LA CORRECCIÓN ---
        // Llamamos a createIcons UNA SOLA VEZ, después de que todos los items
        // han sido añadidos al DOM.
        createIcons({ icons });
        // --- FIN DE LA CORRECCIÓN ---
    },

    async handleFormSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('zoneId').value;
        const zoneData = {
            zone_name: document.getElementById('zone_name').value,
            province: document.getElementById('province').value,
            postal_code_start: document.getElementById('postal_code_start').value || null,
            postal_code_end: document.getElementById('postal_code_end').value || null,
            base_cost: parseFloat(document.getElementById('base_cost').value),
            estimated_days: parseInt(document.getElementById('estimated_days').value) || null,
            carrier: document.getElementById('carrier').value,
            active: document.getElementById('active').checked,
        };

        const url = id ? `${this.apiBaseUrl}/${id}` : this.apiBaseUrl;
        const method = id ? 'PUT' : 'POST';

        try {
            // --- MODIFICADO: Añadir cabeceras ---
            const response = await fetch(url, {
                method,
                headers: { 
                    ...this.getAuthHeaders(), 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(zoneData)
            });
            // --- FIN MODIFICACIÓN ---
            const result = await response.json();
            if (!response.ok) { //... (manejo de errores igual que antes, incluyendo redirección) ...
                 if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem(AUTH_TOKEN_KEY);
                    window.location.href = '/admin-login.html';
                }
                throw new Error(result.error || 'Error al guardar.');
            }
            
            showNotification(result.message, 'success');
            this.resetForm();
            this.loadZones();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    },

    handleListClick(e) {
        const button = e.target.closest('button');
        if (!button) return;

        const li = button.closest('li');
        const zoneId = li.dataset.zoneId;

        if (button.classList.contains('edit-btn')) {
            this.editZone(zoneId);
        } else if (button.classList.contains('delete-btn')) {
            this.deleteZone(zoneId);
        }
    },

    editZone(id) {
        const zone = this.allZones.find(z => z.id == id);
        if (!zone) return;

        document.getElementById('form-title').textContent = 'Editando Zona';
        document.getElementById('zoneId').value = zone.id;
        document.getElementById('zone_name').value = zone.zone_name;
        document.getElementById('province').value = zone.province || '';
        document.getElementById('postal_code_start').value = zone.postal_code_start || '';
        document.getElementById('postal_code_end').value = zone.postal_code_end || '';
        document.getElementById('base_cost').value = zone.base_cost;
        document.getElementById('estimated_days').value = zone.estimated_days || '';
        document.getElementById('carrier').value = zone.carrier || '';
        document.getElementById('active').checked = zone.active;
        window.scrollTo(0, 0);
    },

    async deleteZone(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta zona de envío?')) return;
        try {
            // --- MODIFICADO: Añadir cabecera ---
            const response = await fetch(`${this.apiBaseUrl}/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            // --- FIN MODIFICACIÓN ---
            const result = await response.json();
            if (!response.ok) { //... (manejo de errores igual que antes, incluyendo redirección) ...
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem(AUTH_TOKEN_KEY);
                    window.location.href = '/admin-login.html';
                }
                throw new Error(result.error || 'Error al eliminar.');
            }
            showNotification(result.message, 'success');
            this.loadZones();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    },

    resetForm() {
        document.getElementById('zone-form').reset();
        document.getElementById('form-title').textContent = 'Añadir Nueva Zona';
        document.getElementById('zoneId').value = '';
    }
};

// --- MODIFICADO: Inicializar en DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    try {
        shippingApp.init();
    } catch (error) {
        console.warn("Inicialización detenida debido a redirección por autenticación.");
    }
});

