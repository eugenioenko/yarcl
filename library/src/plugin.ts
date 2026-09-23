import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

/** Options for the yarcl Vite plugin. */
export interface YarclPluginOptions {
  /**
   * Path to the consumer's config file, relative to the Vite root.
   * If the file does not exist, the library's default config is used.
   * @default 'src/yarcl.config.ts'
   */
  config?: string;
}

const defaultConfig = fileURLToPath(new URL('./yarcl.default.config.ts', import.meta.url));

/**
 * Vite plugin that points the library at the consumer's config file.
 *
 * Must be paired with a matching `paths` entry for `@yarcl/config` in the
 * consumer's `tsconfig.json`, so the types resolve to the same file.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { yarcl } from 'yarcl/plugin';
 *
 * export default defineConfig({
 *   plugins: [react(), yarcl({ config: 'src/yarcl.config.ts' })],
 * });
 * ```
 */
export function yarcl({ config = 'src/yarcl.config.ts' }: YarclPluginOptions = {}): Plugin {
  return {
    name: 'yarcl',
    config(userConfig) {
      const consumerConfig = resolve(userConfig.root ?? process.cwd(), config);
      const target = existsSync(consumerConfig) ? consumerConfig : defaultConfig;
      return { resolve: { alias: { '@yarcl/config': target } } };
    },
  };
}
