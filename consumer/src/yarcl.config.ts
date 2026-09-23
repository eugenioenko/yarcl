import { defineConfig } from 'yarcl/define';

export default defineConfig({
  sizes: {
    xs: { height: '28px', paddingX: '10px', fontSize: '12px' },
    sm: { height: '34px', paddingX: '12px', fontSize: '13px' },
    md: { height: '40px', paddingX: '16px', fontSize: '14px' },
    lg: { height: '48px', paddingX: '20px', fontSize: '16px' },
    xl: { height: '56px', paddingX: '24px', fontSize: '18px' },
  },
  radii: {
    square: '0px',
    soft: '6px',
    round: '12px',
    pill: '9999px',
  },
  colors: {
    brand: '#2d4bb8',
    neutral: '#475467',
    success: '#16a34a',
    warning: '#d97706',
    danger: '#dc2626',
  },
  defaults: { size: 'md', radius: 'soft', color: 'brand' },
});
