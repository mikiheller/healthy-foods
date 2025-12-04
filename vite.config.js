import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  publicDir: 'public',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        guide: resolve(__dirname, 'guide.html'),
        game: resolve(__dirname, 'game.html'),
        menu: resolve(__dirname, 'menu.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  }
});
