import { beforeEach, expect, inject, test } from 'vitest';
import { render } from 'vitest-browser-react';
import '@yarcl/react';
import config from '@yarcl/config';
import { applyTheme, resetTheme } from '@yarcl/react/css';
import type { YarclShape } from '@yarcl/react/define';

function color(value: string) {
  const probe = document.createElement('span');
  probe.style.color = value;
  document.body.append(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved;
}

function snapshot(element: HTMLElement) {
  const style = getComputedStyle(element);
  return {
    background: style.backgroundColor,
    color: style.color,
    family: style.fontFamily,
    size: style.fontSize,
    weight: style.fontWeight,
    lineHeight: style.lineHeight,
    spacing: style.letterSpacing,
    scheme: style.colorScheme,
  };
}

const theme: YarclShape = {
  ...config,
  neutrals: {
    ...config.neutrals,
    bg: { light: '#ebe7df', dark: '#18201d' },
    text: { light: '#17271f', dark: '#e7f0eb' },
  },
  typography: {
    ...config.typography,
    families: { ...config.typography.families, pageFont: 'monospace' },
    fonts: { ...config.typography.fonts, body: 'pageFont' },
    styles: {
      ...config.typography.styles,
      pageCopy: {
        family: config.typography.fonts.heading,
        size: '18px',
        weight: 600,
        lineHeight: 1.8,
        letterSpacing: '0.05em',
      },
    },
  },
  defaults: { ...config.defaults, textStyle: 'pageCopy' },
};

/** Verifies opt-in page styles and runtime theme changes with both consumer configs. */
export function testPageRoot() {
  const scheme = inject('scheme');
  beforeEach(() => {
    document.documentElement.style.colorScheme = scheme;
  });

  test('styles an app section and its plain text from custom config keys', async () => {
    const rootRef = { current: null as HTMLDivElement | null };
    const textRef = { current: null as HTMLParagraphElement | null };
    await render(
      <div className="yarcl-root" ref={rootRef}>
        <p ref={textRef}>Page text</p>
      </div>,
    );
    const style = config.typography.styles[config.defaults.textStyle];
    const base = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const size = parseFloat(style.size) * (style.size.endsWith('rem') ? base : 1);
    const result = snapshot(rootRef.current!);
    expect(result.background).toBe(color(config.neutrals.bg[scheme]));
    expect(result.color).toBe(color(config.neutrals.text[scheme]));
    expect(result.size).toBe(`${size}px`);
    expect(result.weight).toBe(String(style.weight));
    expect(parseFloat(result.lineHeight)).toBeCloseTo(size * style.lineHeight, 2);
    expect(result.scheme).toBe(scheme);
    expect(snapshot(textRef.current!).family).toBe(result.family);
    expect(snapshot(textRef.current!).lineHeight).toBe(result.lineHeight);
  });

  test('updates opted-in page styles when applying and removing a theme, leaving other sections alone', async () => {
    const rootRef = { current: null as HTMLDivElement | null };
    const plainRef = { current: null as HTMLDivElement | null };
    await render(
      <div style={{ fontFamily: 'serif', fontSize: 13, lineHeight: 1.2, color: '#123456', background: '#abcdef' }}>
        <div ref={rootRef} className="yarcl-root">
          Themed section
        </div>
        <div ref={plainRef}>Existing section</div>
      </div>,
    );
    const before = snapshot(rootRef.current!);
    const existing = snapshot(plainRef.current!);
    try {
      applyTheme(theme);
      await expect.poll(() => snapshot(rootRef.current!).family).toBe('monospace');
      const result = snapshot(rootRef.current!);
      expect(result.background).toBe(color(theme.neutrals.bg[scheme]));
      expect(result.color).toBe(color(theme.neutrals.text[scheme]));
      expect(result.size).toBe('18px');
      expect(result.weight).toBe('600');
      expect(parseFloat(result.lineHeight)).toBeCloseTo(32.4, 2);
      expect(parseFloat(result.spacing)).toBeCloseTo(0.9, 2);
      expect(snapshot(plainRef.current!)).toEqual(existing);
    } finally {
      resetTheme();
    }
    await expect.poll(() => snapshot(rootRef.current!)).toEqual(before);
    expect(snapshot(plainRef.current!)).toEqual(existing);
  });

  test('preserves an ancestor mode and supports a mode forced on the app root', async () => {
    const ref = { current: null as HTMLDivElement | null };
    await render(
      <div style={{ colorScheme: 'dark' }}>
        <div className="yarcl-root" ref={ref}>
          Dark section
        </div>
      </div>,
    );
    expect(snapshot(ref.current!).scheme).toBe('dark');
    expect(snapshot(ref.current!).background).toBe(color(config.neutrals.bg.dark));
    ref.current!.style.colorScheme = 'light';
    expect(snapshot(ref.current!).scheme).toBe('light');
    expect(snapshot(ref.current!).background).toBe(color(config.neutrals.bg.light));
  });

  test('allows author CSS to override page defaults without specificity workarounds', async () => {
    const ref = { current: null as HTMLDivElement | null };
    const style = document.createElement('style');
    style.textContent = '[data-page-override] { font-family: serif; color-scheme: dark; }';
    document.head.prepend(style);
    try {
      await render(
        <div ref={ref} className="yarcl-root" data-page-override>
          Custom page defaults
        </div>,
      );
      expect(snapshot(ref.current!).family).toBe('serif');
      expect(snapshot(ref.current!).scheme).toBe('dark');
      expect(snapshot(ref.current!).background).toBe(color(config.neutrals.bg.dark));
    } finally {
      style.remove();
    }
  });

  test('works on the body and restores existing page styles when the class is removed', () => {
    const before = snapshot(document.body);
    const originalClass = document.body.className;
    try {
      document.body.classList.add('yarcl-root');
      expect(snapshot(document.body).background).toBe(color(config.neutrals.bg[scheme]));
      expect(snapshot(document.body).color).toBe(color(config.neutrals.text[scheme]));
      applyTheme(theme);
      expect(snapshot(document.body).family).toBe('monospace');
      expect(snapshot(document.body).background).toBe(color(theme.neutrals.bg[scheme]));
      document.body.className = originalClass;
      expect(snapshot(document.body)).toEqual(before);
    } finally {
      document.body.className = originalClass;
      resetTheme();
    }
    expect(snapshot(document.body)).toEqual(before);
  });
}
