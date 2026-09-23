import type config from '@yarcl/config';

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
/** A key of the consumer's `typography.styles` config. */
export type TextStyle = keyof Config['typography']['styles'] & string;

/** Design token props shared by every sized, colored component. */
export interface TokenProps {
  /**
   * Control size, from the `sizes` config.
   * @default config.defaults.size
   */
  size?: Size;
  /**
   * Border radius, from the `radii` config.
   * @default config.defaults.radius
   */
  radius?: Radius;
  /**
   * Semantic color, from the `colors` config.
   * @default config.defaults.color
   */
  color?: Color;
}

/** The `variant` prop shared by components that apply a style recipe. */
export interface VariantProps {
  /**
   * Style recipe, from the `variants` config.
   * @default config.defaults.variant
   */
  variant?: Variant;
}
