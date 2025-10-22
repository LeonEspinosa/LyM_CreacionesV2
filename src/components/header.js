// INICIO MODIFICACIÓN SEMÁNTICA
// --- INICIO: Añadir importación (si no existe ya) ---
import { createIcons, icons } from 'lucide'; 
// --- FIN: Añadir importación ---

const headerHTML = `
  <div class="container mx-auto px-6 py-4 flex justify-between items-center">
    <h1 class="font-display text-2xl font-bold text-pink-500">LyM Creaciones</h1>
    <nav class="hidden md:flex space-x-8 items-center" aria-label="Navegación principal"> <!-- Añadido nav y aria-label -->
      <a id="nav-home" href="#" class="text-gray-600 hover:text-pink-500">Inicio</a>
      <a id="nav-shop" href="#" class="text-gray-600 hover:text-pink-500">Tienda</a>
      <a id="nav-about" href="#" class="text-gray-600 hover:text-pink-500">Sobre Nosotros</a>
      <button id="nav-cart-btn" aria-label="Ver carrito de compras" class="relative text-gray-600 hover:text-pink-500">
        <i data-lucide="shopping-cart"></i>
        <span id="cart-count-badge" class="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center" aria-live="polite">0</span> <!-- Añadido aria-live -->
      </button>
    </nav>
    <div class="flex items-center md:hidden gap-4"> <!-- Contenedor para íconos móviles -->
        <button id="mobile-cart-btn" aria-label="Ver carrito de compras" class="relative text-gray-600 hover:text-pink-500 md:hidden">
            <i data-lucide="shopping-cart"></i>
            <span id="mobile-cart-count-badge" class="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center" aria-live="polite">0</span> <!-- Badge duplicado para móvil -->
        </button>
        <button id="mobile-menu-btn" aria-label="Abrir menú de navegación" class="md:hidden" aria-expanded="false" aria-controls="mobile-menu"> <!-- Atributos ARIA -->
            <i data-lucide="menu" class="text-gray-600"></i>
        </button>
    </div>
  </div>
  <!-- Menú móvil -->
  <nav id="mobile-menu" class="hidden md:hidden bg-white border-t" aria-label="Navegación móvil"> <!-- Añadido nav y aria-label -->
    <a id="mobile-nav-home" href="#" class="block py-2 px-6 text-gray-700 hover:bg-pink-100">Inicio</a>
    <a id="mobile-nav-shop" href="#" class="block py-2 px-6 text-gray-700 hover:bg-pink-100">Tienda</a>
    <a id="mobile-nav-about" href="#" class="block py-2 px-6 text-gray-700 hover:bg-pink-100">Sobre Nosotros</a>
    <!-- El enlace al carrito se quitó de aquí, se accede por el ícono -->
  </nav>
`;


// FIN MODIFICACIÓN SEMÁNTICA

// --- INICIO: Variables y funciones para gestión de foco ---
let mobileMenuElement = null;
let mobileMenuButton = null;
let mobileMenuCloseButton = null;
let focusableElementsInMenu = [];
let firstFocusableElement = null;
let lastFocusableElement = null;
let previouslyFocusedElement = null;

const openMobileMenu = () => {
  if (!mobileMenuElement || !mobileMenuButton) return;
  previouslyFocusedElement = document.activeElement; // Guardar elemento con foco
  mobileMenuElement.classList.remove('hidden');
  mobileMenuButton.setAttribute('aria-expanded', 'true');
  // Encontrar elementos enfocables DENTRO del menú
  focusableElementsInMenu = Array.from(mobileMenuElement.querySelectorAll(
    'a[href], button:not([disabled])'
  ));
  firstFocusableElement = focusableElementsInMenu[0];
  lastFocusableElement = focusableElementsInMenu[focusableElementsInMenu.length - 1];
  
  // Añadir listener para atrapar el foco
  mobileMenuElement.addEventListener('keydown', trapFocus);

  // Mover foco al primer elemento (usualmente el primer enlace)
  setTimeout(() => { // Pequeño delay para asegurar que sea visible
      if(firstFocusableElement) firstFocusableElement.focus();
  }, 100); 
};

