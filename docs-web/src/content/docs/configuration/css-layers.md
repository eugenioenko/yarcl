---
title: CSS cascade layers
description: Override yarcl styles and integrate resets, Tailwind, and Starlight with an explicit layer order.
sidebar:
  order: 10
---

All yarcl styles live inside the `yarcl` cascade layer. Your ordinary CSS takes precedence over them, even if your stylesheet loads first or yarcl uses a more specific selector.

```tsx
<Button className="checkout-button">Complete purchase</Button>
```

```css
.checkout-button {
  background: var(--checkout-background);
  border-radius: 999px;
}
```

You do not need `!important` or a selector that repeats yarcl's classes. The same rule also overrides yarcl's hover and active backgrounds. Add your own state rules when you want those states to look different.

## Internal order

Each yarcl stylesheet declares this order before its rules:

```css
@layer yarcl.tokens, yarcl.base, yarcl.recipes;
```

| Layer | Styles |
| --- | --- |
| `yarcl.tokens` | Generated variables, modifier classes, typography, component size overrides, and configured font faces |
| `yarcl.base` | Component layout, interaction states, focus rings, animations, the optional page base, and design-reference styles |
| `yarcl.recipes` | Custom components and extensions defined in `recipes` |

Component rules take precedence over token classes, preserving size props, automatic table text sizing, and invalid-state colors. Recipes take precedence over both. The internal order stays the same if generated CSS loads before or after component CSS. Custom media definitions stay at the stylesheet's top level so the build plugin can expand them.

`applyTheme` inserts its generated styles into these same layers. Your unlayered overrides keep taking precedence when themes change. The exported token-only stylesheet uses `yarcl.tokens` and declares the same internal order.

## Override a token

Override a variable on an element to customize that element and its descendants:

```css
.checkout-button {
  --yarcl-h: 3.5rem;
}

:root {
  --yarcl-neutral-bg: var(--app-background);
}
```

An unlayered `:root` rule also overrides the generated root variable when you call `applyTheme`. Remove the override if you want the theme to control that value again.

## Layer your application styles

If your own styles use layers, declare the complete order before any stylesheet that defines those layers. Later layers take precedence for normal declarations:

```css
@layer reset, yarcl, app;

@layer reset {
  * {
    box-sizing: border-box;
    margin: 0;
  }
}

@layer app {
  .checkout-button {
    border-radius: 999px;
  }
}
```

Layer order comes from the first declaration of each layer in the document's stylesheet order. A declaration at the end cannot reorder layers introduced earlier. Put the order in the first stylesheet loaded by your app.

Keep global resets in a layer before `yarcl`. An unlayered reset takes precedence over every layered normal declaration. For example, an unlayered `* { margin: 0 }` overrides the automatic margins that center dialogs, and an unlayered `* { outline: none }` removes keyboard focus rings. Wrap legacy resets in a layer rather than adding specificity or `!important`.

`!important` reverses layer priority. Prefer normal declarations for application overrides so the order above stays easy to follow.

## Tailwind CSS

For Tailwind 4, establish the layer order before importing Tailwind:

```css
@layer theme, base, yarcl, components, utilities;
@import 'tailwindcss';
```

Tailwind's Preflight stays in `base`, yarcl components follow it, and Tailwind component styles and utilities can override yarcl. Load this stylesheet before importing `@yarcl/react` in your application entry point. See [Tailwind's Preflight documentation](https://tailwindcss.com/docs/preflight) for its stylesheet imports.

If your toolchain emits a legacy Tailwind reset without native layers, wrap the emitted reset in `@layer reset` and declare `reset, yarcl` first. Inspect the compiled CSS to check that the reset actually stays inside that layer.

## Astro Starlight

Place the layer order at the start of the first custom stylesheet registered with Starlight:

```css
@layer starlight, yarcl;
```

Starlight loads custom styles before its built-in styles, which lets this declaration place Starlight's layers before yarcl. Its reset can then coexist with yarcl's focus rings and centered dialogs. Keep component previews inside Starlight's `not-content` class to opt out of Markdown content styling.

```astro
---
import { Button } from '@yarcl/react';
---

<div class="not-content">
  <Button client:load>Save changes</Button>
</div>
```

Your unlayered custom styles still take precedence over both libraries. See [Starlight's CSS guide](https://starlight.astro.build/guides/css-and-tailwind/) for registering custom CSS.
