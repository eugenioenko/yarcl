---
title: Component parts
description: Style built-in component parts with typed tokens in your design system config.
sidebar:
  order: 9
---

`components.<Name>.slots` styles a built-in component's named parts. Slot names, properties and token references are checked by `defineConfig`, using the same config keys as component props.

```ts
import { defineConfig } from '@yarcl/react/define';
import defaults from '@yarcl/react/defaults';

export default defineConfig({
  ...defaults,
  borders: { ...defaults.borders, heavy: '4px' },
  components: {
    Table: {
      slots: {
        root: { radius: 'square', border: 'double', borderWidth: 'heavy' },
        header: { textStyle: 'label', background: 'tint' },
        cell: { density: 'comfortable' },
      },
    },
    Dialog: {
      slots: {
        header: { textStyle: 'subheading' },
        body: { padding: 'lg' },
        footer: { background: 'tint', padding: 'md' },
      },
    },
    Listbox: {
      slots: {
        panel: { radius: 'sm', shadow: 'lg' },
        item: { textStyle: 'body' },
      },
    },
  },
});
```

Every value refers to this config's tokens or a closed visual choice. Adding a spacing or text style key makes it available in the relevant slots. Unknown parts, unsupported properties and missing tokens are type errors, including settings passed through variables.

## Public parts

Each styled element exposes a stable `data-part` attribute. Internal CSS classes are not the part API.

| Component | Slot | Element |
|---|---|---|
| `Table` | `root` | Outer scrollable frame, rather than the native table |
| `Table` | `header` | `th` from `Table.HeaderCell` and `Table.SelectAllCell` |
| `Table` | `row` | `tr` from `Table.Row` |
| `Table` | `cell` | `td` from `Table.Cell` and `Table.SelectionCell`; also provides shared styles to the header cells |
| `Card` | `root` | The card's chosen root element |
| `Card` | `header`, `body`, `footer` | Optional `Card.Header`, `Card.Body` and `Card.Footer` divs |
| `Dialog`, `Drawer` | `root` | Native `dialog` |
| `Dialog`, `Drawer` | `header`, `body`, `footer` | Existing content sections; body and footer exist only when supplied |
| `Tabs` | `list`, `trigger` | `Tabs.List` div and `Tabs.Trigger` button |
| `Menu` | `panel`, `item` | Portaled `Menu.Content` and `Menu.Item`, including `Menu.RadioItem` |
| `Listbox` | `panel`, `item` | Portaled listbox and options of `Select`, single `Combobox` and multiple `Combobox` |

`Listbox` is a shared config entry, not a separately exported React component. Menu settings remain separate from Listbox settings. Native elements written directly inside a table do not receive compound part classes; use `Table.Row`, `Table.HeaderCell` and `Table.Cell` when they should follow slot settings.

## Properties each part accepts

| Parts | Properties |
|---|---|
| `Table.root` | `radius`, `shadow`, `background`, `border`, `borderWidth` |
| `Table.header` | `textStyle`, `background`, `border`, `borderWidth` |
| `Table.row` | `background` |
| `Table.cell` | `density`, `padding`, `textStyle`, `background`, `border`, `borderWidth` |
| `Card.root` | `radius`, `padding`, `shadow`, `background`, `border`, `borderWidth` |
| `Card`, `Dialog`, `Drawer` content sections | `padding`, `textStyle`, `background`, `border`, `borderWidth` |
| `Dialog.root`, `Drawer.root` | `radius`, `shadow`, `background`, `border`, `borderWidth` |
| `Tabs.list` | `radius`, `padding`, `background`, `border`, `borderWidth` |
| `Tabs.trigger` | `radius`, `padding`, `textStyle`, `background` |
| `Menu.panel`, `Listbox.panel` | `radius`, `padding`, `shadow`, `background`, `border`, `borderWidth` |
| `Menu.item`, `Listbox.item` | `radius`, `padding`, `textStyle`, `background`, `border`, `borderWidth` |

