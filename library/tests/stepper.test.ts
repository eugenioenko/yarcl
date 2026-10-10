import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { expect, test } from 'vitest';
import { Stepper } from '../src/components/Stepper';

const items = [{ id: 'details', label: 'Details', completed: true }, { id: 'payment', label: 'Payment' }];
test('server renders named ordered progress, current state and localized completion without inline tokens', () => {
  const html = renderToString(createElement(Stepper, { 'aria-label': 'Checkout', items, defaultValue: 'payment' }));
  expect(html).toContain('<ol'); expect(html).toContain('role="list"'); expect(html).toContain('aria-current="step"'); expect(html).toContain('Completed'); expect(html).not.toContain('style='); expect(html.match(/tabindex="0"/g)).toHaveLength(1);
});
test('static progress renders no buttons and has only one current stage', () => {
  const html = renderToString(createElement(Stepper, { 'aria-label': 'Checkout', items, value: 'payment', readOnly: true }));
  expect(html).not.toContain('<button'); expect(html.match(/aria-current="step"/g)).toHaveLength(1);
});
test('duplicate stage IDs fail loudly', () => {
  expect(() => renderToString(createElement(Stepper, { 'aria-label': 'Checkout', items: [...items, { id: 'details', label: 'Duplicate' }] }))).toThrow('item id "details" must be unique');
});
