import { defineConfig } from './define';
import defaults from './yarcl.default.config';

defineConfig({ ...defaults, colors: { ...defaults.colors, brand: { light: '#000', dark: '#fff' } } });

defineConfig({
  ...defaults,
  // @ts-expect-error
  colors: { primary: { light: '#2d4bb8' } },
});

defineConfig({
  ...defaults,
  // @ts-expect-error
  defaults: { ...defaults.defaults, size: 'xxl' },
});

defineConfig({
  ...defaults,
  // @ts-expect-error
  focusRing: { ...defaults.focusRing, color: 'nope' },
});

defineConfig({
  ...defaults,
  typography: {
    ...defaults.typography,
    // @ts-expect-error
    styles: { body: { family: 'serif', size: '1rem', weight: 400, lineHeight: 1.5 } },
  },
});

defineConfig({
  ...defaults,
  // @ts-expect-error
  radii: { ...defaults.radii, 'extra round': '2rem' },
});

defineConfig({
  ...defaults,
  zIndex: { ...defaults.zIndex, banner: 900 },
  neutrals: { ...defaults.neutrals, raised: { light: '#fff', dark: '#222' } },
});

defineConfig({
  ...defaults,
  // @ts-expect-error
  zIndex: { dropdown: 1000, tooltip: 1100, dialog: 1200 },
});

defineConfig({
  ...defaults,
  variants: { ...defaults.variants, link: { background: 'none', border: 'none', text: 'color' } },
});

defineConfig({
  ...defaults,
  // @ts-expect-error
  variants: { solid: { background: 'gradient', border: 'color', text: 'on' } },
});

defineConfig({
  ...defaults,
  // @ts-expect-error
  defaults: { ...defaults.defaults, errorColor: 'red' },
});
