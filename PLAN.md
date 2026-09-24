# yarcl — Plan

A component library where the **consumer's config is the design system**. The library ships mechanisms; the config makes the decisions. Every config key is both a valid prop value (types) and a rendered style (CSS) — from one file.

## Decisions

| Topic | Decision | Why |
|---|---|---|
| Config delivery | Module alias `@yarcl/config` (Vite plugin + tsconfig `paths`) | One file is both types and runtime values; can't drift. Augmentation + Provider needs two wires and fails silently. |
| Fallback | Plugin aliases library default if consumer file is missing; tsconfig `paths` lists consumer file first, default second | Works with zero config |
| Types | `keyof` over the config; `defineConfig` with `const` generic | No codegen |
| Styling | Plain CSS, no Tailwind in the library | Consumer keys are unknown at build time; don't force Tailwind on consumers. Optional generated `@theme` later. |
| CSS from config | Plugin generates `virtual:yarcl.css` at build time | No inline styles (CSP-safe), SSR-safe, no flash, tokens usable in consumer CSS, HMR on config change |
| Class naming | `yarcl-{component}`, `yarcl-{component}-{element}` (static); `yarcl-{group}-{key}` (generated, shared across components) | Generated CSS scales with keys, not components × keys. Group in the name prevents key collisions. |
| Reserved names | Token group and modifier names (`color`, `size`, `radius`, `type`, `variant`, `gap`, `padding`, `shadow`, `density`, `align`, `justify`) can't be component names | Avoids `yarcl-size` component vs `yarcl-size-*` modifier collision |
| Token groups | **Open** (`colors`, `sizes`, `radii`, `spacing`, `shadows`, `typography`): any keys. **Required + extras** (`neutrals`, `zIndex`, `motion`, `borders`): keys the library uses are required, any extra keys allowed and emitted as CSS variables | Consumer overrides every value and adds any key; the library can still rely on the names it needs |
| Neutrals | Required `neutrals` group: `bg`, `surface`, `text`, `muted`, `border` | Components need background/text/border colors that aren't semantic `color` prop values |
| Variants | Open `variants` group of recipes: `background` (`fill`/`tint`/`none`), `border` (`color`/`neutral`/`none`), `text` (`on`/`color`/`neutral`). Generated `.yarcl-variant-{k}` sets `--yarcl-v-*` variables, shared across components | Consumers invent variants without library code; one group serves Button, IconButton, later Badge/Alert |
| Error color | `defaults.errorColor` (a color key) → `--yarcl-error`; controls with `aria-invalid="true"` use it | Color keys are the consumer's, so there's no guaranteed `danger` |
| Field | `Field` provides `id`, `aria-describedby`, `aria-invalid`, `required` to its control via context (`useFieldProps`) | Accessible labelling without prop plumbing; works for Input, Textarea, Checkbox, Switch |
| Selection controls | Native inputs with `appearance: none`; box size from the size's `iconSize`; Switch is `<input type="checkbox" role="switch">` | Native form behavior, keyboard and `checked`/`onChange` for free |
| Text & Heading | `Text` (`as`, `textStyle`, `color`, `muted`, `truncate`); `Heading` requires `level` (semantics) and takes `textStyle` (look) separately | Heading level follows document structure; visual size is a design decision |
| Layout | `Stack` / `Inline` with `gap` from spacing, static `align` / `justify`; `Card` with `padding`, `radius`, `shadow`; `Divider` has no spacing prop — the parent's `gap` spaces it | Spacing lives in one place: the layout container |
| Shadows | Plain strings; use `light-dark()` for the shadow color so it works in dark mode | Shadows need to be stronger on dark backgrounds |
| Feedback | `Badge` and `Alert` use variant recipes with `defaults.softVariant`; `Badge` with `onRemove` is a removable tag; `Alert` has no live role unless `live` is set; `Spinner` inherits `currentColor` and the surrounding control's icon size; `Button`/`IconButton` `loading` disables, sets `aria-busy` and shows a Spinner; `Skeleton` uses `shape` (`text`/`control`/`circle`/`rect`) so it matches text styles and control heights | Loading placeholders line up with the content that replaces them |
| Typography | `typography.fontFaces` → `@font-face` rules (format inferred, `local()` supported, `font-display: swap` default); `typography.headings` maps h1–h6 to text styles, so `<Heading level={n}>` renders `<hN>` with the configured look; `defaults.labelStyle` / `defaults.helperStyle` style Field labels, legends, helper and error text | Brand fonts and heading scale are design decisions, so they live in the config |
| Groups | `ButtonGroup` passes size/color/variant/radius to child buttons and can attach them (shared borders, variant-derived separators); `ToggleGroup` (`single`/`multiple`, `aria-pressed`, roving tab stop, arrow keys, `required`), unselected/selected variants from `defaults.softVariant` / `defaults.variant`; `RadioGroup` is a fieldset/legend with shared name and value | Segmented controls and grouped actions without new tokens |
| Reference page | `DesignReference` (`yarcl/reference`) renders the active config with library components: colors with contrast ratios, size scale with live controls, variants, spacing, shadows, fonts, text styles, heading levels, density, other tokens, defaults | The config documents itself |
| Testing | `pnpm test:e2e`: Playwright (`playwright-core`, system Chrome or `CHROME_PATH`) against both consumers, light and dark; `pnpm typecheck` includes `@ts-expect-error` contract files in library and both consumers | Repeatable checkpoints |
| Component defaults | Optional `components: { Button: { radius: 'square' }, … }`; each component accepts only its own token props, values checked against the config; resolution: prop → enclosing group → `components.<Name>` → `defaults` | Opinions per component ("buttons are always sharp") belong in the config, not at every call site |
| Radius scale | Radii are named like sizes (`sm`, `md`, `lg`, `xl`) plus exceptions (`square`, `rounded`). `defaults.radius` is one fixed key (`md`) for every component; consumers change it globally or per component. Opt-in: `defaults.radius: 'size'` makes controls use the radius named like their size (`'size'` is a reserved key) | Predictable corners by default; scaling with size only when asked for |
| Themes | `yarcl/themes`: four deliberately different themes (Brutalist, Bloom, Compact, Editorial) built with `defineConfig` and checked with `satisfies ThemeContract` (the defaults' keys), so they're interchangeable; `yarcl/css` exports `generateCss` for runtime switching | Reusable starting points; the contract makes themes swappable without touching app code |
| Runtime themes | `yarcl/css` exports `applyTheme(theme)` / `resetTheme()`: injects `generateCss` output and swaps the active config held in `runtime.ts`; components read defaults (`defaults`, `components`, heading levels, label styles) at render time via `useDefaults` / `useConfig` (`useSyncExternalStore`), so they re-render with the new theme's defaults. Types still come from the build-time config | Runtime switching previously changed values but not defaults (Bloom lost its pill buttons, Compact its compact tables) |
| Theme playground | Standalone Astro page `/theme-playground/` (outside Starlight) rendering a dashboard; themes applied by injecting `generateCss` output into a `<style>`; editor evaluates a config object, checks the contract and shows contrast warnings | Full-page so portals and dialogs are themed too |
| Focus ring | One `:where(...)`-scoped `:focus-visible` rule for every focusable component, from `focusRing` (`width`, `offset`, `color`, `style`); inputs add their own-color border; tabs draw it inset; highlighted listbox/menu options use a solid fill (`--yarcl-c` / `--yarcl-c-on`) instead of a ring | Consistent, configurable focus; options were 1.2:1 against the panel before |
| Text shades | Each color also gets `--yarcl-color-{k}-text` per scheme: the color itself if it reaches 4.5:1 against bg, surface and tints (0, 14%, 22%), otherwise mixed toward `neutrals.text` in 5% steps until it does; optional `text` override. Variants with `text: 'color'`, colored `Text`, `Link`, menu items and toast actions use it; backgrounds and borders keep the exact color | axe found mid-tone colors (green/amber/red) at 3.7–3.95:1 as text on their own tint |
| Accessibility tests | `e2e/suites/a11y*.mjs`: axe-core (WCAG 2.2 A/AA) on both consumers, light and dark, including open overlays | Catches contrast and ARIA regressions in context |
| Stacked dialogs | Open modals are tracked in order; all but the topmost get `data-yarcl-covered`, which hides their backdrop, so nesting dims once; a dialog ignores `close` events from nested dialogs (React propagates them through the component tree); dialogs set `margin: auto` so CSS resets don't break centering | One backdrop, predictable Esc |
| Modal sizes | Open `modalSizes` group of widths; `Dialog` and `Drawer` take `size` from it (separate from control `sizes`); `defaults.modalSize`; library defaults set `components.Drawer.size: 'sm'`; the free-form `width` prop was removed | Every panel width comes from the config |
| Icon size | Part of each `sizes` entry (`iconSize`), not a separate group | Icons follow the control size automatically |
| Text styles | Generated `.yarcl-type-{key}` classes; `family` references a `typography.families` key | Text styles usable before `Text` exists; group named `type` so the `Text` component can be `yarcl-text` |
| Plugin runtime | Vite loads the plugin with Node's TS type stripping; relative imports in plugin code use `.ts` extensions. Publishing requires compiling the plugin (Node won't strip types inside `node_modules`) | Works from source in the workspace today |
| Units | rem for sizes and type; px only for borders and focus rings | Respects user font-size setting |
| Control height | Fixed `height` in rem from the shared size scale; buttons `nowrap` | Same approach as Chakra/Mantine/shadcn/Radix; same size = same height by construction |
| Color modes | Each color is a `{ light, dark }` pair → `light-dark()`; `:root { color-scheme: light dark }` | Automatic with OS; manual toggle via `color-scheme` on any element; no JS |
| Foreground colors | Computed by contrast at build time; optional `on` override per color | Readable text on any semantic color |
| Floating elements | `@floating-ui/react`; positioned with `top`/`left` (`transform: false`) so CSS can animate `transform`; shared `.yarcl-panel` surface with `defaults.floatingShadow` | Positioning + hover/focus/dismiss/list navigation/typeahead |
| Floating APIs | `Popover` and `Menu` are compound (`.Trigger`, `.Content`, `.Item`, `.Separator`); `Tooltip` and `HoverCard` wrap their trigger and take `content`; triggers are cloned with merged refs and props | Compound where there's structure; a wrapper where there's one trigger and one payload |
| Select & Combobox data | `options: { value, label, disabled? }[]` prop instead of `Select.Option` children; generic value type | Selected label is known while closed; filtering and async results are plain data |
| Combobox modes | One component: searchable select (default), typeahead (`allowCustomValue`), async (`filter={false}` + `onInputValueChange` + `loading`) | One set of keyboard and ARIA behavior |
| Menu focus | Keyboard open focuses the first item; pointer open focuses the menu (Floating UI `focusItemOnOpen: 'auto'`) | Same as Radix / WAI-ARIA practice |
| Dialog & Drawer | Native `<dialog>` + `showModal()` via a shared `Modal` base; Drawer is a `<dialog>` pinned to an edge. Flat API: `title`, `description`, `children`, `footer`, optional `trigger`, controlled or uncontrolled. Scroll lock via `html:has(.yarcl-modal[open])`. Library-styled close button (no consumer keys assumed) | Top layer, Esc, backdrop, inert background and focus return for free; one primitive for both |
| Toast | Imperative `toast({...})` + one `<Toaster />`; `popover="manual"` region in the top layer; portals into the topmost open modal `<dialog>` so toasts stay clickable; over-limit toasts dismissed oldest-first; pause on hover/focus; `urgent` → `role="alert"` | A modal dialog makes everything outside it inert, including top-layer popovers |
| Tabs | Compound (`List`, `Trigger`, `Panel`); automatic activation; arrow keys, Home/End, skips disabled; roving tabindex; `value` or `defaultValue` required by type | WAI-ARIA tabs pattern |
| Table | Semantic compound wrapper (`Head`, `Body`, `Row`, `HeaderCell`, `Cell`); open `density` group (`paddingX`, `paddingY`, `fontSize`) → `.yarcl-density-{k}`; `align="end"` uses tabular numbers | Density is a design decision, so it lives in the config |
| Docs | JSDoc on all public exports (`@example`, `@default`) | Docs site generated via TypeDoc / react-docgen-typescript |
| Bundlers | Vite only | webpack/Turbopack are straightforward aliases; out of scope for now |

