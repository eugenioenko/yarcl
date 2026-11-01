import { createRef, type ReactElement } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Button, Combobox, HoverCard, Menu, Popover, Tooltip } from '@yarcl/react';
import { page } from './page';

/** Checks composed floating triggers and combobox searches with both consumer configs. */
export function testFloatingTriggers() {
  beforeEach(async () => { await page.mouse.move(0, 0); });

  for (const kind of ['menu', 'popover'] as const) {
    for (const tooltipOutside of [true, false]) {
      test(`${kind} and tooltip compose with tooltip ${tooltipOutside ? 'outside' : 'inside'}`, async () => {
        const ref = createRef<HTMLButtonElement>();
        const outerRef = createRef<Element>();
        const events: string[] = [];
        const button = <Button ref={ref} onClick={() => events.push('button')}>Actions</Button>;
        const tip = (child: ReactElement) => <Tooltip ref={outerRef} content="Helpful details" delay={0} onClick={() => events.push('tooltip')}>{child}</Tooltip>;
        const trigger = kind === 'menu'
          ? <Menu.Trigger onClick={() => events.push('trigger')}>{tooltipOutside ? button : tip(button)}</Menu.Trigger>
          : <Popover.Trigger onClick={() => events.push('trigger')}>{tooltipOutside ? button : tip(button)}</Popover.Trigger>;
        await render(<main className="yarcl-root">{kind === 'menu'
          ? <Menu>{tooltipOutside ? tip(trigger) : trigger}<Menu.Content><Menu.Item>First action</Menu.Item></Menu.Content></Menu>
          : <Popover>{tooltipOutside ? tip(trigger) : trigger}<Popover.Content aria-label="Action details">Details</Popover.Content></Popover>}
        </main>);
        expect(outerRef.current).toBe(ref.current);
        await page.getByRole('button', { name: 'Actions', exact: true }).hover();
        await expect.poll(() => document.querySelector('[role="tooltip"]')?.textContent).toContain('Helpful details');
        expect(ref.current?.getAttribute('aria-describedby')).toContain(document.querySelector('[role="tooltip"]')!.id);
        await page.getByRole('button', { name: 'Actions', exact: true }).click();
        expect(events).toEqual(tooltipOutside ? ['button', 'trigger', 'tooltip'] : ['button', 'tooltip', 'trigger']);
        await expect.poll(() => document.querySelector(kind === 'menu' ? '[role="menu"]' : '[role="dialog"]')).not.toBeNull();
        await page.keyboard.press('Escape');
        await expect.poll(() => document.querySelector(kind === 'menu' ? '[role="menu"]' : '[role="dialog"]')).toBeNull();
        await page.mouse.move(0, 0);
        ref.current?.blur();
        ref.current?.focus();
        await expect.poll(() => document.querySelector('[role="tooltip"]')).not.toBeNull();
      });
    }
  }

  test('hover cards pass refs, attributes and handlers through nested triggers', async () => {
    const ref = createRef<Element>();
    const click = vi.fn();
    const screen = await render(<main className="yarcl-root"><Popover>
      <Popover.Trigger><HoverCard ref={ref} content="Preview" openDelay={0} className="outer" style={{ opacity: 0.9 }} onClick={click}>
        <Button className="inner">Preview actions</Button>
      </HoverCard></Popover.Trigger><Popover.Content aria-label="Preview actions">Actions</Popover.Content>
    </Popover></main>);
    const button = screen.container.querySelector('button')!;
    expect(ref.current).toBe(button);
    expect(button.classList.contains('outer')).toBe(true);
    expect(button.classList.contains('inner')).toBe(true);
    expect(button.style.opacity).toBe('0.9');
    await page.getByRole('button', { name: 'Preview actions', exact: true }).click();
    expect(click).toHaveBeenCalledOnce();
    await expect.poll(() => document.querySelector('[role="dialog"]')).not.toBeNull();
  });

  test('single combobox reopens all options and filters only an active search', async () => {
    await render(<main className="yarcl-root"><Combobox aria-label="Fruit" defaultValue="apple" options={[
      { value: 'apple', label: 'Apple' }, { value: 'pear', label: 'Pear' }, { value: 'grape', label: 'Grape' },
    ]} /></main>);
    const input = page.getByRole('combobox', { name: 'Fruit', exact: true });
    await input.click();
    expect(await page.getByRole('option').count()).toBe(3);
    await input.fill('Pea');
    expect(await page.getByRole('option').count()).toBe(1);
    await page.getByRole('option', { name: 'Pear', exact: true }).click();
    await input.click();
    expect(await page.getByRole('option').count()).toBe(3);
    await page.keyboard.press('Escape');
  });

  test('controlled combobox text continues filtering when reopened', async () => {
    await render(<main className="yarcl-root"><Combobox aria-label="Search" inputValue="missing" options={[{ value: 'apple', label: 'Apple' }]} emptyMessage="No matches" /></main>);
    await page.getByRole('combobox', { name: 'Search', exact: true }).click();
    expect(await page.getByRole('option').count()).toBe(0);
    expect(document.body.textContent).toContain('No matches');
  });
}
