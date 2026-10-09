import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { generateCss, generateTokensCss } from '../src/css';
import defaults from '../src/yarcl.config';
import { Spinner } from '../src/components/Spinner';
import { themes } from '../src/themes';

const labels = defaults.labels;

describe('config labels', () => {
  it('formats names, page counts and progress values without changing input data', () => {
    expect(labels.removeItem('résumé.txt')).toBe('Remove résumé.txt');
    expect(labels.previewImage('résumé.txt')).toBe('Preview of résumé.txt');
    expect(labels.avatarOverflow(3)).toBe('3 more');
    expect(labels.page(2)).toBe('Page 2');
    expect(labels.pageSummary(2, 9)).toBe('Page 2 of 9');
    expect(labels.progressValue(3, 8)).toBe('38%');
  });

  it('keeps translation copy and formatters out of generated CSS', () => {
    const formatter = vi.fn(() => {
      throw new Error('CSS generation must not format UI copy');
    });
    const theme = { ...defaults, labels: { ...labels, loading: 'Cargando', page: formatter } };
    expect(generateCss(theme)).toBe(generateCss(defaults));
    expect(generateTokensCss(theme)).toBe(generateTokensCss(defaults));
    expect(formatter).not.toHaveBeenCalled();
  });

  it('server-renders build-time labels and preserves instance overrides including empty labels', () => {
    expect(renderToStaticMarkup(createElement(Spinner))).toContain('aria-label="Loading"');
    expect(renderToStaticMarkup(createElement(Spinner, { label: 'Chargement' }))).toContain('aria-label="Chargement"');
    expect(renderToStaticMarkup(createElement(Spinner, { label: '' }))).toContain('aria-label=""');
  });

  it.each(Object.entries(themes))('keeps the complete default label catalog in the %s theme', (_name, theme) => {
    expect(Object.keys(theme.labels)).toEqual(Object.keys(labels));
    expect(theme.labels.pageSummary(2, 3)).toBe('Page 2 of 3');
    expect(theme.labels.removeItem('file.txt')).toBe('Remove file.txt');
  });
});