| Property | Values and effect |
|---|---|
| `radius` | A key of `radii`; sets border radius. The control-specific value `size` is not accepted. |
| `padding` | A key of `spacing`; sets padding on all sides of that part. |
| `shadow` | A key of `shadows`; sets box shadow. |
| `density` | A key of `density`; sets cell padding and font size. |
| `textStyle` | A key of `typography.styles`; sets family, size, weight, line height and letter spacing. |
| `background` | `surface`, `tint` or `none`. Tint mixes neutral text at 3% with neutral surface. Both follow the active color scheme. |
| `border` | `solid`, `dashed`, `dotted`, `double` or `none`. Uses `borders.width` and the neutral border color. |
| `borderWidth` | A key of `borders`; changes the width of the part's border. Add a wider token for a visible double border. |

The `borders` group contains width tokens. Border styles are a closed vocabulary, so a string such as `1px solid red` is rejected. Set `border` when adding a border to a part that normally has none.

## Composition and priority

Slots style rendered parts. They do not add a header, footer or wrapper to your content. Card parts are optional:

```tsx
<Card padding="sm">
  <Card.Header><Heading level={3}>Plan</Heading></Card.Header>
  <Card.Body><Text>Monthly billing</Text></Card.Body>
  <Card.Footer><Button>Choose plan</Button></Card.Footer>
</Card>
```

The card still accepts ordinary children. `Card.Header`, `Card.Body` and `Card.Footer` spread native div props, including `className`, `style` and React 19 `ref`. Root padding remains separate from part padding; choose their tokens together to control the total spacing.

For supported root props, priority is:

1. Explicit component prop, such as `Card.padding` or `Dialog.radius`.
2. Root slot setting.
3. Per-component default.
4. Global default or existing component style.

An explicit `Table.density` also takes priority over `slots.cell.density`. Within cell slots, `padding` overrides the density's spacing and `textStyle` overrides its font size. Header styles override shared cell styles on header cells. These priorities do not depend on the order of keys in your object.

A dialog or drawer header's `textStyle` also styles its title. Components nested inside a part keep their own explicit token classes and defaults. Active menu/listbox backgrounds and selected, striped or hovered table rows keep their interaction cues. Tabs keep their selected underline, which is why trigger slots do not expose border settings.

## Runtime themes and CSS overrides

Slot settings generate CSS that consumes config variables. Components do not write inline token values. `applyTheme(nextConfig)` replaces the part styles immediately and preserves mounted content; `resetTheme()` restores the build-time settings. Omitting slots restores the existing component styles. Bundled Brutalist and Editorial themes use slots for their table typography and dialog sections.

Part styles live in `yarcl.recipes`, after `yarcl.base`; consumer component recipes follow built-in slot styles. The token-only CSS asset omits slot styles.

Use `data-part` for individual instances or styling beyond the supported token properties. There is no built-in per-instance `slots` prop. Use `wrapClassName` for a table's root frame and `className` on its compound parts:

```tsx
<Table wrapClassName="invoice-table">
  <Table.Head>
    <Table.Row><Table.HeaderCell>Customer</Table.HeaderCell></Table.Row>
  </Table.Head>
  <Table.Body>
    <Table.Row><Table.Cell>Ada</Table.Cell></Table.Row>
  </Table.Body>
</Table>
```

```css
.invoice-table[data-part='root'] [data-part='header'] {
  text-transform: uppercase;
}
```

Scope selectors to your instance. Menu and listbox panels render in portals, so ancestor selectors on the trigger cannot reach them; put a class on `Menu.Content` or use shared `Listbox` settings. See [CSS layers](/configuration/css-layers/) for controlling the priority of application styles.

For custom components with their own variants and markup, use [component recipes](/configuration/component-recipes/). Built-in component parts have a fixed public vocabulary; recipe slots are declared by your application.
