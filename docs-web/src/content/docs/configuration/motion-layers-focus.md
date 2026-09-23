---
title: Motion, layers and focus
description: Transition timing, z-index layers, border width and the focus ring.
sidebar:
  order: 7
---

These groups have keys the library depends on. You set all the values, and you can add extra keys for your own CSS.

## Motion

```ts
motion: { fast: '120ms', base: '200ms', easing: 'cubic-bezier(0.2, 0, 0, 1)' },
```

- `fast`: hover and state changes.
- `base`: opening popovers, dialogs and drawers.
- `easing`: all transitions.

When the user asks for reduced motion (`prefers-reduced-motion: reduce`), transitions and entry animations are turned off and spinners slow down.

## Layers

```ts
zIndex: { dropdown: 1000, tooltip: 1100, dialog: 1200, toast: 1300 },
```

Menus, selects, comboboxes, popovers and hover cards use `dropdown`; tooltips use `tooltip`. Dialogs, drawers and toasts use the browser's top layer, so they sit above everything regardless of z-index.

## Borders

```ts
borders: { width: '1px' },
```

The border width of every control and surface.

## Focus ring

```ts
focusRing: { width: '2px', offset: '2px', color: 'primary' },
```

The outline shown for keyboard focus (`:focus-visible`). `color` is a key of `colors`. Inputs draw the ring in their own `color` and flush with the border.
