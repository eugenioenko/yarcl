import { describe, expect, it } from 'vitest';
import { contrast, parseHex } from '../src/color';
import { generateCss } from '../src/css';
import { cyberpunk, vermeer, artDeco, circuit, studio, themeNames, themes } from '../src/themes';
import defaults from '../src/yarcl.config';

const additions = { cyberpunk, vermeer, artDeco, circuit, studio };
const modes = ['light', 'dark'] as const;

describe('bundled themes', () => {
  it.each(Object.entries(themes))('%s retains the default token and typography contracts', (id, theme) => {
    expect(themeNames[id as keyof typeof themes]).toBeTruthy();
    for (const group of ['colors', 'neutrals', 'sizes', 'radii', 'variants', 'spacing', 'shadows', 'density', 'modalSizes', 'widths', 'breakpoints'] as const) {
      expect(Object.keys(theme[group])).toEqual(expect.arrayContaining(Object.keys(defaults[group])));
    }
    expect(Object.keys(theme.typography.styles)).toEqual(expect.arrayContaining(Object.keys(defaults.typography.styles)));
    for (const family of Object.values(theme.typography.fonts)) expect(theme.typography.families).toHaveProperty(family);
    for (const style of Object.values(theme.typography.styles)) expect(theme.typography.families).toHaveProperty(style.family);
    expect(theme.components.Stepper.radius).toBe('rounded');
    expect(() => generateCss(theme)).not.toThrow();
  });

  it.each(Object.entries(additions))('%s generates both schemes without contrast warnings', (_id, theme) => {
    const warnings: string[] = [];
    const css = generateCss(theme, (warning) => warnings.push(warning));
    expect(warnings).toEqual([]);
    for (const mode of modes) {
      for (const token of Object.values(theme.colors)) expect(css).toContain(token[mode]);
      const backgrounds = [theme.neutrals.bg[mode], theme.neutrals.surface[mode]];
      for (const background of backgrounds) {
        for (const text of [theme.neutrals.text[mode], theme.neutrals.muted[mode]]) {
          expect(contrast(parseHex(text)!, parseHex(background)!)).toBeGreaterThanOrEqual(4.5);
        }
        expect(contrast(parseHex(theme.colors[theme.focusRing.color][mode])!, parseHex(background)!)).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('gives the new themes different type, shape and density alongside their palettes', () => {
    expect(vermeer.typography.fonts.body).toBe('serif');
    expect(cyberpunk.typography.fonts.body).toBe('mono');
    expect(artDeco.components.Card.slots.root.border).toBe('double');
    expect(themes).not.toHaveProperty('atelier');
    expect(circuit.typography.styles.label.family).toBe('mono');
    expect(studio.typography.styles.display.weight).toBe(900);
    expect(new Set(Object.values({ cyberpunk, vermeer, artDeco }).map((theme) => theme.sizes.md.height)).size).toBe(3);
    expect(new Set(Object.values({ cyberpunk, vermeer, artDeco }).map((theme) => theme.radii.lg)).size).toBe(3);
    expect(new Set(Object.values({ cyberpunk, vermeer, artDeco }).map((theme) => theme.shadows.sm)).size).toBe(3);
  });
});
