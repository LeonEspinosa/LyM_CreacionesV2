/**
 * Mantenimiento a Largo Plazo: Módulo dedicado exclusivamente a la lógica del carrito.
 * Es independiente de la interfaz, lo que lo hace reutilizable y fácil de probar.
 */

// El estado del carrito se mantiene aquí.
let cart = [];

// Clave para guardar en el almacenamiento local del navegador (localStorage).
const STORAGE_KEY = 'lym_cart';

/**
 * Carga el carrito desde localStorage al iniciar la aplicación.
 */
export const loadCart = () => {
  const savedCart = localStorage.getItem(STORAGE_KEY);
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
  return cart;
};

/**
 * Guarda el estado actual del carrito en localStorage.
 * Se llama después de cada modificación para que los datos no se pierdan.
 */
const saveCart = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
};

/**
 * Devuelve una copia del estado actual del carrito.
 */
export const getCart = () => {
  return [...cart]; // Devuelve una copia para evitar mutaciones accidentales.
};

/**
 * Añade un producto al carrito o incrementa su cantidad si ya existe.
 * @param {object} product - El producto a añadir.
 * @param {number} quantity - La cantidad a añadir.
 */
export const addToCart = (product, quantity) => {
  if (!product || quantity <= 0) return;

  const existingItem = cart.find(item => item.id === product.id);

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    // Respeta la cantidad máxima si existe
    if (existingItem.max_purchase_quantity && newQuantity > existingItem.max_purchase_quantity) {
        existingItem.quantity = existingItem.max_purchase_quantity;
    } else {
        existingItem.quantity = newQuantity;
    }
  } else {
    cart.push({ ...product, quantity });
  }

  saveCart();
};

/**
 * Elimina un producto del carrito por su ID.
 */
export const removeFromCart = (productId) => {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
};

/**
 * Vacía completamente el carrito.
 */
export const emptyCart = () => {
    cart = [];
    saveCart();
};


/**
 * Aumenta la cantidad de un producto en el carrito, respetando el máximo.
 */
export const increaseQuantity = (productId) => {
    const item = cart.find(item => item.id === productId);
    if(item) {
        // Solo incrementa si no hay un máximo o si no se ha alcanzado
        if (!item.max_purchase_quantity || item.quantity < item.max_purchase_quantity) {
            item.quantity++;
            saveCart();
        }
    }
};

/**
 * Disminuye la cantidad de un producto, respetando el mínimo.
 */
export const decreaseQuantity = (productId) => {
    const item = cart.find(item => item.id === productId);
    const minQty = item.min_purchase_quantity || 1;
    if (item) {
        // Solo decrementa si la cantidad es mayor que el mínimo permitido
        if (item.quantity > minQty) {
            item.quantity--;
            saveCart();
        }
    }
};

/**
 * Calcula los totales del carrito.
 * @returns {object} Un objeto con el subtotal (pre-impuestos) y el número total de items.
 */
export const getCartTotals = () => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => {
        const price = item.sale_price || item.base_price;
        return sum + (price * item.quantity);
    }, 0);

    return { totalItems, subtotal };
};

