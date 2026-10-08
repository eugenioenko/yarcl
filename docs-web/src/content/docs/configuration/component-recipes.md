---
title: Extending components
description: Build typed component extensions and custom components with config recipes and autocompleting token references.
sidebar:
  order: 12
---

Recipes bring your own components into the same design system as yarcl's built-in components. Define their slots, visual variants and defaults in your config. The build plugin generates CSS, and `createComponent` derives the React props from those definitions.

Use a recipe to give `Button` a new visual prop, or to style the elements of a custom component. The markup and behavior stay in React. The design decisions stay in the config.

## Define a recipe

Pass a second argument to `defineConfig`. Its `yarcl` parameter provides typed references to the first argument's tokens, so `yarcl.colors.success` autocompletes and a missing key is a type error.

```ts title="src/yarcl.config.ts"
import { defineConfig } from '@yarcl/react/define';
import defaults from '@yarcl/react/defaults';

export default defineConfig({
  ...defaults,
  colors: {
    ...defaults.colors,
    brand: { light: '#2d4bb8', dark: '#8aa2ff' },
  },
}, (yarcl) => ({
  recipes: {
    Action: {
      slots: {
        root: { borderRadius: yarcl.radii.rounded },
      },
      variants: {
        emphasis: {
          subtle: { root: { opacity: 0.8 } },
          strong: { root: { fontWeight: 700 } },
        },
      },
      defaults: { emphasis: 'subtle' },
    },
    OrderStatus: {
      slots: {
        root: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: yarcl.spacing.sm,
          padding: yarcl.spacing.md,
          borderRadius: yarcl.radii.md,
          backgroundColor: yarcl.neutrals.surface,
          color: yarcl.neutrals.text,
        },
        icon: { color: yarcl.colors.success },
        label: { fontWeight: 500 },
      },
      variants: {
        status: {
          pending: { icon: { opacity: 0.5 } },
          paid: { icon: { opacity: 1 } },
        },
        emphasis: {
          subtle: { label: { fontWeight: 500 } },
          strong: { label: { fontWeight: 700 } },
        },
      },
      defaults: { status: 'pending', emphasis: 'subtle' },
      compounds: [{
        when: { status: 'paid', emphasis: 'strong' },
        slots: { label: { textDecoration: 'underline' } },
      }],
    },
  },
}));
```

Every recipe requires a `root` slot. Other slot names are yours to choose. A variant axis becomes an optional prop; its keys become the allowed values. `defaults` selects values for omitted props. Compound styles apply when all their `when` choices match the resolved props and defaults.

TypeScript checks that variants and compounds style declared slots, defaults select existing choices, and compound conditions name existing axes and choices. Adding `refunded` to `OrderStatus.variants.status` immediately makes `status="refunded"` valid.

Keep your existing build plugin and TypeScript alias pointed at this file. Recipes use the same [config injection](/configuration/typescript/) as built-in component props. There is no additional extraction plugin or declaration generation step.

## Extend an existing component

```tsx title="src/Action.tsx"
import { Button, createComponent } from '@yarcl/react';

export const Action = createComponent('Action', Button);
```

The extension retains the base component's props and behavior, and adds the recipe's visual props:

```tsx
<Action emphasis="strong" onClick={save}>Save changes</Action>
<Action emphasis="subtle" href="/account">Account</Action>
<Action loading>Saving changes</Action>

// Type error: the recipe has no such emphasis.
<Action emphasis="loud">Save changes</Action>

// Type error: Button's link form does not accept disabled.
<Action href="/account" disabled>Account</Action>
```

The recipe's root classes are added to the base component's `className`. Existing classes are retained. Recipe props are consumed by the extension, so `emphasis` does not become an HTML attribute. Native attributes, event handlers, `style` and React 19 refs are passed through to the base component.

Variant axes must not overlap with inherited props. For example, an extension of `Button` cannot define a recipe axis called `size`, because `Button` already uses `size` to select its control token. Choose a separate visual prop such as `emphasis` or `appearance`. The builder reports these collisions as type errors. `children`, `className`, `style`, `ref` and `key` are reserved axes in every recipe.

Extensions add styles without replacing the base component's accessibility behavior. `Button` still provides its native action or link semantics, loading state and focus ring.

## Build a custom component with slots

Choose a native root element and provide a render callback for the named slots:

```tsx title="src/OrderStatus.tsx"
import { createComponent } from '@yarcl/react';

export const OrderStatus = createComponent(
  'OrderStatus',
  'div',
  ({ rootProps, slots }) => (
    <div {...rootProps}>
      <span className={slots.icon} aria-hidden="true">✓</span>
      <span className={slots.label}>{rootProps.children}</span>
    </div>
  ),
);
```

```tsx
<OrderStatus status="paid" emphasis="strong" role="status">
  Payment received
</OrderStatus>
```

`slots` autocompletes the recipe's exact slot names. `rootProps` contains the native element props with visual recipe props removed and the root class merged. Spread it onto the root to preserve attributes, classes, styles and refs. Use its `children` wherever your markup needs content.

Without a render callback, `createComponent('OrderStatus', 'div')` renders the chosen element with root styling and children. Additional slot classes apply only to elements where your render callback places them. Wrapping an existing component does not automatically discover or restyle its internal elements.

The recipe supplies appearance. You supply semantic markup, accessible labels, keyboard behavior and focus management for custom interactive components. Prefer extending an existing accessible component when it already supplies the behavior you need.

