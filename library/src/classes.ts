import config from '@yarcl/config';
import type { Color, Radius, Size, Variant } from './types';

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

export const sizeClass = (size: Size = config.defaults.size) => `yarcl-size-${size}`;
export const radiusClass = (radius: Radius = config.defaults.radius) => `yarcl-radius-${radius}`;
export const colorClass = (color: Color = config.defaults.color) => `yarcl-color-${color}`;
export const variantClass = (variant: Variant = config.defaults.variant) => `yarcl-variant-${variant}`;
