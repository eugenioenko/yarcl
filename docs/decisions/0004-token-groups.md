# ADR 0004: Open token groups and required keys

- Status: accepted
- Date: 2026-09-23

## Context

The consumer should own every value and be free to add keys. But some components need values that aren't prop choices: a page background, a border color, a modal z-index.

## Decision

Two kinds of groups:

- **Open** (`colors`, `sizes`, `radii`, `variants`, `spacing`, `shadows`, `density`, `modalSizes`, `typography.styles`): any keys, and the keys become the valid prop values.
- **Required plus extras** (`neutrals`, `zIndex`, `motion`, `borders`): the keys the library uses are required; extra keys are allowed and emitted as CSS variables for the consumer's styles.

Related choices:

- Variants are recipes (`background`, `border`, `text`), not fixed names, so consumers invent variants without library code.
- The icon size is part of each `sizes` entry, so icons follow the control size.
- Anything the library needs by role (the error color, the default variant) is a `defaults` entry pointing at a key, since no key like `danger` is guaranteed to exist.

## Consequences

- Library code never assumes a key exists in an open group; it reads `defaults` instead.
- Adding a required key is a change to the contract and to every theme.
