import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { setTimeout } from 'node:timers/promises';
import webpack from 'webpack';
import { rspack } from '@rspack/core';
import { rollup } from 'rollup';
import { build as esbuild, context } from 'esbuild';
import webpackPlugin from '@yarcl/react/webpack';
import rspackPlugin from '@yarcl/react/rspack';
import rollupPlugin from '@yarcl/react/rollup';
import esbuildPlugin from '@yarcl/react/esbuild';
import { generateTokensCss } from '@yarcl/react/generate';
import config from './src/yarcl.config.ts';

const root = import.meta.dirname;
const temporary = await mkdtemp(join(root, '.tokens-'));
const input = join(temporary, 'entry.js');
const expected = generateTokensCss(config);

function compile(factory, plugin, outdir, emitTokens) {
  return new Promise((resolve, reject) => {
    const compiler = factory({
      context: root,
      mode: 'production',
      optimization: { minimize: false },
      entry: input,
      output: { path: outdir },
      plugins: [plugin({ root, emitTokens })],
    });
    compiler.run((error, stats) => {
      compiler.close((closeError) => {
        if (error || closeError) reject(error || closeError);
        else if (stats.hasErrors()) reject(new Error(stats.toString()));
        else resolve();
      });
    });
  });
}

const builders = {
  webpack: (outdir, emitTokens) => compile(webpack, webpackPlugin, outdir, emitTokens),
  rspack: (outdir, emitTokens) => compile(rspack, rspackPlugin, outdir, emitTokens),
  async rollup(outdir, emitTokens) {
    const bundle = await rollup({ input, plugins: [rollupPlugin({ root, emitTokens })] });
    try {
      await bundle.write({ dir: outdir, format: 'esm' });
    } finally {
      await bundle.close();
    }
  },
  esbuild: (outdir, emitTokens) => esbuild({
    absWorkingDir: root,
    entryPoints: [input],
    outdir,
    plugins: [esbuildPlugin({ emitTokens })],
  }),
};

try {
  await writeFile(input, 'globalThis.built = true;');
  for (const [name, build] of Object.entries(builders)) {
    for (const [label, emitTokens, filename] of [
      ['default', undefined, 'yarcl.tokens.css'],
      ['enabled', true, 'yarcl.tokens.css'],
      ['custom', 'styles/tokens.css', 'styles/tokens.css'],
      ['disabled', false, undefined],
      ['empty', '', undefined],
    ]) {
      const outdir = join(temporary, name, label);
      await build(outdir, emitTokens);
      if (filename) assert.equal(await readFile(join(outdir, filename), 'utf8'), expected, `${name}: ${label}`);
      else assert.equal((await readdir(outdir, { recursive: true })).some((file) => file.includes('tokens.css')), false, `${name}: ${label}`);
    }
  }

  const outfile = join(temporary, 'outfile/app.js');
  await esbuild({ absWorkingDir: root, entryPoints: [input], outfile, plugins: [esbuildPlugin()] });
  assert.equal(await readFile(join(temporary, 'outfile/yarcl.tokens.css'), 'utf8'), expected);

  const memoryDir = join(temporary, 'memory');
  const result = await esbuild({
    absWorkingDir: root,
    entryPoints: [input],
    outdir: memoryDir,
    write: false,
    plugins: [esbuildPlugin({ emitTokens: 'styles/tokens.css' })],
  });
  assert.equal(result.outputFiles.find((file) => file.path === join(memoryDir, 'styles/tokens.css'))?.text, expected);
  await assert.rejects(readFile(join(memoryDir, 'styles/tokens.css')));

  await esbuild({
    absWorkingDir: root,
    entryPoints: [input],
    outdir: relative(root, join(temporary, 'relative')),
    plugins: [esbuildPlugin()],
  });
  assert.equal(await readFile(join(temporary, 'relative/yarcl.tokens.css'), 'utf8'), expected);

  const watchRoot = join(temporary, 'watch');
  await mkdir(watchRoot);
  await writeFile(join(watchRoot, 'tsconfig.json'), JSON.stringify({
    compilerOptions: { paths: { '@yarcl/config': ['./config.ts'] } },
  }));
  await writeFile(join(watchRoot, 'config.ts'), `
import brand from './palette.ts';
const config = ${JSON.stringify(config)};
export default { ...config, colors: { ...config.colors, brand } };
`);
  const watched = await context({
    absWorkingDir: watchRoot,
    entryPoints: [input],
    outdir: 'dist',
    plugins: [esbuildPlugin({ config: 'config.ts' })],
  });
  try {
    for (const color of ['#112233', '#445566']) {
      await writeFile(join(watchRoot, 'palette.ts'), `export default { light: '${color}', dark: '${color}' };`);
      if (color === '#112233') await watched.watch();
      const deadline = Date.now() + 15_000;
      let css = '';
      while (Date.now() < deadline) {
        css = await readFile(join(watchRoot, 'dist/yarcl.tokens.css'), 'utf8').catch(() => '');
        if (css.includes(`--yarcl-color-brand: ${color};`)) break;
        await setTimeout(50);
      }
      assert.ok(css.includes(`--yarcl-color-brand: ${color};`), 'esbuild watch updates imported tokens without yarcl imports');
    }
  } finally {
    await watched.dispose();
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
