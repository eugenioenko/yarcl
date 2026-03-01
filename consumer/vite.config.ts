import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { yarclPlugin } from 'yarcl/plugin';

export default defineConfig({
  plugins: [react(), yarclPlugin({
    design: 'src/yarcl.config.ts',
    flags:  'src/flags.config.ts',
    i18n:   'src/i18n.config.ts',
    env:    'src/env.config.ts',
  })],
});
