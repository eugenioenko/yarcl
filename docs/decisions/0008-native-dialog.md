# ADR 0008: Native `<dialog>` for modal overlays

- Status: accepted
- Date: 2026-09-23

## Context

Modal overlays need the top layer, Esc to close, a backdrop, an inert background and focus return. Reimplementing these (portals, focus traps, `aria-hidden` on siblings) is a common source of bugs.

## Decision

`Dialog` and `Drawer` share a `Modal` base built on `<dialog>` with `showModal()`. A Drawer is a dialog pinned to an edge.

- Scroll lock: `html:has(.yarcl-modal[open])`.
- Stacked dialogs: open modals are tracked in order, and all but the topmost get `data-yarcl-covered`, which hides their backdrop, so nesting dims once.
- React propagates `close` events through the component tree, so a dialog ignores `close` events whose target isn't itself.
- Dialogs set `margin: auto`, since common CSS resets break native centering.
- Toasts live in a `popover="manual"` region and portal into the topmost open modal, because a modal makes everything outside it inert.

## Consequences

- Top layer, Esc, inert background and focus return come from the browser.
- Anything that must stay interactive over a modal has to render inside it.
