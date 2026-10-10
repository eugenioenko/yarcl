import { defineConfig } from '../define';
import defaults from '../yarcl.config';
import type { ThemeContract } from './contract';

/** Refined and spacious: bronze on ivory and charcoal, serif headings, fine borders, rectangular controls and quiet depth. */
export const atelier = defineConfig({
  ...defaults,
  colors: {
    primary: { light: '#78502d', dark: '#d6b58a' },
    neutral: { light: '#625a50', dark: '#c5bdb1' },
    success: { light: '#436344', dark: '#a5c4a0' },
    warning: { light: '#936018', dark: '#e1bc72' },
    danger: { light: '#a13e44', dark: '#e6a0a5' },
    info: { light: '#49647b', dark: '#a0bfd5' },
  },
  neutrals: {
    bg: { light: '#f5f2ec', dark: '#191816' },
    surface: { light: '#fffdf9', dark: '#25231f' },
    text: { light: '#29251f', dark: '#f3eee5' },
    muted: { light: '#71675b', dark: '#b8aea0' },
    border: { light: '#cfc5b6', dark: '#554d41' },
  },
  sizes: {
    xs: { height: '1.875rem', paddingX: '0.75rem', fontSize: '0.75rem', iconSize: '0.875rem' },
    sm: { height: '2.25rem', paddingX: '1rem', fontSize: '0.8125rem', iconSize: '1rem' },
    md: { height: '2.75rem', paddingX: '1.5rem', fontSize: '0.875rem', iconSize: '1rem' },
    lg: { height: '3.25rem', paddingX: '1.875rem', fontSize: '1rem', iconSize: '1.25rem' },
    xl: { height: '3.75rem', paddingX: '2.25rem', fontSize: '1.125rem', iconSize: '1.5rem' },
  },
  radii: { square: '0', sm: '2px', md: '4px', lg: '8px', xl: '12px', rounded: '9999px' },
  spacing: { xs: '0.375rem', sm: '0.75rem', md: '1.25rem', lg: '1.875rem', xl: '2.75rem' },
  shadows: {
    sm: '0 1px 3px light-dark(rgb(69 48 22 / 0.06), rgb(0 0 0 / 0.25))',
    md: '0 12px 32px -12px light-dark(rgb(69 48 22 / 0.18), rgb(0 0 0 / 0.6))',
    lg: '0 24px 56px -16px light-dark(rgb(69 48 22 / 0.24), rgb(0 0 0 / 0.7))',
  },
  density: {
    compact: { paddingX: '0.75rem', paddingY: '0.5rem', fontSize: '0.8125rem' },
    comfortable: { paddingX: '1rem', paddingY: '0.875rem', fontSize: '0.875rem' },
  },
  typography: {
    families: {
      sans: '"Helvetica Neue", "Segoe UI", system-ui, sans-serif',
      serif: 'Georgia, "Times New Roman", serif',
      mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    },
    fonts: { body: 'sans', heading: 'serif', mono: 'mono' },
    styles: {
      display: { family: 'serif', size: '3rem', weight: 400, lineHeight: 1.1, letterSpacing: '-0.025em' },
      heading: { family: 'serif', size: '1.875rem', weight: 400, lineHeight: 1.2, letterSpacing: '-0.015em' },
      subheading: { family: 'serif', size: '1.25rem', weight: 400, lineHeight: 1.35 },
      body: { family: 'sans', size: '1rem', weight: 400, lineHeight: 1.65 },
      caption: { family: 'sans', size: '0.8125rem', weight: 400, lineHeight: 1.5 },
      code: { family: 'mono', size: '0.875rem', weight: 400, lineHeight: 1.5 },
      label: { family: 'sans', size: '0.8125rem', weight: 600, lineHeight: 1.45, letterSpacing: '0.05em' },
    },
    headings: { h1: 'display', h2: 'heading', h3: 'subheading', h4: 'subheading', h5: 'label', h6: 'label' },
  },
  focusRing: { width: '2px', offset: '3px', color: 'primary' },
  components: {
    ...defaults.components,
    Button: { radius: 'square' },
    Card: { radius: 'lg', shadow: 'sm' },
    Table: { slots: { header: { textStyle: 'label' } } },
    Dialog: { slots: { header: { textStyle: 'heading' } } },
  },
  defaults: { ...defaults.defaults, radius: 'md', padding: 'lg', gap: 'md' },
}) satisfies ThemeContract;
