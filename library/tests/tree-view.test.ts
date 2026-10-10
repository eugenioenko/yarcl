import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { expect, test } from 'vitest';
import { TreeView } from '../src/components/TreeView';

const items = [{ id: 'folder', label: 'Folder', children: [{ id: 'leaf', label: 'File' }] }];

test('server renders nested roles, labels, expansion and selection without inline tokens', () => {
  const html = renderToString(createElement(TreeView, { 'aria-label': 'Files', items, defaultExpanded: ['folder'], defaultValue: 'leaf' }));
  expect(html).toContain('role="tree"');
  expect(html).toContain('role="group"');
  expect(html).toContain('aria-expanded="true"');
  expect(html).toContain('aria-selected="true"');
  expect(html).toContain('aria-level="2"');
  expect(html).not.toContain('style=');
  expect(html).not.toContain('hidden=""');
});

test('collapsed children remain present and hidden in server markup', () => {
  const html = renderToString(createElement(TreeView, { 'aria-label': 'Files', items }));
  expect(html).toContain('hidden=""');
  expect(html).toContain('>File</span>');
  expect(html.match(/tabindex="0"/g)).toHaveLength(1);
});

test('duplicate identifiers across branches fail loudly', () => {
  expect(() => renderToString(createElement(TreeView, { 'aria-label': 'Files', items: [...items, { id: 'leaf', label: 'Duplicate' }] }))).toThrow('item id "leaf" must be unique');
});
