/** A color with a value for each color scheme. Emitted as CSS `light-dark()`. */
export interface ColorPair {
  /** Value used when the color scheme is light. */
  light: string;
  /** Value used when the color scheme is dark. */
  dark: string;
}

/** A semantic color: one value per color scheme, plus an optional foreground. */
export interface ColorToken extends ColorPair {
  /**
   * Text color used on top of this color.
   * Computed by contrast (black or white) per scheme when omitted; requires hex values.
   */
  on?: string | ColorPair;
}

/**
 * A single step of the shared control size scale.
 * Every sized control reads the same entry, so controls of the same size share the same height.
 */
export interface SizeToken {
  /** Control height, e.g. `'2.5rem'`. */
  height: string;
  /** Horizontal padding, e.g. `'1rem'`. */
  paddingX: string;
  /** Font size, e.g. `'0.875rem'`. */
  fontSize: string;
  /** Size of icons inside controls of this size, e.g. `'1rem'`. */
  iconSize: string;
}

/**
 * A style recipe applied on top of a semantic color.
 * Shared by every component that takes a `variant` prop.
 */
export interface VariantToken {
  /** `fill`: the color itself; `tint`: a translucent wash of the color; `none`: transparent. */
  background: 'fill' | 'tint' | 'none';
  /** `color`: the semantic color; `neutral`: the neutral border color; `none`: no visible border. */
  border: 'color' | 'neutral' | 'none';
  /** `on`: the color's foreground; `color`: the semantic color; `neutral`: the default text color. */
  text: 'on' | 'color' | 'neutral';
}

/** Cell spacing for tables at one density. */
export interface DensityToken {
  /** Horizontal cell padding, e.g. `'0.75rem'`. */
  paddingX: string;
  /** Vertical cell padding, e.g. `'0.5rem'`. */
  paddingY: string;
  /** Cell font size, e.g. `'0.875rem'`. */
  fontSize: string;
}

/** A named text style. */
export interface TextStyleToken {
  /** A key of `typography.families`. */
  family: string;
  /** Font size, e.g. `'1rem'`. */
  size: string;
  /** Font weight, e.g. `400`. */
  weight: number;
  /** Unitless line height, e.g. `1.5`. */
  lineHeight: number;
  /** Letter spacing, e.g. `'-0.01em'`. */
  letterSpacing?: string;
}

/**
 * The structure every yarcl config must satisfy.
 *
 * Open groups (`colors`, `sizes`, `radii`, `variants`, `spacing`, `shadows`, `density`, `typography`) take any keys;
 * those keys become the valid prop values. Groups with required keys (`neutrals`, `zIndex`,
 * `motion`, `borders`) must include the keys the library depends on, and accept any extra
 * keys, which are emitted as CSS variables for the consumer's own styles.
 */
