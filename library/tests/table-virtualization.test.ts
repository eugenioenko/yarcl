import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { Table, type TableVirtualBodyProps } from '../src/components/Table';

const items = [{ id: 'first' }, { id: 'second' }];
const getItemKey = (item: (typeof items)[number]) => item.id;
const children = (item: (typeof items)[number]) => createElement(Table.Row, {}, createElement(Table.Cell, {}, item.id));
const render = (props: Record<string, unknown>) =>
  renderToStaticMarkup(
    createElement(
      Table,
      { caption: 'Items' },
      createElement(
        Table.VirtualBody<(typeof items)[number]>,
        props as unknown as TableVirtualBodyProps<(typeof items)[number]>,
      ),
    ),
  );

test.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
  'rejects invalid fixed and estimated heights (%s)',
  (height) => {
    expect(() => render({ items, children, rowHeight: height })).toThrow(/positive/);
    expect(() => render({ items, children, getItemKey, estimateRowHeight: height })).toThrow(/positive/);
  },
);

test.each([-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY])('rejects invalid overscan (%s)', (overscan) => {
  expect(() => render({ items, children, getItemKey, estimateRowHeight: 40, overscan })).toThrow(/overscan/);
});

test('rejects ambiguous height modes, missing stable keys and duplicate keys', () => {
  expect(() => render({ items, children, getItemKey, estimateRowHeight: 40, rowHeight: 40 })).toThrow(/either/);
  expect(() => render({ items, children, estimateRowHeight: 40 })).toThrow(/getItemKey/);
  expect(() => render({ items, children, getItemKey: () => 'duplicate', estimateRowHeight: 40 })).toThrow(/unique/);
});

test('requires a row element in measured mode and preserves flexible children in fixed mode', () => {
  const base = { items, getItemKey, estimateRowHeight: 40 };
  expect(() => render({ ...base, children: () => 'text' })).toThrow(/one Table.Row/);
  expect(() => render({ ...base, children: () => createElement('div') })).toThrow(/one Table.Row/);
  expect(() => render({ ...base, children: () => createElement(Fragment, {}, children(items[0])) })).toThrow(
    /one Table.Row/,
  );
  expect(
    render({
      items,
      rowHeight: 40,
      children: (item: (typeof items)[number]) => createElement(Fragment, {}, children(item)),
    }),
  ).toContain('first');
});

test('server-renders both modes and an empty measured body without browser APIs', () => {
  expect(render({ items, children, getItemKey, estimateRowHeight: 40 })).toContain('data-yarcl-row-index="1"');
  expect(render({ items, children, rowHeight: 40 })).toContain('second');
  expect(render({ items: [], children, getItemKey, estimateRowHeight: 40 })).not.toContain('virtual-spacer');
});
