# ADR 0006: Runtime theme switching

- Status: accepted
- Date: 2026-09-23

## Context

ADR 0001 fixes one config per build. Previews, playgrounds and theme pickers still need to switch themes without a rebuild. Swapping CSS alone isn't enough: themes also change defaults (pill buttons, compact tables).

## Decision

`applyTheme(theme)` and `resetTheme()` in `yarcl/css`:

- inject `generateCss(theme)` into a `<style>` that overrides the build-time CSS
- swap the active config in `runtime.ts`, which components subscribe to through `useSyncExternalStore`, so they re-render with the theme's defaults

Bundled themes satisfy `ThemeContract`, whose keys come from the library defaults, so any theme can replace another without breaking prop values.

## Consequences

- Types still come from the build-time config. A runtime theme must define every key the app uses; the contract enforces this for bundled themes.
- Components must read config through `useConfig` / `useDefaults`, never `import config` at module scope.
- Still one active theme per page; nested themes would need a Provider (see ADR 0001, "When to revisit").
