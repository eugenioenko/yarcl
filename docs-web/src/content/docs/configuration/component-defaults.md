---
title: Defaults
description: Global defaults and per-component defaults, and how a prop value is resolved.
sidebar:
  order: 8
---

## Global defaults

`defaults` holds the value every component uses when a prop is omitted. Each entry must be a key of its group.

| Key | Used by |
|---|---|
| `size` | every sized control |
| `radius` | every component with a radius |
| `color` | every component with a color |
| `variant` | buttons, selected toggle items |
| `softVariant` | badges, alerts, unselected toggle items |
| `errorColor` | invalid fields and error messages |
| `textStyle` | `Text` |
| `labelStyle`, `helperStyle` | `Label` and form legends, helper and error text |
| `gap`, `padding` | layout components, cards, overlays |
| `floatingShadow` | popovers, menus, dialogs, toasts |
| `density` | `Table` |
| `modalSize` | `Dialog`, `Drawer`, `CommandPalette` |

## Per-component defaults

`components` sets defaults for one component, before the global defaults apply:

```ts
defaults: { radius: 'md', size: 'md', … },
components: {
  Button: { radius: 'square' },          // buttons are always sharp
  IconButton: { radius: 'rounded' },     // icon buttons are circles
  Card: { radius: 'lg', padding: 'lg' },
  Stack: { gap: 'sm' },
},
```

Everything is checked:

- component names must be real (`Buton` is an error)
- each component only accepts the props it has (`Card: { variant }` is an error)
- values must be keys of your config (`radius: 'pill'` is an error when there's no `pill`)

## Resolution order

For any token prop, the first value found wins:

1. the prop on the element: `<Button radius="lg">`
2. an enclosing group: `ButtonGroup`, `ToggleGroup` or `RadioGroup` passing `size`, `color`, `variant` or `radius` down
3. `components.<Name>` in the config
4. `defaults` in the config

## Components and the props they accept

| Component | Props |
|---|---|
| `Button`, `IconButton` | `size`, `radius`, `color`, `variant` |
| `ToggleGroup`, `Pagination` | `size`, `radius`, `color`, `variant`, `selectedVariant` |
| `Input`, `Textarea`, `NumberInput`, `Select`, `Combobox`, `Slider` | `size`, `radius`, `color` |
| `DatePicker` | `size`, `radius`, `color`, `variant` |
| `Checkbox`, `Radio`, `Switch` | `size`, `color` |
| `Badge` | `size`, `radius`, `color`, `variant` |
| `Alert` | `radius`, `color`, `variant` |
| `Card` | `radius`, `padding`, `shadow` |
| `Popover`, `HoverCard` | `radius`, `padding` |
| `Dialog` | `radius`, `size` (from `modalSizes`) |
| `Drawer` | `size` (from `modalSizes`) |
| `Menu` | `size` |
| `CommandPalette` | `size`, `radius`, `color` |
| `Tabs` | `size`, `color` |
| `Accordion` | `size`, `radius`, `color` |
| `Table` | `density` |
| `Stack`, `Inline` | `gap` |
| `Text`, `Label`, `Breadcrumb` | `textStyle`, `color` |
| `Link`, `Toast` | `color` |
| `Spinner` | `size`, `color` |
| `Skeleton` | `size`, `radius` |
| `Progress` | `size`, `color`, `radius` |
