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
| Reserved names | Token group names (`color`, `size`, `radius`, `variant`, …) can't be component names | Avoids `yarcl-size` component vs `yarcl-size-*` modifier collision |
| Units | rem for sizes and type; px only for borders and focus rings | Respects user font-size setting |
| Control height | Fixed `height` in rem from the shared size scale; buttons `nowrap` | Same approach as Chakra/Mantine/shadcn/Radix; same size = same height by construction |
| Color modes | Each color is a `{ light, dark }` pair → `light-dark()`; `:root { color-scheme: light dark }` | Automatic with OS; manual toggle via `color-scheme` on any element; no JS |
| Foreground colors | Computed by contrast at build time; optional `on` override per color | Readable text on any semantic color |
| Floating elements | `@floating-ui/react` | Positioning + hover/focus/dismiss/list navigation/typeahead |
| Dialog & Drawer | Native `<dialog>` + `showModal()`; Drawer is a `<dialog>` pinned to an edge | Top layer, Esc, backdrop, inert background for free; one primitive for both |
| Docs | JSDoc on all public exports (`@example`, `@default`) | Docs site generated via TypeDoc / react-docgen-typescript |
| Bundlers | Vite only | webpack/Turbopack are straightforward aliases; out of scope for now |

## API conventions

- Token props on every relevant component: `size`, `color`, `radius`, `variant` — typed from config, defaults from `config.defaults`.
- Extend native element props, omitting the ones yarcl replaces (`color`, `size`). `ref` passes through (React 19).
- Controlled + uncontrolled: `value` / `defaultValue` / `onValueChange`.
- Compound components for complex widgets: `Tabs.List`, `Tabs.Trigger`, `Tabs.Panel`, `Select.Option`, `Table.Row`.
- `className` and `style` merge, never replace.

## Config schema (target)

```ts
export default defineConfig({
  colors: {
    brand:  { light: '#2d4bb8', dark: '#8aa2ff' },
    danger: { light: '#dc2626', dark: '#f87171', on: '#fff' },
  },
  sizes: {
    md: { height: '2.5rem', paddingX: '1rem', fontSize: '0.875rem' },
  },
  radii: { soft: '0.375rem', pill: '9999px' },
  typography: {
    families: { sans: '…', mono: '…' },
    styles: {
      display: { family: 'sans', size: '2.25rem', weight: 700, lineHeight: 1.2 },
      body:    { family: 'sans', size: '1rem',    weight: 400, lineHeight: 1.5 },
    },
  },
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem' },
  shadows: { sm: '…', md: '…' },
  zIndex: { dropdown: 1000, tooltip: 1100, dialog: 1200, toast: 1300 },
  motion: { durations: { fast: '120ms', base: '200ms' }, easings: { standard: '…' } },
  focusRing: { width: '3px', offset: '0px', color: 'brand' },
  borders: { width: '1px', color: { light: '#d0d5dd', dark: '#2e333d' } },
  iconSizes: { md: '1rem' },
  variants: { button: ['solid', 'outline', 'ghost'] },
  density: { compact: '…', comfortable: '…' },
  defaults: { size: 'md', radius: 'soft', color: 'brand' },
});
```

### `defineConfig` checks

- `defaults` entries are existing keys (done)
- Every color has `light` and `dark`
- Keys are valid in class names (no spaces, dots)
- Cross-token references resolve (e.g. `focusRing.color` is a color key, a text style's `family` is a family key)
- Dev-server warning when a color fails WCAG contrast against its foreground, in either mode

## Components

**Controls (shared size scale)**
`Button`, `IconButton`, `Input`, `Textarea`, `Checkbox`, `Radio`, `Switch`

**Forms**
`Field` (label, helper text, error; `aria-describedby` wiring)

**Typography & layout**
`Text`, `Heading`, `Link`, `Stack`, `Inline`, `Card`, `Divider`

**Floating (Floating UI)**
`Popover` (base), `Menu`, `Select`, `Combobox` (typeahead / autocomplete / searchable / async), `Tooltip`, `HoverCard`, shared `Listbox` + `Option`. Optional: `MultiSelect`.

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
  - JSDoc on every new public export
  - One git commit per phase
- **`PLAN.md` is updated whenever a decision changes.**

### Roadmap

1. **Foundation**
   - Plugin generates `virtual:yarcl.css`; remove inline `tokenStyle`
   - Rename classes `y-*` → `yarcl-*`; generated `yarcl-{group}-{key}` modifiers
   - rem defaults; `light-dark()` color pairs; computed foreground colors
   - New token groups: typography, spacing, shadows, zIndex, motion, focusRing, borders, iconSizes
   - `defineConfig` checks
   - Config merge: export library `defaults` so consumers can spread and extend
2. **Controls** — `IconButton`, `Textarea`, `Checkbox`, `Radio`, `Switch`, `Field`, `variants`
3. **Typography & layout** — `Text`, `Heading`, `Link`, `Stack`, `Inline`, `Card`, `Divider`
4. **Floating** — `Popover` → `Listbox` → `Menu`, `Select`, `Combobox`, `Tooltip`, `HoverCard`
5. **Overlays, navigation, data** — `Dialog`, `Drawer`, `Toast`, `Tabs`, `Table` (+ `density`)
6. **Feedback** — `Badge`, `Alert`, `Spinner`, `Skeleton`
7. **Showcase** — generated reference page from config; second consumer app with a different brand; docs site from JSDoc; decision record (alias vs augmentation vs codegen)

## Out of scope

- List virtualization (keep `Listbox` API compatible)
- webpack / Turbopack / Rollup adapters (unplugin later)
- Multiple themes in one build
- Tailwind `@theme` generation (later, optional)
- Native `appearance: base-select` (revisit when browser support is broad)
