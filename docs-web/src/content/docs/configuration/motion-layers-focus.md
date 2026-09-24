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
focusRing: { width: '2px', offset: '2px', color: 'primary', style: 'solid' },
```

One focus ring for every focusable component: buttons, inputs, selects, checkboxes, radios, switches, links, tabs, and the close and dismiss buttons. It appears for keyboard focus only (`:focus-visible`), never on mouse clicks.

| Key | Controls |
|---|---|
| `width` | outline thickness |
| `offset` | gap between the element and the ring; a negative value draws it inside |
| `color` | a key of `colors` |
| `style` | `solid` (default), `dashed`, `dotted` or `double` |

Inputs also switch their border to their own `color` while focused, so the active field is obvious. Tabs draw the ring inside their edge, because the tab list scrolls and would clip an outer ring.

In menus, selects and comboboxes, the highlighted option is filled with the solid color and its foreground instead of a ring, like native menus. That keeps it at least 3:1 against the panel.

### Overriding

The ring comes from one low-specificity rule, so a plain class overrides it:

```css
.toolbar .yarcl-button:focus-visible {
  outline-offset: -2px;
}
```

Or change the variables for a region:

```css
.high-contrast {
  --yarcl-focus-width: 3px;
  --yarcl-focus-color: black;
}
```
