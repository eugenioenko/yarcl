---
title: Build plugins
description: Connect yarcl to Vite, webpack, Rspack, Rollup or esbuild.
sidebar:
  order: 11
---

yarcl uses one shared plugin implementation with an entry point for each supported build tool. Choose the entry point that matches your project.

## Vite

```ts title="vite.config.ts"
import yarcl from '@yarcl/react/vite';

export default defineConfig({
  plugins: [react(), yarcl({ config: 'src/yarcl.config.ts' })],
});
```

## webpack

```js title="webpack.config.js"
const yarcl = require('@yarcl/react/webpack');

module.exports = {
  plugins: [yarcl({ config: 'src/yarcl.config.ts' })],
};
```

webpack must be configured to load CSS and any TypeScript used by your config. With webpack's built-in CSS support, enable `experiments.css` and add a `{ test: /\.css$/, type: 'css' }` module rule.

## Rspack

```ts title="rspack.config.ts"
import yarcl from '@yarcl/react/rspack';

export default {
  plugins: [yarcl({ config: 'src/yarcl.config.ts' })],
};
```

## Rollup

```ts title="rollup.config.ts"
import yarcl from '@yarcl/react/rollup';

export default {
  plugins: [yarcl({ config: 'src/yarcl.config.ts' })],
};
```

The Rollup adapter emits the generated styles as `yarcl.css`. Include that asset with the JavaScript output.

## esbuild

```ts title="esbuild.config.ts"
import { build } from 'esbuild';
import yarcl from '@yarcl/react/esbuild';

await build({
  plugins: [yarcl({ config: 'src/yarcl.config.ts' })],
});
```

## What the plugin does

1. Aliases `@yarcl/config` to your config file so components read your values at runtime.
2. Generates the virtual stylesheet `@yarcl/react/styles.css` from your config with CSS variables, modifier classes and `@font-face` rules.
3. Checks the foreground contrast of every color and warns below 4.5:1.
4. Watches the config and its local imports so generated styles update during development.
5. Validates the TypeScript mapping and stops with a clear error when the two config paths differ.
6. Emits `yarcl.tokens.css` in the build output directory for pages outside the React app.

## Standalone token stylesheet

Every adapter emits `yarcl.tokens.css` by default, even when the entry point does not import yarcl. With Vite's default output directory, the file is `dist/yarcl.tokens.css`. Server templates and public pages can link to this fixed filename without depending on the app's hashed CSS bundles.

The file contains `:root` variables, `color-scheme: light dark` and `.yarcl-type-{key}` text-style classes. Server templates can use these classes directly, for example `<p class="yarcl-type-body">Hello</p>`. It excludes other modifier classes, component styles, custom media and `@font-face` rules. Load fonts separately on these pages. The app's stylesheet continues through the normal build-tool CSS pipeline.

```ts
yarcl();                                  // emits yarcl.tokens.css
yarcl({ emitTokens: true });               // emits yarcl.tokens.css
yarcl({ emitTokens: 'styles/tokens.css' }); // custom output-relative path
yarcl({ emitTokens: false });              // disables emission
yarcl({ emitTokens: '' });                 // disables emission
```

Paths must stay within the build output directory. Vite writes the file when its development server starts, before any app requests, and refreshes it when the config or its local imports change. This uses the same `build.outDir` as production, so a separate backend can serve the file during development. For example, `build: { outDir: '../view/static' }` writes `../view/static/yarcl.tokens.css` in both modes. Neither mode writes the file when `emitTokens` is disabled.

For esbuild, set `outdir` or `outfile`; with `write: false`, the token stylesheet is returned in `outputFiles`.

For an independent build script or a destination outside the build directory, import `generateTokensCss` from `@yarcl/react/generate` and write its result to the desired file.

## Options

| Option | Default | Description |
|---|---|---|
| `config` | `'src/yarcl.config.ts'` | Config path relative to the project root |
| `root` | build-tool root | Explicit project root when automatic detection is not suitable |
| `emitTokens` | `true` | Emits `yarcl.tokens.css`; a string sets an output-relative filename, and `false` or `''` disables emission |

## TypeScript mapping

The build plugin handles runtime resolution. TypeScript separately needs a `paths` entry pointing at the same config file. Run `npx @yarcl/react init` to add or repair both pieces. See [Installation](/getting-started/installation/) for the manual configuration.

If the config file does not exist at startup, the plugin and TypeScript both use the library defaults. Creating or deleting the file while a development server runs requires a restart.

## Frameworks built on Vite

Anything that exposes Vite plugins can use the Vite entry point. Astro, for example:

```js title="astro.config.mjs"
import yarcl from '@yarcl/react/vite';

export default defineConfig({
  integrations: [react()],
  vite: { plugins: [yarcl({ config: 'src/yarcl.config.ts' })] },
});
```
