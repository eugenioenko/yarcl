import { activeConfig } from './runtime';
import type { Breakpoint, Responsive } from './types';

/** @internal Validates breakpoint names and returns the defined overrides of a responsive map. */
export function responsiveEntries<T>(value: { readonly [K in 'base' | Breakpoint]?: T }): [Breakpoint, T][] {
  const entries: [Breakpoint, T][] = [];
  for (const [key, choice] of Object.entries(value)) {
    if (key === 'base') continue;
    if (!Object.hasOwn(activeConfig().breakpoints, key)) throw new Error(`yarcl: unknown responsive breakpoint "${key}"`);
    if (choice !== undefined) entries.push([key as Breakpoint, choice as T]);
  }
  return entries;
}

/** @internal Identifies a responsive modifier independently of scalar token classes. */
export function responsiveClass(group: string, choice: string | boolean, breakpoint: string) {
  return `yarcl-responsive-${group}-${choice}@${breakpoint}`;
}

/** @internal Converts scalar values or breakpoint maps into classes without reading the viewport. */
export function responsiveClasses<T extends string | boolean>(group: string, value: Responsive<T> | undefined, fallback: T | undefined, scalar: (choice: T) => string | undefined): string | undefined {
  if (value === undefined || typeof value !== 'object') return value === undefined ? fallback === undefined ? undefined : scalar(fallback) : scalar(value);
  const base = value.base ?? fallback;
  return [base === undefined ? undefined : scalar(base), ...responsiveEntries<T>(value).map(([breakpoint, choice]) => responsiveClass(group, choice, breakpoint))].filter(Boolean).join(' ');
}
