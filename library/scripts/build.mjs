import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, rm } from 'node:fs/promises';
import { platform } from 'node:os';
import { fileURLToPath, URL } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');

await rm(dist, { recursive: true, force: true });

const result = spawnSync(platform() === 'win32' ? 'tsc.cmd' : 'tsc', ['-p', 'tsconfig.build.json'], {
  cwd: root,
  stdio: 'inherit',
});

if (result.error) throw result.error;
if (result.status !== 0) throw new Error(`TypeScript build failed with status ${result.status ?? 'unknown'}`);

await mkdir(join(dist, 'reference'), { recursive: true });
await Promise.all([
  copyFile(join(root, 'src/styles.css'), join(dist, 'styles.css')),
  copyFile(join(root, 'src/reference/reference.css'), join(dist, 'reference/reference.css')),
]);