const closeMobileMenu = () => {
  if (!mobileMenuElement || !mobileMenuButton) return;
  mobileMenuElement.classList.add('hidden');
  mobileMenuButton.setAttribute('aria-expanded', 'false');
  mobileMenuElement.removeEventListener('keydown', trapFocus); // Quitar listener
  
  // Devolver foco al botón que abrió el menú
  if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
  }
};

// Función para atrapar el foco dentro del menú
const trapFocus = (e) => {
    if (e.key !== 'Tab') {
        return; // Ignorar si no es Tab
    }

    if (e.shiftKey) { // Si es Shift + Tab
        if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus(); // Mover al último
            e.preventDefault();
        }
    } else { // Si es solo Tab
        if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus(); // Mover al primero
            e.preventDefault();
        }
    }
};
// --- FIN: Variables y funciones para gestión de foco ---

export const renderHeader = (container, onNavigate, onCartClick) => {
  container.innerHTML = headerHTML;

  // --- INICIO: Guardar referencias a elementos del menú móvil ---
  mobileMenuElement = document.getElementById('mobile-menu');
  mobileMenuButton = document.getElementById('mobile-menu-btn');
  mobileMenuCloseButton = document.getElementById('mobile-menu-close-btn');
  // --- FIN: Guardar referencias ---

  // Navegación de escritorio
  document.getElementById('nav-home').addEventListener('click', (e) => { e.preventDefault(); onNavigate('home'); });
  document.getElementById('nav-shop').addEventListener('click', (e) => { e.preventDefault(); onNavigate('shop'); });
  document.getElementById('nav-about').addEventListener('click', (e) => { e.preventDefault(); onNavigate('about'); });

  // Botones del carrito (escritorio y móvil)
  document.getElementById('nav-cart-btn').addEventListener('click', onCartClick);
  document.getElementById('mobile-cart-btn').addEventListener('click', onCartClick); // Nuevo botón móvil para carrito

  // Lógica del menú móvil
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  document.getElementById('mobile-nav-home').addEventListener('click', (e) => { e.preventDefault(); onNavigate('home'); closeMobileMenu(mobileMenu, mobileMenuBtn); });
  document.getElementById('mobile-nav-shop').addEventListener('click', (e) => { e.preventDefault(); onNavigate('shop'); closeMobileMenu(mobileMenu, mobileMenuBtn); });
  document.getElementById('mobile-nav-about').addEventListener('click', (e) => { e.preventDefault(); onNavigate('about'); closeMobileMenu(mobileMenu, mobileMenuBtn); });

  // --- INICIO: Usar nuevas funciones para abrir/cerrar ---
  if(mobileMenuButton) {
      mobileMenuButton.addEventListener('click', () => {
        const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
      });
  }
  if(mobileMenuCloseButton) {
     mobileMenuCloseButton.addEventListener('click', closeMobileMenu);
  }
  // Cerrar con tecla Escape
  if(mobileMenuElement) {
      mobileMenuElement.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
              closeMobileMenu();
          }
      });
  }
  // --- FIN: Usar nuevas funciones ---
  // Inicializar íconos
  createIcons({ icons });

  // Asegurar que los badges estén ocultos si el contador es 0 inicialmente
  updateHeaderCartCount(0); 
};

export const updateHeaderCartCount = (count) => {
  const badgeDesktop = document.getElementById('cart-count-badge');
  const badgeMobile = document.getElementById('mobile-cart-count-badge');
  const countToShow = count > 99 ? '99+' : count.toString(); // Limitar a 99+

  if (badgeDesktop) {
    badgeDesktop.textContent = countToShow;
    badgeDesktop.classList.toggle('hidden', count === 0); // Ocultar si es 0
  }
  if (badgeMobile) {
    badgeMobile.textContent = countToShow;
    badgeMobile.classList.toggle('hidden', count === 0); // Ocultar si es 0
  }
};