## Add custom behavior with useRecipe

Use the underlying hook when your component needs its own behavior props or state:

```tsx
import {
  useRecipe,
  type ExtendedComponentProps,
} from '@yarcl/react';

type PaymentProps = ExtendedComponentProps<'OrderStatus', 'button'> & {
  onConfirm: () => void;
};

export function Payment({ onConfirm, ...props }: PaymentProps) {
  const { rootProps, slots } = useRecipe('OrderStatus', props);
  return (
    <button {...rootProps} type="button" onClick={onConfirm}>
      <span className={slots.label}>{props.children}</span>
    </button>
  );
}
```

Remove your own behavior props before spreading `rootProps` onto HTML. `useRecipe` consumes the configured visual props and retains the other supplied props. Call it at the top level of your component, like any other React hook.

## Tokens, CSS and external variables

Recipe declarations use CSS property names in camel case. Token references, literal CSS and CSS variables can appear in the same object:

```ts
root: {
  backgroundColor: yarcl.colors.success,
  borderRadius: yarcl.radii.md,
  gap: yarcl.spacing.sm,
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  width: 'var(--panel-width, 100%)',
  '--local-gap': yarcl.spacing.md,
}
```

`yarcl.colors.success` is a serializable reference to `var(--yarcl-color-success)`. It contains no concrete color value and follows changes to the generated variable. CSS variables such as `--panel-width` may be supplied by an enclosing element or an external stylesheet.

Literal strings pass through as CSS. Numeric dimensional values receive `px`; zero, unitless properties such as `fontWeight`, and custom-property numbers retain their numeric value. Prefer config tokens for design decisions that should be shared or themed.

| Accessor | Reference |
|---|---|
| `yarcl.colors.success` | Semantic color value |
| `yarcl.neutrals.surface` | Neutral color value |
| `yarcl.spacing.sm` | Spacing value |
| `yarcl.radii.md` | Border radius |
| `yarcl.shadows.md` | Box shadow |
| `yarcl.modalSizes.md` | Modal width |
| `yarcl.widths.page` | Page or container width |
| `yarcl.zIndex.dialog` | Stacking order |
| `yarcl.motion.fast` | Motion value |
| `yarcl.borders.width` | Border width |
| `yarcl.sizes.md.height` | Field of a control size |
| `yarcl.density.comfortable.paddingY` | Field of a table density |
| `yarcl.typography.families.sans` | Font family |
| `yarcl.typography.styles.body.size` | Field of a text style |

The names in this table come from the library defaults. Your config determines which names autocomplete. Use bracket access for numeric or hyphenated keys: `yarcl.spacing['2']` or `yarcl.sizes['talla-s'].height`.

Token reference groups are checked for properties with a specific meaning: a spacing reference cannot be used as `color`, and a color reference cannot be used as `gap`. Unknown CSS properties, including nested declarations, are type errors. Literal CSS strings retain normal React CSS typing; TypeScript does not parse arbitrary CSS expressions or validate external variable definitions.

## Interaction states and conditional rules

Use `&` for the current slot's selector. Nested media and support queries are emitted into the generated stylesheet:

```ts
root: {
  color: yarcl.neutrals.text,
  '&:hover': { color: yarcl.colors.success },
  '&:focus-visible': { outlineStyle: 'solid' },
  '@media (min-width: 48rem)': {
    padding: yarcl.spacing.lg,
  },
  '@supports (display: grid)': {
    display: 'grid',
  },
}
```

Keep focus indicators visible and respect reduced-motion preferences when adding animations. These conditions execute in CSS, without React resize listeners.

## Sharing recipe definitions

You can define recipes in a separate module using `tokens` and `defineRecipes` from `@yarcl/react/define`:

```ts
const yarcl = tokens(baseConfig);
const recipes = defineRecipes({
  Action: {
    slots: { root: { borderRadius: yarcl.radii.rounded } },
  },
});

export default defineConfig({ ...baseConfig, recipes });
```

`baseConfig` must already contain your token definitions. Keep it in a module that does not import the final config. Inside config modules, use `/define` and `/defaults`; importing the active config or the React entry point there would introduce a circular dependency. Token references are validated against the final config when CSS is generated, so removing a referenced token stops the build with a descriptive error.

## CSS ordering and themes

The generator emits base slot styles, then visual variant styles in definition order, then compound styles. When two axes set the same property, the later axis wins. Matching compounds are emitted in array order. Recipe rules use two class selectors to override the usual built-in component class styles. Your explicitly supplied inline styles still follow normal CSS precedence.

Components assemble classes at render time. They do not inject recipe styles or inline token values. Config edits regenerate the stylesheet through the existing plugin, including recipes imported from local modules. The `yarcl.tokens.css` export contains token variables and text styles; component recipes are in the full application stylesheet.

Runtime themes must include the recipes and tokens used by your app. Keep the recipe names, slots and variant vocabulary consistent, because TypeScript derives props from the build-time config:

```ts
import { config } from '@yarcl/react';
import { applyTheme } from '@yarcl/react/css';

applyTheme({
  ...config,
  spacing: { ...config.spacing, sm: '0.75rem' },
});
```

`applyTheme` regenerates the recipe CSS and components read the active recipe defaults. Explicit variant props take precedence. `resetTheme` restores the build-time styles and defaults. A theme missing a mounted component's recipe fails with a descriptive error. When applying a bundled theme, preserve your recipes and ensure that theme contains every token they reference.
