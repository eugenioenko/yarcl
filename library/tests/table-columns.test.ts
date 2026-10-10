import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { useTableColumns, type TableColumnDefinition, type TableColumnOptions } from '../src/table-columns';
import { Table } from '../src/components/Table';
import type { TableColumnResizerProps } from '../src/components/TableColumns';

const definitions = [{ id: 'name', label: 'Name', width: 220, resizable: true, minWidth: 100, maxWidth: 480 }, { id: 'total', label: 'Total', width: 140 }] as const;
function Model({ columns = definitions, options }: { columns?: readonly TableColumnDefinition[]; options?: TableColumnOptions }) {
  const model = useTableColumns(columns, options);
  return createElement(Table, { caption: 'Orders', style: model.tableStyle }, createElement(Table.Columns, { columns: model.visibleColumns }));
}
const render = (columns: readonly TableColumnDefinition[], options?: TableColumnOptions) => renderToStaticMarkup(createElement(Model, { columns, options }));

test('server renders accepted widths, visible columns and a fixed layout', () => {
  const html = render(definitions, { widths: { name: 300 }, visibility: { total: false } });
  expect(html).toContain('table-layout:fixed;width:300px'); expect(html).toContain('<col style="width:300px"'); expect(html).not.toContain('width:140px');
});

test('rejects empty, duplicate and blank column identifiers', () => {
  expect(() => render([])).toThrow(/unique/); expect(() => render([definitions[0], definitions[0]])).toThrow(/unique/); expect(() => render([{ id: '', label: 'Empty', width: 100 }])).toThrow(/widths/);
});

test.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('rejects invalid initial and state widths (%s)', (width) => {
  expect(() => render([{ id: 'name', label: 'Name', width }])).toThrow(/positive/); expect(() => render(definitions, { widths: { name: width } })).toThrow(/positive/); expect(() => render(definitions, { defaultWidths: { name: width } })).toThrow(/positive/);
});

test.each([{ minWidth: 0 }, { minWidth: 500 }, { maxWidth: 50 }, { maxWidth: Number.POSITIVE_INFINITY }, { minWidth: Number.NaN }, { width: 50 }, { width: 500 }])('rejects invalid resizing bounds %j', (overrides) => {
  expect(() => render([{ ...definitions[0], ...overrides }])).toThrow(/minWidth/);
});

test.each(['widths', 'defaultWidths', 'visibility', 'defaultVisibility'] as const)('rejects unknown identifiers in %s', (state) => {
  expect(() => render(definitions, { [state]: { unknown: state.includes('Widths') || state === 'widths' ? 200 : false } })).toThrow(/unknown/);
});

test('rejects non-boolean visibility and preserves required or last-visible columns', () => {
  expect(() => render(definitions, { visibility: { name: 'false' } } as unknown as TableColumnOptions)).toThrow(/boolean/);
  expect(render(definitions, { visibility: { name: false, total: false } })).toContain('width:220px');
  expect(render([{ id: 'required', label: 'Required', width: 64, hideable: false }], { visibility: { required: false } })).toContain('width:64px');
});

test.each([{ value: Number.NaN }, { min: 0 }, { min: 500 }, { max: Number.POSITIVE_INFINITY }, { step: 0 }, { largeStep: Number.NaN }])('rejects invalid standalone resizer values %j', (overrides) => {
  expect(() => renderToStaticMarkup(createElement(Table.ColumnResizer, { 'aria-label': 'Name', value: 220, min: 100, max: 480, ...overrides } as TableColumnResizerProps))).toThrow(/Table.ColumnResizer/);
});

test('preserves native colgroup and handle properties while server rendering range semantics', () => {
  const html = renderToStaticMarkup(createElement(Table, {}, createElement(Table.Columns, { columns: [{ id: 'name', width: 220 }], id: 'column-layout', className: 'custom' }), createElement(Table.Head, {}, createElement(Table.Row, {}, createElement(Table.HeaderCell, { id: 'name-header', resize: { 'aria-label': 'Name', value: 220, min: 100, max: 480 } }, 'Name')))));
  expect(html).toContain('id="column-layout"'); expect(html).toContain('yarcl-table-columns custom'); expect(html).toContain('aria-controls="name-header"'); expect(html).toContain('aria-valuenow="220"');
});

test('column identifiers that match object prototype names use their declared widths', () => {
  const html = render([{ id: 'constructor', label: 'Constructor', width: 180 }, { id: 'toString', label: 'String', width: 160 }, { id: '__proto__', label: 'Prototype', width: 140 }]);
  expect(html).toContain('width:480px'); expect(html).toContain('width:180px'); expect(html).toContain('width:160px'); expect(html).toContain('width:140px');
});

test('explicit undefined state entries use definition widths and visible defaults', () => {
  expect(render(definitions, { widths: { name: undefined }, visibility: { name: undefined } })).toContain('width:360px');
});
