import axe from 'axe-core';
import { createRef, useState } from 'react';
import { afterEach, beforeEach, expect, inject, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Button, Input, SplitPane, config, type SplitPaneProps, type Color, type Radius, type Size } from '@yarcl/react';
import { applyTheme, resetTheme } from '@yarcl/react/css';
import { themes } from '@yarcl/react/themes';
import { page } from './page';

const base: SplitPaneProps = { primaryLabel: 'Files', secondaryLabel: 'Document', primary: <Button>File action</Button>, secondary: <Input aria-label="Editor" />, style: { width: '600px', height: '300px' } };
const separator = () => page.getByRole('separator', { name: 'Files', exact: true });
const current = async () => Number(await separator().getAttribute('aria-valuenow'));
async function press(key: string) { (await separator().element() as HTMLElement).focus(); await page.keyboard.press(key); }
async function start() {
  const element = await separator().element();
  const rect = element.getBoundingClientRect();
  const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  return { x, y, element };
}
function pixels(value: string) {
  const element = document.createElement('div'); element.style.width = value; document.body.append(element);
  const width = getComputedStyle(element).width; element.remove(); return width;
}

/** Exercises resizing, focus, constraints, native events, nested layouts and consumer token styling. */
export function testSplitPane() {
  beforeEach(async () => { await page.throttleCpu(); document.documentElement.style.colorScheme = inject('scheme'); await page.mouse.move(innerWidth - 1, innerHeight - 1); });
  afterEach(async () => { await page.mouse.up(); resetTheme(); });

  test('names the pane and separator, exposes its controlled region and limits', async () => {
    const screen = await render(<SplitPane {...base} defaultValue={35} min={20} max={70} formatValue={(value) => `${value} percent`} />);
    const handle = await separator().element();
    expect(handle.getAttribute('aria-controls')).toBe(screen.container.querySelector('[data-part="primary"]')?.id);
    expect(handle.getAttribute('aria-orientation')).toBe('vertical');
    expect(handle.getAttribute('aria-valuemin')).toBe('20'); expect(handle.getAttribute('aria-valuemax')).toBe('70');
    expect(handle.getAttribute('aria-valuetext')).toBe('35 percent');
    expect(screen.container.querySelector('[data-part="primary"]')?.getAttribute('aria-label')).toBe('Files');
  });

  test('arrow keys adjust by step and ignore the other axis', async () => {
    await render(<SplitPane {...base} step={0.5} defaultValue={30} />);
    await press('ArrowRight'); expect(await current()).toBe(30.5);
    await press('ArrowLeft'); expect(await current()).toBe(30);
    await press('ArrowDown'); expect(await current()).toBe(30);
  });

  test('vertical layouts use up and down with a horizontal separator', async () => {
    await render(<SplitPane {...base} orientation="vertical" step={2} />);
    expect(await separator().getAttribute('aria-orientation')).toBe('horizontal');
    await press('ArrowDown'); expect(await current()).toBe(52);
    await press('ArrowUp'); expect(await current()).toBe(50);
    await press('ArrowRight'); expect(await current()).toBe(50);
  });

  test('RTL mirrors horizontal keyboard movement and first-pane position', async () => {
    const screen = await render(<SplitPane {...base} dir="rtl" />);
    await press('ArrowLeft'); expect(await current()).toBe(51);
    await press('ArrowRight'); expect(await current()).toBe(50);
    const first = screen.container.querySelector('[data-part="primary"]')!.getBoundingClientRect();
    const second = screen.container.querySelector('[data-part="secondary"]')!.getBoundingClientRect();
    expect(first.left).toBeGreaterThan(second.left);
  });

  test('Home End and page keys respect bounds and larger steps', async () => {
    await render(<SplitPane {...base} min={20} max={70} largeStep={15} />);
    await press('PageUp'); expect(await current()).toBe(65);
    await press('PageUp'); expect(await current()).toBe(70);
    await press('End'); expect(await current()).toBe(70);
    await press('PageDown'); expect(await current()).toBe(55);
    await press('Home'); expect(await current()).toBe(20);
    await press('ArrowLeft'); expect(await current()).toBe(20);
  });

  test('Enter minimizes and restores the last accepted size', async () => {
    await render(<SplitPane {...base} defaultValue={35} min={0} />);
    await press('ArrowRight'); await press('Enter'); expect(await current()).toBe(0);
    expect((await page.getByRole('region', { name: 'Files', exact: true, includeHidden: true }).element()).hasAttribute('hidden')).toBe(true);
    await press('Enter'); expect(await current()).toBe(36);
  });

  test('an initially minimized pane restores to an available size', async () => {
    await render(<SplitPane {...base} min={0} max={100} defaultValue={0} />);
    await press('Enter'); expect(await current()).toBe(50);
  });

  test('pointer capture resizes beyond the divider and commits the last size', async () => {
    const change = vi.fn(), commit = vi.fn();
    await render(<SplitPane {...base} onValueChange={change} onValueCommit={commit} />);
    const { x, y, element } = await start();
    await page.mouse.move(x + 60, y + 80);
    expect(await current()).toBeGreaterThan(59);
    expect(document.activeElement).toBe(element);
    expect(commit).not.toHaveBeenCalled();
    const size = await current(); await page.mouse.up(); expect(commit).toHaveBeenLastCalledWith(size);
    await page.mouse.move(x - 50, y); expect(await current()).toBe(size);
    expect(change).toHaveBeenCalled();
  });

  test('vertical pointer dragging measures the available height', async () => {
    await render(<SplitPane {...base} orientation="vertical" />);
    const { x, y } = await start(); await page.mouse.move(x, y + 30); await page.mouse.up();
    expect(await current()).toBeGreaterThan(60); expect(await current()).toBeLessThan(62);
  });

  test('RTL pointer dragging moves the first pane in the correct direction', async () => {
    await render(<SplitPane {...base} dir="rtl" />);
    const { x, y } = await start(); await page.mouse.move(x - 60, y); await page.mouse.up();
    expect(await current()).toBeGreaterThan(59);
  });

  test('pointer dragging clamps at both percentage limits', async () => {
    await render(<SplitPane {...base} min={40} max={60} />);
    const { x, y } = await start(); await page.mouse.move(x + 200, y); expect(await current()).toBe(60);
    await page.mouse.move(x - 200, y); expect(await current()).toBe(40); await page.mouse.up();
  });

  test('pane clicks never initiate resizing', async () => {
    const change = vi.fn(); await render(<SplitPane {...base} onValueChange={change} />);
    await page.getByRole('button', { name: 'File action' }).click(); await page.mouse.move(500, 200);
    expect(change).not.toHaveBeenCalled(); expect(await current()).toBe(50);
  });

  test('controlled resizing reports requests and waits for the prop update', async () => {
    const change = vi.fn(); const screen = await render(<SplitPane {...base} value={40} onValueChange={change} />);
    await press('ArrowRight'); expect(change).toHaveBeenLastCalledWith(41); expect(await current()).toBe(40);
    await screen.rerender(<SplitPane {...base} value={41} onValueChange={change} />); expect(await current()).toBe(41);
  });

  test('controlled pointer commits the final requested value even before acceptance', async () => {
    const change = vi.fn(), commit = vi.fn(); await render(<SplitPane {...base} value={40} onValueChange={change} onValueCommit={commit} />);
    const { x, y } = await start(); await page.mouse.move(x + 60, y); await page.mouse.up();
    expect(await current()).toBe(40); expect(change.mock.lastCall?.[0]).toBeGreaterThan(49);
    expect(commit).toHaveBeenLastCalledWith(change.mock.lastCall![0]);
  });

  test('controlled parents can accept keyboard and pointer changes', async () => {
    function Example() { const [value, setValue] = useState(30); return <SplitPane {...base} value={value} onValueChange={setValue} />; }
    await render(<Example />); await press('ArrowRight'); expect(await current()).toBe(31);
    const { x, y } = await start(); await page.mouse.move(x + 30, y); await page.mouse.up(); expect(await current()).toBeGreaterThan(35);
  });

  test('native keyboard handlers can cancel adjustments and commits', async () => {
    const change = vi.fn(), commit = vi.fn(); await render(<SplitPane {...base} onKeyDown={(event) => event.preventDefault()} onValueChange={change} onValueCommit={commit} />);
    await press('ArrowRight'); expect(await current()).toBe(50); expect(change).not.toHaveBeenCalled(); expect(commit).not.toHaveBeenCalled();
  });

  test('native pointer handlers can cancel drag startup', async () => {
    const change = vi.fn(); await render(<SplitPane {...base} onPointerDown={(event) => event.preventDefault()} onValueChange={change} />);
    const { x, y } = await start(); await page.mouse.move(x + 70, y); await page.mouse.up(); expect(change).not.toHaveBeenCalled();
  });

  test('pointer cancellation stops resizing without committing', async () => {
    const commit = vi.fn(); await render(<SplitPane {...base} onValueCommit={commit} />);
    const { x, y, element } = await start(); await page.mouse.move(x + 20, y);
    const id = await new Promise<number>((resolve) => { element.addEventListener('pointermove', (event) => resolve((event as PointerEvent).pointerId), { once: true }); void page.mouse.move(x + 21, y); });
    element.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerId: id }));
    const value = await current(); await page.mouse.move(x + 80, y); await page.mouse.up();
    expect(await current()).toBe(value); expect(commit).not.toHaveBeenCalled();
  });

  test('disabling during a drag releases capture and ignores subsequent movement', async () => {
    const commit = vi.fn(); const screen = await render(<SplitPane {...base} onValueCommit={commit} />);
    const { x, y } = await start(); await page.mouse.move(x + 20, y); const value = await current();
    await screen.rerender(<SplitPane {...base} disabled onValueCommit={commit} />); await page.mouse.move(x + 80, y); await page.mouse.up();
    expect(await current()).toBe(value); expect(commit).not.toHaveBeenCalled();
  });

  test('disabled separators have no tab stop and ignore resizing', async () => {
    const change = vi.fn(); await render(<SplitPane {...base} disabled onValueChange={change} />);
    expect(await separator().getAttribute('tabindex')).toBe('-1'); expect(await separator().getAttribute('aria-disabled')).toBe('true');
    await press('ArrowRight'); const { x, y } = await start(); await page.mouse.move(x + 80, y); await page.mouse.up(); expect(change).not.toHaveBeenCalled();
  });

  test('changing the layout axis during a drag stops the old gesture', async () => {
    const commit = vi.fn(); const screen = await render(<SplitPane {...base} onValueCommit={commit} />);
    const { x, y } = await start(); await page.mouse.move(x + 20, y); const value = await current();
    await screen.rerender(<SplitPane {...base} orientation="vertical" onValueCommit={commit} />);
    await page.mouse.move(x, y + 80); await page.mouse.up(); expect(await current()).toBe(value); expect(commit).not.toHaveBeenCalled();
  });

  test('changing limits during a drag cancels it and clamps the current size', async () => {
    const commit = vi.fn(); const screen = await render(<SplitPane {...base} onValueCommit={commit} />);
    const { x, y } = await start(); await page.mouse.move(x + 20, y);
    await screen.rerender(<SplitPane {...base} min={60} max={80} onValueCommit={commit} />);
    await page.mouse.move(x + 100, y); await page.mouse.up(); expect(await current()).toBe(60); expect(commit).not.toHaveBeenCalled();
  });

  test('non-primary pointer events cannot adjust the captured gesture', async () => {
    await render(<SplitPane {...base} />); const { element } = await start();
    element.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 999, clientX: 600, isPrimary: false }));
    expect(await current()).toBe(50); await page.mouse.up();
  });

  test('keyboard precision stays within fractional limits', async () => {
    const change = vi.fn(); await render(<SplitPane {...base} min={0} max={0.0000007} value={0} step={0.1} onValueChange={change} />);
    await press('End'); expect(change).toHaveBeenLastCalledWith(0.0000007);
  });

  test('small positive steps remain usable without rounding to zero', async () => {
    await render(<SplitPane {...base} min={0} max={1} defaultValue={0} step={0.0000001} />);
    await press('ArrowRight'); expect(await current()).toBe(0.0000001);
  });

  test('zero-size panes hide their content while retaining the DOM', async () => {
    const screen = await render(<SplitPane {...base} value={0} min={0} max={100} />);
    expect(screen.container.querySelector('[data-part="primary"]')?.hasAttribute('hidden')).toBe(true);
    expect(screen.container.querySelector('button')?.textContent).toBe('File action');
    await screen.rerender(<SplitPane {...base} value={100} min={0} max={100} />);
    expect(screen.container.querySelector('[data-part="secondary"]')?.hasAttribute('hidden')).toBe(true);
    expect(screen.container.querySelector('[data-part="primary"]')?.hasAttribute('hidden')).toBe(false);
  });

  test('external collapse restores focus from the first pane to the separator', async () => {
    const screen = await render(<SplitPane {...base} value={50} min={0} max={100} />);
    await page.getByRole('button', { name: 'File action' }).click();
    await screen.rerender(<SplitPane {...base} value={0} min={0} max={100} />);
    await expect.poll(() => document.activeElement).toBe(await separator().element());
  });

  test('external collapse restores focus from the second pane', async () => {
    const screen = await render(<SplitPane {...base} value={50} min={0} max={100} />);
    await page.getByRole('textbox', { name: 'Editor' }).click();
    await screen.rerender(<SplitPane {...base} value={100} min={0} max={100} />);
    await expect.poll(() => document.activeElement).toBe(await separator().element());
  });

  test('external resizing preserves focus outside the component', async () => {
    const screen = await render(<><Button>Outside</Button><SplitPane {...base} value={50} min={0} /></>);
    await page.getByRole('button', { name: 'Outside' }).click(); const outside = document.activeElement;
    await screen.rerender(<><Button>Outside</Button><SplitPane {...base} value={0} min={0} /></>); expect(document.activeElement).toBe(outside);
  });

  test('tab order follows pane regions, their controls and the separator', async () => {
    await render(<SplitPane {...base} />); await page.getByRole('button', { name: 'File action' }).click();
    await page.keyboard.press('Tab'); expect(document.activeElement).toBe(await separator().element());
    const style = getComputedStyle(document.activeElement!); expect(style.outlineStyle).toBe((config.focusRing as { style?: string }).style ?? 'solid'); expect(style.outlineWidth).toBe(pixels(config.focusRing.width));
    await page.keyboard.press('Tab'); expect(document.activeElement).toBe(await page.getByRole('region', { name: 'Document', exact: true }).element());
    await page.keyboard.press('Tab'); expect(document.activeElement).toBe(await page.getByRole('textbox', { name: 'Editor' }).element());
  });

  test('text-only scrollable panes are keyboard reachable and pass axe', async () => {
    const text = <>{Array.from({ length: 30 }, (_, index) => <p key={index}>Paragraph {index + 1}</p>)}</>;
    const screen = await render(<div className="yarcl-root"><Button>Before</Button><SplitPane {...base} primary={text} secondary={text} /></div>);
    await page.getByRole('button', { name: 'Before', exact: true }).click(); await page.keyboard.press('Tab');
    const first = await page.getByRole('region', { name: 'Files', exact: true }).element();
    expect(document.activeElement).toBe(first); expect(first.scrollHeight).toBeGreaterThan(first.clientHeight);
    await page.keyboard.press('ArrowDown'); await expect.poll(() => first.scrollTop).toBeGreaterThan(0);
    await page.keyboard.press('Tab'); expect(document.activeElement).toBe(await separator().element());
    await page.keyboard.press('Tab'); expect(document.activeElement).toBe(await page.getByRole('region', { name: 'Document', exact: true }).element());
    const audit = await axe.run(screen.container, { rules: { region: { enabled: false } } }); expect(audit.violations.map(({ id }) => id)).toEqual([]);
  });

  test('nested separators resize independently without inheriting the outer ratio', async () => {
    const screen = await render(<SplitPane {...base} defaultValue={70} secondary={<SplitPane primaryLabel="Console" primary="Output" secondary="Log" defaultValue={25} />} />);
    const inner = await page.getByRole('separator', { name: 'Console' }).element() as HTMLElement; inner.focus(); await page.keyboard.press('ArrowRight');
    expect(inner.getAttribute('aria-valuenow')).toBe('26'); expect(await current()).toBe(70);
    expect(screen.container.querySelectorAll('.yarcl-split')[1].getAttribute('style')).toContain('26fr');
  });

  test('native attributes, refs, token widths and radius reach their parts', async () => {
    const ref = createRef<HTMLDivElement>(); const size = Object.keys(config.sizes)[0] as Size, radius = Object.keys(config.radii)[0] as Radius, color = Object.keys(config.colors)[0] as Color;
    await render(<SplitPane {...base} ref={ref} title="Workspace" data-owner="Sam" className="custom-split" size={size} radius={radius} color={color} />);
    expect(ref.current?.getAttribute('data-owner')).toBe('Sam'); expect(ref.current?.className).toContain('custom-split'); expect(ref.current?.className).toContain(`yarcl-color-${color}`);
    const handle = await separator().element(); expect(parseFloat(getComputedStyle(handle).width)).toBeCloseTo(parseFloat(pixels(config.sizes[size].paddingX)) / 2, 1);
    expect(getComputedStyle(ref.current!.querySelector('[data-part="primary"]')!).borderRadius).toBe(pixels(config.radii[radius]));
    expect(ref.current?.style.cssText).not.toContain(config.sizes[size].paddingX);
  });

  test('runtime component defaults and size overrides adjust the separator', async () => {
    const size = Object.keys(config.sizes)[0] as Size;
    applyTheme({ ...config, components: { ...config.components, SplitPane: { size, sizeOverrides: { [size]: { paddingX: '40px' } } } } });
    await render(<SplitPane {...base} />); expect(getComputedStyle(await separator().element()).width).toBe('20px');
  });

  test('runtime themes preserve size, content identity and separator focus', async () => {
    const screen = await render(<SplitPane {...base} defaultValue={35} />); await press('ArrowRight'); const handle = await separator().element(); const content = screen.container.querySelector('input');
    applyTheme(themes.brutalist); await expect.poll(() => document.activeElement).toBe(handle);
    expect(await current()).toBe(36); expect(screen.container.querySelector('input')).toBe(content);
  });

  test.each(['yarcl', 'brutalist'] as const)('passes axe for both orientations, collapsed and disabled states in %s', async (theme) => {
    applyTheme(themes[theme]); const screen = await render(<div className="yarcl-root"><SplitPane {...base} min={0} max={100} /></div>);
    for (const props of [{}, { orientation: 'vertical' as const }, { value: 0 }, { value: 100 }, { disabled: true }]) {
      await screen.rerender(<div className="yarcl-root"><SplitPane {...base} min={0} max={100} {...props} /></div>);
      const audit = await axe.run(screen.container, { rules: { region: { enabled: false } } }); expect(audit.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) }))).toEqual([]);
    }
  });
}
