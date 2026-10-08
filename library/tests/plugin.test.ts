import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { build, createServer } from 'vite';
import yarcl from '../src/vite.ts';
import { generateTokensCss } from '../src/css.ts';
import brandA from '../../consumer/src/yarcl.config.ts';
import brandB from '../../e2e/consumer/src/yarcl.config.ts';

const temporary: string[] = [];

afterEach(async () => {
  await Promise.all(temporary.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function project(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'yarcl-tokens-'));
  temporary.push(root);
  await writeFile(join(root, 'tsconfig.json'), JSON.stringify({
    compilerOptions: { paths: { '@yarcl/config': ['./src/yarcl.config.ts'] } },
  }));
  await writeFile(join(root, 'index.js'), 'globalThis.built = true;');
  return root;
}

describe('token asset emission', () => {
  it('generates imported recipes through the existing stylesheet module and rebuilds edited definitions', async () => {
    const root = await project();
    await writeFile(join(root, 'tsconfig.json'), JSON.stringify({ compilerOptions: { paths: { '@yarcl/config': ['./config.ts'] } } }));
    await writeFile(join(root, 'index.js'), "import '@yarcl/react/styles.css';");
    await writeFile(join(root, 'config.ts'), `
import { defineConfig } from ${JSON.stringify(resolve(import.meta.dirname, '../src/define.ts'))};
import defaults from ${JSON.stringify(resolve(import.meta.dirname, '../src/yarcl.config.ts'))};
import recipes from './recipes.ts';
export default defineConfig(defaults, (yarcl) => ({ recipes: recipes(yarcl) }));
`);
    for (const weight of [700, 800]) {
      await writeFile(join(root, 'recipes.ts'), `export default (yarcl) => ({ Action: { slots: { root: { color: yarcl.colors.success, fontWeight: ${weight} } } } });`);
      const result = await build({
        configFile: false, root, logLevel: 'silent', plugins: [yarcl({ config: 'config.ts' })],
        build: { write: false, minify: false, cssMinify: false, rollupOptions: { input: join(root, 'index.js') } },
      });
      const outputs = (Array.isArray(result) ? result : [result]).flatMap((item) => 'output' in item ? item.output : []);
      const css = outputs.flatMap((item) => item.type === 'asset' && item.fileName.endsWith('.css') && item.fileName !== 'yarcl.tokens.css' ? [String(item.source)] : []).join('\n');
      expect(css).toContain('yarcl-recipe-');
      expect(css).toContain('color: var(--yarcl-color-success);');
      expect(css).toContain(`font-weight: ${weight};`);
    }
  });

  it('invalidates the full generated stylesheet when an imported recipe changes in dev', async () => {
    const root = await project();
    await writeFile(join(root, 'tsconfig.json'), JSON.stringify({ compilerOptions: { paths: { '@yarcl/config': ['./config.ts'] } } }));
    await writeFile(join(root, 'index.js'), "import '@yarcl/react/styles.css';");
    await writeFile(join(root, 'config.ts'), `
import defaults from ${JSON.stringify(resolve(import.meta.dirname, '../src/yarcl.config.ts'))};
import recipes from './recipes.ts';
export default { ...defaults, recipes };
`);
    await writeFile(join(root, 'recipes.ts'), 'export default { Action: { slots: { root: { fontWeight: 700 } } } };');
    const server = await createServer({
      configFile: false, root, logLevel: 'silent', plugins: [yarcl({ config: 'config.ts', emitTokens: false })],
      server: { port: 0, watch: { usePolling: true, interval: 50 } },
    });
    const cssUrl = '@yarcl/react/styles.css';
    try {
      await server.listen();
      expect((await server.transformRequest(cssUrl))?.code).toContain('font-weight: 700;');
      await vi.waitFor(() => expect(server.watcher.getWatched()[root]).toContain('recipes.ts'));
      await writeFile(join(root, 'recipes.ts'), 'export default { Action: { slots: { root: { fontWeight: 800 } } } };');
      await vi.waitFor(async () => expect((await server.transformRequest(cssUrl))?.code).toContain('font-weight: 800;'), { timeout: 5000 });
    } finally {
      await server.close();
    }
  });

  it.each([
    [undefined, 'yarcl.tokens.css'],
    [true, 'yarcl.tokens.css'],
    ['styles/tokens.css', 'styles/tokens.css'],
    [false, undefined],
    ['', undefined],
  ] as const)('handles emitTokens=%s without importing yarcl styles', async (emitTokens, fileName) => {
    const root = await project();
    const result = await build({
      configFile: false,
      logLevel: 'silent',
      root,
      plugins: [yarcl({ emitTokens })],
      build: { write: false, rollupOptions: { input: join(root, 'index.js') } },
    });
    const outputs = (Array.isArray(result) ? result : [result]).flatMap((item) => 'output' in item ? item.output : []);
    const assets = outputs.filter((item) => item.type === 'asset');
    if (!fileName) {
      expect(assets).toHaveLength(0);
      return;
    }
    expect(assets).toHaveLength(1);
    expect(assets[0].fileName).toBe(fileName);
    expect(assets[0].source).toContain('--yarcl-color-primary:');
    expect(assets[0].source).toContain('.yarcl-type-body {');
    expect(assets[0].source).not.toContain('.yarcl-size-');
  });

  it.each([
    ['consumer', brandA],
    ['e2e/consumer', brandB],
  ] as const)('writes %s tokens to the configured output directory', async (consumer, config) => {
    const root = await project();
    const outDir = join(root, 'output');
    await build({
      configFile: false,
      logLevel: 'silent',
      root,
      plugins: [yarcl({ root: resolve(import.meta.dirname, '../..', consumer) })],
      build: { outDir, rollupOptions: { input: join(root, 'index.js') } },
    });
    expect(await readFile(join(outDir, 'yarcl.tokens.css'), 'utf8')).toBe(generateTokensCss(config));
  });

  it.each([
    [undefined, 'yarcl.tokens.css'],
    ['styles/tokens.css', 'styles/tokens.css'],
    [false, undefined],
    ['', undefined],
  ] as const)('writes development tokens with emitTokens=%s before app requests', async (emitTokens, fileName) => {
    const root = await project();
    const outDir = join(root, 'public-assets');
    const server = await createServer({
      configFile: false, root, plugins: [yarcl({ emitTokens })], logLevel: 'silent',
      build: { outDir },
      server: { port: 0 },
    });
    try {
      await server.listen();
      if (fileName) {
        const css = await readFile(join(outDir, fileName), 'utf8');
        expect(css).toContain('--yarcl-color-primary:');
        expect(css).toContain('.yarcl-type-body {');
      } else {
        await expect(readFile(join(outDir, 'yarcl.tokens.css'))).rejects.toThrow();
      }
    } finally {
      await server.close();
    }
  });

  it.each([brandA, brandB])('refreshes development tokens when the config or its imports change', async (config) => {
    const root = await project();
    await writeFile(join(root, 'tsconfig.json'), JSON.stringify({
      compilerOptions: { paths: { '@yarcl/config': ['./config.ts'] } },
    }));
    const source = `
import custom from './palette.ts';
const config = ${JSON.stringify(config)};
export default { ...config, colors: { ...config.colors, custom } };
`;
    await writeFile(join(root, 'config.ts'), source);
    await writeFile(join(root, 'palette.ts'), "export default { light: '#112233', dark: '#112233' };");
    const server = await createServer({
      configFile: false, root, plugins: [yarcl({ config: 'config.ts' })], logLevel: 'silent',
      build: { outDir: 'static' },
      server: { port: 0, watch: { usePolling: true, interval: 50 } },
    });
    const stylesheet = join(root, 'static/yarcl.tokens.css');
    try {
      await server.listen();
      expect(await readFile(stylesheet, 'utf8')).toContain('--yarcl-color-custom: #112233;');
      await vi.waitFor(() => expect(server.watcher.getWatched()[root]).toContain('palette.ts'));
      await writeFile(join(root, 'palette.ts'), "export default { light: '#445566', dark: '#445566' };");
      await vi.waitFor(async () => {
        expect(await readFile(stylesheet, 'utf8')).toContain('--yarcl-color-custom: #445566;');
      }, { timeout: 5000 });
      await writeFile(join(root, 'config.ts'), source.replace('custom }', 'custom, added: custom }'));
      await vi.waitFor(async () => {
        expect(await readFile(stylesheet, 'utf8')).toContain('--yarcl-color-added: #445566;');
      }, { timeout: 5000 });
    } finally {
      await server.close();
    }
  });

  it('reloads imported config values when building again', async () => {
    const root = await project();
    await writeFile(join(root, 'tsconfig.json'), JSON.stringify({
      compilerOptions: { paths: { '@yarcl/config': ['./config.ts'] } },
    }));
    await writeFile(join(root, 'config.ts'), `
import defaults from ${JSON.stringify(resolve(import.meta.dirname, '../src/yarcl.config.ts'))};
import color from './palette.ts';
export default { ...defaults, colors: { ...defaults.colors, custom: color } };
`);
    const settings = {
      configFile: false as const,
      logLevel: 'silent' as const,
      root,
      plugins: [yarcl({ config: 'config.ts' })],
      build: { outDir: join(root, 'output'), rollupOptions: { input: join(root, 'index.js') } },
    };
    for (const color of ['#112233', '#445566']) {
      await writeFile(join(root, 'palette.ts'), `export default { light: '${color}', dark: '${color}' };`);
      await build(settings);
      expect(await readFile(join(root, 'output/yarcl.tokens.css'), 'utf8')).toContain(`--yarcl-color-custom: ${color};`);
    }
  });

  it.each(['/tokens.css', '../tokens.css', 'styles/../tokens.css', 'C:\\tokens.css'])('rejects output paths outside the build directory: %s', (emitTokens) => {
    expect(() => yarcl({ emitTokens })).toThrow('relative to the build output directory');
  });
});
