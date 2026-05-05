import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        catalog: resolve(__dirname, 'src/html/catalog.html'),
        product: resolve(__dirname, 'src/html/product.html'),
        about: resolve(__dirname, 'src/html/about.html'),
        contact: resolve(__dirname, 'src/html/contact.html'),
        cart: resolve(__dirname, 'src/html/cart.html'),
      },
    },
  },
  server: {
    open: true,
  },
});
