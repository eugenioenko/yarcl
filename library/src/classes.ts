import config from '@yarcl/config';
import type { Color, Radius, Shadow, Size, Spacing, TextStyle, Variant } from './types';

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

export const sizeClass = (size: Size = config.defaults.size) => `yarcl-size-${size}`;
export const radiusClass = (radius: Radius = config.defaults.radius) => `yarcl-radius-${radius}`;
export const colorClass = (color: Color = config.defaults.color) => `yarcl-color-${color}`;
export const variantClass = (variant: Variant = config.defaults.variant) => `yarcl-variant-${variant}`;
export const gapClass = (gap: Spacing = config.defaults.gap) => `yarcl-gap-${gap}`;
export const paddingClass = (padding: Spacing = config.defaults.padding) => `yarcl-padding-${padding}`;
export const shadowClass = (shadow?: Shadow) => shadow && `yarcl-shadow-${shadow}`;
export const typeClass = (style: TextStyle) => `yarcl-type-${style}`;
