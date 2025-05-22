import { createContext, useContext } from 'react';
import type { ThemeConfig, ThemeProviderProps } from './Theme.types';
import { defaultThemeConfig } from './Theme.config';
import deepmerge from 'deepmerge';

export const ThemeContext = createContext<ThemeConfig>(defaultThemeConfig);

export function useTheme() {
  return useContext(ThemeContext);
}

export const ThemeProvider = ({ children, config }: ThemeProviderProps) => {
  const merged = deepmerge(
    defaultThemeConfig,
    (config || {}),
  ) as ThemeConfig;
  return <ThemeContext.Provider value={merged}>{children}</ThemeContext.Provider>;
};
