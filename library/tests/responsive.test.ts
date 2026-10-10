import { afterEach, describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { generateCss, generateTokensCss } from '../src/css';
import { gapClass, alignClass, wrapClass } from '../src/classes';
import { setActiveConfig } from '../src/runtime';
import { Grid } from '../src/components/Grid';
import { Stack } from '../src/components/Stack';
import defaults from '../src/yarcl.config';
import brandA from '../../consumer/src/yarcl.config';
import brandB from '../../e2e/consumer/src/yarcl.config';

afterEach(() => setActiveConfig(null));

describe('responsive CSS', () => {
  it.each([defaults, brandA, brandB])('uses every configured breakpoint and spacing token', (config) => {
    const css = generateCss(config);
    for (const [breakpoint, width] of Object.entries(config.breakpoints)) {
      expect(css).toContain(`@media (min-width: ${width})`);
      for (const token of Object.keys(config.spacing)) {
        expect(css).toContain(`.yarcl-responsive-gap-${token}\\@${breakpoint}`);
        expect(css).toContain(`.yarcl-responsive-padding-${token}\\@${breakpoint}`);
      }
    }
  });

  it('keeps breakpoint declaration order with mixed CSS units', () => {
    const css = generateCss({ ...defaults, breakpoints: { phone: '400px', tablet: '45rem', desktop: '70em' } });
    expect(css.indexOf('@media (min-width: 400px)')).toBeLessThan(css.indexOf('@media (min-width: 45rem)'));
    expect(css.indexOf('@media (min-width: 45rem)')).toBeLessThan(css.indexOf('@media (min-width: 70em)'));
    expect(css).toContain('var(--yarcl-grid-columns-desktop, var(--yarcl-grid-columns-tablet, var(--yarcl-grid-columns-phone, var(--yarcl-grid-columns-base))))');
  });

  it('escapes punctuation without colliding with scalar token names', () => {
    const config = { ...defaults, spacing: { ...defaults.spacing, 'space.small': '0.25rem', 'sm@lg': '3rem' } };
    const css = generateCss(config);
    expect(css).toContain('.yarcl-responsive-gap-space\\.small\\@lg');
    expect(css).toContain('--yarcl-component-gap: var(--yarcl-space-space\\.small)');
    expect(css).toContain('.yarcl-gap-sm\\@lg');
    expect(css).toContain('.yarcl-responsive-gap-sm\\@lg');
  });

  it('puts layout overrides in the component layer and beats scalar modifiers', () => {
    const css = generateCss(defaults);
    const layer = css.slice(css.indexOf('@layer yarcl.base {'));
    expect(layer).toContain('.yarcl-responsive-align-end\\@lg.yarcl-responsive-align-end\\@lg {\n  align-items: flex-end;');
    expect(layer).toContain('justify-content: space-between;');
    expect(layer).toContain('flex-wrap: nowrap;');
    expect(layer).toContain('flex-wrap: wrap;');
  });

  it('does not add responsive classes to token-only output', () => {
    const css = generateTokensCss(defaults);
    expect(css).not.toContain('yarcl-responsive');
    expect(css).not.toContain('yarcl-grid');
    expect(css).not.toContain('@media');
  });

  it.each([generateCss, generateTokensCss])('rejects the reserved base breakpoint at runtime', (generate) => {
    expect(() => generate({ ...defaults, breakpoints: { base: '0px' } })).toThrow('"base" is reserved');
  });
});

describe('responsive rendering', () => {
  it('preserves scalar classes and treats false as a real base value', () => {
    expect(gapClass('sm')).toBe('yarcl-gap-sm');
    expect(wrapClass(true)).toBeUndefined();
    expect(wrapClass({ base: false, lg: true })).toBe('yarcl-inline-nowrap yarcl-responsive-wrap-true@lg');
    expect(alignClass({ lg: 'end' }, 'center')).toBe('yarcl-align-center yarcl-responsive-align-end@lg');
  });

  it('uses component fallbacks for empty maps and missing base values', () => {
    expect(gapClass({}, 'lg')).toBe('yarcl-gap-lg');
    expect(gapClass({ lg: 'xl' }, 'sm')).toBe('yarcl-gap-sm yarcl-responsive-gap-xl@lg');
    expect(gapClass({ base: undefined, lg: undefined }, 'sm')).toBe('yarcl-gap-sm');
  });

  it('validates responsive breakpoint names for JavaScript callers', () => {
    expect(() => gapClass({ unknown: 'sm' } as never)).toThrow('unknown responsive breakpoint "unknown"');
    expect(() => renderToString(createElement(Grid, { columns: { unknown: 3 } as never }))).toThrow('unknown responsive breakpoint');
  });

  it('validates names against the active config instead of library defaults', () => {
    setActiveConfig({ ...defaults, breakpoints: { compact: '32rem' } });
    expect(gapClass({ compact: 'sm' } as never)).toContain('yarcl-responsive-gap-sm@compact');
    expect(() => gapClass({ lg: 'sm' })).toThrow('unknown responsive breakpoint "lg"');
  });

  it('server renders spacing as classes and preserves native attributes', () => {
    const html = renderToString(createElement(Stack, { gap: { base: 'sm', lg: 'lg' }, as: 'section', id: 'projects', 'aria-label': 'Projects' }));
    expect(html).toContain('<section');
    expect(html).toContain('yarcl-gap-sm yarcl-responsive-gap-lg@lg');
    expect(html).toContain('aria-label="Projects"');
    expect(html).not.toContain('style=');
    expect(html).not.toContain('[object Object]');
  });

  it('server renders responsive raw column tracks and normalizes numeric counts', () => {
    const html = renderToString(createElement(Grid, { columns: { base: 2.9, md: 0, lg: '12rem minmax(0, 1fr)' } }));
    expect(html).toContain('yarcl-grid-responsive');
    expect(html).toContain('--yarcl-grid-columns-base:repeat(2, minmax(0, 1fr))');
    expect(html).toContain('--yarcl-grid-columns-md:repeat(1, minmax(0, 1fr))');
    expect(html).toContain('--yarcl-grid-columns-lg:12rem minmax(0, 1fr)');
  });

  it('keeps auto-fit precedence and caller style overrides', () => {
    const html = renderToString(createElement(Grid, { columns: { lg: 4 }, minItemWidth: '14rem', style: { gridTemplateColumns: '1fr 1fr' } }));
    expect(html).toContain('repeat(auto-fit, minmax(min(100%, 14rem), 1fr))');
    expect(html).toContain('grid-template-columns:1fr 1fr');
    expect(html).not.toContain('yarcl-grid-responsive');
    expect(html).not.toContain('--yarcl-grid-columns-lg');
  });
});
