import { createIcons, icons } from 'lucide';
import { showNotification } from './components/notification.js';
import { createOrderListItem } from './components/orderListItem.js';

const ordersApp = {
    apiBaseUrl: 'http://localhost:3000/api/orders',
    adminSecret: 'tu-clave-secreta-aqui',
    allOrders: [],
    viewState: {
        searchTerm: '',
        sortBy: 'date-desc',
        filters: {
            order_status: 'all',
            payment_status: 'all',
            shipping_status: 'all',
        },
    },

    init() {
        this.addEventListeners();
        this.loadOrders();
    },

    addEventListeners() {
        // VISTA DE LISTA
        document.getElementById('search-input').addEventListener('input', () => this.renderOrderList());
        document.getElementById('sort-date-btn').addEventListener('click', () => this.toggleSort('date'));
        document.getElementById('sort-total-btn').addEventListener('click', () => this.toggleSort('total'));
        document.querySelectorAll('.filter-dropdown').forEach(dd => {
            const toggle = dd.querySelector('.dropdown-toggle');
            const menu = dd.querySelector('.dropdown-menu');
            toggle.addEventListener('click', () => menu.classList.toggle('hidden'));
            menu.addEventListener('click', (e) => this.handleFilterChange(e));
        });
        document.addEventListener('click', (e) => { // Cierra menús al hacer clic afuera
            if (!e.target.closest('.filter-dropdown, .quick-status-dropdown')) {
                document.querySelectorAll('.dropdown-menu, .quick-status-menu').forEach(m => m.classList.add('hidden'));
            }
        });
        document.getElementById('order-list').addEventListener('click', this.handleListClick.bind(this));
        
        // VISTA DE FORMULARIO
        document.getElementById('order-form').addEventListener('submit', this.handleFormSubmit.bind(this));
        document.getElementById('cancel-edit-btn').addEventListener('click', () => this.showView('list'));
    },

    async loadOrders() {
        try {
            const response = await fetch(this.apiBaseUrl, { headers: { 'x-admin-secret': this.adminSecret } });
            if (!response.ok) throw new Error('No se pudieron cargar los pedidos.');
            this.allOrders = await response.json();
            this.renderOrderList();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    },

    renderOrderList() {
        const listContainer = document.getElementById('order-list');
        listContainer.innerHTML = '';
        
        const filtered = this.applyFiltersAndSorting();

        if (filtered.length === 0) {
            listContainer.innerHTML = '<li><p class="text-gray-500 text-center py-4">No se encontraron pedidos con estos filtros.</p></li>';
            return;
        }

        filtered.forEach(order => {
            const listItem = createOrderListItem(order);
            listContainer.appendChild(listItem);
        });
        createIcons({ icons });
    },
    
    applyFiltersAndSorting() {
        let filtered = [...this.allOrders];
        // Búsqueda
        const term = document.getElementById('search-input').value.toLowerCase();
        if (term) {
            filtered = filtered.filter(o => `${o.customer_firstName} ${o.customer_lastName}`.toLowerCase().includes(term));
        }
        // Filtros de estado
        for (const key in this.viewState.filters) {
            if (this.viewState.filters[key] !== 'all') {
                filtered = filtered.filter(o => o[key] === this.viewState.filters[key]);
            }
        }
        // Ordenamiento
        switch (this.viewState.sortBy) {
            case 'date-desc': filtered.sort((a, b) => new Date(b.order_date) - new Date(a.order_date)); break;
            case 'date-asc': filtered.sort((a, b) => new Date(a.order_date) - new Date(b.order_date)); break;
            case 'total-desc': filtered.sort((a, b) => b.total_amount - a.total_amount); break;
            case 'total-asc': filtered.sort((a, b) => a.total_amount - b.total_amount); break;
        }
        return filtered;
    },

    toggleSort(type) {
        const current = this.viewState.sortBy;
        this.viewState.sortBy = current === `${type}-desc` ? `${type}-asc` : `${type}-desc`;
        this.renderOrderList();
    },

    handleFilterChange(e) {
        e.preventDefault();
        const link = e.target.closest('a');
        if (!link) return;
        
        const { filterType, filterValue } = link.dataset;
        this.viewState.filters[filterType] = filterValue;
        
        const dropdown = link.closest('.filter-dropdown');
        const label = dropdown.querySelector('.dropdown-label');
        label.textContent = link.textContent;
        dropdown.querySelector('.dropdown-menu').classList.add('hidden');
        
        this.renderOrderList();
    },

    handleListClick(e) {
        const target = e.target;
        const orderItem = target.closest('li[data-order-id]');
        if (!orderItem) return;
        const orderId = orderItem.dataset.orderId;

        if (target.closest('.edit-order-btn')) {
            this.editOrder(orderId);
        } else if (target.closest('.delete-order-btn')) {
            this.deleteOrder(orderId);
        } else if (target.closest('.quick-status-toggle')) {
            e.stopPropagation();
            const menu = orderItem.querySelector('.quick-status-menu');
            document.querySelectorAll('.quick-status-menu').forEach(m => m.classList.add('hidden'));
            menu.classList.toggle('hidden');
        } else if (target.closest('.quick-status-menu a')) {
            e.preventDefault();
            const newStatus = target.dataset.status;
            this.updateOrderStatus(orderId, newStatus);
        }
    },

    showView(viewName) {
        document.getElementById('list-view').classList.toggle('hidden', viewName !== 'list');
        document.getElementById('form-view').classList.toggle('hidden', viewName !== 'form');
        window.scrollTo(0, 0);
    },

    editOrder(id) {
        const order = this.allOrders.find(o => o.id == id);
        if (!order) return;
        
        document.getElementById('orderId').value = order.id;
        document.getElementById('order-id-display').textContent = order.id;
        
        // Poblar formulario
        document.getElementById('customer_firstName').value = order.customer_firstName;
        document.getElementById('customer_lastName').value = order.customer_lastName;
        document.getElementById('customer_dni').value = order.customer_dni || '';
        document.getElementById('customer_email').value = order.customer_email || '';
        document.getElementById('customer_phone').value = order.customer_phone || '';
        document.getElementById('shipping_address').value = order.shipping_address || '';
        document.getElementById('shipping_city').value = order.shipping_city || '';
        document.getElementById('shipping_zip').value = order.shipping_zip || '';
        document.getElementById('payment_status').value = order.payment_status;
        document.getElementById('shipping_status').value = order.shipping_status;
        
        this.showView('form');
    },

    async handleFormSubmit(e) {
        e.preventDefault();
        const orderId = document.getElementById('orderId').value;
        const formData = {
            customer_firstName: document.getElementById('customer_firstName').value,
            customer_lastName: document.getElementById('customer_lastName').value,
            customer_dni: document.getElementById('customer_dni').value,
            customer_email: document.getElementById('customer_email').value,
            customer_phone: document.getElementById('customer_phone').value,
            shipping_address: document.getElementById('shipping_address').value,
            shipping_city: document.getElementById('shipping_city').value,
            shipping_zip: document.getElementById('shipping_zip').value,
            payment_status: document.getElementById('payment_status').value,
            shipping_status: document.getElementById('shipping_status').value,
        };

        try {
            const response = await fetch(`${this.apiBaseUrl}/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-admin-secret': this.adminSecret },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Error al guardar.');
            
            showNotification(result.message, 'success');
            await this.loadOrders();
            this.showView('list');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    },

    async updateOrderStatus(id, status) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'x-admin-secret': this.adminSecret },
                body: JSON.stringify({ order_status: status })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            showNotification(result.message, 'success');
            await this.loadOrders();
        } catch (error) {
            showNotification(`Error: ${error.message}`, 'error');
        }
    },

    async deleteOrder(id) {
        if (!confirm(`¿Estás seguro de que quieres eliminar el pedido #${id}? Esta acción no se puede deshacer.`)) return;
        try {
            const response = await fetch(`${this.apiBaseUrl}/${id}`, {
                method: 'DELETE',
                headers: { 'x-admin-secret': this.adminSecret }
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            showNotification(result.message, 'success');
            await this.loadOrders();
        } catch (error) {
            showNotification(`Error: ${error.message}`, 'error');
        }
    },
};

ordersApp.init();

