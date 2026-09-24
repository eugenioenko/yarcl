---
title: Vite plugin
description: What the plugin does, its options, fallback behavior and hot reload.
sidebar:
  order: 11
---

```ts title="vite.config.ts"
import { yarcl } from '@yarcl/react/plugin';

export default defineConfig({
  plugins: [react(), yarcl({ config: 'src/yarcl.config.ts' })],
});
```

## What it does

1. **Aliases `@yarcl/config`** to your config file, so the library's components read your values at runtime.
2. **Generates `virtual:yarcl.css`** from your config: CSS variables, one class per key, and `@font-face` rules.
3. **Checks contrast** of every color's foreground and prints a warning below 4.5:1.
4. **Hot-reloads** the stylesheet when the config file, or anything it imports, changes.

## Options

| Option | Default | Description |
|---|---|---|
| `config` | `'src/yarcl.config.ts'` | path to your config, relative to the Vite root |

## Fallback

If the config file doesn't exist when the dev server starts, the plugin uses the library's default config. Pair it with the fallback entry in `tsconfig.json` so the types fall back the same way. Creating or deleting the file while the server runs needs a restart.

## Other frameworks built on Vite

Anything that exposes Vite plugins works, for example Astro (this documentation site):

```js title="astro.config.mjs"
export default defineConfig({
  integrations: [react()],
  vite: { plugins: [yarcl({ config: 'src/yarcl.config.ts' })] },
});
```

## Other bundlers

Only Vite is supported today. The mechanism is a plain module alias, so webpack (`resolve.alias`), Rollup, esbuild and Turbopack (`resolveAlias`) adapters are straightforward. See the [architecture decision](/reference/architecture/).
