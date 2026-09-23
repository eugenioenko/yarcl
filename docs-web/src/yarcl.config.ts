import { defineConfig } from 'yarcl/define';
import defaults from 'yarcl/defaults';

export default defineConfig({
  ...defaults,
  colors: {
    primary: defaults.colors.primary,
    neutral: { light: '#4b5263', dark: '#a3a9b8' },
    success: { light: '#15803d', dark: '#4ade80' },
    warning: { light: '#b45309', dark: '#fbbf24' },
    danger: { light: '#dc2626', dark: '#f87171' },
  },
  neutrals: {
    bg: { light: '#ffffff', dark: '#17181c' },
    surface: { light: '#ffffff', dark: '#23262f' },
    text: { light: '#23262f', dark: '#e6e8ee' },
    muted: { light: '#5e6575', dark: '#9aa1b1' },
    border: { light: '#d8dbe3', dark: '#353a47' },
  },
  focusRing: { ...defaults.focusRing, color: 'primary' },
  defaults: { ...defaults.defaults, color: 'primary' },
});
