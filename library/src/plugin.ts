import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, extname, resolve, win32 } from 'node:path';
import { createJiti } from 'jiti';
import { createUnplugin } from 'unplugin';
import { generateCss, generateTokensCss } from './css';
import type { YarclShape } from './define';
import { assertConfigMapping, DEFAULT_CONFIG_PATH } from './setup.ts';

/** Options shared by every yarcl build-tool plugin. */
export interface YarclPluginOptions {
  /**
   * Path to the consumer's config file, relative to the project root.
   * If the file does not exist, the library's default config is used.
   * @default 'src/yarcl.config.ts'
   */
  config?: string;
  /**
   * Project root used to resolve the config and TypeScript mapping.
   * Build-tool adapters normally detect it automatically.
   * @default process.cwd()
   */
  root?: string;
  /**
   * Emits CSS variables and text-style classes in the build output directory.
   * Vite also writes the file during development and updates it with the config.
   * A string sets the output-relative filename. Use `false` or `''` to disable.
   * @default true
   */
  emitTokens?: boolean | string;
}

const VIRTUAL_CSS = '@yarcl/react/styles.css';
const RESOLVED_CSS = `\0${VIRTUAL_CSS}`;
const CONFIG_MODULE = '@yarcl/config';
const PACKAGE = '@yarcl/react';
const selfRequire = createRequire(typeof __filename === 'string' ? __filename : import.meta.url);
const extensions = ['', '.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs', '.json'];
const importPattern = /(?:\bimport\s*(?:[\s\S]*?\sfrom\s*)?|\bexport\s*[\s\S]*?\sfrom\s*|\bimport\s*\()(['"])(\.{1,2}\/[^'"]+)\1/g;

function localDependency(importer: string, specifier: string): string | undefined {
  const candidate = resolve(dirname(importer), specifier);
  for (const extension of extensions) {
    const file = `${candidate}${extension}`;
    if (existsSync(file)) return file;
  }
  for (const extension of extensions.slice(1)) {
    const file = resolve(candidate, `index${extension}`);
    if (existsSync(file)) return file;
  }
}

async function configDependencies(entry: string): Promise<Set<string>> {
  const dependencies = new Set<string>();
  const visit = async (file: string): Promise<void> => {
    if (dependencies.has(file)) return;
    dependencies.add(file);
    if (extname(file) === '.json') return;
    const source = await readFile(file, 'utf8');
    const imports = [...source.matchAll(importPattern)]
      .map((match) => localDependency(file, match[2]))
      .filter((dependency): dependency is string => dependency !== undefined);
    await Promise.all(imports.map(visit));
  };
  await visit(entry);
  return dependencies;
}

function defaultConfig(): string {
  return selfRequire.resolve('@yarcl/react/defaults');
}

/** Shared yarcl plugin implementation used by every build-tool adapter. */
export const yarclPlugin = createUnplugin<YarclPluginOptions | undefined>((options = {}, meta) => {
  const configPath = options.config ?? DEFAULT_CONFIG_PATH;
  const emitTokens = options.emitTokens ?? true;
  const tokensFile = typeof emitTokens === 'string' ? emitTokens.replaceAll('\\', '/') : emitTokens ? 'yarcl.tokens.css' : '';
  if (tokensFile && (win32.isAbsolute(tokensFile) || tokensFile.split('/').some((part) => !part || part === '.' || part === '..'))) {
    throw new Error('yarcl: emitTokens must be a filename relative to the build output directory.');
  }
  let building = meta.framework !== 'vite';
  let tokensOutputDir = '';
  let root = resolve(options.root ?? process.cwd());
  let target = '';
  let componentStyles = '';
  let generatedStyles = '';
  let staticStyles = '';
  let referenceStyles = '';
  let watched = new Set<string>();
  const responsiveStyles = new Set<string>();

  const prepare = (): void => {
    assertConfigMapping(root, configPath, meta.framework);
    const consumerConfig = resolve(root, configPath);
    const fallback = defaultConfig();
    target = existsSync(consumerConfig) ? consumerConfig : fallback;
    staticStyles = resolve(dirname(fallback), 'styles.css');
    referenceStyles = resolve(dirname(fallback), 'reference/reference.css');
  };

  const loadConfig = async (): Promise<YarclShape> => {
    const jiti = createJiti(resolve(root, 'package.json'), { moduleCache: false });
    return jiti.import<YarclShape>(target, { default: true });
  };

  const tokenStyles = async (watch?: (file: string) => void): Promise<string> => {
    const config = await loadConfig();
    if (watch) {
      watched = await configDependencies(target);
      watched.forEach(watch);
    }
    return generateTokensCss(config);
  };

  const writeDevTokens = async (watch: (file: string) => void): Promise<void> => {
    const css = await tokenStyles(watch);
    const path = resolve(tokensOutputDir, tokensFile);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, css);
  };

  return {
    name: 'yarcl',
    enforce: 'pre',

    async buildStart() {
      prepare();
      if (meta.framework === 'vite' && !building && tokensFile) {
        await writeDevTokens((file) => this.addWatchFile(file));
      }
    },

    async buildEnd(error?: unknown) {
      if (error || !tokensFile || !building || meta.framework === 'esbuild' || meta.framework === 'webpack' || meta.framework === 'rspack') return;
      this.emitFile({ type: 'asset', fileName: tokensFile, source: await tokenStyles((file) => this.addWatchFile(file)) });
    },

    resolveId: {
      filter: { id: /^(?:@yarcl\/config|@yarcl\/react\/styles\.css)$/ },
      handler(id) {
        if (id === CONFIG_MODULE) return meta.framework === 'esbuild' ? undefined : target;
        if (id === VIRTUAL_CSS) return RESOLVED_CSS;
      },
    },

    load: {
      filter: { id: /(?:@yarcl\/react\/styles\.css|\/(?:styles|reference)\.css)$/ },
      async handler(id) {
        if (meta.framework === 'rollup' && (id === staticStyles || id === referenceStyles)) {
          componentStyles += `${await readFile(id, 'utf8')}\n`;
          return '';
        }
        if (id !== RESOLVED_CSS) return;
        const config = await loadConfig();
        watched = existsSync(target) ? await configDependencies(target) : new Set([target]);
        watched.forEach((file) => this.addWatchFile(file));
        const css = generateCss(config, (message) => this.warn(message))
          .replace(/^@custom-media --yarcl-(?:min|max)-[^\n]+\n/gm, '');
        if (meta.framework === 'rollup') {
          generatedStyles = css;
          return '';
        }
        return css;
      },
    },

    transform: {
      filter: { id: /\.css(?:\?.*)?$/ },
      async handler(code, id) {
        if (!code.includes('--yarcl-min-') && !code.includes('--yarcl-max-')) return;
        if (!target) prepare();
        const config = await loadConfig();
        let changed = false;
        const transformed = code.replace(/\(\s*--yarcl-(min|max)-([a-zA-Z0-9_-]+)\s*\)/g, (_, direction: string, key: string) => {
          const value = config.breakpoints[key];
          if (value === undefined) throw new Error(`yarcl: unknown breakpoint "${key}" in ${id}`);
          changed = true;
          return `(${direction}-width: ${value})`;
        });
        if (!changed) return;
        responsiveStyles.add(id);
        this.addWatchFile(target);
        return transformed;
      },
    },

    rollup: {
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'yarcl.css', source: `${generatedStyles}\n${componentStyles}` });
      },
    },

    vite: {
      configResolved(config) {
        building = config.command === 'build';
        tokensOutputDir = resolve(config.root, config.build.outDir);
      },
      config(userConfig) {
        root = resolve(options.root ?? userConfig.root ?? process.cwd());
        return {
          build: userConfig.build?.cssTarget ? {} : { cssTarget: ['chrome123', 'edge123', 'firefox120', 'safari17.5'] },
          optimizeDeps: {
            exclude: [PACKAGE],
            include: ['@floating-ui/react', 'date-fns', 'date-fns/locale', 'date-fns/locale/en-US'].map((dependency) =>
              `${PACKAGE} > ${dependency}`,
            ),
          },
          ssr: { noExternal: [PACKAGE] },
        };
      },
      async handleHotUpdate({ file, server, modules }) {
        if (!watched.has(file)) return;
        if (tokensFile) await writeDevTokens((dependency) => server.watcher.add(dependency));
        const css = server.moduleGraph.getModuleById(RESOLVED_CSS);
        const responsive = [...responsiveStyles]
          .map((id) => server.moduleGraph.getModuleById(id))
          .filter((module) => module !== undefined);
        if (css) server.moduleGraph.invalidateModule(css);
        responsive.forEach((module) => server.moduleGraph.invalidateModule(module));
        return [...modules, ...(css ? [css] : []), ...responsive];
      },
    },

    webpack(compiler) {
      root = resolve(options.root ?? compiler.context);
      if (!tokensFile) return;
      compiler.hooks.thisCompilation.tap('yarcl', (compilation) => {
        compilation.hooks.processAssets.tapPromise({
          name: 'yarcl',
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        }, async () => {
          const css = await tokenStyles((file) => compilation.fileDependencies.add(file));
          compilation.emitAsset(tokensFile, new compiler.webpack.sources.RawSource(css));
        });
      });
    },

    rspack(compiler) {
      root = resolve(options.root ?? compiler.context);
      if (!tokensFile) return;
      compiler.hooks.thisCompilation.tap('yarcl', (compilation) => {
        compilation.hooks.processAssets.tapPromise({
          name: 'yarcl',
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        }, async () => {
          const css = await tokenStyles((file) => compilation.fileDependencies.add(file));
          compilation.emitAsset(tokensFile, new compiler.webpack.sources.RawSource(css));
        });
      });
    },

    esbuild: {
      config(buildOptions) {
        root = resolve(options.root ?? buildOptions.absWorkingDir ?? process.cwd());
        prepare();
      },
      setup(build) {
        build.onResolve({ filter: /^@yarcl\/config$/ }, () => ({ path: target }));
        if (!tokensFile) return;
        const workingDir = resolve(build.initialOptions.absWorkingDir ?? process.cwd());
        const { outdir, outfile } = build.initialOptions;
        if (!outdir && !outfile) throw new Error('yarcl: emitTokens requires esbuild outdir or outfile. Use emitTokens: false for stdout builds.');
        const outputDir = outdir ? resolve(workingDir, outdir) : dirname(resolve(workingDir, outfile!));
        const watchModule = '@yarcl/tokens-watch';
        build.initialOptions.inject = [...(build.initialOptions.inject ?? []), watchModule];
        build.onResolve({ filter: /^@yarcl\/tokens-watch$/ }, () => ({ path: watchModule, namespace: 'yarcl-tokens' }));
        build.onLoad({ filter: /.*/, namespace: 'yarcl-tokens' }, async () => ({
          contents: '',
          loader: 'js',
          watchFiles: [...await configDependencies(target)],
        }));
        build.onEnd(async (result) => {
          if (result.errors.length) return;
          const css = await tokenStyles();
          const path = resolve(outputDir, tokensFile);
          if (build.initialOptions.write === false) {
            result.outputFiles?.push({
              path,
              contents: new TextEncoder().encode(css),
              hash: createHash('sha256').update(css).digest('hex'),
              get text() { return css; },
            });
            return;
          }
          await mkdir(dirname(path), { recursive: true });
          await writeFile(path, css);
        });
      },
      loader: 'css',
    },
  };
});
