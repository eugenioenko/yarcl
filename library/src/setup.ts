import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { parse, type ParseError } from 'jsonc-parser';

export const DEFAULT_CONFIG_PATH = 'src/yarcl.config.ts';
export const CONFIG_MODULE = '@yarcl/config';
const tsconfigNames = ['tsconfig.app.json', 'tsconfig.json'];

export function findTsconfig(root: string): string | undefined {
  return tsconfigNames.map((name) => resolve(root, name)).find((file) => existsSync(file));
}

export function projectPath(from: string, target: string): string {
  const path = relative(from, target).split(sep).join('/');
  return path.startsWith('.') ? path : `./${path}`;
}

export function configMappings(root: string, tsconfig: string, configPath: string): string[] {
  const base = dirname(tsconfig);
  return [
    projectPath(base, resolve(root, configPath)),
    projectPath(base, resolve(root, 'node_modules/@yarcl/react/dist/yarcl.config.d.ts')),
  ];
}

function readTsconfig(root: string, file: string) {
  const errors: ParseError[] = [];
  const config = parse(readFileSync(file, 'utf8'), errors, { allowTrailingComma: true });
  if (errors.length > 0) throw new Error(`yarcl: Could not parse ${projectPath(root, file)}.`);
  return config;
}

function localExtends(file: string, value: unknown): string[] {
  const entries = Array.isArray(value) ? value : [value];
  return entries
    .filter((entry): entry is string => typeof entry === 'string' && (entry.startsWith('.') || isAbsolute(entry)))
    .map((entry) => resolve(dirname(file), entry.endsWith('.json') ? entry : `${entry}.json`))
    .filter((target) => existsSync(target));
}

function configMapping(root: string, file: string, ancestors = new Set<string>()): { path?: string } | undefined {
  if (ancestors.has(file)) throw new Error(`yarcl: Circular tsconfig extends in ${projectPath(root, file)}.`);
  const seen = new Set(ancestors).add(file);
  const config = readTsconfig(root, file);
  const mapping = config?.compilerOptions?.paths?.[CONFIG_MODULE];
  if (config?.compilerOptions?.paths) {
    return { path: Array.isArray(mapping) && typeof mapping[0] === 'string' ? resolve(dirname(file), mapping[0]) : undefined };
  }
  const parents = localExtends(file, config?.extends).reverse();
  for (const parent of parents) {
    const found = configMapping(root, parent, seen);
    if (found) return found;
  }
  return undefined;
}

export function assertConfigMapping(root: string, configPath: string, buildTool = 'build tool'): void {
  const tsconfig = findTsconfig(root);
  if (!tsconfig) {
    throw new Error(`yarcl: No tsconfig.app.json or tsconfig.json found in ${root}. Run "yarcl init".`);
  }

  const expected = resolve(root, configPath);
  const actual = configMapping(root, tsconfig)?.path;
  if (actual === expected) return;

  const current = actual ? `"${projectPath(root, actual)}"` : 'no path';
  throw new Error(
    `yarcl: Config path mismatch. ${buildTool} uses "${configPath}", but ${projectPath(root, tsconfig)} has ${current} for "${CONFIG_MODULE}". Run "yarcl init --config ${configPath}".`,
  );
}
