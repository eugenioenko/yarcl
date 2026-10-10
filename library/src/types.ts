import type config from '@yarcl/config';
import type { ComponentName } from './define';

type Config = typeof config;

/** A key of the consumer's `sizes` config. */
export type Size = keyof Config['sizes'] & string;
/** A key of the consumer's `radii` config. */
export type Radius = keyof Config['radii'] & string;
/** A key of the consumer's `colors` config. */
export type Color = keyof Config['colors'] & string;
/** A key of the consumer's `variants` config. */
export type Variant = keyof Config['variants'] & string;
/** A key of the consumer's `spacing` config. */
export type Spacing = keyof Config['spacing'] & string;
/** A key of the consumer's `shadows` config. */
export type Shadow = keyof Config['shadows'] & string;
/** A key of the consumer's `density` config. */
export type Density = keyof Config['density'] & string;
/** A key of the consumer's `modalSizes` config. */
export type ModalSize = keyof Config['modalSizes'] & string;
/** A key of the consumer's page and container widths. */
export type Width = keyof Config['widths'] & string;
/** A key of the consumer's responsive breakpoints. */
export type Breakpoint = keyof Config['breakpoints'] & string;
/** A key of the consumer's `typography.styles` config. */
export type TextStyle = keyof Config['typography']['styles'] & string;

type ConfiguredComponents = Config extends { components?: infer C } ? NonNullable<C> : Record<never, never>;

/** A component's own variant keys, or shared variant keys when it has no variant map. */
export type ComponentVariant<C extends ComponentName> = C extends keyof ConfiguredComponents
  ? ConfiguredComponents[C] extends { variants: infer V }
    ? Extract<keyof V, string>
    : Variant
  : Variant;

/** A component's allowed size keys, or every global size when it has no restriction. */
export type ComponentSize<C extends ComponentName> = C extends keyof ConfiguredComponents
  ? ConfiguredComponents[C] extends { allowedSizes: readonly (infer S)[] }
    ? Extract<S, Size>
    : Extract<keyof Config['sizes'], string>
  : Extract<keyof Config['sizes'], string>;

/** Design token props shared by every sized, colored component. */
export interface TokenProps<C extends ComponentName | undefined = undefined> {
  /**
   * Control size, from the `sizes` config.
   * @default config.defaults.size
   */
  size?: C extends ComponentName ? ComponentSize<C> : Size;
  /**
   * Border radius, from the `radii` config, or `'size'` for the radius named like the control's size.
   * @default config.defaults.radius
   */
  radius?: Radius | 'size';
  /**
   * Semantic color, from the `colors` config.
   * @default config.defaults.color
   */
  color?: Color;
}

/** Cross-axis alignment for layout components. */
export type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
/** Main-axis distribution for layout components. */
export type Justify = 'start' | 'center' | 'end' | 'between';

/** The `variant` prop shared by components that apply a style recipe. */
export interface VariantProps<C extends ComponentName | undefined = undefined> {
  /**
   * Style recipe, from the component's variant map or the shared `variants` config.
   * @default config.defaults.variant
   */
  variant?: C extends ComponentName ? ComponentVariant<C> : Variant;
}

/** Values a component can receive from `components` in the config. */
export interface ComponentDefaults<C extends ComponentName | undefined = undefined> {
  size?: Size;
  radius?: Radius | 'size';
  color?: Color;
  variant?: C extends ComponentName ? ComponentVariant<C> : Variant;
  selectedVariant?: C extends ComponentName ? ComponentVariant<C> : Variant;
  gap?: Spacing;
  padding?: Spacing;
  shadow?: Shadow;
  density?: Density;
  textStyle?: TextStyle;
}
