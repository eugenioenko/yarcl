import { envSchema } from '@yarcl/env';
import type { EnvKey } from './env.types';

type Env = Record<EnvKey, string>;

// Reads each declared key from import.meta.env.
// Keys missing from the schema are not accessible — EnvKey is the only valid index.
export const env = Object.keys(envSchema).reduce<Env>((acc, key) => {
  acc[key as EnvKey] = (import.meta.env as Record<string, string>)[key] ?? '';
  return acc;
}, {} as Env);
