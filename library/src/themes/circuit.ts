import { defineConfig } from '../define';
import defaults from '../yarcl.config';
import type { ThemeContract } from './contract';

/** Precise and technical: cyan on ice and navy, crisp corners, monospace labels, roomy controls and layered panels. */
export const circuit = defineConfig({
  ...defaults,
  colors: {
    primary: { light: '#006c83', dark: '#67e8f9' },
    neutral: { light: '#465d73', dark: '#adc6db' },
    success: { light: '#14734f', dark: '#6ee7b7' },
    warning: { light: '#925900', dark: '#fcd34d' },
    danger: { light: '#c02d4d', dark: '#fda4af' },
    info: { light: '#3b54b0', dark: '#a5b4fc' },
  },
  neutrals: {
    bg: { light: '#edf4f8', dark: '#07111f' },
    surface: { light: '#fafdff', dark: '#11243a' },
    text: { light: '#102a43', dark: '#e2f0fb' },
    muted: { light: '#50677e', dark: '#9bb4cc' },
    border: { light: '#b4c9dc', dark: '#36546f' },
  },
  sizes: {
    xs: { height: '1.75rem', paddingX: '0.625rem', fontSize: '0.75rem', iconSize: '0.875rem' },
    sm: { height: '2.125rem', paddingX: '0.875rem', fontSize: '0.8125rem', iconSize: '1rem' },
    md: { height: '2.625rem', paddingX: '1.125rem', fontSize: '0.875rem', iconSize: '1.125rem' },
    lg: { height: '3.125rem', paddingX: '1.5rem', fontSize: '1rem', iconSize: '1.25rem' },
    xl: { height: '3.625rem', paddingX: '1.875rem', fontSize: '1.125rem', iconSize: '1.5rem' },
  },
  radii: { square: '0', sm: '2px', md: '4px', lg: '6px', xl: '8px', rounded: '9999px' },
  spacing: { xs: '0.25rem', sm: '0.625rem', md: '1rem', lg: '1.5rem', xl: '2.25rem' },
  shadows: {
    sm: '0 0 0 1px light-dark(rgb(0 108 131 / 0.08), rgb(103 232 249 / 0.08))',
    md: '0 8px 24px light-dark(rgb(16 42 67 / 0.14), rgb(0 0 0 / 0.55))',
    lg: '0 20px 48px light-dark(rgb(16 42 67 / 0.2), rgb(0 0 0 / 0.7))',
  },
  density: {
    compact: { paddingX: '0.625rem', paddingY: '0.375rem', fontSize: '0.8125rem' },
    comfortable: { paddingX: '0.875rem', paddingY: '0.75rem', fontSize: '0.875rem' },
  },
  typography: {
    families: {
      sans: '"Segoe UI", system-ui, -apple-system, sans-serif',
      mono: '"SF Mono", ui-monospace, Menlo, Consolas, monospace',
    },
    fonts: { body: 'sans', heading: 'sans', mono: 'mono' },
    styles: {
      display: { family: 'sans', size: '2.25rem', weight: 600, lineHeight: 1.15, letterSpacing: '-0.035em' },
      heading: { family: 'sans', size: '1.5rem', weight: 600, lineHeight: 1.25, letterSpacing: '-0.025em' },
      subheading: { family: 'sans', size: '1.125rem', weight: 600, lineHeight: 1.35 },
      body: { family: 'sans', size: '0.9375rem', weight: 400, lineHeight: 1.55 },
      caption: { family: 'mono', size: '0.75rem', weight: 400, lineHeight: 1.5 },
      code: { family: 'mono', size: '0.8125rem', weight: 400, lineHeight: 1.5 },
      label: { family: 'mono', size: '0.8125rem', weight: 500, lineHeight: 1.45, letterSpacing: '0.025em' },
    },
    headings: { h1: 'display', h2: 'heading', h3: 'subheading', h4: 'subheading', h5: 'label', h6: 'label' },
  },
  focusRing: { width: '2px', offset: '3px', color: 'primary' },
  components: {
    ...defaults.components,
    Card: { radius: 'lg', shadow: 'sm' },
    Table: { slots: { header: { textStyle: 'label', background: 'tint' } } },
    Tabs: { slots: { trigger: { textStyle: 'label' } } },
    Dialog: { slots: { footer: { background: 'tint', padding: 'md' } } },
  },
  defaults: { ...defaults.defaults, radius: 'sm', padding: 'lg', gap: 'md' },
}) satisfies ThemeContract;
