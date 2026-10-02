# @yarcl/react

Yet another react component library. Your config file is the design system: every key becomes a typed prop and a rendered style.

From an existing React project using Vite, webpack, Rspack, Rollup or esbuild, run:

```sh
npx @yarcl/react init
```

This installs the package, adds the detected build plugin and TypeScript path mapping, and creates `src/yarcl.config.ts`. The equivalent commands are `pnpm dlx @yarcl/react init`, `yarn dlx @yarcl/react init` and `bunx @yarcl/react init`.

For manual setup:

```sh
npm install @yarcl/react
```

```ts
// vite.config.ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import yarcl from '@yarcl/react/vite';

export default defineConfig({ plugins: [react(), yarcl({ config: 'src/yarcl.config.ts' })] });
```

For webpack, Rspack, Rollup or esbuild, import the plugin from the matching `@yarcl/react/<build-tool>` entry point.

Every build plugin also emits `yarcl.tokens.css` in the build output directory for server templates and other pages outside the React app. It contains CSS variables, `color-scheme` and `.yarcl-type-{key}` text-style classes, without component styles or font loading. Vite also writes the file to `build.outDir` at dev-server startup and updates it when the config or its local imports change. Set `emitTokens: false` or `emitTokens: ''` to disable it, or pass a filename such as `emitTokens: 'styles/tokens.css'` to customize its output-relative path.

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@yarcl/config": ["./src/yarcl.config.ts", "./node_modules/@yarcl/react/dist/yarcl.config.d.ts"]
    }
  }
}
```

```ts
// src/yarcl.config.ts
import { defineConfig } from '@yarcl/react/define';
import defaults from '@yarcl/react/defaults';

export default defineConfig({
  ...defaults,
  colors: {
    ...defaults.colors,
    brand: { light: '#4f46e5', dark: '#a5b4fc' },
  },
});
```

```tsx
import { Button } from '@yarcl/react';

<Button color="brand">Save</Button>;
```

Documentation: [yarcl.dev](https://yarcl.dev)

For coding agents working in an installed project, read [`node_modules/@yarcl/react/llms.txt`](./llms.txt). The package copies this guide from the docs site during its build, so it matches the installed version. The package also includes a short [`AGENTS.md`](./AGENTS.md) pointer for agents that inspect dependency directories.

## License

MIT
