import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './', // Asegura que la raíz de tu proyecto es donde está vite.config.js
  build: {
    outDir: 'dist', // Directorio de salida para la construcción
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'), // Tu frontend de la tienda
        admin: resolve(__dirname, 'admin.html'), // Tu panel de gestión de productos
        adminOrders: resolve(__dirname, 'admin-orders.html'), // Tu panel de gestión de pedidos
      },
      output: {
        // Para que los assets (CSS/JS) generados por cada HTML vayan a sus propias carpetas
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  server: {
    open: '/index.html', // Abre el frontend principal por defecto
  }
});
