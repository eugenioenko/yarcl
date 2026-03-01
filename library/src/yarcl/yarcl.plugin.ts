import { resolve } from 'path';
import { cwd } from 'process';
import type { Plugin } from 'vite';

interface YarclPluginOptions {
  /** Path to the design system config → @yarcl/config */
  design?: string;
  /** Path to the feature flags config → @yarcl/flags */
  flags?: string;
  /** Path to the translations config → @yarcl/i18n */
  i18n?: string;
  /** Path to the env var schema → @yarcl/env */
  env?: string;
}

const VIRTUAL_THEME = 'virtual:yarcl-theme';
const RESOLVED_VIRTUAL_THEME = '\0' + VIRTUAL_THEME;

const defaults: Required<YarclPluginOptions> = {
  design: 'src/yarcl.config.ts',
  flags:  'src/flags.config.ts',
  i18n:   'src/i18n.config.ts',
  env:    'src/env.config.ts',
};

export function yarclPlugin(options: YarclPluginOptions = {}): Plugin {
  const opts = { ...defaults, ...options };

  const aliases = {
    '@yarcl/config': resolve(cwd(), opts.design),
    '@yarcl/flags':  resolve(cwd(), opts.flags),
    '@yarcl/i18n':   resolve(cwd(), opts.i18n),
    '@yarcl/env':    resolve(cwd(), opts.env),
  };

  return {
    name: 'yarcl',

    config() {
      return { resolve: { alias: aliases } };
    },

    resolveId(id) {
      if (id === VIRTUAL_THEME) return RESOLVED_VIRTUAL_THEME;
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_THEME) return;

      return `
        import { yarcl } from '@yarcl/config';

        const colors = yarcl.colors ?? {};
        const lines = [];

        for (const [name, value] of Object.entries(colors)) {
          lines.push(\`  --color-\${name}: \${value};\`);
          lines.push(\`  --color-\${name}-light:  color-mix(in srgb, \${value}, #ffffff 75%);\`);
          lines.push(\`  --color-\${name}-active: color-mix(in srgb, \${value}, #000000 15%);\`);
        }

        if (lines.length > 0) {
          const style = document.createElement('style');
          style.setAttribute('data-yarcl-theme', '');
          style.textContent = \`:root {\\n\${lines.join('\\n')}\\n}\`;
          document.head.insertBefore(style, document.head.firstChild);
        }
      `;
    },
  };
}
