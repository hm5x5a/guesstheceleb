import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        hair: resolve(__dirname, 'guess-the-celebrity-by-hair/index.html'),
        beard: resolve(__dirname, 'guess-the-celebrity-by-beard/index.html'),
        nose: resolve(__dirname, 'guess-the-celebrity-by-nose/index.html'),
        eyes: resolve(__dirname, 'guess-the-celebrity-by-eyes/index.html'),
        unlimited: resolve(__dirname, 'unlimited-guess-the-celebrity/index.html'),
        custom: resolve(__dirname, 'custom-guess-the-celebrity/index.html'),
        about: resolve(__dirname, 'about/index.html'),
        privacy: resolve(__dirname, 'privacy/index.html'),
        terms: resolve(__dirname, 'terms/index.html'),
        contact: resolve(__dirname, 'contact/index.html'),
      },
    },
  },
});
