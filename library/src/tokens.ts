import config from '@yarcl/config';
import type { CSSProperties } from 'react';
import type { TokenProps } from './types';

export function tokenStyle({
  size = config.defaults.size,
  radius = config.defaults.radius,
  color = config.defaults.color,
}: TokenProps): CSSProperties {
  const s = config.sizes[size];
  return {
    '--y-h': s.height,
    '--y-px': s.paddingX,
    '--y-fs': s.fontSize,
    '--y-r': config.radii[radius],
    '--y-c': config.colors[color],
  } as CSSProperties;
}
