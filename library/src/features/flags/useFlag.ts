import { flags } from '@yarcl/flags';
import type { FlagKey } from './flags.types';

export function useFlag(key: FlagKey): boolean {
  return flags[key];
}
