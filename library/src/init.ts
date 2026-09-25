import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { platform } from 'node:os';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { env } from 'node:process';
import { applyEdits, modify } from 'jsonc-parser';
import { CONFIG_MODULE, DEFAULT_CONFIG_PATH, configMappings, findTsconfig } from './setup.ts';

interface InitOptions {
  root: string;
  configPath?: string;
  configProvided?: boolean;
  install?: boolean;
  version: string;
}

export interface InitResult {
  configPath: string;
  tsconfig: string;
  viteConfig: string;
  dependencyAdded: boolean;
}

const viteConfigNames = ['vite.config.ts', 'vite.config.mts', 'vite.config.js', 'vite.config.mjs'];

function closingToken(source: string, start: number, open: string, close: string): number {
  let depth = 0;
  let quote = '';
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (lineComment) {
      if (character === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (character === '*' && next === '/') {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '/' && next === '/') {
      lineComment = true;
      index += 1;
      continue;
    }
    if (character === '/' && next === '*') {
      blockComment = true;
      index += 1;
      continue;
    }
    if (character === "'" || character === '"' || character === '`') {
      quote = character;
      continue;
    }
    if (character === open) depth += 1;
    if (character === close) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function existingPluginPath(source: string): string | undefined | null {
  const call = /\byarcl\s*\(/g.exec(source);
  if (!call) return undefined;
  const open = source.indexOf('(', call.index);
  const close = closingToken(source, open, '(', ')');
  if (close < 0) throw new Error('yarcl: Could not parse the yarcl plugin call in the Vite config.');
  const options = source.slice(open + 1, close).trim();
  if (!options) return DEFAULT_CONFIG_PATH;
  const match = /\bconfig\s*:\s*(['"`])([^'"`]+)\1/.exec(options);
  if (match) return match[2];
  if (options.startsWith('{')) return /\bconfig\s*:/.test(options) ? null : DEFAULT_CONFIG_PATH;
  return null;
}

function addPlugin(source: string, configPath: string): string {
  const pluginPath = existingPluginPath(source);
  if (pluginPath !== undefined) return source;

  const match = /\bplugins\s*:\s*\[/g.exec(source);
  if (!match) throw new Error('yarcl: Could not find a plugins array in the Vite config. Add one and run "yarcl init" again.');
  const open = source.indexOf('[', match.index);
  const close = closingToken(source, open, '[', ']');
  if (close < 0) throw new Error('yarcl: Could not parse the plugins array in the Vite config.');

  const body = source.slice(open + 1, close);
  const plugin = `yarcl({ config: '${configPath.replaceAll("'", "\\'")}' })`;
  let updatedBody: string;
  if (!body.includes('\n')) {
    updatedBody = body.trim() ? `${body.trimEnd()}, ${plugin}` : plugin;
  } else {
    const trailing = /\s*$/.exec(body)?.[0] ?? '';
    const content = body.slice(0, body.length - trailing.length).trimEnd();
    const closeIndent = /(?:^|\n)([ \t]*)[^\n]*$/.exec(source.slice(0, close))?.[1] ?? '';
    const itemIndent = /\n([ \t]+)\S/.exec(body)?.[1] ?? `${closeIndent}  `;
    const comma = content.endsWith(',') ? '' : ',';
    updatedBody = `${content}${comma}\n${itemIndent}${plugin},${trailing}`;
  }

  let updated = source.slice(0, open + 1) + updatedBody + source.slice(close);
  const hasImport = /import[\s\S]*?\byarcl\b[\s\S]*?from\s*['"]@yarcl\/react\/plugin['"]/.test(updated);
  if (!hasImport) updated = `import { yarcl } from '@yarcl/react/plugin';\n${updated}`;
  return updated;
}

function detectPackageManager(root: string): string {
  if (existsSync(resolve(root, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(resolve(root, 'yarn.lock'))) return 'yarn';
  if (existsSync(resolve(root, 'bun.lock')) || existsSync(resolve(root, 'bun.lockb'))) return 'bun';
  const caller = env.npm_config_user_agent?.split('/')[0];
  if (caller === 'pnpm' || caller === 'yarn' || caller === 'bun') return caller;
  return 'npm';
}

function install(root: string): void {
  const manager = detectPackageManager(root);
  const executable = platform() === 'win32' ? `${manager}.cmd` : manager;
  const result = spawnSync(executable, ['install'], { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`yarcl: ${manager} install failed with status ${result.status ?? 'unknown'}.`);
}

function normalizedConfigPath(root: string, configPath: string): string {
  const projectRelative = relative(root, resolve(root, configPath));
  if (isAbsolute(configPath) || projectRelative === '..' || projectRelative.startsWith(`..${sep}`)) {
    throw new Error('yarcl: The config path must be inside the project.');
  }
  return configPath.replaceAll('\\', '/').replace(/^\.\//, '');
}

export async function initProject(options: InitOptions): Promise<InitResult> {
  const root = resolve(options.root);
  const manifestPath = resolve(root, 'package.json');
  const viteConfig = viteConfigNames.map((name) => resolve(root, name)).find((file) => existsSync(file));
  const tsconfig = findTsconfig(root);
  if (!existsSync(manifestPath)) throw new Error(`yarcl: No package.json found in ${root}.`);
  if (!viteConfig) throw new Error(`yarcl: No Vite config found in ${root}.`);
  if (!tsconfig) throw new Error(`yarcl: No tsconfig.app.json or tsconfig.json found in ${root}.`);

  const requested = normalizedConfigPath(root, options.configPath ?? DEFAULT_CONFIG_PATH);
  const viteSource = await readFile(viteConfig, 'utf8');
  const existing = existingPluginPath(viteSource);
  if (existing === null) throw new Error('yarcl: The existing yarcl plugin uses a dynamic config path that cannot be updated.');
  if (options.configProvided && existing && resolve(root, existing) !== resolve(root, requested)) {
    throw new Error(`yarcl: The Vite plugin already uses "${existing}", not "${requested}".`);
  }
  const configPath = normalizedConfigPath(root, existing ?? requested);
  const updatedVite = addPlugin(viteSource, configPath);

  const tsconfigSource = await readFile(tsconfig, 'utf8');
  const eol = tsconfigSource.includes('\r\n') ? '\r\n' : '\n';
  const edits = modify(tsconfigSource, ['compilerOptions', 'paths', CONFIG_MODULE], configMappings(root, tsconfig, configPath), {
    formattingOptions: { insertSpaces: true, tabSize: 2, eol },
  });
  const updatedTsconfig = applyEdits(tsconfigSource, edits);

  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const dependencyAdded = !manifest.dependencies?.['@yarcl/react'] && !manifest.devDependencies?.['@yarcl/react'];
  if (dependencyAdded) manifest.dependencies = { ...manifest.dependencies, '@yarcl/react': `^${options.version}` };

  const targetConfig = resolve(root, configPath);
  await Promise.all([
    writeFile(viteConfig, updatedVite),
    writeFile(tsconfig, updatedTsconfig),
    writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`),
    existsSync(targetConfig)
      ? Promise.resolve()
      : mkdir(dirname(targetConfig), { recursive: true }).then(() =>
          writeFile(
            targetConfig,
            "import { defineConfig } from '@yarcl/react/define';\nimport defaults from '@yarcl/react/defaults';\n\nexport default defineConfig({\n  ...defaults,\n});\n",
          ),
        ),
  ]);

  if (dependencyAdded && options.install !== false) install(root);
  return { configPath, tsconfig, viteConfig, dependencyAdded };
}
