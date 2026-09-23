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

defineConfig({
  ...defaults,
  // @ts-expect-error
  defaults: { ...defaults.defaults, textStyle: 'huge' },
});

defineConfig({
  ...defaults,
  // @ts-expect-error
  defaults: { ...defaults.defaults, gap: 'tight' },
});

defineConfig({
  ...defaults,
  // @ts-expect-error
  defaults: { ...defaults.defaults, softVariant: 'subtle' },
});

defineConfig({
  ...defaults,
  typography: {
    ...defaults.typography,
    fontFaces: [{ family: 'Inter', src: ['/fonts/inter.woff2', 'local(Inter)'], weight: '100 900' }],
  },
});

defineConfig({
  ...defaults,
  typography: {
    ...defaults.typography,
    // @ts-expect-error
    headings: { ...defaults.typography.headings, h3: 'huge' },
  },
});

defineConfig({
  ...defaults,
  typography: {
    ...defaults.typography,
    // @ts-expect-error
    headings: { h1: 'display', h2: 'heading' },
  },
});

defineConfig({
  ...defaults,
  // @ts-expect-error
  defaults: { ...defaults.defaults, labelStyle: 'tiny' },
});

defineConfig({
  ...defaults,
  components: {
    Button: { radius: 'square', variant: 'outline' },
    IconButton: { radius: 'size' },
    Card: { padding: 'xl', shadow: 'lg' },
    Stack: { gap: 'sm' },
  },
});

defineConfig({
  ...defaults,
  components: {
    // @ts-expect-error
    Buton: { radius: 'square' },
  },
});

defineConfig({
  ...defaults,
  components: {
    // @ts-expect-error
    Card: { variant: 'solid' },
  },
});

defineConfig({
  ...defaults,
  components: {
    // @ts-expect-error
    Button: { radius: 'pill' },
  },
});

defineConfig({
  ...defaults,
  // @ts-expect-error
  radii: { ...defaults.radii, size: '1rem' },
});

defineConfig({ ...defaults, defaults: { ...defaults.defaults, radius: 'square' } });
