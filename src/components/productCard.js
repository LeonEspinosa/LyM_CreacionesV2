/**
 * Mantenimiento a Largo Plazo: Componente reutilizable para una tarjeta de producto.
 * Es una función "pura": recibe datos y devuelve HTML.
 */

/**
 * Crea el elemento HTML para una tarjeta de producto.
 * @param {object} product - El objeto del producto con sus datos.
 * @param {function} onProductClick - Función que se ejecuta al hacer clic en el link del producto.
 * @param {function} onAddToCartClick - Función que se ejecuta al hacer clic en el botón "Añadir".
 * @returns {HTMLElement} El elemento <li> de la tarjeta de producto.
 */
export const createProductCard = (product, onProductClick, onAddToCartClick) => {
    const li = document.createElement('li');
    li.className = "bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 relative group";
    li.dataset.productId = product.id;

    const confirmationDiv = document.createElement('div');
    confirmationDiv.className = "add-to-cart-confirmation absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 pointer-events-none";
    confirmationDiv.innerHTML = `<span class="bg-white text-pink-500 font-bold py-2 px-4 rounded-full flex items-center"><i data-lucide="check" class="mr-2"></i>¡Agregado!</span>`;
    
    const productLink = document.createElement('a');
    productLink.href = '#';
    productLink.className = "block cursor-pointer";
    productLink.onclick = (e) => { e.preventDefault(); onProductClick(product.id); };

    const firstImage = product.images && product.images.length > 0 ? product.images[0] : null;
    const imageUrl = firstImage 
        ? (firstImage.startsWith('http') ? firstImage : `http://localhost:3000/uploads/${firstImage}`) 
        : 'https://placehold.co/640x360/FFF0F5/DB2777?text=Sin+Imagen';
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = product.name;
    img.loading = "lazy";
    img.className = "w-full h-56 object-cover";

    const contentDiv = document.createElement('div');
    contentDiv.className = "p-6 text-center";
    
    const nameH4 = document.createElement('h4');
    nameH4.className = "font-bold text-lg text-gray-800 truncate";
    nameH4.textContent = product.name;

    productLink.append(img);
    contentDiv.append(nameH4);

    const priceP = document.createElement('p');
    priceP.className = "text-gray-600 mt-2";
    const displayPrice = product.sale_price || product.base_price;
    priceP.textContent = `$${(displayPrice || 0).toFixed(2)}`;
    contentDiv.append(priceP);

    if (product.customizable) {
        const customizableTag = document.createElement('p');
        customizableTag.className = "text-green-600 font-semibold text-sm mt-2";
        customizableTag.innerHTML = `<i data-lucide="sparkles" class="inline-block w-4 h-4 mr-1"></i>¡Es personalizable!`;
        contentDiv.appendChild(customizableTag);
    }

    const actionsDiv = document.createElement('div');
    actionsDiv.className = "mt-4 flex items-center justify-center gap-2";
    const quantityInput = document.createElement('input');
    quantityInput.type = "number";
    // CORRECCIÓN: Se añadió la clase 'quantity-input' que faltaba.
    quantityInput.className = "w-16 text-center border-gray-300 rounded-full shadow-sm quantity-input";
    quantityInput.value = "1";
    quantityInput.min = "1";
    
    const addButton = document.createElement('button');
    addButton.className = "flex-grow bg-pink-100 text-pink-700 font-semibold py-2 px-4 rounded-full hover:bg-pink-200 transition-colors";
    addButton.textContent = "Añadir";
    addButton.onclick = (event) => onAddToCartClick(product.id, event.currentTarget);

    actionsDiv.append(quantityInput, addButton);
    contentDiv.append(actionsDiv);
    productLink.appendChild(contentDiv);
    li.append(confirmationDiv, productLink);
    
    return li;
};

