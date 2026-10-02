import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    name: 'playground',
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
