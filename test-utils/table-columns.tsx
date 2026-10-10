import { createRef, useState } from 'react';
import { afterEach, beforeEach, expect, inject, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import axe from 'axe-core';
import { Table, useTableColumns, config, type TableColumnOptions, type TableColumnWidths, type TableColumnDefinition, type TableColumnResizerProps, type Density } from '@yarcl/react';
import { applyTheme, resetTheme } from '@yarcl/react/css';
import { themes } from '@yarcl/react/themes';
import { page } from './page';

const definitions = [
  { id: 'select', label: 'Selection', width: 64, hideable: false },
  { id: 'customer', label: 'Customer', width: 220, resizable: true, minWidth: 100, maxWidth: 480 },
  { id: 'description', label: 'Description', width: 280, resizable: true, minWidth: 100, maxWidth: 600 },
  { id: 'total', label: 'Total', width: 140 },
] as const satisfies readonly TableColumnDefinition[];
type Id = (typeof definitions)[number]['id'];
const items = Array.from({ length: 120 }, (_, id) => ({ id, customer: `Customer ${String(id).padStart(3, '0')}`, description: 'A longer description that wraps as the column becomes narrow. More words make the row height depend on its width.', total: id + 1 }));
const key = (item: (typeof items)[number]) => item.id;
const button = (name: string) => page.getByRole('button', { name, exact: true });
const toggle = (name: string) => page.getByRole('checkbox', { name, exact: true });
const handle = (name = 'Customer') => page.getByRole('separator', { name, exact: true });
const cell = (id: string) => document.querySelector<HTMLTableCellElement>(`th[data-column="${id}"]`)!;
const wrap = () => document.querySelector<HTMLDivElement>('.yarcl-table-wrap')!;
const settle = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

/** Exercises column state with sorting, selection, sticky headers and measured or fixed rows. */
function Fixture({ options, virtual = false, fixed = false, dir, disabled, density, resizeProps, columns = definitions }: { options?: TableColumnOptions<Id>; virtual?: boolean; fixed?: boolean; dir?: 'ltr' | 'rtl'; disabled?: boolean; density?: Density; resizeProps?: Partial<TableColumnResizerProps>; columns?: readonly (typeof definitions)[number][] }) {
  const model = useTableColumns(columns, options);
  const [sort, setSort] = useState<'ascending' | 'descending'>('ascending');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const data = [...(virtual ? items : items.slice(0, 6))].sort((a, b) => sort === 'ascending' ? a.id - b.id : b.id - a.id);
  const all = selected.size === data.length;
  const row = (item: (typeof items)[number]) => <Table.Row key={item.id} selected={selected.has(item.id)} data-id={item.id} style={fixed ? { height: 48 } : undefined}>
    {model.visibleColumns.map((column) => column.id === 'select' ? <Table.SelectionCell key={column.id} aria-label={`Select ${item.customer}`} checked={selected.has(item.id)} onCheckedChange={(checked) => setSelected((previous) => { const next = new Set(previous); if (checked) next.add(item.id); else next.delete(item.id); return next; })} /> : <Table.Cell key={column.id} data-column={column.id}>{column.id === 'customer' ? <button type="button">Open {item.customer}</button> : item[column.id]}</Table.Cell>)}
  </Table.Row>;
  return <div dir={dir} className="yarcl-root"><Table.ColumnVisibility label="Columns" columns={model.columns} onVisibilityChange={model.setVisible} disabled={disabled} />
    <button type="button" onClick={() => model.setWidth('customer', 300)}>Set customer width</button>
    <button type="button" onClick={() => model.setVisible('customer', false)}>Hide customer</button>
    <Table caption="Orders" density={density} stickyHeader style={model.tableStyle} wrapStyle={{ width: 550, maxWidth: '100%', height: virtual ? 240 : undefined, maxHeight: virtual ? 240 : undefined }}>
      <Table.Columns columns={model.visibleColumns} />
      <Table.Head><Table.Row>{model.visibleColumns.map((column) => column.id === 'select' ? <Table.SelectAllCell key={column.id} checked={all} indeterminate={selected.size > 0 && !all} onCheckedChange={(checked) => setSelected(new Set(checked ? data.map((item) => item.id) : []))} /> : <Table.HeaderCell key={column.id} data-column={column.id} sortable={column.id === 'customer'} sortDirection={column.id === 'customer' ? sort : undefined} onSort={setSort} resize={column.id === 'customer' || column.id === 'description' ? { ...model.getResizeProps(column.id), disabled, ...resizeProps } : undefined}>{column.label}</Table.HeaderCell>)}</Table.Row></Table.Head>
      {virtual ? fixed ? <Table.VirtualBody items={data} rowHeight={48} getItemKey={key}>{row}</Table.VirtualBody> : <Table.VirtualBody items={data} estimateRowHeight={80} getItemKey={key}>{row}</Table.VirtualBody> : <Table.Body>{data.map(row)}</Table.Body>}
    </Table>
  </div>;
}

/** Verifies typed column state, pointer and keyboard resizing, visibility, table integration and accessibility. */
export function testTableColumns(densities: [Density, Density]) {
  beforeEach(async () => { document.documentElement.style.colorScheme = inject('scheme'); await page.throttleCpu(); await page.mouse.move(innerWidth - 1, innerHeight - 1); });
  afterEach(() => resetTheme());

  test('explicit column widths match native header geometry and the fixed table extent', async () => {
    await render(<Fixture />);
    expect(cell('customer').getBoundingClientRect().width).toBeCloseTo(220, 0);
    expect(cell('description').getBoundingClientRect().width).toBeCloseTo(280, 0);
    expect(document.querySelector('table')!.getBoundingClientRect().width).toBeCloseTo(704, 0);
    expect(getComputedStyle(document.querySelector('table')!).tableLayout).toBe('fixed');
    expect(document.querySelectorAll('col')).toHaveLength(4);
  });

  test.each([['ArrowRight', 221], ['ArrowLeft', 219], ['PageUp', 230], ['PageDown', 210], ['Home', 100], ['End', 480]] as const)('%s adjusts accepted width to %s and preserves separator focus', async (key, width) => {
    const change = vi.fn(); const commit = vi.fn(); await render(<Fixture options={{ onWidthsChange: change }} resizeProps={{ onValueCommit: commit }} />);
    await handle().focus(); await page.keyboard.press(key);
    expect(await handle().getAttribute('aria-valuenow')).toBe(String(width));
    expect(cell('customer').getBoundingClientRect().width).toBeCloseTo(width, 0);
    expect(change).toHaveBeenCalledExactlyOnceWith({ select: 64, customer: width, description: 280, total: 140 });
    expect(commit).toHaveBeenCalledExactlyOnceWith(width);
    expect(document.activeElement).toBe(await handle().element());
    expect(cell('customer').getAttribute('aria-sort')).toBe('ascending');
  });

  test('reaching bounds deduplicates callbacks and ignores unrelated or modified keys', async () => {
    const change = vi.fn(); await render(<Fixture options={{ defaultWidths: { customer: 480 }, onWidthsChange: change }} />);
    await handle().focus(); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowUp'); await page.keyboard.press('Control+ArrowLeft'); await page.keyboard.press('Enter');
    expect(change).not.toHaveBeenCalled(); expect(await handle().getAttribute('aria-valuenow')).toBe('480');
  });

  test('custom increments and value descriptions support precise keyboard editing', async () => {
    await render(<Fixture resizeProps={{ step: 5, largeStep: 25, formatValue: (width) => `${width} pixels` }} />);
    await handle().focus(); await page.keyboard.press('ArrowRight'); expect(await handle().getAttribute('aria-valuetext')).toBe('225 pixels');
    await page.keyboard.press('PageDown'); expect(await handle().getAttribute('aria-valuenow')).toBe('200');
  });

  test('RTL arrow keys follow physical separator movement', async () => {
    await render(<Fixture dir="rtl" />); await handle().focus(); await page.keyboard.press('ArrowLeft'); expect(await handle().getAttribute('aria-valuenow')).toBe('221'); await page.keyboard.press('ArrowRight'); expect(await handle().getAttribute('aria-valuenow')).toBe('220');
  });

  test.each(['ltr', 'rtl'] as const)('pointer dragging resizes without sorting in %s', async (dir) => {
    const commit = vi.fn(); await render(<Fixture dir={dir} resizeProps={{ onValueCommit: commit }} />);
    const rect = (await handle().element()).getBoundingClientRect(); const x = rect.left + rect.width / 2; const y = rect.top + rect.height / 2;
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + (dir === 'rtl' ? -60 : 60), y); await page.mouse.up();
    await expect.poll(async () => Number(await handle().getAttribute('aria-valuenow'))).toBeCloseTo(280, 0);
    expect(commit).toHaveBeenCalledTimes(1); expect(cell('customer').getAttribute('aria-sort')).toBe('ascending'); expect(document.activeElement).toBe(await handle().element());
  });

  test('canceled and lost-capture drags stop resizing without committing', async () => {
    for (const type of ['pointercancel', 'lostpointercapture']) {
      const down = vi.fn(); const commit = vi.fn(); const screen = await render(<Fixture resizeProps={{ onPointerDown: down, onValueCommit: commit }} />);
      const node = await handle().element(); const rect = node.getBoundingClientRect(); const x = rect.left + rect.width / 2; const y = rect.top + rect.height / 2;
      await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 30, y); await expect.poll(async () => Number(await handle().getAttribute('aria-valuenow'))).toBe(250);
      node.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: down.mock.calls[0][0].pointerId })); await page.mouse.move(x + 50, y); await page.mouse.up(); expect(await handle().getAttribute('aria-valuenow')).toBe('250'); expect(commit).not.toHaveBeenCalled();
      await screen.unmount();
    }
  });

  test('disabling during a drag releases capture and stops requests', async () => {
    const commit = vi.fn(); const screen = await render(<Fixture resizeProps={{ onValueCommit: commit }} />); const rect = (await handle().element()).getBoundingClientRect(); const x = rect.left + rect.width / 2; const y = rect.top + rect.height / 2;
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 30, y); await screen.rerender(<Fixture disabled resizeProps={{ onValueCommit: commit }} />); await page.mouse.move(x + 60, y); await page.mouse.up(); expect(await handle().getAttribute('aria-valuenow')).toBe('250'); expect(commit).not.toHaveBeenCalled();
  });

  test('native pointer handlers can cancel starting a drag', async () => {
    const change = vi.fn(); await render(<Fixture options={{ onWidthsChange: change }} resizeProps={{ onPointerDown: (event) => event.preventDefault() }} />); const rect = (await handle().element()).getBoundingClientRect(); const x = rect.left + rect.width / 2; const y = rect.top + rect.height / 2;
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 30, y); await page.mouse.up(); expect(change).not.toHaveBeenCalled();
  });

  test('dragging clamps to maximum width even outside the table frame', async () => {
    await render(<Fixture />); const rect = (await handle().element()).getBoundingClientRect(); const x = rect.left + rect.width / 2; const y = rect.top + rect.height / 2;
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 600, y); await page.mouse.up(); expect(await handle().getAttribute('aria-valuenow')).toBe('480');
  });

  test('dynamic definitions retain existing widths and initialize newly added identifiers', async () => {
    const initial = definitions.filter((column) => column.id !== 'total'); const screen = await render(<Fixture columns={initial} />); await handle().focus(); await page.keyboard.press('PageUp');
    await screen.rerender(<Fixture columns={definitions} />); expect(await handle().getAttribute('aria-valuenow')).toBe('230'); expect(cell('total').getBoundingClientRect().width).toBeCloseTo(140, 0);
    await screen.rerender(<Fixture columns={definitions.filter((column) => column.id !== 'description')} />); expect(document.querySelector('[data-column="description"]')).toBeNull(); expect(await handle().getAttribute('aria-valuenow')).toBe('230');
  });

  test('controlled widths request changes and wait for accepted props', async () => {
    const change = vi.fn(); const screen = await render(<Fixture options={{ widths: { customer: 220 }, onWidthsChange: change }} />);
    await handle().focus(); await page.keyboard.press('ArrowRight'); expect(await handle().getAttribute('aria-valuenow')).toBe('220'); expect(change.mock.calls[0][0].customer).toBe(221);
    await screen.rerender(<Fixture options={{ widths: { customer: 221 }, onWidthsChange: change }} />); expect(await handle().getAttribute('aria-valuenow')).toBe('221'); expect(cell('customer').getBoundingClientRect().width).toBeCloseTo(221, 0);
  });

  test('controlled width state can accept requests through callbacks', async () => {
    function Example() { const [widths, setWidths] = useState<TableColumnWidths<Id>>({ customer: 220 }); return <Fixture options={{ widths, onWidthsChange: setWidths }} />; }
    await render(<Example />); await button('Set customer width').click(); expect(await handle().getAttribute('aria-valuenow')).toBe('300');
  });

  test('provided widths clamp to declared limits', async () => {
    await render(<Fixture options={{ widths: { customer: 1, description: 1000 } }} />); expect(await handle().getAttribute('aria-valuenow')).toBe('100'); expect(await handle('Description').getAttribute('aria-valuenow')).toBe('600');
  });

  test('visibility removes matching columns, headers and every body cell and restores the width', async () => {
    const change = vi.fn(); await render(<Fixture options={{ onVisibilityChange: change }} />);
    await toggle('Description').click(); expect(document.querySelectorAll('[data-column="description"]')).toHaveLength(0); expect(document.querySelectorAll('col')).toHaveLength(3); expect(document.querySelector('table')!.getBoundingClientRect().width).toBeCloseTo(424, 0);
    expect(change).toHaveBeenCalledExactlyOnceWith({ select: true, customer: true, description: false, total: true });
    await toggle('Description').click(); expect(document.querySelectorAll('[data-column="description"]')).toHaveLength(7); expect(cell('description').getBoundingClientRect().width).toBeCloseTo(280, 0);
  });

  test('hidden columns retain their resized widths when shown again', async () => {
    await render(<Fixture />); await handle('Description').focus(); await page.keyboard.press('PageUp'); await toggle('Description').click(); await toggle('Description').click(); expect(await handle('Description').getAttribute('aria-valuenow')).toBe('290');
  });

  test('controlled visibility waits for accepted props, including checkbox state', async () => {
    const change = vi.fn(); const screen = await render(<Fixture options={{ visibility: {}, onVisibilityChange: change }} />);
    await toggle('Description').click(); expect((await toggle('Description').element() as HTMLInputElement).checked).toBe(true); expect(cell('description')).not.toBeNull(); expect(change.mock.calls[0][0].description).toBe(false);
    await screen.rerender(<Fixture options={{ visibility: { description: false }, onVisibilityChange: change }} />); expect(document.querySelector('[data-column="description"]')).toBeNull(); expect((await toggle('Description').element() as HTMLInputElement).checked).toBe(false);
  });

  test('required columns remain visible even when controlled state asks to hide them', async () => {
    await render(<Fixture options={{ visibility: { select: false } }} />); expect((await toggle('Selection').element() as HTMLInputElement).disabled).toBe(true); expect(document.querySelectorAll('.yarcl-table-selection-cell')).toHaveLength(7);
  });

  test('the last visible column cannot be hidden and malformed all-hidden state recovers', async () => {
    const single = [{ id: 'total', label: 'Total', width: 140 }] as const; await render(<Fixture columns={single} options={{ defaultVisibility: { total: false } }} />);
    expect((await toggle('Total').element() as HTMLInputElement).checked).toBe(true); expect((await toggle('Total').element() as HTMLInputElement).disabled).toBe(true); expect(cell('total')).not.toBeNull();
  });

  test('visibility checkboxes support Space and retain their focus', async () => {
    await render(<Fixture />); await toggle('Description').focus(); await page.keyboard.press('Space'); expect(document.querySelector('[data-column="description"]')).toBeNull(); expect(document.activeElement).toBe(await toggle('Description').element());
  });

  test('sorting and row selection survive resizing and hiding other columns', async () => {
    await render(<Fixture />); await toggle('Select Customer 000').click(); await handle().focus(); await page.keyboard.press('PageUp'); await toggle('Description').click(); await button('Customer').click();
    expect(cell('customer').getAttribute('aria-sort')).toBe('descending'); expect(document.querySelector('tbody tr')!.getAttribute('data-id')).toBe('5'); expect((await toggle('Select Customer 000').element() as HTMLInputElement).checked).toBe(true); expect(document.querySelector('tr[data-id="0"]')!.getAttribute('aria-selected')).toBe('true');
  });

  test('disabled controls prevent keyboard and pointer changes and native fieldset disables checkboxes', async () => {
    const widths = vi.fn(); const visibility = vi.fn(); await render(<Fixture disabled options={{ onWidthsChange: widths, onVisibilityChange: visibility }} />);
    expect(await handle().getAttribute('tabindex')).toBe('-1'); expect(await handle().getAttribute('aria-disabled')).toBe('true'); expect((await toggle('Description').element() as HTMLInputElement).matches(':disabled')).toBe(true);
    await handle().focus(); await page.keyboard.press('ArrowRight'); expect(widths).not.toHaveBeenCalled(); expect(visibility).not.toHaveBeenCalled();
  });

  test('native key handlers can cancel an adjustment', async () => {
    const change = vi.fn(); const keyboard = vi.fn((event: React.KeyboardEvent<HTMLSpanElement>) => event.preventDefault()); await render(<Fixture options={{ onWidthsChange: change }} resizeProps={{ onKeyDown: keyboard }} />);
    await handle().focus(); await page.keyboard.press('ArrowRight'); expect(keyboard).toHaveBeenCalledTimes(1); expect(change).not.toHaveBeenCalled();
  });

  test('header references, range semantics and native resizer refs identify the controlled column', async () => {
    const ref = createRef<HTMLSpanElement>(); await render(<Fixture resizeProps={{ ref }} />);
    expect(ref.current).toBe(await handle('Description').element()); expect(await handle().getAttribute('aria-orientation')).toBe('vertical'); expect(await handle().getAttribute('aria-valuemin')).toBe('100'); expect(await handle().getAttribute('aria-valuemax')).toBe('480'); expect(await handle().getAttribute('aria-controls')).toBe(cell('customer').id);
  });

  test('removing the focused column through accepted external state restores focus to the table wrapper', async () => {
    const screen = await render(<Fixture options={{ visibility: {} }} />); await handle().focus(); await screen.rerender(<Fixture options={{ visibility: { customer: false } }} />); expect(document.activeElement).toBe(wrap());
  });

  test('external visibility changes preserve focus outside the table', async () => {
    const screen = await render(<Fixture />); await button('Set customer width').focus(); await screen.rerender(<Fixture options={{ visibility: { customer: false } }} />); expect(document.activeElement).toBe(await button('Set customer width').element());
  });

  test.each([false, true])('visibility updates virtual spacer column spans in %s fixed mode', async (fixed) => {
    await render(<Fixture virtual fixed={fixed} />); await expect.poll(() => document.querySelector('.yarcl-table-virtual-spacer td')?.getAttribute('colspan')).toBe('4'); await toggle('Description').click(); await expect.poll(() => document.querySelector('.yarcl-table-virtual-spacer td')?.getAttribute('colspan')).toBe('3');
    wrap().scrollTop = wrap().scrollHeight; await expect.poll(() => document.querySelector('tr[data-id="119"]')).not.toBeNull(); expect(document.querySelectorAll('tbody tr:not(.yarcl-table-virtual-spacer)').length).toBeLessThan(24);
  });

  test('measured row heights refresh after narrowing a column and preserve the scroll anchor', async () => {
    await render(<Fixture virtual />); const before = document.querySelector('tr[data-id="0"]')!.getBoundingClientRect().height;
    await handle('Description').focus(); await page.keyboard.press('Home'); await expect.poll(() => document.querySelector('tr[data-id="0"]')!.getBoundingClientRect().height).toBeGreaterThan(before);
    wrap().scrollTop = 400; await settle(); const first = [...document.querySelectorAll<HTMLTableRowElement>('tbody tr[data-id]')].find((row) => row.getBoundingClientRect().bottom > document.querySelector('thead')!.getBoundingClientRect().bottom)!; const id = first.dataset.id!;
    await button('Set customer width').click(); await expect.poll(() => document.querySelector(`tr[data-id="${id}"]`)).not.toBeNull(); expect(wrap().scrollTop).toBeGreaterThan(0);
  });

  test('resizable headers stay sticky and handles remain inside their headers while scrolling', async () => {
    await render(<Fixture virtual />); wrap().scrollTop = 350; await settle(); const top = cell('customer').getBoundingClientRect().top; expect(getComputedStyle(cell('customer')).position).toBe('sticky'); expect(top).toBeCloseTo(wrap().getBoundingClientRect().top + wrap().clientTop, 0); wrap().scrollTop = 500; await settle(); expect(cell('customer').getBoundingClientRect().top).toBeCloseTo(top, 0); expect((await handle().element()).getBoundingClientRect().top).toBeGreaterThanOrEqual(top);
  });

  test('density and runtime themes style handles from tokens without changing width or focus', async () => {
    const screen = await render(<Fixture density={densities[0]} />); await handle().focus(); await page.keyboard.press('PageUp'); const node = await handle().element(); const border = getComputedStyle(node, '::after').width; expect(parseFloat(border)).toBeGreaterThan(0);
    await screen.rerender(<Fixture density={densities[1]} />); expect(await handle().element()).toBe(node); expect(await handle().getAttribute('aria-valuenow')).toBe('230');
    applyTheme(themes.brutalist); await expect.poll(() => getComputedStyle(node).outlineWidth).toBe('3px'); expect(document.activeElement).toBe(node); expect(cell('customer').getBoundingClientRect().width).toBeCloseTo(230, 0);
    expect(node.getAttribute('style')).toBeNull(); expect(config.density[densities[1]]).toBeDefined();
  });

  test('cell padding slots reach plain and sortable resize content and the handle without double padding', async () => {
    const token = Object.keys(config.spacing).at(-1)! as keyof typeof config.spacing;
    applyTheme({ ...config, components: { ...config.components, Table: { slots: { cell: { padding: token } } } } });
    await render(<Fixture />);
    const probe = document.createElement('div'); probe.style.width = config.spacing[token]; document.body.append(probe); const padding = getComputedStyle(probe).width; probe.remove();
    expect(getComputedStyle(cell('customer')).paddingTop).toBe('0px'); expect(getComputedStyle(cell('description')).paddingTop).toBe('0px');
    expect(getComputedStyle(cell('customer').querySelector('.yarcl-table-sort-button')!).paddingTop).toBe(padding); expect(getComputedStyle(cell('description').querySelector('.yarcl-table-header-content')!).paddingTop).toBe(padding);
    expect(getComputedStyle(await handle().element()).width).toBe(padding); resetTheme(); await expect.poll(() => getComputedStyle(cell('customer').querySelector('.yarcl-table-sort-button')!).paddingTop).not.toBe(padding);
  });

  test('zero cell padding retains a visible pointer target and leaves the sort label clear', async () => {
    const token = Object.keys(config.spacing)[0] as keyof typeof config.spacing;
    applyTheme({ ...config, spacing: { ...config.spacing, [token]: '0px' }, components: { ...config.components, Table: { slots: { cell: { padding: token } } } } });
    await render(<Fixture />); const node = await handle().element(); const width = node.getBoundingClientRect().width;
    expect(width).toBeGreaterThan(0); expect(parseFloat(getComputedStyle(cell('customer').querySelector('.yarcl-table-sort-button')!).paddingInlineEnd)).toBeGreaterThanOrEqual(width);
    await handle().focus(); await page.keyboard.press('ArrowRight'); expect(await handle().getAttribute('aria-valuenow')).toBe('221');
  });

  test.each(['yarcl', 'brutalist'] as const)('passes axe for visible, resized and hidden columns in %s', async (theme) => {
    applyTheme(themes[theme]); const screen = await render(<Fixture />); expect((await axe.run(document.querySelector('.yarcl-root')!)).violations).toEqual([]); await handle().focus(); await page.keyboard.press('Home'); await toggle('Description').click(); await page.mouse.move(innerWidth - 1, innerHeight - 1);
    expect((await axe.run(document.querySelector('.yarcl-root')!)).violations).toEqual([]);
    await screen.rerender(<Fixture disabled />); expect((await axe.run(document.querySelector('.yarcl-root')!)).violations).toEqual([]);
  });
}
