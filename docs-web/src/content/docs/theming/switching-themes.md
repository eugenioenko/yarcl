---
title: Switching themes
description: Keep themes interchangeable with a shared set of keys, then pick one at build time or switch at runtime.
sidebar:
  order: 2
---

## The theme contract

Two themes are interchangeable when they define the same keys. Your app references keys, so any theme with the same keys renders it.

The bundled themes all satisfy `ThemeContract`, the keys of the library defaults. Use it to check your own themes:

```ts
import { defineConfig } from 'yarcl/define';
import defaults from 'yarcl/defaults';
import type { ThemeContract } from 'yarcl/themes';

export const midnight = defineConfig({
  ...defaults,
  colors: { … },
  sizes: { … },
}) satisfies ThemeContract;
```

A missing key (say, no `lg` size) is a type error, so the theme can't silently break a screen that uses `size="lg"`. Extra keys are allowed.

For your own design system, define your own contract the same way: a type listing the keys your app uses.

## At build time

The simplest approach: one theme per build. Point the config file at the theme you want:

```ts title="src/yarcl.config.ts"
export { compact as default } from 'yarcl/themes';
```

To build the same app with several themes (white-label products, per-customer builds), keep one config file per theme and choose it with an environment variable in the plugin:

```ts title="vite.config.ts"
yarcl({ config: `src/themes/${process.env.THEME ?? 'default'}.ts` })
```

Remember the matching `paths` entry in `tsconfig.json`; with a shared contract, any of the theme files works for type-checking.

## At runtime

`yarcl/css` exports `generateCss`, the same function the plugin runs at build time. Call it in the browser and put the result in a `<style>` element to switch themes without a rebuild:

```ts
import { generateCss } from 'yarcl/css';
import { themes } from 'yarcl/themes';

function applyTheme(theme: keyof typeof themes) {
  let style = document.getElementById('yarcl-theme');
  if (!style) {
    style = document.createElement('style');
    style.id = 'yarcl-theme';
    document.head.append(style);
  }
  style.textContent = generateCss(themes[theme]);
}
```

This is how the [theme playground](/theming/playground/) works. Two things to keep in mind:

- The themes must share keys (a contract), because the types come from the build-time config.
- The generated stylesheet replaces the build-time one for the whole page, so dialogs, menus and toasts switch too. To theme only part of a page, use the CSS variables instead (next section).

## Light and dark

Every theme has light and dark values built in. The page follows the OS setting, and `color-scheme` switches it:

```ts
document.documentElement.style.colorScheme = 'dark';
```

## Theming a region

Everything is a CSS variable, so a region can override values without a new theme:

```css
.promo {
  --yarcl-color-primary: light-dark(#be185d, #f9a8d4);
  --yarcl-color-primary-on: #fff;
  --yarcl-focus-color: var(--yarcl-color-primary);
}
```
