import { defineConfig } from '@yarcl/react/define';
import defaults from '@yarcl/react/defaults';

export default defineConfig({
  ...defaults,
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
