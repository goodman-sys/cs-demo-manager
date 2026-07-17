import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { lingui } from '@lingui/vite-plugin';
import tailwindcss from '@tailwindcss/vite';

const currentFolderPath = fileURLToPath(new URL('.', import.meta.url));
const srcFolderPath = path.resolve(currentFolderPath, '../../src');

export default defineConfig({
  root: currentFolderPath,
  resolve: {
    alias: {
      csdm: srcFolderPath,
    },
  },
  plugins: [
    react({
      babel: {
        plugins: ['@lingui/babel-plugin-lingui-macro'],
      },
    }),
    lingui(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