## API conventions

- Token props on every relevant component: `size`, `color`, `radius`, `variant` — typed from config, defaults from `config.defaults`.
- Extend native element props, omitting the ones yarcl replaces (`color`, `size`). `ref` passes through (React 19).
- Controlled + uncontrolled: `value` / `defaultValue` / `onValueChange`.
- Compound components for complex widgets: `Tabs.List`, `Tabs.Trigger`, `Tabs.Panel`, `Select.Option`, `Table.Row`.
- `className` and `style` merge, never replace.

## Config schema

Implemented in `library/src/define.ts`. Library defaults in `library/src/yarcl.config.ts`, the same filename a consumer uses; consumers spread `yarcl/defaults` to extend instead of replace.

```ts
import { defineConfig } from 'yarcl/define';
import defaults from 'yarcl/defaults';

export default defineConfig({
  ...defaults,
  colors: {
    brand:  { light: '#2d4bb8', dark: '#8aa2ff' },
    danger: { light: '#dc2626', dark: '#f87171', on: '#fff' },
  },
  neutrals: { bg, surface, text, muted, border /* + any extra { light, dark } */ },
  sizes: {
    md: { height: '2.5rem', paddingX: '1rem', fontSize: '0.875rem', iconSize: '1rem' },
  },
  radii: { square: '0', sm: '0.25rem', md: '0.375rem', lg: '0.5rem', rounded: '9999px' },
  variants: {
    solid:   { background: 'fill', border: 'color', text: 'on' },
    outline: { background: 'none', border: 'color', text: 'color' },
  },
  spacing: { tight: '0.5rem', normal: '1rem', loose: '2rem' },
  shadows: { sm: '…', md: '…' },
  density: { compact: { paddingX: '0.5rem', paddingY: '0.25rem', fontSize: '0.8125rem' } },
  typography: {
    fontFaces: [{ family: 'Fraunces', src: '/fonts/fraunces.woff2', weight: '100 900' }],
    families: { sans: '…', mono: '…' },
    styles: {
      display: { family: 'sans', size: '2.25rem', weight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' },
      body:    { family: 'sans', size: '1rem',    weight: 400, lineHeight: 1.5 },
    },
    headings: { h1: 'display', h2: 'title', h3: 'title', h4: 'body', h5: 'body', h6: 'body' },
  },
  zIndex: { dropdown: 1000, tooltip: 1100, dialog: 1200, toast: 1300 /* + extras */ },
  motion: { fast: '120ms', base: '200ms', easing: '…' /* + extras */ },
  borders: { width: '1px' /* + extras */ },
  focusRing: { width: '2px', offset: '2px', color: 'brand' },
  components: { Button: { radius: 'square' } },
  defaults: {
    size: 'md', radius: 'md', color: 'brand', variant: 'solid', errorColor: 'danger',
    textStyle: 'body', labelStyle: 'label', helperStyle: 'caption', gap: 'normal', padding: 'normal', floatingShadow: 'md', density: 'compact', softVariant: 'subtle',
  },
});
```

