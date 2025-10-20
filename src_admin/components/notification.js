/**
 * Componente para mostrar notificaciones emergentes.
 */

/**
 * Renderiza el contenedor donde aparecerán las notificaciones.
 * Debe llamarse una vez al iniciar la aplicación.
 * @param {HTMLElement} parentElement - El elemento donde se añadirá el contenedor (usualmente el body).
 */
export const renderNotificationContainer = (parentElement) => {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'fixed top-5 right-5 z-50';
    parentElement.appendChild(container);
};

/**
 * Muestra una notificación.
 * @param {string} message - El mensaje a mostrar.
 * @param {string} type - 'success' o 'error'.
 */
export const showNotification = (message, type = 'success') => {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification transform translate-x-full ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white py-2 px-4 rounded-md shadow-lg mb-2`;
    notification.textContent = message;
    container.appendChild(notification);
    
    setTimeout(() => notification.classList.remove('translate-x-full'), 10);
    
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 400); // Espera a que termine la transición para eliminar
    }, 3000);
};
