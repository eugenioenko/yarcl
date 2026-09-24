# Adding a component

Checklist for an agent adding a new component to yarcl. Every step is required; a component isn't done until all of them pass. Use an existing component of the same kind as the model (`Badge` for simple, `Popover` for floating, `Dialog` for overlays, `RadioGroup` for grouped controls).

Throughout, `Foo` is the component name and `foo` its kebab-case form.

## 1. Component

Create `library/src/components/Foo.tsx`.

- Export `FooProps` and `Foo` as a named function. No default exports.
- Extend the native element's props: `extends Omit<ComponentProps<'div'>, 'color'>` (omit any native attribute a token prop shadows).
- Token props use the config-derived types from `library/src/types.ts` (`Size`, `Radius`, `Color`, `Variant`, `Spacing`, `Shadow`, `Density`, `ModalSize`, `TextStyle`), or `TokenProps` / `VariantProps`. Never hardcode token values as string unions.
- Render classes only, no inline token styles. Root class is `yarcl-foo`; modifiers come from the helpers in `library/src/classes.ts` (`sizeClass`, `radiusClass`, `colorClass`, `variantClass`, `gapClass`, `paddingClass`, `shadowClass`, `typeClass`, `densityClass`). Join with `cx`, and pass the consumer's `className` last.
- Resolve defaults at render time: `prop ?? own.prop` with `const own = useDefaults('Foo')`, falling back to `useConfig().defaults` where needed. Never read the config at module scope, or runtime themes (`applyTheme`) won't apply.
- Spread `...props` onto the root and keep native behavior (`type="button"`, `disabled`, refs via props).
- Accessibility: correct roles, `aria-*` wiring, keyboard support, and a visible focus state (the global `:focus-visible` rule covers focusable elements; don't add another outline).
- Floating content uses the helpers in `library/src/floating.tsx`; modal content uses native `<dialog>` like `Dialog`/`Drawer`.
- JSDoc on the component and every prop (summary, `@default`, one `@example`). These feed the docs props table. No other comments unless critical.
- No em dashes anywhere (code, JSDoc, docs, copy).

## 2. Styles

Add a `/* Foo */` section to `library/src/styles.css`.

- Use the variables set by modifier classes: `--yarcl-h`, `--yarcl-px`, `--yarcl-fs`, `--yarcl-icon` (size), `--yarcl-r` (radius), color and variant variables, and the `:root` token variables. No literal colors, sizes or radii.
- Support dark mode through the token variables (they already use `light-dark()`); don't add dark-mode rules.
- Respect `prefers-reduced-motion` for any animation.
- If the component needs a new config-driven class or variable, add it to `generateCss` in `library/src/css.ts`, not to `styles.css`.

## 3. Exports

In `library/src/index.ts`, add in the matching section:

```ts
export { Foo } from './components/Foo';
export type { FooProps } from './components/Foo';
```

## 4. Component defaults

If `Foo` has token props, add it to `ComponentTokenProps` in `library/src/define.ts` with exactly the props it reads through `useDefaults`:

```ts
Foo: 'size' | 'radius' | 'color';
```

Then add a row to the table in `docs-web/src/content/docs/configuration/component-defaults.md`.

## 5. Config (only if the component needs new tokens)

If a new config group or key is needed:

- Add it to `YarclShape` in `library/src/define.ts` (with JSDoc) and to `Checks<T>` if it references other keys.
- Add values to `library/src/yarcl.config.ts` and to every theme in `library/src/themes/` (`satisfies ThemeContract` fails otherwise).
- Emit it in `generateCss` (`library/src/css.ts`).
- Add a type alias in `library/src/types.ts` if the keys become prop values.
- Document it under `docs-web/src/content/docs/configuration/`.
- Add invalid-config cases to `library/src/define.check.ts`.

## 6. Type contract checks

In both `consumer/src/contract.check.tsx` and `e2e/consumer/src/contract.check.tsx`:

- Add a valid usage covering every prop.
- Add `// @ts-expect-error` cases for values outside the config (unknown size, color, etc.). The e2e fixture has different keys, so its checks must use its own config.

## 7. Demo apps

- `consumer/src`: add a demo in the matching file (`FeedbackDemo.tsx`, `FloatingDemo.tsx`, `OverlaysDemo.tsx`) or `App.tsx`, inside the right `<section>`. Use plain human-readable labels, not config keys.
- `e2e/consumer/src/App.tsx`: add it too if its styling depends on config (the fixture checks a second brand's tokens).

## 8. Browser tests

Add checks to the matching suite in `e2e/suites/`, or create one plus a test file that runs it (`consumer/tests/foo.test.ts`, calling `runSuite`):

- Behavior: open/close, keyboard, focus management, `aria-*` state.
- Styling: computed styles match the config tokens in both apps (see `brand-b.mjs`).
- Accessibility: an `audit(...)` call in `a11y.mjs` for every state that renders new DOM (open, expanded, error). Also cover it in `focus.mjs` if it's focusable.
- Poll for async state (`poll` from `e2e/suites/poll.mjs`) instead of fixed waits.

## 9. Docs site

- Page: `docs-web/src/content/docs/components/<group>/foo.mdx`, with `title`, `description` (no em dashes) and `sidebar.order`. Follow `skeleton.mdx`: import line, `<Preview>` with a demo, a code sample, notes on the tokens and accessibility, then `## Props` with `<Props of="FooProps" />`.
- Demo: export `FooDemo` from the matching file in `docs-web/src/demos/`, and render it with `client:visible`.
- Gallery: add an entry (`name`, `href`, `description`, `preview`) in `docs-web/src/demos/gallery.tsx`.
- Add it to the component list in `docs-web/src/content/docs/reference/api.md` and `README.md`.
- If it fits, use it in the playground (`docs-web/src/playground/Dashboard.tsx`) so themes show it.
- The props table comes from TypeDoc (`pnpm -C docs-web api`); a missing table means the props type isn't exported or lacks JSDoc.

## 10. Verify

Run from the repo root; all must pass:

```sh
pnpm typecheck
pnpm lint
pnpm build
pnpm test
pnpm docs:build
grep -rn "—" library/src docs-web/src README.md
```

Then look at the component in the browser in both apps and the docs page, in light and dark mode, with at least two themes (`applyTheme`), and at phone width.

Don't commit unless asked.
