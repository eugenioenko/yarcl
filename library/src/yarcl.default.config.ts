import { defineConfig } from './define';

/** The library's default design system, used when the consumer provides no config. */
export default defineConfig({
  colors: {
    primary: { light: '#2d4bb8', dark: '#8aa2ff' },
    secondary: { light: '#8240b3', dark: '#c79bf0' },
    danger: { light: '#dc2626', dark: '#f87171' },
  },
  neutrals: {
    bg: { light: '#f8f9fb', dark: '#0f1115' },
    surface: { light: '#ffffff', dark: '#181b21' },
    text: { light: '#101828', dark: '#e6e8ec' },
    muted: { light: '#667085', dark: '#8b93a1' },
    border: { light: '#d0d5dd', dark: '#2e333d' },
  },
  sizes: {
    sm: { height: '2rem', paddingX: '0.75rem', fontSize: '0.8125rem', iconSize: '0.875rem' },
    md: { height: '2.5rem', paddingX: '1rem', fontSize: '0.875rem', iconSize: '1rem' },
    lg: { height: '3rem', paddingX: '1.25rem', fontSize: '1rem', iconSize: '1.25rem' },
  },
  radii: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    full: '9999px',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  shadows: {
    sm: '0 1px 2px rgb(0 0 0 / 0.08)',
    md: '0 4px 12px rgb(0 0 0 / 0.12)',
    lg: '0 12px 32px rgb(0 0 0 / 0.18)',
  },
  typography: {
    families: {
      sans: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    },
    styles: {
      heading: { family: 'sans', size: '1.5rem', weight: 700, lineHeight: 1.25, letterSpacing: '-0.01em' },
      body: { family: 'sans', size: '1rem', weight: 400, lineHeight: 1.5 },
      caption: { family: 'sans', size: '0.8125rem', weight: 400, lineHeight: 1.4 },
      code: { family: 'mono', size: '0.875rem', weight: 400, lineHeight: 1.5 },
    },
  },
  zIndex: { dropdown: 1000, tooltip: 1100, dialog: 1200, toast: 1300 },
  motion: { fast: '120ms', base: '200ms', easing: 'cubic-bezier(0.2, 0, 0, 1)' },
  borders: { width: '1px' },
  focusRing: { width: '2px', offset: '2px', color: 'primary' },
  defaults: { size: 'md', radius: 'md', color: 'primary' },
});
