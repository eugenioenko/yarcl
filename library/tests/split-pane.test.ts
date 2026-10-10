import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { expect, test } from 'vitest';
import { SplitPane, type SplitPaneProps } from '../src/components/SplitPane';

const props = { primaryLabel: 'Files', primary: 'Files', secondary: 'Document' };
const html = (overrides: Partial<SplitPaneProps> = {}) => renderToString(createElement(SplitPane, { ...props, ...overrides }));

test('server renders a named focusable separator with the primary pane relationship', () => {
  const rendered = html({ defaultValue: 35 });
  expect(rendered).toContain('role="separator"'); expect(rendered).toContain('aria-valuenow="35"'); expect(rendered).toContain('aria-controls=');
  expect(rendered).toContain('--yarcl-split-primary:35fr'); expect(rendered).not.toContain('undefined');
});
test('out-of-range values clamp and zero-size pane content remains mounted but hidden', () => {
  expect(html({ value: -20 })).toContain('aria-valuenow="10"');
  expect(html({ value: 0, min: 0 })).toContain('hidden=""'); expect(html({ value: 0, min: 0 })).toContain('>Files</div>');
});
test.each([{ min: -1 }, { max: 101 }, { min: 50, max: 50 }, { min: NaN }, { value: Infinity }, { step: 0 }, { largeStep: -1 }])('invalid numeric inputs fail loudly: %j', (overrides) => {
  expect(() => html(overrides)).toThrow('yarcl: SplitPane');
});
