import { defineConfig } from '../define';
import defaults from '../yarcl.config';
import type { ThemeContract } from './contract';

/** Electric and futuristic: neon pink and cyan, violet surfaces, monospace type, sharp controls and luminous panel edges. */
export const cyberpunk = defineConfig({
  ...defaults,
  colors: {
    primary: { light: '#ad007c', dark: '#ff70de' },
    neutral: { light: '#534369', dark: '#c6b4e6' },
    success: { light: '#267400', dark: '#bdff5b' },
    warning: { light: '#8a5c00', dark: '#ffe55b' },
    danger: { light: '#cf234d', dark: '#ff739b' },
    info: { light: '#006e80', dark: '#59efff' },
  },
  neutrals: {
    bg: { light: '#f2ebfc', dark: '#090516' },
    surface: { light: '#fffbff', dark: '#1c1233' },
    text: { light: '#29113d', dark: '#f8eeff' },
    muted: { light: '#695176', dark: '#c0a9d5' },
    border: { light: '#ae78bd', dark: '#8d53a5' },
  },
  sizes: {
    xs: { height: '1.75rem', paddingX: '0.625rem', fontSize: '0.75rem', iconSize: '0.875rem' },
    sm: { height: '2.125rem', paddingX: '0.875rem', fontSize: '0.8125rem', iconSize: '1rem' },
    md: { height: '2.625rem', paddingX: '1.125rem', fontSize: '0.875rem', iconSize: '1.125rem' },
    lg: { height: '3.125rem', paddingX: '1.5rem', fontSize: '1rem', iconSize: '1.25rem' },
    xl: { height: '3.625rem', paddingX: '1.875rem', fontSize: '1.125rem', iconSize: '1.5rem' },
  },
  radii: { square: '0', sm: '0', md: '2px', lg: '4px', xl: '6px', rounded: '9999px' },
  variants: {
    ...defaults.variants,
    soft: { background: 'tint', border: 'color', text: 'color' },
  },
  spacing: { xs: '0.25rem', sm: '0.625rem', md: '1rem', lg: '1.5rem', xl: '2.25rem' },
  shadows: {
    sm: '0 0 0 1px light-dark(rgb(173 0 124 / 0.3), rgb(255 112 222 / 0.5)), 0 0 16px light-dark(rgb(173 0 124 / 0.1), rgb(255 112 222 / 0.18))',
    md: '0 0 0 1px light-dark(rgb(0 110 128 / 0.4), rgb(89 239 255 / 0.6)), 0 0 28px light-dark(rgb(0 110 128 / 0.14), rgb(89 239 255 / 0.2))',
    lg: '0 0 0 1px light-dark(rgb(173 0 124 / 0.4), rgb(255 112 222 / 0.7)), 0 0 48px light-dark(rgb(173 0 124 / 0.2), rgb(255 112 222 / 0.25))',
  },
  density: {
    compact: { paddingX: '0.625rem', paddingY: '0.375rem', fontSize: '0.75rem' },
    comfortable: { paddingX: '0.875rem', paddingY: '0.75rem', fontSize: '0.8125rem' },
  },
  typography: {
    families: {
      sans: '"SF Mono", "Cascadia Code", ui-monospace, Menlo, Consolas, monospace',
      mono: '"SF Mono", "Cascadia Code", ui-monospace, Menlo, Consolas, monospace',
    },
    fonts: { body: 'mono', heading: 'mono', mono: 'mono' },
    styles: {
      display: { family: 'mono', size: '2.25rem', weight: 700, lineHeight: 1.15, letterSpacing: '-0.045em' },
      heading: { family: 'mono', size: '1.5rem', weight: 700, lineHeight: 1.25, letterSpacing: '-0.025em' },
      subheading: { family: 'mono', size: '1.125rem', weight: 600, lineHeight: 1.35 },
      body: { family: 'mono', size: '0.875rem', weight: 400, lineHeight: 1.6 },
      caption: { family: 'mono', size: '0.75rem', weight: 400, lineHeight: 1.5 },
      code: { family: 'mono', size: '0.8125rem', weight: 400, lineHeight: 1.5 },
      label: { family: 'mono', size: '0.8125rem', weight: 600, lineHeight: 1.4, letterSpacing: '0.04em' },
    },
    headings: { h1: 'display', h2: 'heading', h3: 'subheading', h4: 'subheading', h5: 'label', h6: 'label' },
  },
  focusRing: { width: '2px', offset: '4px', color: 'info' },
  components: {
    ...defaults.components,
    Card: { radius: 'lg', shadow: 'sm' },
    Table: { slots: { header: { textStyle: 'label', background: 'tint' } } },
    Dialog: { radius: 'md', slots: { root: { shadow: 'lg' }, header: { textStyle: 'heading' } } },
    Drawer: { size: 'sm', slots: { root: { shadow: 'md' } } },
  },
  defaults: { ...defaults.defaults, radius: 'sm', padding: 'lg', gap: 'md' },
}) satisfies ThemeContract;
