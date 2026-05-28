import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@data': path.resolve(__dirname, '../data'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
    fs: {
      // Allow importing from the repo root data/ directory
      allow: ['..'],
    },
  },
});
