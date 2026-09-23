/**
 * A single step of the shared control size scale.
 * Every sized control (Button, Input, …) reads the same entry,
 * so controls of the same size always share the same height.
 */
export interface SizeToken {
  /** Control height as a CSS length, e.g. `'2.5rem'`. */
  height: string;
  /** Horizontal padding as a CSS length, e.g. `'1rem'`. */
  paddingX: string;
  /** Font size as a CSS length, e.g. `'0.875rem'`. */
  fontSize: string;
}

/** The structure every yarcl config must satisfy. */
export interface YarclShape {
  /** Control size scale. Keys become the valid values of the `size` prop. */
  sizes: Record<string, SizeToken>;
  /** Border radii. Keys become the valid values of the `radius` prop. */
  radii: Record<string, string>;
  /** Semantic colors. Keys become the valid values of the `color` prop. */
  colors: Record<string, string>;
  /** Values used when a component prop is omitted. Each must be a key of its group. */
  defaults: { size: string; radius: string; color: string };
}

/**
 * Declares a yarcl design system config.
 *
 * Validates the config's shape and that every `defaults` entry is an existing key.
 * Returns the config unchanged, with literal types preserved, so the library can
 * derive its prop types from it.
 *
 * @example
 * ```ts
 * // src/yarcl.config.ts
 * import { defineConfig } from 'yarcl/define';
 *
 * export default defineConfig({
 *   sizes: { md: { height: '2.5rem', paddingX: '1rem', fontSize: '0.875rem' } },
 *   radii: { soft: '0.375rem' },
 *   colors: { brand: '#2d4bb8' },
 *   defaults: { size: 'md', radius: 'soft', color: 'brand' },
 * });
 * ```
 */
export function defineConfig<const T extends YarclShape>(
  config: T & {
    defaults: {
      size: keyof T['sizes'];
      radius: keyof T['radii'];
      color: keyof T['colors'];
    };
  },
): T {
  return config;
}
