import type config from '@yarcl/config';

type Config = typeof config;

/** A key of the consumer's `sizes` config. */
export type Size = keyof Config['sizes'];
/** A key of the consumer's `radii` config. */
export type Radius = keyof Config['radii'];
/** A key of the consumer's `colors` config. */
export type Color = keyof Config['colors'];

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
