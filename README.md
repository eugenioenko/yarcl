# config-to-types pipeline

A proof of concept for eliminating an entire class of silent runtime bugs using three TypeScript primitives that already exist in your stack.

> This repo is the reference implementation. Read the full writeup: [config-to-types pipeline](https://codelog.yy-dev.top/posts/config-to-type-pipeline)

---

## The problem

These bugs ship to production constantly:

```ts
// flags
useFlag('premiumFeaure')        // typo — silently returns false, gate is open

// translations
t('nav.hme')                    // typo — silently renders raw key or empty string

// env
process.env.VITE_API_URL        // removed from .env — silently undefined at runtime

// design system
<Button size="extralarge" />    // not a real size — silently falls back or breaks
```

None of these are caught by TypeScript because the APIs accept `string`. The type is correct — the *contract* is wrong. There is no enforcement between what your config defines and what your code consumes.

The usual fixes are runtime validation, integration tests, or careful code review. All of them catch the bug *after* it exists.

---

## The pattern

Three TypeScript/Vite primitives, combined:

**1. `as const` — freeze your config as a literal type**
```ts
export const flags = {
  darkMode: false,
  premiumFeature: false,
} as const;
```

**2. `keyof typeof` — derive a union from the config**
```ts
import type { flags } from '@yarcl/flags';
export type FlagKey = keyof typeof flags; // "darkMode" | "premiumFeature"
```

**3. Vite module alias — point `@yarcl/flags` at the consumer's config**
```ts
// vite.config.ts
resolve: {
  alias: { '@yarcl/flags': '/src/flags.config.ts' }
}
```

The result: `useFlag()` only accepts `"darkMode" | "premiumFeature"`. A typo is a red squiggle before you save the file. Rename a flag in config and every stale callsite breaks at compile time, not in production.

No codegen. No CLI. No runtime type engine. The config file *is* the type definition.

---

## Four pipelines

The same three primitives apply to four common problems:

### Design system

```ts
// consumer/src/yarcl.config.ts
export const yarcl = {
  button: {
    sizes: { xs: '28px', sm: '36px', md: '44px', lg: '52px' },
    radii: { none: '0px', sm: '4px', md: '8px', rounded: '9999px' },
  },
  colors: { primary: '#2d4bb8', danger: '#dc2626' },
} as const;

// library derives:
type ButtonSize   = keyof typeof yarcl.button.sizes;  // "xs" | "sm" | "md" | "lg"
type ButtonRadius = keyof typeof yarcl.button.radii;  // "none" | "sm" | "md" | "rounded"
type ButtonColor  = keyof typeof yarcl.colors;        // "primary" | "danger"

// consumer gets:
<Button size="xs" color="primary" />  // ✓
<Button size="xxl" />                 // ✗ TS error
```

The consumer controls exactly how many sizes, radii, and colors exist. Three brand colors? Two button sizes? The type system enforces it — nothing else is valid.

### Feature flags

```ts
// consumer/src/flags.config.ts
export const flags = {
  darkMode: false,
  betaEditor: true,
  premiumFeature: false,
} as const;

// usage
const enabled = useFlag('betaEditor');   // ✓ boolean
const enabled = useFlag('betaEditr');    // ✗ TS error
```

Rename or remove a flag in config → every stale `useFlag()` call breaks at compile time.

### Translations

```ts
// consumer/src/i18n.config.ts
export const translations = {
  en: { 'nav.home': 'Home', 'button.submit': 'Submit' },
  es: { 'nav.home': 'Inicio', 'button.submit': 'Enviar' },
} as const;

// usage
const { t } = useTranslation('en');
t('nav.home')    // ✓ "Home"
t('nav.hme')     // ✗ TS error — not a key in the config
```

Compare to i18next TypeScript support, which requires module augmentation in a separate `.d.ts` file that must be kept in sync manually. This approach starts typed — the config is the source of truth, no gap to maintain.

### Environment variables

```ts
// consumer/src/env.config.ts
export const envSchema = {
  VITE_API_URL: '',
  VITE_APP_NAME: '',
} as const;

// usage
env.VITE_API_URL    // ✓ string
env.VITE_TYPO       // ✗ TS error — not declared in schema
```

Only variables declared in the schema are accessible. Remove a variable from the schema and all usages break immediately.

---

## Type flow

```
consumer/src/flags.config.ts      (as const)
  ↓ Vite alias: @yarcl/flags
library/src/features/flags/flags.types.ts
  export type FlagKey = keyof typeof flags
  ↓
library/src/features/flags/useFlag.ts
  export function useFlag(key: FlagKey): boolean
  ↓
consumer/src/App.tsx
  useFlag('betaEditor')   ← only valid keys autocomplete
```

The library never hardcodes the consumer's config. The alias makes the consumer's file the module the library imports from. Types flow through — the library's types *are* the consumer's types.

---

## Why this hasn't been the default

The tools always existed. `as const` has been in TypeScript since 3.4 (2019). Module aliases are in every bundler. `keyof typeof` is basic TypeScript.

The insight is that these three primitives, combined, eliminate the need for:
- Codegen (Panda CSS, i18next-codegen)
- Runtime type engines (Stitches, vanilla-extract)
- Module augmentation boilerplate (i18next TypeScript guide)
- Manual union types that go stale

Each existing solution solves one problem. This is a general pattern.

---

## Limitations

**Vite-only (currently).** The plugin uses Vite's `resolve.alias`. A webpack equivalent is straightforward but not built yet. Next.js, Rsbuild, and other bundlers would each need their own adapter.

**Needs library adoption.** For maximum value, hooks like `useTranslation` and `useFlag` should be distributed by the actual libraries (i18next, LaunchDarkly, etc.) with config-aware types. Until then, the pattern requires either using this library's implementations or wrapping existing ones.

**No runtime validation.** Types are erased at runtime. If your config changes between build and deploy, nothing catches it. This is intentional — the pattern is about development-time correctness, not runtime guarantees. Pair it with Zod schemas if you need runtime validation.

---

## Running the demo

```bash
pnpm install
cd consumer && pnpm dev
```

Try these in `consumer/src/App.tsx` to see the type errors:

```ts
useFlag('nonExistentFlag')           // TS error
t('missing.key')                     // TS error
env.UNDECLARED_VAR                   // TS error
<Button size="gigantic" />           // TS error
```

Add a new key to any config file — it becomes valid immediately, with autocomplete.

---

## Structure

```
library/   — the pattern implementation (package: yarcl)
consumer/  — demo app showing all four pipelines
```