### Generated CSS

- `:root` variables: `--yarcl-color-{k}`, `--yarcl-color-{k}-on`, `--yarcl-neutral-{k}`, `--yarcl-size-{k}-{height|padding-x|font-size|icon-size}`, `--yarcl-radius-{k}`, `--yarcl-space-{k}`, `--yarcl-shadow-{k}`, `--yarcl-font-{k}`, `--yarcl-z-{k}`, `--yarcl-motion-{k}`, `--yarcl-border-{k}`, `--yarcl-focus-{width|offset|color}`
- Modifier classes set component-level variables: `.yarcl-color-{k}` → `--yarcl-c`, `--yarcl-c-on`; `.yarcl-size-{k}` → `--yarcl-h`, `--yarcl-px`, `--yarcl-fs`, `--yarcl-icon`; `.yarcl-radius-{k}` → `--yarcl-r`
- `.yarcl-variant-{k}` → `--yarcl-v-bg`, `--yarcl-v-bg-hover`, `--yarcl-v-bg-active`, `--yarcl-v-border`, `--yarcl-v-fg`
- `.yarcl-type-{k}` sets font properties directly
- `.yarcl-gap-{k}`, `.yarcl-padding-{k}` from `spacing`; `.yarcl-shadow-{k}` from `shadows`
- `--yarcl-error` from `defaults.errorColor`; `--yarcl-floating-shadow` from `defaults.floatingShadow`; `--yarcl-padding` / `--yarcl-gap` from `defaults.padding` / `defaults.gap`
- `.yarcl-density-{k}` → `--yarcl-cell-px`, `--yarcl-cell-py`, `--yarcl-cell-fs`
- Keys are CSS-escaped, so any non-whitespace key works

