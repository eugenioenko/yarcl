import config from '@yarcl/config';
import type { TokenProps } from './types';

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

export function tokenClasses({
  size = config.defaults.size,
  radius = config.defaults.radius,
  color = config.defaults.color,
}: TokenProps): string {
  return `yarcl-size-${size} yarcl-radius-${radius} yarcl-color-${color}`;
}
