import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@yarcl/config': path.resolve(__dirname, 'src/yarcl/yarcl.default.config.ts'),
      '@yarcl/flags':  path.resolve(__dirname, 'src/yarcl/flags.default.config.ts'),
      '@yarcl/i18n':   path.resolve(__dirname, 'src/yarcl/i18n.default.config.ts'),
      '@yarcl/env':    path.resolve(__dirname, 'src/yarcl/env.default.config.ts'),
    },
  },
});
