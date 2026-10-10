import type { YarclShape } from './define';

/** Public component parts and the token properties each part accepts. */
export const componentSlots = {
  Table: {
    root: ['radius', 'shadow', 'background', 'border', 'borderWidth'],
    header: ['textStyle', 'background', 'border', 'borderWidth'],
    row: ['background'],
    cell: ['density', 'padding', 'textStyle', 'background', 'border', 'borderWidth'],
  },
  Card: {
    root: ['radius', 'padding', 'shadow', 'background', 'border', 'borderWidth'],
    header: ['padding', 'textStyle', 'background', 'border', 'borderWidth'],
    body: ['padding', 'textStyle', 'background', 'border', 'borderWidth'],
    footer: ['padding', 'textStyle', 'background', 'border', 'borderWidth'],
  },
  Dialog: {
    root: ['radius', 'shadow', 'background', 'border', 'borderWidth'],
    header: ['padding', 'textStyle', 'background', 'border', 'borderWidth'],
    body: ['padding', 'textStyle', 'background', 'border', 'borderWidth'],
    footer: ['padding', 'textStyle', 'background', 'border', 'borderWidth'],
  },
  Drawer: {
    root: ['radius', 'shadow', 'background', 'border', 'borderWidth'],
    header: ['padding', 'textStyle', 'background', 'border', 'borderWidth'],
    body: ['padding', 'textStyle', 'background', 'border', 'borderWidth'],
    footer: ['padding', 'textStyle', 'background', 'border', 'borderWidth'],
  },
  Tabs: {
    list: ['radius', 'padding', 'background', 'border', 'borderWidth'],
    trigger: ['radius', 'padding', 'textStyle', 'background'],
  },
  Menu: {
    panel: ['radius', 'padding', 'shadow', 'background', 'border', 'borderWidth'],
    item: ['radius', 'padding', 'textStyle', 'background', 'border', 'borderWidth'],
  },
  Listbox: {
    panel: ['radius', 'padding', 'shadow', 'background', 'border', 'borderWidth'],
    item: ['radius', 'padding', 'textStyle', 'background', 'border', 'borderWidth'],
  },
} as const;

/** Built-in components with configurable parts. Listbox covers Select and both Combobox forms. */
export type SlotComponentName = keyof typeof componentSlots;
/** Closed background choices for a component part. Tint uses the configured neutral text and surface. */
export type SlotBackground = 'surface' | 'tint' | 'none';
/** Border styles for a component part. Width comes from the borders group. */
export type SlotBorder = 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
/** Accepted token properties for every public part. */
export type ComponentSlotProps = {
  [C in SlotComponentName]: {
    [S in keyof typeof componentSlots[C]]: typeof componentSlots[C][S] extends readonly (infer P)[] ? P : never;
  };
};

type SlotValues<T extends YarclShape> = {
  radius: keyof T['radii'];
  padding: keyof T['spacing'];
  shadow: keyof T['shadows'];
  density: keyof T['density'];
  textStyle: keyof T['typography']['styles'];
  background: SlotBackground;
  border: SlotBorder;
  borderWidth: keyof T['borders'];
};

/** Typed token settings for a component's public parts, derived from a config's groups. */
export type ComponentSlotConfig<T extends YarclShape, C extends SlotComponentName> = {
  [S in keyof ComponentSlotProps[C]]?: {
    [P in Extract<ComponentSlotProps[C][S], keyof SlotValues<T>>]?: SlotValues<T>[P];
  };
};

/** Checks exact slot and property names, including objects passed through variables. */
export type SlotChecks<T extends YarclShape, C extends SlotComponentName, V> = {
  [S in keyof NonNullable<V>]: S extends keyof ComponentSlotProps[C]
    ? { [P in keyof NonNullable<NonNullable<V>[S]>]: P extends ComponentSlotProps[C][S]
        ? P extends keyof SlotValues<T> ? SlotValues<T>[P] : never
        : never }
    : never;
};
