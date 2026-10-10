import { defineConfig } from '../define';
import defaults from '../yarcl.config';
import type { ThemeContract } from './contract';

/** Architectural and opulent: gold on pearl and black, geometric letterspaced type, square controls and double-framed panels. */
export const artDeco = defineConfig({
  ...defaults,
  colors: {
    primary: { light: '#896613', dark: '#d9b868' },
    neutral: { light: '#414d4c', dark: '#bcc8c5' },
    success: { light: '#285d50', dark: '#9ad1b5' },
    warning: { light: '#945c21', dark: '#ebbe87' },
    danger: { light: '#923946', dark: '#e7a3b0' },
    info: { light: '#325d7c', dark: '#a1c6e1' },
  },
  neutrals: {
    bg: { light: '#f2f3ed', dark: '#080d0c' },
    surface: { light: '#ffffff', dark: '#17221f' },
    text: { light: '#17221f', dark: '#f3eee0' },
    muted: { light: '#56635e', dark: '#b7c3b9' },
    border: { light: '#806c36', dark: '#a68c4c' },
  },
  sizes: {
    xs: { height: '1.875rem', paddingX: '0.75rem', fontSize: '0.75rem', iconSize: '0.875rem' },
    sm: { height: '2.25rem', paddingX: '1rem', fontSize: '0.8125rem', iconSize: '1rem' },
    md: { height: '2.75rem', paddingX: '1.5rem', fontSize: '0.875rem', iconSize: '1rem' },
    lg: { height: '3.25rem', paddingX: '1.875rem', fontSize: '1rem', iconSize: '1.25rem' },
    xl: { height: '3.75rem', paddingX: '2.25rem', fontSize: '1.125rem', iconSize: '1.5rem' },
  },
  radii: { square: '0', sm: '0', md: '0', lg: '0', xl: '0', rounded: '9999px' },
  variants: {
    solid: { background: 'fill', border: 'neutral', text: 'on' },
    soft: { background: 'tint', border: 'neutral', text: 'color' },
    outline: { background: 'none', border: 'neutral', text: 'color' },
    ghost: { background: 'none', border: 'none', text: 'color' },
  },
  spacing: { xs: '0.375rem', sm: '0.75rem', md: '1.25rem', lg: '1.875rem', xl: '2.75rem' },
  shadows: {
    sm: '0 0 0 1px light-dark(#806c36, #a68c4c), 0 0 0 4px light-dark(#f2f3ed, #080d0c), 0 0 0 5px light-dark(#806c36, #a68c4c)',
    md: '0 12px 32px -8px light-dark(rgb(23 34 31 / 0.2), rgb(0 0 0 / 0.6))',
    lg: '0 24px 56px -12px light-dark(rgb(23 34 31 / 0.28), rgb(0 0 0 / 0.75))',
  },
  borders: { width: '1px', frame: '3px' },
  density: {
    compact: { paddingX: '0.75rem', paddingY: '0.5rem', fontSize: '0.8125rem' },
    comfortable: { paddingX: '1rem', paddingY: '0.875rem', fontSize: '0.875rem' },
  },
  typography: {
    families: {
      sans: 'Futura, "Century Gothic", "Avenir Next", system-ui, sans-serif',
      mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    },
    fonts: { body: 'sans', heading: 'sans', mono: 'mono' },
    styles: {
      display: { family: 'sans', size: '2.25rem', weight: 500, lineHeight: 1.2, letterSpacing: '0.08em' },
      heading: { family: 'sans', size: '1.5rem', weight: 500, lineHeight: 1.3, letterSpacing: '0.06em' },
      subheading: { family: 'sans', size: '1.125rem', weight: 600, lineHeight: 1.4, letterSpacing: '0.035em' },
      body: { family: 'sans', size: '1rem', weight: 400, lineHeight: 1.6 },
      caption: { family: 'sans', size: '0.8125rem', weight: 400, lineHeight: 1.5, letterSpacing: '0.04em' },
      code: { family: 'mono', size: '0.875rem', weight: 400, lineHeight: 1.5 },
      label: { family: 'sans', size: '0.75rem', weight: 600, lineHeight: 1.5, letterSpacing: '0.1em' },
    },
    headings: { h1: 'display', h2: 'heading', h3: 'subheading', h4: 'subheading', h5: 'label', h6: 'label' },
  },
  focusRing: { width: '2px', offset: '4px', color: 'primary' },
  components: {
    ...defaults.components,
    Card: { radius: 'square', shadow: 'sm', slots: { root: { border: 'double', borderWidth: 'frame' } } },
    Table: { slots: { header: { textStyle: 'label', border: 'double', borderWidth: 'frame' } } },
    Dialog: { radius: 'square', slots: { root: { border: 'double', borderWidth: 'frame' }, header: { textStyle: 'heading' } } },
    Drawer: { size: 'sm', slots: { root: { border: 'double', borderWidth: 'frame' } } },
  },
  defaults: { ...defaults.defaults, radius: 'square', padding: 'lg', gap: 'md' },
}) satisfies ThemeContract;
