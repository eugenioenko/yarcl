import defaults from '../yarcl.config';
import { brutalist } from './brutalist';
import { compact } from './compact';
import { editorial } from './editorial';
import { bloom } from './bloom';

export type { ThemeContract } from './contract';
export { brutalist, compact, editorial, bloom };

/**
 * Every bundled theme, keyed by id, including the library defaults as `@yarcl/react`.
 * All of them satisfy {@link ThemeContract}, so they're interchangeable.
 *
 * @example
 * ```ts
 * // src/yarcl.config.ts: use a theme as is
 * export { editorial as default } from '@yarcl/react/themes';
 * ```
 *
 * @example
 * ```ts
 * // or start from one and change what you need
 * import { defineConfig } from '@yarcl/react/define';
 * import { bloom } from '@yarcl/react/themes';
 *
 * export default defineConfig({
 *   ...bloom,
 *   colors: { ...bloom.colors, primary: { light: '#db2777', dark: '#f9a8d4' } },
 * });
 * ```
 */
export const themes = {
  yarcl: defaults,
  brutalist,
  bloom,
  compact,
  editorial,
};

/** Display names of the bundled themes. */
export const themeNames: Record<keyof typeof themes, string> = {
  yarcl: 'yarcl (default)',
  brutalist: 'Brutalist',
  bloom: 'Bloom',
  compact: 'Compact',
  editorial: 'Editorial',
};
