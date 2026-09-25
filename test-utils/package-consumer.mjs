import { execFileSync } from 'node:child_process';
import { access, cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { platform, tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const fixture = join(root, 'e2e/package-consumer');
const temporary = await mkdtemp(join(tmpdir(), 'yarcl-package-'));
const packs = join(temporary, 'packs');
const consumer = join(temporary, 'consumer');
const pnpm = platform() === 'win32' ? 'pnpm.cmd' : 'pnpm';

function run(args, cwd = root) {
  execFileSync(pnpm, args, { cwd, stdio: 'inherit' });
}

try {
  await mkdir(packs);
  run(['-C', 'library', 'pack', '--pack-destination', packs]);

  const archive = (await readdir(packs)).find((file) => file.endsWith('.tgz'));
  if (!archive) throw new Error('pnpm pack did not create a tarball');

  await cp(fixture, consumer, { recursive: true });
  const manifestPath = join(consumer, 'package.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  manifest.dependencies['@yarcl/react'] = pathToFileURL(join(packs, archive)).href;
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

  run(['install', '--ignore-workspace'], consumer);

  const installed = join(consumer, 'node_modules/@yarcl/react');
  await Promise.all([
    access(join(installed, 'dist/index.js')),
    access(join(installed, 'dist/index.d.ts')),
    access(join(installed, 'dist/styles.css')),
    access(join(installed, 'dist/yarcl.config.js')),
    access(join(installed, 'dist/yarcl.config.d.ts')),
  ]);

  try {
    await access(join(installed, 'src'));
    throw new Error('The packed package contains TypeScript source');
  } catch (error) {
    if (error instanceof Error && !('code' in error && error.code === 'ENOENT')) throw error;
  }

  run(['build'], consumer);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