export interface YarclShape {
  /** Semantic colors. Keys become the valid values of the `color` prop. */
  colors: Record<string, ColorToken>;
  /** Neutral colors for backgrounds, text and borders. Extra keys allowed. */
  neutrals: Record<string, ColorPair> & {
    /** Page background. */
    bg: ColorPair;
    /** Background of controls and raised surfaces. */
    surface: ColorPair;
    /** Default text. */
    text: ColorPair;
    /** Secondary text and placeholders. */
    muted: ColorPair;
    /** Default border. */
    border: ColorPair;
  };
  /** Control size scale. Keys become the valid values of the `size` prop. */
  sizes: Record<string, SizeToken>;
  /** Border radii. Keys become the valid values of the `radius` prop. */
  radii: Record<string, string>;
  /** Style recipes. Keys become the valid values of the `variant` prop. */
  variants: Record<string, VariantToken>;
  /** Spacing scale, e.g. for `gap` and padding. */
  spacing: Record<string, string>;
  /** Box shadows. */
  shadows: Record<string, string>;
  /** Table densities. Keys become the valid values of the `density` prop. */
  density: Record<string, DensityToken>;
  /** Font families and named text styles. */
  typography: {
    /** Font stacks, e.g. `{ sans: 'Inter, system-ui, sans-serif' }`. */
    families: Record<string, string>;
    /** Named text styles. Keys become the valid text style names. */
    styles: Record<string, TextStyleToken>;
  };
  /** Stacking order of floating layers. Extra keys allowed. */
  zIndex: Record<string, number> & { dropdown: number; tooltip: number; dialog: number; toast: number };
  /** Transition timing. Extra keys allowed. */
  motion: Record<string, string> & {
    /** Short transitions, e.g. hover. */
    fast: string;
    /** Standard transitions, e.g. opening a popover. */
    base: string;
    /** Easing function. */
    easing: string;
  };
  /** Border widths. Extra keys allowed. */
  borders: Record<string, string> & { width: string };
  /** Keyboard focus indicator. */
  focusRing: {
    /** Outline width. */
    width: string;
    /** Outline offset. */
    offset: string;
    /** A key of `colors`. */
    color: string;
  };
  /** Values used when a component prop is omitted. Each must be a key of its group. */
  defaults: {
    size: string;
    radius: string;
    color: string;
    variant: string;
    /** Color used for invalid fields. A key of `colors`. */
    errorColor: string;
    /** Text style for `Text`. A key of `typography.styles`. */
    textStyle: string;
    /** Text style for `Heading`. A key of `typography.styles`. */
    headingStyle: string;
    /** Gap for `Stack` and `Inline`. A key of `spacing`. */
    gap: string;
    /** Padding for `Card`. A key of `spacing`. */
    padding: string;
    /** Elevation of popovers, menus and listboxes. A key of `shadows`. */
    floatingShadow: string;
    /** Density for `Table`. A key of `density`. */
    density: string;
    /** Variant for low-emphasis components such as `Badge` and `Alert`. A key of `variants`. */
    softVariant: string;
  };
}

type Whitespace = ' ' | '\n' | '\t';

type KeyCheck<G> = {
  [K in keyof G as K extends `${string}${Whitespace}${string}` ? K : never]: {
    error: `Key "${K & string}" must not contain whitespace`;
  };
};

type Checks<T extends YarclShape> = {
  colors: KeyCheck<T['colors']>;
  neutrals: KeyCheck<T['neutrals']>;
  zIndex: KeyCheck<T['zIndex']>;
  motion: KeyCheck<T['motion']>;
  borders: KeyCheck<T['borders']>;
  sizes: KeyCheck<T['sizes']>;
  radii: KeyCheck<T['radii']>;
  variants: KeyCheck<T['variants']>;
  spacing: KeyCheck<T['spacing']>;
  shadows: KeyCheck<T['shadows']>;
  density: KeyCheck<T['density']>;
  typography: {
    families: KeyCheck<T['typography']['families']>;
    styles: KeyCheck<T['typography']['styles']> & {
      [K in keyof T['typography']['styles']]: { family: keyof T['typography']['families'] };
    };
  };
  focusRing: { color: keyof T['colors'] };
  defaults: {
    size: keyof T['sizes'];
    radius: keyof T['radii'];
    color: keyof T['colors'];
    variant: keyof T['variants'];
    errorColor: keyof T['colors'];
    textStyle: keyof T['typography']['styles'];
    headingStyle: keyof T['typography']['styles'];
    gap: keyof T['spacing'];
    padding: keyof T['spacing'];
    floatingShadow: keyof T['shadows'];
    density: keyof T['density'];
    softVariant: keyof T['variants'];
  };
};

/**
 * Declares a yarcl design system config.
 *
 * Checks at compile time that:
 * - every color has a `light` and `dark` value
 * - `defaults`, `focusRing.color` and each text style's `family` reference existing keys
 * - no key contains whitespace
 *
 * Returns the config unchanged with literal types preserved, so the library can derive
 * its prop types from it. Spread `yarcl/defaults` to extend the library defaults instead
 * of replacing them.
 *
 * @example
 * ```ts
 * // src/yarcl.config.ts
 * import { defineConfig } from 'yarcl/define';
 * import defaults from 'yarcl/defaults';
 *
 * export default defineConfig({
 *   ...defaults,
 *   colors: { ...defaults.colors, brand: { light: '#2d4bb8', dark: '#8aa2ff' } },
 *   defaults: { ...defaults.defaults, color: 'brand' },
 * });
 * ```
 */
export function defineConfig<const T extends YarclShape>(config: T & Checks<T>): T {
  return config;
}
