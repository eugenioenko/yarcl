import { createRef, useState, type ReactElement } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Button, Combobox, Drawer, HoverCard, Menu, Popover, Select, Tooltip } from '@yarcl/react';
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

  for (const controlled of [false, true]) {
    test(`custom combobox searches stay active with ${controlled ? 'controlled' : 'uncontrolled'} values`, async () => {
      function Example() {
        const [value, setValue] = useState<string | null>(null);
        return <form className="yarcl-root"><Combobox name="framework" aria-label="Framework" allowCustomValue
          value={controlled ? value : undefined} onValueChange={setValue}
          options={['React', 'Vue', 'Svelte'].map((label) => ({ value: label, label }))} /></form>;
      }
      const screen = await render(<Example />);
      const input = page.getByRole('combobox', { name: 'Framework', exact: true });
      const value = () => new FormData(screen.container.querySelector('form')!).get('framework');
      await input.fill('Vu');
      expect(await page.getByRole('option').allInnerTexts()).toEqual(['Vue']);
      await page.keyboard.press('Enter');
      expect(await input.inputValue()).toBe('Vue');
      expect(value()).toBe('Vue');
      await input.click();
      expect(await page.getByRole('option').count()).toBe(3);
      await input.fill('Lit');
      expect(await page.getByRole('option').count()).toBe(0);
      await page.keyboard.press('Enter');
      expect(value()).toBe('Lit');
      expect(await input.inputValue()).toBe('Lit');
      await input.click();
      expect(await page.getByRole('option').count()).toBe(3);
    });
  }

  test('a rejected controlled custom value keeps its active draft until blur', async () => {
    const changed = vi.fn();
    await render(<main className="yarcl-root"><Combobox aria-label="Framework" allowCustomValue value="React" onValueChange={changed}
      options={['React', 'Vue'].map((label) => ({ value: label, label }))} /><Button>Done</Button></main>);
    const input = page.getByRole('combobox', { name: 'Framework', exact: true });
    await input.fill('Vu');
    expect(await input.inputValue()).toBe('Vu');
    expect(await page.getByRole('option').allInnerTexts()).toEqual(['Vue']);
    expect(changed).toHaveBeenLastCalledWith('Vu');
    await page.getByRole('button', { name: 'Done', exact: true }).click();
    expect(await input.inputValue()).toBe('React');
    await input.click();
    expect(await page.getByRole('option').count()).toBe(2);
  });

  test('form resets clear the custom search without treating the default label as a query', async () => {
    await render(<form className="yarcl-root"><Combobox aria-label="Framework" allowCustomValue defaultValue="React"
      options={['React', 'Vue', 'Svelte'].map((label) => ({ value: label, label }))} /><button type="reset">Reset</button></form>);
    const input = page.getByRole('combobox', { name: 'Framework', exact: true });
    await input.fill('Vu');
    expect(await page.getByRole('option').allInnerTexts()).toEqual(['Vue']);
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect.poll(() => input.inputValue()).toBe('React');
    await input.click();
    expect(await page.getByRole('option').count()).toBe(3);
  });

  test('panels inside a modal drawer render in the dialog and stay usable', async () => {
    const change = vi.fn();
    await render(<main className="yarcl-root"><Drawer open title="Edit client">
      <Select aria-label="Client type" defaultValue="public" onValueChange={change} options={[
        { value: 'public', label: 'Public' }, { value: 'confidential', label: 'Confidential' },
      ]} />
      <Tooltip content="Drawer tip" delay={0}><Button>Help</Button></Tooltip>
    </Drawer></main>);
    const dialog = document.querySelector('dialog[open]')!;
    await page.getByRole('combobox', { name: 'Client type', exact: true }).click();
    const listbox = document.querySelector('[role="listbox"]')!;
    expect(dialog.contains(listbox)).toBe(true);
    expect(getComputedStyle(listbox as HTMLElement).position).toBe('fixed');
    await page.getByRole('option', { name: 'Confidential', exact: true }).click();
    expect(change).toHaveBeenCalledWith('confidential');
    await page.getByRole('button', { name: 'Help', exact: true }).hover();
    await expect.poll(() => document.querySelector('[role="tooltip"]')).not.toBeNull();
    expect(dialog.contains(document.querySelector('[role="tooltip"]'))).toBe(true);
  });
}
