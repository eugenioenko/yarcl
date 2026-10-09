import { useRef, type ComponentProps } from 'react';
import { beforeEach, expect, inject, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { Table } from '@yarcl/react';
import type { Density } from '@yarcl/react';
import config from '@yarcl/config';
import { applyTheme, resetTheme } from '@yarcl/react/css';
import axe from 'axe-core';
import { page } from './page';

const items = Array.from({ length: 120 }, (_, index) => ({ id: `row-${index}`, index }));
const key = (item: (typeof items)[number]) => item.id;
const rows = () => [...document.querySelectorAll<HTMLTableRowElement>('tbody tr:not(.yarcl-table-virtual-spacer)')];
const wrap = () => document.querySelector<HTMLDivElement>('.yarcl-table-wrap')!;
const settle = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
const firstIndex = () => Number(rows()[0]?.dataset.yarclRowIndex);

function Fixture({
  data = items,
  density,
  width = 320,
  height = 180,
  estimate = 44,
  fixed,
  expanded = false,
  bodyRef,
  rowRef,
  custom = false,
  overscan = 2,
}: {
  data?: typeof items;
  density?: Density;
  width?: number;
  height?: number;
  estimate?: number;
  fixed?: number;
  expanded?: boolean;
  bodyRef?: ComponentProps<'tbody'>['ref'];
  rowRef?: ComponentProps<'tr'>['ref'];
  custom?: boolean;
  overscan?: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const renderRow = (item: (typeof items)[number]) => (
    <Table.Row
      ref={item.index === 0 ? rowRef : undefined}
      data-id={item.id}
      style={fixed ? { height: fixed } : undefined}
    >
      <Table.Cell style={fixed ? { padding: 0 } : undefined}>
        <button type="button">Open {item.index}</button>
      </Table.Cell>
      <Table.Cell style={fixed ? { padding: 0 } : undefined}>
        <div style={fixed ? { height: fixed - 1, overflow: 'hidden' } : undefined}>
          {fixed
            ? 'Fixed row'
            : Array.from({ length: expanded ? 6 : (item.index % 3) + 1 }, (_, line) => (
                <div key={line}>
                  Row {item.index}, line {line}: content wraps when the table becomes narrow.
                </div>
              ))}
        </div>
      </Table.Cell>
    </Table.Row>
  );
  const table = (
    <Table
      density={density}
      caption="Orders"
      stickyHeader
      style={{ tableLayout: 'fixed' }}
      wrapStyle={custom ? { overflow: 'visible', maxHeight: 'none' } : { width, height, maxHeight: height }}
    >
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Action</Table.HeaderCell>
          <Table.HeaderCell>Description</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      {fixed ? (
        <Table.VirtualBody items={data} rowHeight={fixed} overscan={overscan} ref={bodyRef}>
          {renderRow}
        </Table.VirtualBody>
      ) : (
        <Table.VirtualBody
          items={data}
          estimateRowHeight={estimate}
          getItemKey={key}
          overscan={overscan}
          ref={bodyRef}
          scrollRef={custom ? scrollRef : undefined}
        >
          {renderRow}
        </Table.VirtualBody>
      )}
    </Table>
  );
  return custom ? (
    <div ref={scrollRef} data-testid="external-scroll" style={{ width, height, overflow: 'auto' }}>
      <div style={{ height: 90 }}>Content before the table</div>
      {table}
    </div>
  ) : (
    table
  );
}

async function assertCovered(el = wrap()) {
  await settle();
  await expect
    .poll(() => {
      const header = document.querySelector('thead')!.getBoundingClientRect();
      const viewport = el.getBoundingClientRect();
      const top = Math.max(viewport.top + el.clientTop, header.bottom);
      const bottom = viewport.top + el.clientTop + el.clientHeight;
      const visible = rows().filter((row) => {
        const rect = row.getBoundingClientRect();
        return rect.bottom > top && rect.top < bottom;
      });
      if (!visible.length) return false;
      for (let i = 1; i < visible.length; i++) {
        if (Math.abs(visible[i].getBoundingClientRect().top - visible[i - 1].getBoundingClientRect().bottom) > 1)
          return false;
      }
      return (
        visible[0].getBoundingClientRect().top <= top + 1 &&
        visible.at(-1)!.getBoundingClientRect().bottom >= bottom - 1
      );
    })
    .toBe(true);
}

/** Exercises measured virtualization and the fixed-height mode with both consumer configs. */
export function testTableVirtualization(densities: [Density, Density]) {
  beforeEach(async () => {
    document.documentElement.style.colorScheme = inject('scheme');
    await page.throttleCpu();
  });
  test('measures mixed heights, keeps the viewport covered and reaches the final row', async () => {
    await render(<Fixture />);
    await expect.poll(() => new Set(rows().map((row) => row.getBoundingClientRect().height)).size).toBeGreaterThan(1);
    const visited = new Map<number, number>();
    for (let step = 0; step < 160; step++) {
      await assertCovered();
      expect(rows().length).toBeLessThan(24);
      for (const row of rows()) visited.set(Number(row.dataset.yarclRowIndex), row.getBoundingClientRect().height);
      if (wrap().scrollTop + wrap().clientHeight >= wrap().scrollHeight - 1) break;
      wrap().scrollTop += 150;
    }
    expect(rows().at(-1)!.dataset.id).toBe('row-119');
    expect(visited.size).toBe(items.length);
    const total = [...visited.values()].reduce((sum, height) => sum + height, 0);
    expect(document.querySelector('tbody')!.getBoundingClientRect().height).toBeCloseTo(total, 0);
    wrap().scrollTop = 0;
    await expect.poll(() => firstIndex()).toBe(0);
    await assertCovered();
  });

  test('retains measurements by stable key when sorting and filtering', async () => {
    const screen = await render(<Fixture data={items.slice(0, 12)} height={1800} />);
    await expect.poll(() => rows().length).toBe(12);
    await settle();
    const heights = new Map(rows().map((row) => [row.dataset.id, row.getBoundingClientRect().height]));
    const total = document.querySelector('tbody')!.getBoundingClientRect().height;
    await screen.rerender(<Fixture data={items.slice(0, 12).reverse()} />);
    await settle();
    expect(rows().map((row) => row.dataset.id)).toEqual(items.slice(0, 12).reverse().slice(0, rows().length).map(key));
    expect(rows().length).toBeLessThan(12);
    for (const row of rows())
      expect(Math.abs(row.getBoundingClientRect().height - heights.get(row.dataset.id)!)).toBeLessThanOrEqual(1);
    expect(document.querySelector('tbody')!.getBoundingClientRect().height).toBe(total);
    await screen.rerender(<Fixture data={items.slice(0, 2)} />);
    await expect.poll(() => rows().length).toBe(2);
    expect(document.querySelectorAll('.yarcl-table-virtual-spacer').length).toBe(0);
    await screen.rerender(<Fixture data={[]} />);
    await expect.poll(() => rows().length).toBe(0);
    expect(document.querySelectorAll('.yarcl-table-virtual-spacer').length).toBe(0);
  });

  test('remeasures on density, width and visible content changes while preserving the scroll anchor', async () => {
    const screen = await render(<Fixture density={densities[0]} width={600} />);
    wrap().scrollTop = 1600;
    await expect.poll(() => firstIndex()).toBeGreaterThan(10);
    await assertCovered();
    const headerBottom =
      wrap().getBoundingClientRect().top +
      wrap().clientTop +
      document.querySelector('thead')!.getBoundingClientRect().height;
    const anchor = rows().find((row) => row.getBoundingClientRect().bottom > headerBottom)!;
    const anchorId = anchor.dataset.id;
    const oldHeight = anchor.getBoundingClientRect().height;
    await screen.rerender(<Fixture density={densities[1]} width={600} />);
    await assertCovered();
    const retained = rows().find((row) => row.dataset.id === anchorId)!;
    expect(
      retained,
      JSON.stringify({ anchorId, current: rows().map((row) => row.dataset.id), scroll: wrap().scrollTop }),
    ).toBeDefined();
    expect(retained.getBoundingClientRect().height).not.toBe(oldHeight);
    await screen.rerender(<Fixture density={densities[1]} width={240} />);
    await assertCovered();
    const narrowed = rows().find((row) => row.dataset.id === anchorId)!;
    expect(
      narrowed,
      JSON.stringify({ anchorId, current: rows().map((row) => row.dataset.id), scroll: wrap().scrollTop }),
    ).toBeDefined();
    const narrowHeight = narrowed.getBoundingClientRect().height;
    await screen.rerender(<Fixture density={densities[1]} width={240} expanded />);
    await assertCovered();
    expect(
      rows()
        .find((row) => row.dataset.id === anchorId)!
        .getBoundingClientRect().height,
    ).toBeGreaterThan(narrowHeight);
  });

  test('observes content growth without a parent render and refreshes heights after a theme swap', async () => {
    await render(<Fixture density={densities[0]} />);
    await settle();
    const row = rows()[0];
    const height = row.getBoundingClientRect().height;
    const content = row.cells[1].firstElementChild as HTMLElement;
    content.style.minHeight = `${height + 80}px`;
    await expect.poll(() => row.getBoundingClientRect().height).toBeGreaterThan(height + 70);
    await assertCovered();
    const grownHeight = row.getBoundingClientRect().height;
    try {
      applyTheme({
        ...config,
        density: {
          ...config.density,
          [densities[0]]: {
            ...config.density[densities[0]],
            paddingY: '2rem',
          },
        },
      });
      await expect.poll(() => rows()[0].getBoundingClientRect().height).toBeGreaterThan(grownHeight);
      await assertCovered();
    } finally {
      resetTheme();
    }
    await expect.poll(() => rows()[0].getBoundingClientRect().height).toBe(grownHeight);
  });

  test('keeps focused rows mounted during scrolling and supports Tab across virtual windows', async () => {
    await render(<Fixture overscan={0} />);
    await page.getByRole('button', { name: 'Open 0', exact: true }).focus();
    for (let index = 1; index < 18; index++) {
      await page.keyboard.press('Tab');
      await expect.poll(() => document.activeElement?.textContent).toBe(`Open ${index}`);
    }
    const focused = document.activeElement;
    wrap().scrollTop = 10000;
    await settle();
    expect(document.activeElement).toBe(focused);
    expect(focused!.isConnected).toBe(true);
    expect(rows().length).toBeLessThan(24);
    await page.keyboard.press('Shift+Tab');
    await expect.poll(() => document.activeElement?.textContent).toBe('Open 16');
    await page.keyboard.press('Tab');
    await expect.poll(() => document.activeElement?.textContent).toBe('Open 17');
  });

  test('supports PageDown, End and Home from the focusable table wrapper', async () => {
    await render(<Fixture />);
    wrap().focus();
    expect(document.activeElement).toBe(wrap());
    expect(getComputedStyle(wrap()).outlineStyle).not.toBe('none');
    await page.keyboard.press('PageDown');
    await expect.poll(() => wrap().scrollTop).toBeGreaterThan(0);
    await assertCovered();
    await page.keyboard.press('End');
    await expect.poll(() => rows().at(-1)?.dataset.id).toBe('row-119');
    await assertCovered();
    await page.keyboard.press('Home');
    await expect.poll(() => firstIndex()).toBe(0);
    await assertCovered();
  });

  test('accounts for captions and content before a custom scroll container table', async () => {
    await render(<Fixture custom />);
    const el = document.querySelector<HTMLDivElement>('[data-testid="external-scroll"]')!;
    el.scrollTop = 1900;
    await expect.poll(() => firstIndex()).toBeGreaterThan(10);
    await assertCovered(el);
    el.scrollTop = el.scrollHeight;
    await expect.poll(() => rows().at(-1)?.dataset.id).toBe('row-119');
    await assertCovered(el);
  });

  test('preserves tbody and row refs, cleans observers and passes an axe audit', async () => {
    const bodyRef = { current: null as HTMLTableSectionElement | null };
    const rowRef = { current: null as HTMLTableRowElement | null };
    const screen = await render(<Fixture bodyRef={bodyRef} rowRef={rowRef} />);
    expect(bodyRef.current?.tagName).toBe('TBODY');
    expect(rowRef.current?.dataset.id).toBe('row-0');
    await settle();
    const result = await axe.run(wrap());
    expect(result.violations.map((violation) => violation.id)).toEqual([]);
    await screen.unmount();
    expect(bodyRef.current).toBeNull();
    expect(rowRef.current).toBeNull();
  });

  test('keeps explicit fixed-height virtualization bounded after large scrolls', async () => {
    await render(<Fixture fixed={80} />);
    await settle();
    expect(rows().length).toBeLessThan(15);
    expect(rows().every((row) => row.getBoundingClientRect().height === 80)).toBe(true);
    wrap().scrollTop = 5600;
    await expect.poll(() => Number(rows()[0]?.dataset.id?.replace('row-', ''))).toBeGreaterThan(60);
    expect(rows().length).toBeLessThan(15);
    wrap().scrollTop = 0;
    await expect.poll(() => rows()[0]?.dataset.id).toBe('row-0');
  });
}
