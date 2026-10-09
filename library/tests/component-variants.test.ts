import { afterEach, describe, expect, it } from 'vitest';
import { defineConfig, type VariantComponentName } from '../src/define';
import defaults from '../src/yarcl.config';
import { generateCss, generateTokensCss } from '../src/css';
import { softVariantClass, variantClass } from '../src/classes';
import { setActiveConfig } from '../src/runtime';

const fill = { background: 'fill', border: 'color', text: 'on' } as const;
const plain = { background: 'none', border: 'none', text: 'neutral' } as const;
const config = defineConfig({
  ...defaults,
  components: {
    Button: { variants: { action: fill, 'custom.name': plain }, variant: 'action' },
    Badge: { variants: { status: plain }, variant: 'status' },
  },
});

const components: VariantComponentName[] = [
  'Button',
  'IconButton',
  'SplitButton',
  'ToggleGroup',
  'Badge',
  'Avatar',
  'AvatarGroup',
  'Alert',
  'DatePicker',
  'Pagination',
  'Label',
];

afterEach(() => setActiveConfig(null));

describe('component variants', () => {
  it('emits exactly one class per local key, retaining the shared group', () => {
    const css = generateCss(config);
    for (const selector of [
      '.yarcl-Button-variant-action',
      '.yarcl-Button-variant-custom\\.name',
      '.yarcl-Badge-variant-status',
      '.yarcl-variant-solid',
    ]) {
      expect(css.split(`${selector} {`)).toHaveLength(2);
    }
    expect(css).toContain('.yarcl-Badge-variant-status {\n  --yarcl-v-bg: transparent;');
    expect(css).not.toContain('.yarcl-Button-variant-status');
    expect(css).not.toContain('.yarcl-Badge-variant-action');
    expect(generateTokensCss(config)).not.toContain('-variant-');
  });

  it('keeps scoped classes disjoint from arbitrary shared key names', () => {
    const css = generateCss({ ...config, variants: { ...config.variants, 'Button-action': plain } });
    expect(css).toContain('.yarcl-variant-Button-action {\n  --yarcl-v-bg: transparent;');
    expect(css).toContain('.yarcl-Button-variant-action {\n  --yarcl-v-bg: var(--yarcl-c);');
  });

  it('resolves local defaults and shared primary or soft fallbacks', () => {
    setActiveConfig(config);
    expect(variantClass(undefined, 'Button')).toBe('yarcl-Button-variant-action');
    expect(softVariantClass(undefined, 'Badge')).toBe('yarcl-Badge-variant-status');
    expect(variantClass('custom.name', 'Button')).toBe('yarcl-Button-variant-custom.name');
    expect(variantClass(undefined, 'IconButton')).toBe(`yarcl-variant-${defaults.defaults.variant}`);
    expect(softVariantClass(undefined, 'Alert')).toBe(`yarcl-variant-${defaults.defaults.softVariant}`);
    expect(variantClass('outline')).toBe('yarcl-variant-outline');
  });

  it.each(components)('supports a local map for %s without altering another component', (component) => {
    const theme = { ...defaults, components: { [component]: { variant: 'custom', variants: { custom: fill } } } };
    const css = generateCss(theme);
    expect(css).toContain(`.yarcl-${component}-variant-custom {`);
    setActiveConfig(theme);
    expect(variantClass(undefined, component)).toBe(`yarcl-${component}-variant-custom`);
    expect(softVariantClass(undefined, component)).toBe(`yarcl-${component}-variant-custom`);
    const other = component === 'Button' ? 'Badge' : 'Button';
    expect(variantClass(undefined, other)).toBe(`yarcl-variant-${defaults.defaults.variant}`);
  });
});
