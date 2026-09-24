import defaults from '../yarcl.default.config';
import { brutalist } from './brutalist';
import { compact } from './compact';
import { editorial } from './editorial';
import { soft } from './soft';

export type { ThemeContract } from './contract';
export { brutalist, compact, editorial, soft };

/**
 * Every bundled theme, keyed by id, including the library defaults as `yarcl`.
 * All of them satisfy {@link ThemeContract}, so they're interchangeable.
 *
 * @example
 * ```ts
 * // src/yarcl.config.ts: use a theme as is
 * export { editorial as default } from 'yarcl/themes';
 * ```
 *
 * @example
 * ```ts
 * // or start from one and change what you need
 * import { defineConfig } from 'yarcl/define';
 * import { soft } from 'yarcl/themes';
 *
 * export default defineConfig({
 *   ...soft,
 *   colors: { ...soft.colors, primary: { light: '#db2777', dark: '#f9a8d4' } },
 * });
 * ```
 */
export const themes = {
  yarcl: defaults,
  brutalist,
  soft,
  compact,
  editorial,
};

/** Display names of the bundled themes. */
export const themeNames: Record<keyof typeof themes, string> = {
  yarcl: 'yarcl (default)',
  brutalist: 'Brutalist',
  soft: 'Soft',
  compact: 'Compact',
  editorial: 'Editorial',
};
