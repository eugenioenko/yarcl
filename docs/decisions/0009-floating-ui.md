# ADR 0009: Floating UI for anchored elements

- Status: accepted
- Date: 2026-09-23

## Context

Popovers, menus, selects, comboboxes, tooltips and hover cards need positioning with flip and shift, plus dismiss, focus, list navigation and typeahead. The native Popover and anchor positioning APIs don't cover all of that across browsers yet.

## Decision

Use `@floating-ui/react` for all anchored elements, through shared helpers in `floating.tsx`.

- Position with `top` / `left` (`transform: false`), so CSS can animate `transform`.
- One shared `.yarcl-panel` surface and `.yarcl-listbox` / `.yarcl-option` styles.
- Compound APIs where there's structure (`Popover`, `Menu`); a wrapper with a `content` prop where there's one trigger and one payload (`Tooltip`, `HoverCard`).
- `Select` and `Combobox` take `options` as data, so the selected label is known while closed and filtering or async results are plain data.

## Consequences

- One dependency for all positioning and interaction logic.

## When to revisit

- Anchor positioning and `appearance: base-select` are broadly supported: replace pieces with native features.
