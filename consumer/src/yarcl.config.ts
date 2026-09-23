import { defineConfig } from 'yarcl/define';
import defaults from 'yarcl/defaults';

export default defineConfig({
  ...defaults,
  colors: {
    brand: { light: '#2d4bb8', dark: '#8aa2ff' },
    neutral: { light: '#475467', dark: '#98a2b3' },
    success: { light: '#15803d', dark: '#4ade80' },
    warning: { light: '#b45309', dark: '#fbbf24' },
    danger: { light: '#dc2626', dark: '#f87171' },
  },
  sizes: {
    xs: { height: '1.75rem', paddingX: '0.625rem', fontSize: '0.75rem', iconSize: '0.75rem' },
    sm: { height: '2.125rem', paddingX: '0.75rem', fontSize: '0.8125rem', iconSize: '0.875rem' },
    md: { height: '2.5rem', paddingX: '1rem', fontSize: '0.875rem', iconSize: '1rem' },
    lg: { height: '3rem', paddingX: '1.25rem', fontSize: '1rem', iconSize: '1.25rem' },
    xl: { height: '3.5rem', paddingX: '1.5rem', fontSize: '1.125rem', iconSize: '1.5rem' },
  },
  radii: {
    square: '0',
    soft: '0.375rem',
    round: '0.75rem',
    pill: '9999px',
  },
  spacing: {
    tight: '0.5rem',
    normal: '1rem',
    loose: '2rem',
  },
  typography: {
    ...defaults.typography,
    styles: {
      display: { family: 'sans', size: '2.25rem', weight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' },
      title: { family: 'sans', size: '1.25rem', weight: 600, lineHeight: 1.3 },
      body: { family: 'sans', size: '1rem', weight: 400, lineHeight: 1.5 },
      caption: { family: 'sans', size: '0.8125rem', weight: 400, lineHeight: 1.4 },
      code: { family: 'mono', size: '0.875rem', weight: 400, lineHeight: 1.5 },
    },
  },
  zIndex: { ...defaults.zIndex, banner: 900 },
  focusRing: { ...defaults.focusRing, color: 'brand' },
  defaults: { size: 'md', radius: 'soft', color: 'brand' },
});
