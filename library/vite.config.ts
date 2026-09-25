import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

const entry = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const externalPackages = [
  '@floating-ui/react',
  '@yarcl/config',
  'date-fns',
  'react',
  'react-dom',
  'virtual:yarcl.css',
  'vite',
];

export default defineConfig({
  build: {
    target: 'es2022',
    emptyOutDir: false,
    minify: false,
    lib: {
      entry: {
        index: entry('./src/index.ts'),
        define: entry('./src/define.ts'),
        'yarcl.config': entry('./src/yarcl.config.ts'),
        plugin: entry('./src/plugin.ts'),
        'reference/index': entry('./src/reference/index.ts'),
        'themes/index': entry('./src/themes/index.ts'),
        apply: entry('./src/apply.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external(id) {
        return (
          id.startsWith('node:') ||
          id.endsWith('.css') ||
          externalPackages.some((dependency) => id === dependency || id.startsWith(`${dependency}/`))
        );
      },
      output: {
        preserveModules: true,
        preserveModulesRoot: entry('./src'),
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
    },
  },
});
