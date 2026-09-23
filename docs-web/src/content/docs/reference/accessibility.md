---
title: Accessibility
description: What yarcl handles for you, and what's still up to you.
sidebar:
  order: 3
---

## Built in

- **Native elements first**: `<button>`, `<input>`, `<dialog>`, `<hr>`, `<table>`, `<fieldset>` and `<legend>`, so browsers and assistive technology get the semantics for free.
- **Keyboard support** for every interactive component. Menus, selects and toggle groups use roving focus; menus and selects support type-to-select.
- **Focus management**: dialogs and drawers trap focus and return it on close; menus and popovers return focus to their trigger.
- **Labelling**: `Field` and `RadioGroup` connect labels, descriptions and errors; `IconButton` requires `aria-label` in its types.
- **Live regions**: toasts use `role="status"` (or `role="alert"` when urgent); alerts opt in with `live`.
- **Visible focus**: every control shows a focus ring for keyboard users (`:focus-visible`), configured in `focusRing`.
- **Contrast checks**: the build warns when a color's text color fails WCAG AA in light or dark mode.
- **Reduced motion**: transitions and entry animations are turned off when the user prefers reduced motion.
- **Scalable sizes**: sizes in `rem` follow the user's browser font size.

## Keyboard reference

| Component | Keys |
|---|---|
| [Menu](/components/overlays/menu/) | <kbd>↑</kbd> <kbd>↓</kbd>, typing, <kbd>Enter</kbd>, <kbd>Esc</kbd> |
| [Select](/components/forms/select/) | <kbd>↑</kbd> <kbd>↓</kbd>, typing (open or closed), <kbd>Enter</kbd>, <kbd>Esc</kbd> |
| [Combobox](/components/forms/combobox/) | typing, <kbd>↑</kbd> <kbd>↓</kbd>, <kbd>Enter</kbd>, <kbd>Esc</kbd> |
| [Tabs](/components/data/tabs/) | <kbd>←</kbd> <kbd>→</kbd>, <kbd>Home</kbd>, <kbd>End</kbd> |
| [ToggleGroup](/components/buttons/toggle-group/) | arrow keys, <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>Space</kbd> |
| [Dialog](/components/overlays/dialog/), [Drawer](/components/overlays/drawer/), [Popover](/components/overlays/popover/), [Tooltip](/components/overlays/tooltip/) | <kbd>Esc</kbd> |

## Up to you

- Give icon-only buttons, button groups, toggle groups and tab lists meaningful labels.
- Choose heading levels by document structure; change the look with `textStyle`.
- Keep links in running text underlined.
- Check that semantic colors used as **text** on your page background have enough contrast. The build only checks text drawn on the colors themselves.
- Set `live` on alerts that appear in response to user actions.
