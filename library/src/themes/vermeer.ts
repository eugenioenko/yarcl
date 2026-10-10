import { defineConfig } from '../define';
import defaults from '../yarcl.config';
import type { ThemeContract } from './contract';

/** Painterly and intimate: rich blue and ochre on parchment, full serif typography, rounded controls and warm layered depth. */
export const vermeer = defineConfig({
  ...defaults,
  colors: {
    primary: { light: '#234e9a', dark: '#94bdf5' },
    neutral: { light: '#626049', dark: '#c2bba4' },
    success: { light: '#416234', dark: '#aacb83' },
    warning: { light: '#8d6416', dark: '#e8c567' },
    danger: { light: '#993e3b', dark: '#eaa49a' },
    info: { light: '#2c6c75', dark: '#91c6cf' },
  },
  neutrals: {
    bg: { light: '#f3e8cc', dark: '#202a27' },
    surface: { light: '#fff8e6', dark: '#2f3933' },
    text: { light: '#2e3126', dark: '#faf0d8' },
    muted: { light: '#626049', dark: '#c2bba4' },
    border: { light: '#bcab80', dark: '#69735b' },
  },
  sizes: {
    xs: { height: '1.875rem', paddingX: '0.75rem', fontSize: '0.8125rem', iconSize: '0.875rem' },
    sm: { height: '2.25rem', paddingX: '1rem', fontSize: '0.875rem', iconSize: '1rem' },
    md: { height: '2.875rem', paddingX: '1.375rem', fontSize: '1rem', iconSize: '1.125rem' },
    lg: { height: '3.375rem', paddingX: '1.75rem', fontSize: '1.125rem', iconSize: '1.25rem' },
    xl: { height: '3.875rem', paddingX: '2rem', fontSize: '1.25rem', iconSize: '1.5rem' },
  },
  radii: { square: '0', sm: '4px', md: '8px', lg: '12px', xl: '18px', rounded: '9999px' },
  spacing: { xs: '0.375rem', sm: '0.75rem', md: '1.125rem', lg: '1.75rem', xl: '2.5rem' },
  shadows: {
    sm: '0 2px 0 light-dark(rgb(141 100 22 / 0.22), rgb(0 0 0 / 0.45))',
    md: '0 8px 24px -4px light-dark(rgb(94 65 20 / 0.22), rgb(0 0 0 / 0.55))',
    lg: '0 20px 48px -8px light-dark(rgb(94 65 20 / 0.28), rgb(0 0 0 / 0.7))',
  },
  density: {
    compact: { paddingX: '0.75rem', paddingY: '0.5rem', fontSize: '0.875rem' },
    comfortable: { paddingX: '1rem', paddingY: '0.875rem', fontSize: '1rem' },
  },
  typography: {
    families: {
      sans: '"Segoe UI", system-ui, sans-serif',
      serif: 'Georgia, "Palatino Linotype", Palatino, serif',
      mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    },
    fonts: { body: 'serif', heading: 'serif', mono: 'mono' },
    styles: {
      display: { family: 'serif', size: '2.75rem', weight: 400, lineHeight: 1.15, letterSpacing: '-0.025em' },
      heading: { family: 'serif', size: '1.875rem', weight: 400, lineHeight: 1.25 },
      subheading: { family: 'serif', size: '1.25rem', weight: 700, lineHeight: 1.35 },
      body: { family: 'serif', size: '1rem', weight: 400, lineHeight: 1.6 },
      caption: { family: 'serif', size: '0.875rem', weight: 400, lineHeight: 1.5 },
      code: { family: 'mono', size: '0.875rem', weight: 400, lineHeight: 1.5 },
      label: { family: 'serif', size: '0.9375rem', weight: 700, lineHeight: 1.4 },
    },
    headings: { h1: 'display', h2: 'heading', h3: 'subheading', h4: 'subheading', h5: 'label', h6: 'label' },
  },
  focusRing: { width: '2px', offset: '3px', color: 'primary' },
  components: {
    ...defaults.components,
    Card: { radius: 'lg', shadow: 'sm' },
    Table: { slots: { header: { textStyle: 'label', background: 'tint' } } },
    Dialog: { radius: 'xl', slots: { header: { textStyle: 'heading' } } },
  },
  defaults: { ...defaults.defaults, radius: 'md', padding: 'lg', gap: 'md' },
}) satisfies ThemeContract;
