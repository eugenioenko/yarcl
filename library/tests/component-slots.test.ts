import { describe, expect, it } from 'vitest';
import { generateCss, generateTokensCss } from '../src/css';
import { componentSlots, type YarclShape } from '../src/define';
import defaults from '../src/yarcl.config';
import brandA from '../../consumer/src/yarcl.config';
import brandB from '../../e2e/consumer/src/yarcl.config';
import { themes } from '../src/themes';

const configs: YarclShape[] = [defaults, brandA, brandB];

describe('component slot generation', () => {
  it.each(configs)('resolves part styles exclusively through this config’s token groups', (config) => {
    const radius = Object.keys(config.radii)[0];
    const padding = Object.keys(config.spacing)[0];
    const shadow = Object.keys(config.shadows)[0];
    const density = Object.keys(config.density)[0];
    const textStyle = Object.keys(config.typography.styles)[0];
    const theme: YarclShape = { ...config, components: {
      Card: { slots: { root: { radius, padding, shadow, border: 'double', borderWidth: 'width' } } },
      Table: { slots: { cell: { density, textStyle } } },
    } };
    const css = generateCss(theme).split('@layer yarcl.recipes {')[1];
    expect(css).toContain(`border-radius: var(--yarcl-radius-${radius})`);
    expect(css).toContain(`padding: var(--yarcl-space-${padding})`);
    expect(css).toContain(`box-shadow: var(--yarcl-shadow-${shadow})`);
    expect(css).toContain('border: var(--yarcl-border-width) double var(--yarcl-neutral-border)');
    expect(css).toContain('border-width: var(--yarcl-border-width)');
    expect(css).toContain(`--yarcl-cell-py: var(--yarcl-density-${density}-padding-y)`);
    expect(css).toContain(`--yarcl-cell-px: var(--yarcl-density-${density}-padding-x)`);
    expect(css).toContain(`font-family: var(--yarcl-text-${textStyle}-family)`);
    expect(css).toContain(`letter-spacing: var(--yarcl-text-${textStyle}-letter-spacing)`);
    expect(generateTokensCss(theme)).not.toContain('yarcl-slot-');
  });

  it('emits supported parts for every component without styles for absent settings', () => {
    const components = Object.fromEntries(Object.entries(componentSlots).map(([component, parts]) => [
      component, { slots: Object.fromEntries(Object.keys(parts).map((part) => [part, { background: 'none' }])) },
    ])) as YarclShape['components'];
    const css = generateCss({ ...defaults, components });
    for (const [component, parts] of Object.entries(componentSlots)) {
      for (const part of Object.keys(parts)) expect(css).toContain(`.yarcl-slot-${component}-${part}`);
    }
    expect(css).toContain('background: transparent');
    expect(generateCss({ ...defaults, components: {} })).not.toContain('yarcl-slot-');
  });

  it('keeps text style, padding and border width priority independent of object order', () => {
    const ordered = { density: 'compact', padding: 'md', textStyle: 'label', border: 'double', borderWidth: 'width' } as const;
    const reverse = { borderWidth: 'width', border: 'double', textStyle: 'label', padding: 'md', density: 'compact' } as const;
    const css = (cell: typeof ordered) => generateCss({ ...defaults, components: { Table: { slots: { cell, header: { textStyle: 'caption' } } } } });
    expect(css(ordered)).toBe(css(reverse));
    const rules = css(ordered).split('@layer yarcl.recipes {')[1];
    expect(rules.indexOf('var(--yarcl-density-compact-padding-y)')).toBeLessThan(rules.indexOf('var(--yarcl-space-md)'));
    expect(rules.indexOf('var(--yarcl-text-label-size)')).toBeGreaterThan(rules.indexOf('var(--yarcl-density-compact-font-size)'));
    expect(rules.indexOf('var(--yarcl-text-caption-size)')).toBeGreaterThan(rules.indexOf('var(--yarcl-text-label-size)'));
  });

  it.each(Object.values(themes))('generates every bundled theme including its configured slots', (theme) => {
    expect(() => generateCss(theme)).not.toThrow();
  });

  it.each([
    { Button: { slots: { root: { radius: 'md' } } } },
    { Table: { slots: { missing: { padding: 'md' } } } },
    { Table: { slots: { row: { radius: 'md' } } } },
    { Card: { slots: { root: { radius: 'missing' } } } },
    { Card: { slots: { root: { shadow: 'missing' } } } },
    { Dialog: { slots: { body: { padding: 'missing' } } } },
    { Table: { slots: { header: { textStyle: 'missing' } } } },
    { Table: { slots: { cell: { density: 'missing' } } } },
    { Menu: { slots: { panel: { borderWidth: 'missing' } } } },
    { Menu: { slots: { panel: { border: 'red' } } } },
    { Listbox: { slots: { item: { background: '#fff' } } } },
    { Listbox: { slots: { item: { background: 'constructor' } } } },
  ])('rejects invalid slot data delivered outside TypeScript', (components) => {
    expect(() => generateCss({ ...defaults, components } as unknown as YarclShape)).toThrow(/yarcl:/);
  });

  it('escapes punctuation in token references', () => {
    const css = generateCss({ ...defaults, radii: { 'round.edge': '4px' }, components: { Card: { slots: { root: { radius: 'round.edge' } } } } });
    expect(css).toContain('border-radius: var(--yarcl-radius-round\\.edge)');
  });
});
