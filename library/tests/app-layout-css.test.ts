import { describe, expect, it } from 'vitest';
import { generateCss, generateTokensCss } from '../src/css';
import defaults from '../src/yarcl.config';

describe('application layout widths', () => {
  it('emits a modifier referencing each width variable', () => {
    const css = generateCss(defaults);
    for (const key of Object.keys(defaults.widths)) {
      expect(css).toContain(`.yarcl-app-width-${key} {\n  --yarcl-app-width: var(--yarcl-width-${key});`);
    }
  });

  it('keeps layout modifier classes out of token-only stylesheets', () => {
    const css = generateTokensCss(defaults);
    expect(css).toContain('--yarcl-width-sidebar: 15rem;');
    expect(css).not.toContain('.yarcl-app-width-');
  });

  it('escapes punctuation consistently in width modifiers and variables', () => {
    const css = generateCss({ ...defaults, widths: { 'nav.panel': '17rem' } });
    expect(css).toContain('.yarcl-app-width-nav\\.panel');
    expect(css).toContain('--yarcl-app-width: var(--yarcl-width-nav\\.panel);');
  });
});
