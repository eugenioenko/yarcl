import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runnerImport, type Plugin } from 'vite';
import { generateCss } from './css.ts';
import type { YarclShape } from './define.ts';

/** Options for the yarcl Vite plugin. */
export interface YarclPluginOptions {
  /**
   * Path to the consumer's config file, relative to the Vite root.
   * If the file does not exist, the library's default config is used.
   * @default 'src/yarcl.config.ts'
   */
  config?: string;
}

const VIRTUAL_CSS = 'virtual:yarcl.css';
const RESOLVED_CSS = '\0' + VIRTUAL_CSS;
const PACKAGE = '@yarcl/react';
const defaultConfig = [new URL('./yarcl.config.ts', import.meta.url), new URL('../src/yarcl.config.ts', import.meta.url)]
  .map((url) => fileURLToPath(url))
  .find((file) => existsSync(file))!;

/**
 * Vite plugin that connects the library to the consumer's config.
 *
 * - Aliases `@yarcl/config` to the consumer's config file (or the library default).
 * - Generates `virtual:yarcl.css` from the config at build time: CSS variables on `:root`
 *   and one `yarcl-{group}-{key}` class per key. No inline styles, no runtime cost.
 * - Warns when a color's foreground fails WCAG AA contrast.
 * - Regenerates the CSS when the config file changes.
 *
 * Must be paired with a matching `paths` entry for `@yarcl/config` in the
 * consumer's `tsconfig.json`, so the types resolve to the same file.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { yarcl } from '@yarcl/react/plugin';
 *
 * export default defineConfig({
 *   plugins: [react(), yarcl({ config: 'src/yarcl.config.ts' })],
 * });
 * ```
 */
export function yarcl({ config = 'src/yarcl.config.ts' }: YarclPluginOptions = {}): Plugin {
  let root = process.cwd();
  let target = defaultConfig;
  let watched = new Set<string>();

  return {
    name: 'yarcl',

    config(userConfig) {
      root = resolve(userConfig.root ?? process.cwd());
      const consumerConfig = resolve(root, config);
      target = existsSync(consumerConfig) ? consumerConfig : defaultConfig;
      return {
        resolve: { alias: { '@yarcl/config': target } },
        optimizeDeps: { exclude: [PACKAGE] },
        ssr: { noExternal: [PACKAGE] },
      };
    },

    resolveId(id) {
      if (id === VIRTUAL_CSS) return RESOLVED_CSS;
    },

    async load(id) {
      if (id !== RESOLVED_CSS) return;
      const { module, dependencies } = await runnerImport<{ default: YarclShape }>(target, {
        configFile: false,
        root,
        ssr: { noExternal: [PACKAGE] },
        logLevel: 'error',
      });
      watched = new Set([target, ...dependencies.map((dep) => resolve(root, dep))]);
      watched.forEach((file) => this.addWatchFile(file));
      return generateCss(module.default, (message) => this.warn(message));
    },

    handleHotUpdate({ file, server, modules }) {
      if (!watched.has(file)) return;
      const css = server.moduleGraph.getModuleById(RESOLVED_CSS);
      if (!css) return;
      server.moduleGraph.invalidateModule(css);
      return [...modules, css];
    },
  };
}
