import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const version = '1.63.0';
const image = `mcr.microsoft.com/playwright:v${version}-noble@sha256:eff16c30e6f3f4af0a03fa4b706120d5e9b0891c344a27d64559aff5900a4a27`;
const require = createRequire(import.meta.url);
if (require('playwright/package.json').version !== version) {
  throw new Error('Update the visual test image and review new baselines when upgrading Playwright.');
}
const args = process.argv.slice(2);
if (process.env.CI && args.some((arg) => arg === '-u' || arg.startsWith('-u=') || arg.startsWith('--update-snapshots'))) {
  throw new Error('CI compares reviewed baselines and cannot update them.');
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const command = ['node', 'node_modules/playwright/cli.js', 'test', '-c', 'e2e/visual/playwright.config.ts', ...args];
const user = typeof process.getuid === 'function' ? ['--user', `${process.getuid()}:${process.getgid()}`] : [];
mkdirSync(resolve(root, '.visual'), { recursive: true });
mkdirSync(resolve(root, 'e2e/visual/baselines'), { recursive: true });
const result = process.env.VISUAL_CONTAINER === '1'
  ? spawnSync(command[0], command.slice(1), { cwd: root, stdio: 'inherit' })
  : spawnSync('docker', [
    'run', '--rm', '--init', '--ipc=host', ...user,
    '-e', `CI=${process.env.CI ?? ''}`, '-e', 'VISUAL_CONTAINER=1',
    '-v', `${root}:/work`, '-w', '/work', image, ...command,
  ], { cwd: root, stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
