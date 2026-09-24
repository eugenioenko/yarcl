# ADR 0005: Per-component defaults in the config

- Status: accepted
- Date: 2026-09-23

## Context

Design systems have per-component opinions ("buttons are always sharp", "drawers are narrow"). Without a place in the config, those opinions end up repeated at every call site.

## Decision

An optional `components` group: `components: { Button: { radius: 'square' } }`. Each component accepts only its own token props (`ComponentTokenProps` in `define.ts`), and values are checked against the config's keys.

A prop value resolves in this order:

1. the prop
2. the enclosing group (`ButtonGroup`), when there is one
3. `components.<Name>`
4. `defaults`

Components read steps 3 and 4 at render time (`useDefaults`, `useConfig`), never at module scope.

The default radius is one fixed key for every component. Scaling radius with size is opt-in: `defaults.radius: 'size'`.

## Consequences

- A new component with token props must be added to `ComponentTokenProps`.
- Runtime themes can change defaults, not just values (ADR 0006).
