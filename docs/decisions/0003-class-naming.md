# ADR 0003: Class naming and reserved names

- Status: accepted
- Date: 2026-09-23

## Context

Generated CSS has to scale with the consumer's keys. If every component had its own class per key (`yarcl-button-lg`, `yarcl-input-lg`), the output would grow as components × keys.

## Decision

- Static classes: `yarcl-{component}` and `yarcl-{component}-{element}`.
- Generated modifiers: `yarcl-{group}-{key}` (`yarcl-size-lg`, `yarcl-color-danger`, `yarcl-variant-outline`), shared by every component.
- A modifier sets short-lived variables (`--yarcl-h`, `--yarcl-r`, `--yarcl-c`, `--yarcl-v-*`) that component styles read. `yarcl-size-lg` means the same thing on a Button and an Input.
- Group names are reserved and can't be component names: `color`, `size`, `radius`, `type`, `variant`, `gap`, `padding`, `shadow`, `density`, `align`, `justify`. Text styles use the group `type` so the `Text` component can be `yarcl-text`.
- Reserved keys inside groups (such as the `size` radius) are rejected by `defineConfig` at compile time.

## Consequences

- Generated CSS grows with the number of keys, not components.
- Components never build class names by hand; they use the helpers in `classes.ts`.
- A new component must not take a reserved group name.
