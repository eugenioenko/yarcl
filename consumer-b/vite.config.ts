import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { yarcl } from 'yarcl/plugin';

export default defineConfig({
  plugins: [react(), yarcl({ config: 'src/yarcl.config.ts' })],
});
