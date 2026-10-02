import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
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
    expect(assets[0].source).not.toContain('.yarcl-');
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

  it('does not emit assets when the Vite dev server closes', async () => {
    const root = await project();
    const server = await createServer({ configFile: false, root, plugins: [yarcl()], logLevel: 'silent' });
    await server.pluginContainer.buildStart({});
    await server.close();
    await expect(readFile(join(root, 'dist/yarcl.tokens.css'))).rejects.toThrow();
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
