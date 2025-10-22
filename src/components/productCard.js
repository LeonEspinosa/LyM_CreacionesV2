// No necesitamos importar createIcons aquí si usamos la carga global

export const createProductCard = (product, onProductClick, onAddToCartClick) => {
    const li = document.createElement('li');
    li.className = "bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 relative group flex flex-col";
    li.dataset.productId = product.id;

    // --- Contenedor de confirmación ---
    const confirmationDiv = document.createElement('div');
    confirmationDiv.className = "add-to-cart-confirmation absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 pointer-events-none";
    confirmationDiv.innerHTML = `<span class="bg-white text-pink-500 font-bold py-2 px-4 rounded-full flex items-center"><i data-lucide="check" class="mr-2"></i>¡Agregado!</span>`;

    // --- Contenido Clickeable (Imagen) ---
    const productImageLink = document.createElement('a');
    productImageLink.href = "#";
    productImageLink.className = "cursor-pointer block";
    productImageLink.onclick = (e) => {
        e.preventDefault();
        onProductClick(product.id);
    };

    const firstImage = product.images && product.images[0];
    const imageUrl = firstImage
        ? (firstImage.startsWith('http') ? firstImage : `http://localhost:3000/uploads/${firstImage}`)
        : 'https://placehold.co/640x360/FFF0F5/DB2777?text=Sin+Imagen';

    const img = document.createElement('img');
    img.src = imageUrl;
    // --- MEJORADO: alt descriptivo ---
    img.alt = `Imagen de ${product.name}`; // Texto alternativo más específico
    img.loading = "lazy";
    img.className = "w-full h-56 object-cover";
    productImageLink.appendChild(img);

    // --- Contenedor principal para todo el texto y acciones ---
    const mainContentWrapper = document.createElement('div');
    mainContentWrapper.className = "p-6 flex flex-col flex-grow text-center";

    const nameH4 = document.createElement('h4');
    nameH4.className = "font-bold text-lg text-gray-800 truncate mb-2 cursor-pointer hover:text-pink-600 transition-colors";
    nameH4.textContent = product.name;
    nameH4.onclick = (e) => { // Hacer que el título también sea clickeable
        e.stopPropagation();
        onProductClick(product.id);
    };
    mainContentWrapper.appendChild(nameH4);

    // --- Etiqueta "Personalizable" ---
    if (product.customizable) {
        const customizableTag = document.createElement('p');
        customizableTag.className = "text-green-600 font-semibold text-xs mb-3";
        customizableTag.innerHTML = `<i data-lucide="sparkles" class="inline-block w-4 h-4 mr-1"></i>¡Es personalizable!`;
        mainContentWrapper.appendChild(customizableTag);
    }

    // --- Contenedor de Precios ---
    const priceContainer = document.createElement('div');
    priceContainer.className = "mb-4";

    const taxes = product.taxes || 0;
    const finalPriceWithTaxes = product.base_price * (1 + taxes / 100);
    const hasOffer = product.sale_price && product.sale_price < product.base_price;

    if (hasOffer) {
        const finalSalePriceWithTaxes = product.sale_price * (1 + taxes / 100);
        const discountPercentage = ((product.base_price - product.sale_price) / product.base_price) * 100;

        priceContainer.innerHTML = `
            <div class="flex items-center justify-center gap-2">
                <p class="text-xl font-bold text-pink-600">$${finalSalePriceWithTaxes.toFixed(2)}</p>
                <span class="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">${discountPercentage.toFixed(0)}% OFF</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">Antes: <del>$${finalPriceWithTaxes.toFixed(2)}</del></p>
        `;
    } else {
        priceContainer.innerHTML = `<p class="text-lg font-semibold text-gray-800">$${finalPriceWithTaxes.toFixed(2)}</p>`;
    }
    mainContentWrapper.appendChild(priceContainer);

    // --- Descripción Corta con Truncado ---
    const descriptionP = document.createElement('p');
    descriptionP.className = "text-sm text-gray-600 line-clamp-2 min-h-[40px] mb-4"; // min-h para mantener altura consistente
    descriptionP.textContent = product.short_description || '';
    mainContentWrapper.appendChild(descriptionP);

    // --- Contenedor de acciones (empujado al fondo) ---
    const actionsDiv = document.createElement('div');
    actionsDiv.className = "mt-auto pt-4"; // mt-auto es la clave para empujar esto al fondo

    const quantityActionsDiv = document.createElement('div');
    quantityActionsDiv.className = "flex items-center justify-center gap-2";

    // --- MEJORADO: Input con aria-label ---
    const quantityInput = document.createElement('input');
    quantityInput.type = "number";
    quantityInput.className = "w-16 text-center border-gray-300 rounded-full shadow-sm quantity-input";
    quantityInput.setAttribute('aria-label', `Cantidad para ${product.name}`); // Describe para qué es la cantidad

    const minQty = product.min_purchase_quantity || 1;
    const maxQty = product.max_purchase_quantity;

    quantityInput.value = minQty;
    quantityInput.min = minQty;
    if (maxQty) {
        quantityInput.max = maxQty;
    }

    const addButton = document.createElement('button');
    addButton.className = "flex-grow bg-pink-100 text-pink-700 font-semibold py-2 px-4 rounded-full hover:bg-pink-200 transition-colors";
    addButton.textContent = "Añadir";

    const validationMessage = document.createElement('p');
    validationMessage.className = "text-xs text-red-500 mt-1 h-4";
    // --- AÑADIDO: aria-live para anunciar cambios en el mensaje de validación ---
    validationMessage.setAttribute('aria-live', 'polite');

    quantityInput.addEventListener('input', () => {
        const value = parseInt(quantityInput.value);
        let message = '';
        let isValid = true;
        if (isNaN(value)) {
            message = 'Inválido'; isValid = false;
        } else if (value < minQty) {
            message = `Mínimo: ${minQty}`; isValid = false;
        } else if (maxQty && value > maxQty) {
            message = `Máximo: ${maxQty}`; isValid = false;
        }
        validationMessage.textContent = message;
        addButton.disabled = !isValid;
    });

    quantityInput.addEventListener('click', e => e.stopPropagation());

    addButton.onclick = (event) => {
        event.stopPropagation();
        onAddToCartClick(product.id, event.currentTarget);
    };

    quantityActionsDiv.append(quantityInput, addButton);
    actionsDiv.appendChild(quantityActionsDiv);
    actionsDiv.appendChild(validationMessage);
    mainContentWrapper.appendChild(actionsDiv);

    // --- Ensamblaje final de la tarjeta ---
    li.append(confirmationDiv, productImageLink, mainContentWrapper);

    // No necesitamos llamar a createIcons aquí si usamos la carga global

    return li;
};

