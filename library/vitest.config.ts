import { defineProject } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineProject({
  resolve: { alias: { '@yarcl/config': fileURLToPath(new URL('./src/yarcl.config.ts', import.meta.url)) } },
  test: {
    name: 'library',
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