### `defineConfig` checks

- [x] `defaults` entries are existing keys (`size`, `radius`, `color`, `variant`, `errorColor`, `textStyle`, `labelStyle`, `helperStyle`, `gap`, `padding`, `floatingShadow`, `density`, `softVariant`)
- [x] Every color has `light` and `dark`
- [x] Keys contain no whitespace (other characters are escaped in CSS)
- [x] `focusRing.color` is a color key; each text style's `family` is a family key; every `typography.headings` level is a style key
- [x] Required keys present in `neutrals`, `zIndex`, `motion`, `borders`
- [x] Build/dev warning when a color's foreground fails WCAG AA (4.5:1) in either mode, or can't be computed (non-hex without `on`)

Contract tests: `library/src/define.check.ts`, `consumer/src/contract.check.tsx`.

## Components

**Controls (shared size scale)**
`Button`, `IconButton`, `ButtonGroup`, `ToggleGroup`, `Input`, `Textarea`, `Checkbox`, `Radio`, `RadioGroup`, `Switch`

**Forms**
`Field` (label, helper text, error; `aria-describedby` wiring)

**Typography & layout**
`Text`, `Heading`, `Link`, `Stack`, `Inline`, `Card`, `Divider`

**Floating (Floating UI)**
`Popover` (base), `Menu`, `Select`, `Combobox` (typeahead / autocomplete / searchable / async), `Tooltip`, `HoverCard`; shared `.yarcl-listbox` / `.yarcl-option` styles. Optional: `MultiSelect`.

