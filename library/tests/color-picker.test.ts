import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { expect, test } from 'vitest';
import { ColorPicker, type ColorPickerValue } from '../src/components/ColorPicker';

test('server renders normalized color, a labelled chooser and one accepted form value', () => {
  const html = renderToString(createElement(ColorPicker, { defaultValue: '#AbC', name: 'accent', 'aria-label': 'Accent' }));
  expect(html.match(/value="#aabbcc"/g)).toHaveLength(3);
  expect(html.match(/name="accent"/g)).toHaveLength(1);
  expect(html).toContain('aria-label="Accent Choose color"'); expect(html).not.toContain('style=');
});

test('read-only rendering keeps text readable and locks the chooser and presets', () => {
  const html = renderToString(createElement(ColorPicker, { value: '#fff', readOnly: true, 'aria-label': 'Accent', presets: [{ value: '#fff', label: 'White' }] }));
  expect(html).toContain('readOnly=""'); expect(html).toContain('aria-pressed="true"'); expect(html.match(/disabled=""/g)).toHaveLength(2);
});

test.each(['#12', '#12345g', '#12345678', 'red', 'var(--accent)'])('invalid color %s fails loudly instead of falling back to black', (value) => {
  expect(() => renderToString(createElement(ColorPicker, { value: value as ColorPickerValue, 'aria-label': 'Accent' }))).toThrow('opaque hex color');
});

test('invalid preset colors fail loudly', () => {
  expect(() => renderToString(createElement(ColorPicker, { defaultValue: '#123', presets: [{ value: '#xyz', label: 'Invalid' }], 'aria-label': 'Accent' }))).toThrow('opaque hex color');
});
