import { defineConfig, defineRecipes } from '@yarcl/react/define';
import defaults from '@yarcl/react/defaults';

const variants = {
  filled: { background: 'fill', border: 'color', text: 'on' },
  line: { background: 'none', border: 'color', text: 'color' },
  wash: { background: 'tint', border: 'none', text: 'color' },
  text: { background: 'none', border: 'none', text: 'color' },
} as const;

export default defineConfig({
  labels: { ...defaults.labels, notifications: 'Avisos del proyecto' },
  colors: {
    ink: { light: '#1c1917', dark: '#f5f5f4' },
    clay: { light: '#a4441f', dark: '#f0a07a' },
    moss: { light: '#3f6212', dark: '#a3e635' },
    alert: { light: '#b91c1c', dark: '#fca5a5' },
  },
  neutrals: {
    bg: { light: '#faf7f2', dark: '#14110f' },
    surface: { light: '#fffdf9', dark: '#1c1917' },
    text: { light: '#1c1917', dark: '#ede8e3' },
    muted: { light: '#6f6660', dark: '#a8a29e' },
    border: { light: '#e2d9cc', dark: '#3a332e' },
  },
  sizes: {
    'talla-s': { height: '2.25rem', paddingX: '0.875rem', fontSize: '0.75rem', iconSize: '0.875rem' },
    'talla-m': { height: '2.75rem', paddingX: '1.25rem', fontSize: '0.8125rem', iconSize: '1rem' },
    'talla-l': { height: '3.25rem', paddingX: '1.75rem', fontSize: '0.875rem', iconSize: '1.125rem' },
  },
  radii: {
    square: '0',
    hairline: '2px',
  },
  variants,
  spacing: {
    '1': '0.25rem',
    '2': '0.5rem',
    '3': '0.75rem',
    '4': '1rem',
    '6': '1.5rem',
    '8': '2rem',
    '12': '3rem',
  },
  shadows: {
    lifted: '0 2px 0 light-dark(rgb(28 25 23 / 0.08), rgb(0 0 0 / 0.6))',
    float: '0 16px 40px -12px light-dark(rgb(28 25 23 / 0.25), rgb(0 0 0 / 0.8))',
  },
  density: {
    compact: { paddingX: '0.5rem', paddingY: '0.25rem', fontSize: '0.75rem' },
    cozy: { paddingX: '1rem', paddingY: '0.75rem', fontSize: '0.8125rem' },
  },
  modalSizes: {
    narrow: '22rem',
    regular: '34rem',
    wide: '52rem',
  },
  widths: { sidebar: '14rem', reading: '40rem', page: '68rem' },
  breakpoints: { xs: '28rem', sm: '38rem', md: '46rem', lg: '62rem', xl: '78rem' },
  typography: {
    fontFaces: [{ family: 'Fraunces', src: '/fonts/fraunces.woff2', weight: '100 900' }],
    families: {
      serif: 'Fraunces, Georgia, "Times New Roman", serif',
      sans: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    fonts: { body: 'sans', heading: 'serif', mono: 'sans' },
    styles: {
      headline: { family: 'serif', size: '2.75rem', weight: 500, lineHeight: 1.05, letterSpacing: '-0.02em' },
      title: { family: 'serif', size: '1.5rem', weight: 500, lineHeight: 1.2 },
      price: { family: 'serif', size: '1.375rem', weight: 600, lineHeight: 1.2 },
      lead: { family: 'sans', size: '1.0625rem', weight: 400, lineHeight: 1.6 },
      copy: { family: 'sans', size: '0.9375rem', weight: 400, lineHeight: 1.6 },
      label: { family: 'sans', size: '0.6875rem', weight: 700, lineHeight: 1.4, letterSpacing: '0.12em' },
      fine: { family: 'sans', size: '0.75rem', weight: 400, lineHeight: 1.5 },
    },
    headings: { h1: 'headline', h2: 'title', h3: 'title', h4: 'label', h5: 'label', h6: 'label' },
    prose: { body: 'copy', code: 'fine', blockGap: '3', headingGap: '6', listIndent: '6' },
  },
  zIndex: defaults.zIndex,
  motion: { ...defaults.motion, fast: '160ms', easing: 'cubic-bezier(0.3, 0, 0, 1)' },
  timing: defaults.timing,
  borders: { width: '1px' },
  focusRing: { width: '2px', offset: '3px', color: 'clay' },
  components: {
    NavSection: { gap: "2", textStyle: "label" },
    Card: { slots: { body: { padding: '2' } } },
    Table: { slots: { header: { background: 'tint', textStyle: 'label' } } },
    SplitButton: { size: 'talla-s', radius: 'square', color: 'clay', variant: 'wash', allowedSizes: ['talla-s', 'talla-l'], sizeOverrides: { 'talla-s': { paddingX: '1.125rem', iconSize: '1.125rem' } } },
    Grid: { gap: '4' },
    Avatar: { size: 'talla-s', radius: 'hairline', color: 'clay', variant: 'wash' },
    AvatarGroup: { size: 'talla-s', radius: 'square', color: 'moss', variant: 'wash' },
    EmptyState: { color: 'clay', gap: '3', padding: '6', textStyle: 'fine' },
    Alert: { gap: '2', padding: '4', textStyle: 'copy' },
    Badge: { variant: 'marker', variants: { wash: variants.wash, line: variants.line, marker: variants.wash } },
    Button: {
      variant: 'action', variants: { ...variants, action: variants.filled },
      size: 'talla-s',
      radius: 'square',
      allowedSizes: ['talla-s', 'talla-l'],
      sizeOverrides: { 'talla-l': { paddingX: '2rem' } },
    },
    IconButton: { radius: 'square' },
    ToggleGroup: { radius: 'square' },
    Pagination: { size: 'talla-s', radius: 'square', variant: 'text', selectedVariant: 'line' },
    DatePicker: { radius: 'square' },
    Drawer: { size: 'narrow' },
    Label: { color: 'clay' },
    Progress: { color: 'moss' },
    CommandPalette: { radius: 'square', color: 'clay' },
    Breadcrumb: { textStyle: 'fine' },
    Accordion: { size: 'talla-s', radius: 'square' },
    NumberInput: { radius: 'square' },
    Tooltip: { radius: 'hairline', padding: '2', textStyle: 'fine' },
    Toast: { radius: 'hairline', gap: '2', padding: '4', textStyle: 'copy' },
  },
  defaults: {
    size: 'talla-m',
    radius: 'hairline',
    color: 'ink',
    variant: 'filled',
    errorColor: 'alert',
    textStyle: 'copy',
    labelStyle: 'label',
    helperStyle: 'fine',
    gap: '3',
    padding: '6',
    floatingShadow: 'float',
    density: 'cozy',
    softVariant: 'wash',
    modalSize: 'regular',
  },
}, (yarcl) => ({
  recipes: defineRecipes({
    Action: {
      slots: { root: { borderRadius: yarcl.radii.hairline } },
      variants: {
        emphasis: {
          subtle: { root: { opacity: 0.8 } },
          strong: { root: { fontWeight: 700 } },
        },
      },
      defaults: { emphasis: 'subtle' },
    },
    OrderStatus: {
      slots: {
        root: {
          display: 'inline-flex', alignItems: 'center',
          gap: yarcl.spacing['2'], padding: yarcl.spacing['2'],
          borderRadius: yarcl.radii.hairline, backgroundColor: yarcl.neutrals.surface,
          color: yarcl.neutrals.text, width: 'var(--status-width, auto)',
        },
        icon: { color: yarcl.colors.moss },
        label: { fontWeight: 500 },
      },
      variants: {
        status: {
          pending: { icon: { opacity: 0.5 } },
          paid: { icon: { opacity: 1 } },
        },
        emphasis: {
          subtle: { root: { borderStyle: 'solid', borderWidth: yarcl.borders.width, borderColor: yarcl.neutrals.border } },
          strong: { label: { fontWeight: 700 } },
        },
      },
      defaults: { status: 'pending', emphasis: 'subtle' },
      compounds: [{ when: { status: 'paid', emphasis: 'strong' }, slots: { label: { textDecoration: 'underline' } } }],
    },
  }),
}));
