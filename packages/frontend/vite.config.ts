import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { lingui } from '@lingui/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import babel, { defineRolldownBabelPreset } from '@rolldown/plugin-babel';

const currentFolderPath = fileURLToPath(new URL('.', import.meta.url));
const srcFolderPath = path.resolve(currentFolderPath, '../../src');
const bootstrapPath = path.resolve(currentFolderPath, './src/bootstrap');

const linguiPreset = defineRolldownBabelPreset({
  preset: () => ({ plugins: ['@lingui/babel-plugin-lingui-macro'] }),
  rolldown: {
    filter: {
      code: /from ['"]@lingui\/(?:react|core)\/macro['"]/,
    },
  },
});

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
    react(),
    lingui(),
    babel({
      presets: [linguiPreset],
      plugins: ['babel-plugin-react-compiler'],
    }),
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
