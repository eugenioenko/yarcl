import { defineConfig } from '../define';
import defaults from '../yarcl.config';
import type { ThemeContract } from './contract';

/** Bold and energetic: cobalt and citrus, heavy display type, rounded rectangles, large controls and sculpted cards. */
export const studio = defineConfig({
  ...defaults,
  colors: {
    primary: { light: '#2842d7', dark: '#a8b5ff' },
    neutral: { light: '#4d4d65', dark: '#bcbcd4' },
    success: { light: '#407200', dark: '#d5ef68' },
    warning: { light: '#a86a00', dark: '#ffdc62' },
    danger: { light: '#c42b5c', dark: '#ff9fc0' },
    info: { light: '#6b35bd', dark: '#cbaaff' },
  },
  neutrals: {
    bg: { light: '#f3f3fa', dark: '#121225' },
    surface: { light: '#ffffff', dark: '#22223b' },
    text: { light: '#20203c', dark: '#f4f4ff' },
    muted: { light: '#66667e', dark: '#b2b2cc' },
    border: { light: '#c9c9df', dark: '#535373' },
  },
  sizes: {
    xs: { height: '2rem', paddingX: '0.75rem', fontSize: '0.8125rem', iconSize: '0.875rem' },
    sm: { height: '2.5rem', paddingX: '1rem', fontSize: '0.875rem', iconSize: '1rem' },
    md: { height: '3rem', paddingX: '1.375rem', fontSize: '1rem', iconSize: '1.25rem' },
    lg: { height: '3.5rem', paddingX: '1.75rem', fontSize: '1.125rem', iconSize: '1.5rem' },
    xl: { height: '4rem', paddingX: '2.25rem', fontSize: '1.25rem', iconSize: '1.75rem' },
  },
  radii: { square: '0', sm: '6px', md: '10px', lg: '16px', xl: '24px', rounded: '9999px' },
  spacing: { xs: '0.375rem', sm: '0.75rem', md: '1.25rem', lg: '1.75rem', xl: '2.5rem' },
  shadows: {
    sm: '0 3px 0 light-dark(rgb(40 66 215 / 0.1), rgb(0 0 0 / 0.35))',
    md: '0 8px 24px -4px light-dark(rgb(40 66 215 / 0.2), rgb(0 0 0 / 0.6))',
    lg: '0 20px 48px -8px light-dark(rgb(40 66 215 / 0.25), rgb(0 0 0 / 0.75))',
  },
  density: {
    compact: { paddingX: '0.75rem', paddingY: '0.5rem', fontSize: '0.875rem' },
    comfortable: { paddingX: '1rem', paddingY: '0.875rem', fontSize: '1rem' },
  },
  typography: {
    families: {
      sans: '"Avenir Next", "Trebuchet MS", system-ui, sans-serif',
      mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    },
    fonts: { body: 'sans', heading: 'sans', mono: 'mono' },
    styles: {
      display: { family: 'sans', size: '3rem', weight: 900, lineHeight: 1, letterSpacing: '-0.045em' },
      heading: { family: 'sans', size: '1.875rem', weight: 800, lineHeight: 1.15, letterSpacing: '-0.025em' },
      subheading: { family: 'sans', size: '1.25rem', weight: 700, lineHeight: 1.3 },
      body: { family: 'sans', size: '1rem', weight: 400, lineHeight: 1.55 },
      caption: { family: 'sans', size: '0.8125rem', weight: 500, lineHeight: 1.45 },
      code: { family: 'mono', size: '0.875rem', weight: 400, lineHeight: 1.5 },
      label: { family: 'sans', size: '0.9375rem', weight: 700, lineHeight: 1.4 },
    },
    headings: { h1: 'display', h2: 'heading', h3: 'subheading', h4: 'subheading', h5: 'label', h6: 'label' },
  },
  focusRing: { width: '3px', offset: '3px', color: 'primary' },
  components: {
    ...defaults.components,
    Button: { radius: 'md' },
    Card: { radius: 'xl', shadow: 'sm' },
    Badge: { color: 'success', radius: 'sm' },
    Alert: { color: 'success', radius: 'lg', gap: 'sm', padding: 'md', textStyle: 'label' },
    Dialog: { radius: 'xl', slots: { header: { textStyle: 'heading' } } },
    Table: { slots: { header: { textStyle: 'label' } } },
  },
  defaults: { ...defaults.defaults, radius: 'md', padding: 'lg', gap: 'md' },
}) satisfies ThemeContract;
