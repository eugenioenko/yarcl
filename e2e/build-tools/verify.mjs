import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';

const outputs = [
  'dist/webpack/main.css',
  'dist/rspack/main.css',
  'dist/rollup/yarcl.css',
  'dist/esbuild/index.css',
];

await Promise.all(
  outputs.map(async (file) => {
    const css = await readFile(new URL(file, import.meta.url), 'utf8');
    if (!css.includes('--yarcl-color-brand')) throw new Error(`${file} does not contain the generated yarcl styles.`);
    if (!css.includes('.yarcl-button')) throw new Error(`${file} does not contain the yarcl component styles.`);
  }),
);

await Promise.all(['webpack', 'rspack', 'rollup', 'esbuild'].map(async (adapter) => {
  const file = `dist/${adapter}/yarcl.tokens.css`;
  const css = await readFile(new URL(file, import.meta.url), 'utf8');
  if (!css.includes('--yarcl-color-brand')) throw new Error(`${file} does not contain the configured tokens.`);
  if (css.includes('.yarcl-')) throw new Error(`${file} contains component or modifier classes.`);
}));

await import('./tokens.mjs');
