import buildConfig from '@yarcl/config';
import { useSyncExternalStore } from 'react';
import type { ComponentName, YarclShape } from './define.js';
import type { ComponentDefaults } from './types.js';

type Config = typeof buildConfig;

let active: Config = buildConfig;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function activeConfig(): Config {
  return active;
}

export function setActiveConfig(next: YarclShape | null) {
  active = (next ?? buildConfig) as Config;
  listeners.forEach((listener) => listener());
}

/**
 * The config components currently read their defaults from: the build-time config, or the
 * theme passed to `applyTheme`. Re-renders the caller when the theme changes.
 */
export function useConfig(): Config {
  return useSyncExternalStore(subscribe, activeConfig, () => buildConfig);
}

export function useDefaults(component: ComponentName): ComponentDefaults {
  const config = useConfig();
  return ((config as unknown as YarclShape).components?.[component] ?? {}) as ComponentDefaults;
}
