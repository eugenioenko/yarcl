# @yarcl/react

Yet another react component library. Your config file is the design system: every key becomes a typed prop and a rendered style.

```sh
npm install @yarcl/react
```

```ts
// vite.config.ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { yarcl } from '@yarcl/react/plugin';

export default defineConfig({ plugins: [react(), yarcl({ config: 'src/yarcl.config.ts' })] });
```

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

## License

MIT
