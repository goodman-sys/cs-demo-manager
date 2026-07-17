import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { lingui } from '@lingui/vite-plugin';
import tailwindcss from '@tailwindcss/vite';

const currentFolderPath = fileURLToPath(new URL('.', import.meta.url));
const srcFolderPath = path.resolve(currentFolderPath, '../../src');
const bootstrapPath = path.resolve(currentFolderPath, './src/bootstrap');

export default defineConfig({
  root: currentFolderPath,
  resolve: {
    alias: {
      csdm: srcFolderPath,
      'csdm/ui/bootstrap/web-socket-provider': path.resolve(bootstrapPath, 'web-socket-provider.tsx'),
      'csdm/ui/hooks/use-web-socket-client': path.resolve(bootstrapPath, 'use-web-socket-client.ts'),
      'csdm/ui/bootstrap/locale-provider': path.resolve(bootstrapPath, 'locale-provider.tsx'),
    },
  },
  define: {
    IS_PRODUCTION: false,
    IS_DEV: true,
    APP_VERSION: JSON.stringify('0.0.1-web'),
    REACT_STRICT_MODE_ENABLED: false,
  },
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler', '@lingui/babel-plugin-lingui-macro'],
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