**Overlays**
`Dialog`, `Drawer` (`side: "left" | "right"`), `Toast`

**Navigation & data**
`Tabs`, `Table`

**Feedback**
`Badge` / `Tag`, `Alert` / `Callout`, `Spinner`, `Skeleton`. Optional: `Avatar`.

## Phases

### Process

- **Phase 0:** `git init`, commit current state.
- **Phase 1 is built carefully, then stops for review** — everything else depends on its CSS generation, class naming and config schema.
- **Phases 2–6 are built one whole phase at a time**, following the pattern set in Phase 1.
- **Checkpoint at the end of every phase:**
  - `pnpm typecheck` passes, including `@ts-expect-error` contract checks for invalid props on every new component
  - Demo page has a section per new component, checked in a browser in light and dark mode
  - Interactive components: scripted keyboard/mouse checks in a real browser (Playwright driving the installed Chrome)
  - JSDoc on every new public export
  - One git commit per phase
- **`PLAN.md` is updated whenever a decision changes.**

### Roadmap

1. **Foundation** ✅
   - Plugin generates `virtual:yarcl.css`; remove inline `tokenStyle`
   - Rename classes `y-*` → `yarcl-*`; generated `yarcl-{group}-{key}` modifiers
   - rem defaults; `light-dark()` color pairs; computed foreground colors
   - New token groups: neutrals, typography, spacing, shadows, zIndex, motion, focusRing, borders (icon size folded into `sizes`)
   - `defineConfig` checks
   - Config merge: export library `defaults` so consumers can spread and extend
2. **Controls** ✅ — `IconButton`, `Textarea`, `Checkbox`, `Radio`, `Switch`, `Field`, `variants`
   - `RadioGroup` (fieldset/legend) added in Phase 7
3. **Typography & layout** ✅ — `Text`, `Heading`, `Link`, `Stack`, `Inline`, `Card`, `Divider`
4. **Floating** ✅ — `Popover` → `Listbox` → `Menu`, `Select`, `Combobox`, `Tooltip`, `HoverCard`
5. **Overlays, navigation, data** ✅ — `Dialog`, `Drawer`, `Toast`, `Tabs`, `Table` (+ `density`)
6. **Feedback** ✅ — `Badge`, `Alert`, `Spinner`, `Skeleton`
7. **Showcase** ✅ — `DesignReference` from config; `e2e/consumer` (Maison Talla, originally `consumer-b`) with a different brand, web font and keys; TypeDoc API docs (`pnpm docs:api`); ADR 0001 (alias vs augmentation vs codegen); README; e2e suites in repo (`pnpm test:e2e`)
   - Also added: `typography.fontFaces`, `typography.headings`, `defaults.labelStyle` / `helperStyle`, `ButtonGroup`, `ToggleGroup`, `RadioGroup`

## Out of scope

- List virtualization (keep `Listbox` API compatible)
- webpack / Turbopack / Rollup adapters (unplugin later)
- Multiple themes in one build
- Tailwind `@theme` generation (later, optional)
- Native `appearance: base-select` (revisit when browser support is broad)
