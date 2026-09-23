import config from '@yarcl/config';
import type { ComponentName, YarclShape } from './define';
import type { ComponentDefaults, Color, Density, Radius, Shadow, Size, Spacing, TextStyle, Variant } from './types';

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

export const sizeClass = (size: Size = config.defaults.size) => `yarcl-size-${size}`;
export function radiusClass(radius?: Radius | 'size', size?: Size): string | undefined {
  const value: Radius | 'size' = radius ?? (config.defaults.radius as Radius | 'size');
  if (value !== 'size') return `yarcl-radius-${value}`;
  const match = size ?? config.defaults.size;
  return match in config.radii ? `yarcl-radius-${match}` : undefined;
}
export const colorClass = (color: Color = config.defaults.color) => `yarcl-color-${color}`;
export const variantClass = (variant: Variant = config.defaults.variant) => `yarcl-variant-${variant}`;
export const gapClass = (gap: Spacing = config.defaults.gap) => `yarcl-gap-${gap}`;
export const paddingClass = (padding: Spacing = config.defaults.padding) => `yarcl-padding-${padding}`;
export const shadowClass = (shadow?: Shadow) => shadow && `yarcl-shadow-${shadow}`;
export const typeClass = (style: TextStyle) => `yarcl-type-${style}`;
export const densityClass = (density: Density = config.defaults.density) => `yarcl-density-${density}`;
export const softVariantClass = (variant: Variant = config.defaults.softVariant) => `yarcl-variant-${variant}`;

export function defaultsFor(component: ComponentName): ComponentDefaults {
  return ((config as unknown as YarclShape).components?.[component] ?? {}) as ComponentDefaults;
}
