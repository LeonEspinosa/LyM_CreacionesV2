import { createIcons, icons } from 'lucide';
import { showNotification } from './components/notification.js';
import { createProductListItem } from './components/productListItem.js';
import './admin-style.css';

const adminApp = {
    apiBaseUrl: 'http://localhost:3000',
    products: [],
    imagesToUpload: [],
    viewState: {
        searchTerm: '',
        sortOrder: 'asc'
    },

    init() {
        this.addEventListeners();
        this.loadProducts();
        createIcons({ icons });
        this.showView('list-view'); // Asegurarnos de que la vista inicial sea la lista
    },

    // --- NUEVA FUNCIÓN PARA CAMBIAR DE VISTA ---
    showView(viewId) {
        document.getElementById('list-view').classList.add('hidden');
        document.getElementById('form-view').classList.add('hidden');
        
        const viewToShow = document.getElementById(viewId);
        if (viewToShow) {
            viewToShow.classList.remove('hidden');
        }
    },

    addEventListeners() {
        document.getElementById('product-form').addEventListener('submit', this.handleFormSubmit.bind(this));
        document.getElementById('cancel-edit-btn').addEventListener('click', () => {
            this.resetForm();
            this.showView('list-view');
        });
        document.getElementById('add-product-btn').addEventListener('click', () => {
            this.resetForm();
            document.getElementById('form-title').innerText = 'Añadir Nuevo Producto';
            this.showView('form-view');
        });
        document.getElementById('product-list').addEventListener('click', this.handleProductListClick.bind(this));
        document.getElementById('image-files').addEventListener('change', this.handleImagePreview.bind(this));
        document.getElementById('refresh-products-btn').addEventListener('click', () => this.loadProducts());
        
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.viewState.searchTerm = e.target.value;
            this.renderProductList();
        });

        document.getElementById('sort-stock-btn').addEventListener('click', () => {
            this.viewState.sortOrder = this.viewState.sortOrder === 'asc' ? 'desc' : 'asc';
            this.renderProductList();
        });

        ['base_price', 'sale_price', 'taxes'].forEach(id => {
            document.getElementById(id).addEventListener('input', this.updateCalculatedPrices);
        });
        document.getElementById('has_production_time').addEventListener('change', (e) => {
            document.getElementById('production-time-container').classList.toggle('hidden', !e.target.checked);
        });
    },
    
    async loadProducts() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/products?all=true`, { 
                headers: { 'x-admin-secret': 'tu-clave-secreta-aqui' } 
            });
            if (!response.ok) throw new Error((await response.json()).error);
            this.products = await response.json();
            this.renderProductList();
        } catch (error) { 
            showNotification(`Error al cargar productos: ${error.message}`, 'error'); 
        }
    },

    renderProductList() {
        let filteredProducts = this.products.filter(p => {
            const searchTerm = this.viewState.searchTerm.toLowerCase();
            const nameMatch = p.name.toLowerCase().includes(searchTerm);
            const categoryMatch = Array.isArray(p.category) && p.category.some(cat => cat.toLowerCase().includes(searchTerm));
            return nameMatch || categoryMatch;
        });

        filteredProducts.sort((a, b) => {
            return this.viewState.sortOrder === 'asc' ? a.stock - b.stock : b.stock - a.stock;
        });

        const listContainer = document.getElementById('product-list');
        listContainer.innerHTML = ''; 
        if (!filteredProducts.length) { 
            listContainer.innerHTML = '<li><p>No se encontraron productos que coincidan con la búsqueda.</p></li>';
            return;
        }

        filteredProducts.forEach(p => listContainer.appendChild(createProductListItem(p, this.apiBaseUrl)));
        createIcons({ icons });
    },

    handleProductListClick(event) {
        const button = event.target.closest('button');
        if (!button) return;

        const li = button.closest('li');
        const productId = li.dataset.productId;

        if (button.classList.contains('edit-btn')) {
            this.editProduct(productId);
        } else if (button.classList.contains('delete-btn')) {
            this.deleteProduct(productId);
        } else if (button.classList.contains('update-stock-btn')) {
            this.handleStockUpdate(productId, li);
        }
    },

    async handleFormSubmit(event) {
        event.preventDefault();
        const id = document.getElementById('productId').value;
        const headers = { 'x-admin-secret': 'tu-clave-secreta-aqui' };

        let uploadedFilenames = document.getElementById('image-urls').value.split(',').filter(Boolean);

        if (this.imagesToUpload.length > 0) {
            const formData = new FormData();
            this.imagesToUpload.forEach(fileObj => formData.append('images', fileObj.file));
            try {
                const uploadRes = await fetch(`${this.apiBaseUrl}/api/upload`, { method: 'POST', headers, body: formData });
                if (!uploadRes.ok) throw new Error('Error subiendo imágenes.');
                
                const uploadData = await uploadRes.json();
                uploadedFilenames = [...uploadedFilenames, ...uploadData.filenames];
            } catch (error) {
                showNotification(`Error de red al subir imágenes: ${error.message}`, 'error');
                return;
            }
        }
        
        // El resto de la función es igual, pero al final volvemos a la lista
        const productData = { /* ... (código de recolección de datos del formulario igual que antes) ... */
             name: document.getElementById('name').value,
             short_description: document.getElementById('short_description').value,
             long_description: document.getElementById('long_description').value,
             images: uploadedFilenames,
             video_url: document.getElementById('video_url').value,
             category: document.getElementById('category').value.split(',').map(c => c.trim()).filter(Boolean),
             status: document.getElementById('status').value,
             enabled: document.getElementById('enabled').checked,
             stock: parseInt(document.getElementById('stock').value) || 0,
             base_price: parseFloat(document.getElementById('base_price').value) || 0,
             sale_price: document.getElementById('sale_price').value ? parseFloat(document.getElementById('sale_price').value) : null,
             cost_price: document.getElementById('cost_price').value ? parseFloat(document.getElementById('cost_price').value) : null,
             taxes: parseFloat(document.getElementById('taxes').value) || 0,
             currency: 'ARS',
             min_purchase_quantity: parseInt(document.getElementById('min_purchase_quantity').value) || 1,
             max_purchase_quantity: document.getElementById('max_purchase_quantity').value ? parseInt(document.getElementById('max_purchase_quantity').value) : null,
             weight: document.getElementById('weight').value ? parseFloat(document.getElementById('weight').value) : null,
             dimensions: document.getElementById('dimensions').value,
             customizable: document.getElementById('customizable').checked,
             has_production_time: document.getElementById('has_production_time').checked,
             production_time_hours: document.getElementById('has_production_time').checked ? (document.getElementById('production_time_hours').value ? parseInt(document.getElementById('production_time_hours').value) : null) : null,
             restock_time: document.getElementById('restock_time').value ? parseInt(document.getElementById('restock_time').value) : null,
             featured: document.getElementById('featured').checked,
        };
        
        const url = id ? `${this.apiBaseUrl}/api/products/${id}` : `${this.apiBaseUrl}/api/products`;
        const method = id ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, { 
                method, 
                headers: { ...headers, 'Content-Type': 'application/json' }, 
                body: JSON.stringify(productData) 
            });
            if (!res.ok) {
                const errorData = await res.json(); 
                throw new Error(errorData.error || `Error del servidor: ${res.status}`);
            }
            showNotification(`Producto ${id ? 'actualizado' : 'creado'} con éxito.`, 'success');
            
            // --- MODIFICADO: Al éxito, volvemos a la lista ---
            this.resetForm(); 
            await this.loadProducts();
            this.showView('list-view');

        } catch (error) { 
            showNotification(`No se pudo guardar: ${error.message}`, 'error'); 
        }
    },

    editProduct(id) {
        const product = this.products.find(p => p.id == id);
        if (!product) return;
        
        this.resetForm(); // Limpiamos el form antes de llenarlo
        document.getElementById('form-title').innerText = 'Editando Producto';
        document.getElementById('productId').value = product.id;
        
        // ... (código para rellenar el formulario igual que antes) ...
        Object.keys(product).forEach(key => {
             const el = document.getElementById(key);
             if (el) {
                 if (el.type === 'checkbox') {
                     el.checked = !!product[key];
                 } else if(key === 'category') {
                     el.value = product[key] ? product[key].join(', ') : '';
                 } else {
                     el.value = product[key] == null ? '' : product[key];
                 }
             }
         });
        
        document.getElementById('has_production_time').dispatchEvent(new Event('change'));
        this.updateCalculatedPrices();

        document.getElementById('image-urls').value = product.images ? product.images.join(',') : '';
        const previewContainer = document.getElementById('image-preview');
        if(product.images) {
            product.images.forEach(imageUrl => {
                const div = document.createElement('div');
                div.className = 'image-preview-item w-20 h-20';
                const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${this.apiBaseUrl}/uploads/${imageUrl}`;
                div.innerHTML = `<img src="${fullUrl}" class="w-full h-full object-cover rounded-md"><button type="button" class="remove-btn">&times;</button>`;
                previewContainer.appendChild(div);
                div.querySelector('.remove-btn').addEventListener('click', () => {
                    const urls = document.getElementById('image-urls').value.split(',');
                    document.getElementById('image-urls').value = urls.filter(u => u !== imageUrl).join(',');
                    div.remove();
                });
            });
        }
        
        // --- MODIFICADO: Mostramos la vista del formulario ---
        this.showView('form-view');
        window.scrollTo(0, 0);
    },
    
    resetForm() {
        document.getElementById('product-form').reset();
        document.getElementById('productId').value = '';
        document.getElementById('image-preview').innerHTML = '';
        document.getElementById('image-urls').value = '';
        this.imagesToUpload = [];
        document.getElementById('taxes').value = '21';
        this.updateCalculatedPrices();
        document.getElementById('has_production_time').dispatchEvent(new Event('change'));
        // Ya no cambiamos de vista aquí, solo reseteamos el contenido.
    },
    
    // El resto de funciones (deleteProduct, handleStockUpdate, handleImagePreview, etc.) no necesitan cambios.
    async deleteProduct(id) {
         if (!confirm('¿Estás seguro? Se eliminará el producto permanentemente.')) return;
         try {
             const res = await fetch(`${this.apiBaseUrl}/api/products/${id}`, { method: 'DELETE', headers: { 'x-admin-secret': 'tu-clave-secreta-aqui' } });
             if (!res.ok) throw new Error('Error del servidor.');
             showNotification('Producto eliminado.', 'success');
             await this.loadProducts();
         } catch (error) { showNotification(`No se pudo eliminar: ${error.message}`, 'error'); }
     },

     handleImagePreview(event) {
         const previewContainer = document.getElementById('image-preview');
         for (const file of event.target.files) {
             const fileId = Date.now() + Math.random();
             this.imagesToUpload.push({ id: fileId, file: file });
             const reader = new FileReader();
             reader.onload = (e) => {
                 const div = document.createElement('div');
                 div.className = 'image-preview-item w-20 h-20';
                 div.dataset.fileId = fileId;
                 div.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover rounded-md"><button type="button" class="remove-btn">&times;</button>`;
                 previewContainer.appendChild(div);
                 div.querySelector('.remove-btn').addEventListener('click', () => {
                     this.imagesToUpload = this.imagesToUpload.filter(f => f.id !== fileId);
                     div.remove();
                 });
             };
             reader.readAsDataURL(file);
         }
     },
     
     async handleStockUpdate(productId, listItemElement) {
         const input = listItemElement.querySelector('.stock-change-input');
         const changeAmount = parseInt(input.value, 10);

         if (isNaN(changeAmount)) {
             showNotification('Por favor, introduce un número válido (ej: 10 o -5).', 'error');
             return;
         }

         try {
             const response = await fetch(`${this.apiBaseUrl}/api/products/${productId}/stock`, {
                 method: 'PATCH',
                 headers: {
                     'Content-Type': 'application/json',
                     'x-admin-secret': 'tu-clave-secreta-aqui'
                 },
                 body: JSON.stringify({ change: changeAmount })
             });

             const result = await response.json();
             if (!response.ok) throw new Error(result.error || 'Error del servidor');

             showNotification('Stock actualizado con éxito.', 'success');
             
             const stockDisplay = listItemElement.querySelector('.stock-display');
             stockDisplay.textContent = result.newStock;
             input.value = ''; 

             const product = this.products.find(p => p.id == productId);
             if (product) product.stock = result.newStock;

         } catch (error) {
             showNotification(`Error al actualizar stock: ${error.message}`, 'error');
         }
     },
     
     updateCalculatedPrices() {
         const basePrice = parseFloat(document.getElementById('base_price').value) || 0;
         const salePrice = parseFloat(document.getElementById('sale_price').value) || 0;
         const taxes = parseFloat(document.getElementById('taxes').value) || 0;

         let discount = 0;
         if (basePrice > 0 && salePrice > 0 && salePrice < basePrice) {
             discount = ((basePrice - salePrice) / basePrice) * 100;
         }
         document.getElementById('discount_percentage').value = discount > 0 ? `${discount.toFixed(2)}%` : '0%';

         const priceToCalculate = salePrice > 0 && salePrice < basePrice ? salePrice : basePrice;
         const finalPrice = priceToCalculate * (1 + taxes / 100);
         document.getElementById('final_price').value = `$${finalPrice.toFixed(2)}`;
     }
};

document.addEventListener('DOMContentLoaded', () => {
    adminApp.init();
});

