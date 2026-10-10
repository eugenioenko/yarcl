import { activeConfig } from './runtime';
import type { Align, Color, Density, Justify, Radius, Responsive, Shadow, Size, Spacing, TextStyle } from './types';
import { responsiveClasses } from './responsive';
import type { ComponentName, YarclShape } from './define';

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

export const sizeClass = (size: Size = activeConfig().defaults.size, component?: ComponentName) =>
  `yarcl-size-${size}${component ? ` yarcl-sized-${component}` : ''}`;
export function radiusClass(radius?: Radius | 'size', size?: Size): string | undefined {
  const value: Radius | 'size' = radius ?? (activeConfig().defaults.radius as Radius | 'size');
  if (value !== 'size') return `yarcl-radius-${value}`;
  const match = size ?? activeConfig().defaults.size;
  return match in activeConfig().radii ? `yarcl-radius-${match}` : undefined;
}
export const colorClass = (color: Color = activeConfig().defaults.color) => `yarcl-color-${color}`;
/** Resolves a component recipe, falling back to the shared variant group. */
export function variantClass(variant?: string, component?: ComponentName, soft = false) {
  const config = activeConfig() as YarclShape;
  const own = component ? config.components?.[component] : undefined;
  const key =
    variant ?? (own && 'variant' in own ? own.variant : undefined) ?? config.defaults[soft ? 'softVariant' : 'variant'];
  const local = own && 'variants' in own && own.variants;
  return `yarcl-${local ? `${component}-variant-` : 'variant-'}${key}`;
}
export const gapClass = (gap?: Responsive<Spacing>, fallback: Spacing = activeConfig().defaults.gap) => responsiveClasses('gap', gap, fallback, (choice) => `yarcl-gap-${choice}`);
export const paddingClass = (padding?: Responsive<Spacing>, fallback: Spacing = activeConfig().defaults.padding) => responsiveClasses('padding', padding, fallback, (choice) => `yarcl-padding-${choice}`);
export const alignClass = (align?: Responsive<Align>, fallback?: Align) => responsiveClasses('align', align, fallback, (choice) => `yarcl-align-${choice}`);
export const justifyClass = (justify?: Responsive<Justify>) => responsiveClasses('justify', justify, undefined, (choice) => `yarcl-justify-${choice}`);
export const wrapClass = (wrap: Responsive<boolean>) => responsiveClasses('wrap', wrap, true, (choice) => choice ? undefined : 'yarcl-inline-nowrap');
export const shadowClass = (shadow?: Shadow) => shadow && `yarcl-shadow-${shadow}`;
export const typeClass = (style: TextStyle) => `yarcl-type-${style}`;
export const densityClass = (density: Density = activeConfig().defaults.density) => `yarcl-density-${density}`;
/** Resolves a low-emphasis component recipe with shared soft variants as the fallback. */
export const softVariantClass = (variant?: string, component?: ComponentName) => variantClass(variant, component, true);
