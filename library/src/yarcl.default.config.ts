import { defineConfig } from './define';

export default defineConfig({
  sizes: {
    sm: { height: '32px', paddingX: '12px', fontSize: '13px' },
    md: { height: '40px', paddingX: '16px', fontSize: '14px' },
    lg: { height: '48px', paddingX: '20px', fontSize: '16px' },
  },
  radii: {
    none: '0px',
    sm: '4px',
    md: '8px',
    full: '9999px',
  },
  colors: {
    primary: '#2d4bb8',
    secondary: '#8240b3',
    danger: '#dc2626',
  },
  defaults: { size: 'md', radius: 'md', color: 'primary' },
});
