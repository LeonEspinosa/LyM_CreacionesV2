const headerHTML = `
  <div class="container mx-auto px-6 py-4 flex justify-between items-center">
    <h1 class="font-display text-2xl font-bold text-pink-500">LyM Creaciones</h1>
    <nav class="hidden md:flex space-x-8 items-center">
      <a id="nav-home" href="#" class="text-gray-600 hover:text-pink-500">Inicio</a>
      <a id="nav-shop" href="#" class="text-gray-600 hover:text-pink-500">Tienda</a>
      <a id="nav-about" href="#" class="text-gray-600 hover:text-pink-500">Sobre Nosotros</a>
      <button id="nav-cart-btn" aria-label="Ver carrito de compras" class="relative text-gray-600 hover:text-pink-500">
        <i data-lucide="shopping-cart"></i>
        <span id="cart-count-badge" class="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
      </button>
    </nav>
    <button id="mobile-menu-btn" aria-label="Abrir menú de navegación" class="md:hidden">
        <i data-lucide="menu" class="text-gray-600"></i>
    </button>
  </div>
  <div id="mobile-menu" class="hidden md:hidden bg-white border-t">
    <a id="mobile-nav-home" href="#" class="block py-2 px-6 text-gray-700 hover:bg-pink-100">Inicio</a>
    <a id="mobile-nav-shop" href="#" class="block py-2 px-6 text-gray-700 hover:bg-pink-100">Tienda</a>
    <a id="mobile-nav-about" href="#" class="block py-2 px-6 text-gray-700 hover:bg-pink-100">Sobre Nosotros</a>
    <a id="mobile-nav-cart" href="#" class="block py-2 px-6 text-gray-700 hover:bg-pink-100">Carrito</a>
  </div>
`;

export const renderHeader = (container, onNavigate, onCartClick) => {
  container.innerHTML = headerHTML;

  // Navegación de escritorio
  document.getElementById('nav-home').addEventListener('click', (e) => { e.preventDefault(); onNavigate('home'); });
  document.getElementById('nav-shop').addEventListener('click', (e) => { e.preventDefault(); onNavigate('shop'); });
  document.getElementById('nav-about').addEventListener('click', (e) => { e.preventDefault(); onNavigate('about'); }); // <-- AÑADIDO

  // Botones del carrito
  document.getElementById('nav-cart-btn').addEventListener('click', onCartClick);
  document.getElementById('mobile-nav-cart').addEventListener('click', (e) => { e.preventDefault(); onCartClick(); });

  // Lógica del menú móvil
  const mobileMenu = document.getElementById('mobile-menu');
  document.getElementById('mobile-nav-home').addEventListener('click', (e) => { e.preventDefault(); onNavigate('home'); mobileMenu.classList.add('hidden'); });
  document.getElementById('mobile-nav-shop').addEventListener('click', (e) => { e.preventDefault(); onNavigate('shop'); mobileMenu.classList.add('hidden'); });
  document.getElementById('mobile-nav-about').addEventListener('click', (e) => { e.preventDefault(); onNavigate('about'); mobileMenu.classList.add('hidden'); }); // <-- AÑADIDO
  
  document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
};

export const updateHeaderCartCount = (count) => {
  const badge = document.getElementById('cart-count-badge');
  if (badge) {
    badge.textContent = count;
  }
};
