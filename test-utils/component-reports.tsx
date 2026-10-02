import { useState } from 'react';
import { flushSync } from 'react-dom';
import axe from 'axe-core';
import { expect, inject, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Avatar, Badge, Button, Combobox, Menu, Stack, Text } from '@yarcl/react';
import { page } from './page';

const options = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }];

/** Checks the reported menu, account trigger, badge and selected-label behavior in both brands. */
export function testComponentReports() {
  test('single Combobox follows controlled selections and arriving labels without emitting input changes', async () => {
    const onInputValueChange = vi.fn();
    const screen = await render(<Combobox aria-label="Region" options={options} value="a" onInputValueChange={onInputValueChange} />);
    const input = screen.container.querySelector('input')!;
    expect(input.value).toBe('Alpha');
    await screen.rerender(<Combobox aria-label="Region" options={options} value="b" onInputValueChange={onInputValueChange} />);
    expect(input.value).toBe('Beta');
    await screen.rerender(<Combobox aria-label="Region" options={[]} value="b" onInputValueChange={onInputValueChange} />);
    expect(input.value).toBe('');
    await screen.rerender(<Combobox aria-label="Region" options={[{ value: 'b', label: 'Updated region' }]} value="b" onInputValueChange={onInputValueChange} />);
    expect(input.value).toBe('Updated region');
    await screen.rerender(<Combobox aria-label="Region" options={options} value={null} onInputValueChange={onInputValueChange} />);
    expect(input.value).toBe('');
    expect(onInputValueChange).not.toHaveBeenCalled();
  });

  test('single Combobox preserves search text on equivalent options and restores the selection on blur', async () => {
    const screen = await render(<Combobox aria-label="Region" options={options} value="a" />);
    const input = screen.container.querySelector('input')!;
    await page.getByRole('combobox', { name: 'Region' }).fill('Bet');
    await screen.rerender(<Combobox aria-label="Region" options={options.map((option) => ({ ...option }))} value="a" />);
    expect(input.value).toBe('Bet');
    await page.getByRole('option', { name: 'Beta' }).waitFor();
    input.blur();
    await expect.poll(() => input.value).toBe('Alpha');
  });

  test('controlled input text takes precedence over selected values and arriving labels', async () => {
    const onInputValueChange = vi.fn();
    const screen = await render(<Combobox aria-label="Search" options={[]} value="a" inputValue="Query" onInputValueChange={onInputValueChange} />);
    await screen.rerender(<Combobox aria-label="Search" options={options} value="b" inputValue="Query" onInputValueChange={onInputValueChange} />);
    expect(screen.container.querySelector('input')!.value).toBe('Query');
    expect(onInputValueChange).not.toHaveBeenCalled();
  });

  test('a controlled Combobox follows both rejected choices and immediate parent commits', async () => {
    const onValueChange = vi.fn();
    const onInputValueChange = vi.fn();
    const screen = await render(<Combobox aria-label="Region" options={options} value="a" onValueChange={onValueChange} onInputValueChange={onInputValueChange} />);
    await page.getByRole('combobox', { name: 'Region' }).fill('Bet');
    await page.getByRole('option', { name: 'Beta' }).click();
    expect(onValueChange).toHaveBeenLastCalledWith('b');
    expect(onInputValueChange).toHaveBeenLastCalledWith('Beta');
    expect(screen.container.querySelector('input')!.value).toBe('Alpha');

    function ImmediateCombobox() {
      const [value, setValue] = useState<string | null>('a');
      return <Combobox aria-label="Region" options={options} value={value} onValueChange={(next) => flushSync(() => setValue(next))} />;
    }
    await screen.rerender(<ImmediateCombobox />);
    await page.getByRole('combobox', { name: 'Region' }).fill('Bet');
    await page.getByRole('option', { name: 'Beta' }).click();
    expect(screen.container.querySelector('input')!.value).toBe('Beta');
  });

  test('uncontrolled Combobox follows arriving labels and resets its value and label with the form', async () => {
    const onInputValueChange = vi.fn();
    const screen = await render(<form><Combobox aria-label="Region" options={[]} defaultValue="a" onInputValueChange={onInputValueChange} /></form>);
    await screen.rerender(<form><Combobox aria-label="Region" options={options} defaultValue="a" onInputValueChange={onInputValueChange} /></form>);
    const input = screen.container.querySelector('input')!;
    expect(input.value).toBe('Alpha');
    await page.getByRole('combobox', { name: 'Region' }).fill('Bet');
    await page.getByRole('option', { name: 'Beta' }).click();
    expect(input.value).toBe('Beta');
    screen.container.querySelector('form')!.reset();
    await expect.poll(() => input.value).toBe('Alpha');
    expect(onInputValueChange).toHaveBeenLastCalledWith('Alpha');
  });

  test('radio menu choices expose selection, skip disabled items, close and restore focus', async () => {
    document.documentElement.style.colorScheme = inject('scheme');
    const selected = vi.fn();
    const radioRef = { current: null as HTMLButtonElement | null };
    function SchemeMenu() {
      const [value, setValue] = useState('light');
      return <Menu>
        <Menu.Trigger><Button>Appearance</Button></Menu.Trigger>
        <Menu.Content aria-label="Appearance">
          <Menu.RadioGroup aria-label="Color scheme" value={value} onValueChange={(next) => { setValue(next); selected(next); }}>
            <Menu.RadioItem value="light" ref={radioRef}>Light</Menu.RadioItem>
            <Menu.RadioItem value="unavailable" disabled>Unavailable</Menu.RadioItem>
            <Menu.RadioItem value="dark">Dark</Menu.RadioItem>
            <Menu.RadioItem value="system">System</Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Content>
      </Menu>;
    }
    await render(<SchemeMenu />);
    const trigger = page.getByRole('button', { name: 'Appearance' });
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => radioRef.current?.getAttribute('aria-checked')).toBe('true');
    expect(radioRef.current!.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    await expect.poll(() => document.activeElement?.textContent).toBe('Light');
    expect((await axe.run(document.querySelector('[role="menu"]')!)).violations).toEqual([]);
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => document.activeElement?.textContent).toBe('Dark');
    await page.keyboard.press('Enter');
    await expect.poll(() => document.querySelector('[role="menu"]')).toBeNull();
    expect(selected).toHaveBeenLastCalledWith('dark');
    await expect.poll(() => document.activeElement?.textContent).toBe('Appearance');
    await trigger.click();
    await page.getByRole('menuitemradio', { name: 'Dark', checked: true }).waitFor();
    await page.keyboard.press('s');
    await expect.poll(() => document.activeElement?.textContent).toBe('System');
    await page.keyboard.press('Enter');
    await expect.poll(() => document.querySelector('[role="menu"]')).toBeNull();
    expect(selected).toHaveBeenLastCalledWith('system');
    await trigger.click();
    await page.getByRole('menuitemradio', { name: 'Light' }).click();
    expect(selected).toHaveBeenLastCalledWith('light');
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await page.getByRole('menuitemradio', { name: 'Light' }).waitFor();
    await expect.poll(() => document.activeElement?.textContent).toBe('Light');
    await page.keyboard.press('Space');
    await expect.poll(() => document.querySelector('[role="menu"]')).toBeNull();
    expect(selected).toHaveBeenLastCalledWith('light');
  });

  test('account triggers grow to contain both lines and remain usable menu triggers', async () => {
    const ref = { current: null as HTMLButtonElement | null };
    await render(<Menu>
      <Menu.Trigger>
        <Button autoHeight ref={ref}>
          <Avatar name="Ada Lovelace" />
          <Stack><Text>Ada Lovelace</Text><Text>ada@example.com</Text></Stack>
        </Button>
      </Menu.Trigger>
      <Menu.Content><Menu.Item>Sign out</Menu.Item></Menu.Content>
    </Menu>);
    const button = ref.current!;
    const content = button.querySelector('.yarcl-stack')!;
    expect(button.clientHeight).toBeGreaterThan(content.clientHeight);
    expect(content.getBoundingClientRect().bottom).toBeLessThan(button.getBoundingClientRect().bottom);
    expect(button.hasAttribute('autoHeight')).toBe(false);
    await page.getByRole('button', { name: /Ada Lovelace/ }).click();
    await page.getByRole('menuitem', { name: 'Sign out' }).waitFor();
  });

  test('badges truncate or wrap within a narrow container while keeping icons and removal visible', async () => {
    const label = 'Certified Wonderful Enrichment Educator withaverylongunbrokencredentialtitle';
    const remove = vi.fn();
    const screen = await render(<div style={{ width: '10rem' }}>
      <Badge startIcon={<svg aria-hidden="true" />} onRemove={remove}>{label}</Badge>
      <Badge wrap>{label}</Badge>
    </div>);
    const [badge, wrapped] = screen.container.querySelectorAll<HTMLElement>('.yarcl-badge');
    const text = badge.querySelector<HTMLElement>('.yarcl-badge-label')!;
    const wrappedText = wrapped.querySelector<HTMLElement>('.yarcl-badge-label')!;
    expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
    expect(getComputedStyle(text).textOverflow).toBe('ellipsis');
    expect(badge.scrollWidth).toBeLessThanOrEqual(badge.clientWidth);
    expect(wrapped.scrollWidth).toBeLessThanOrEqual(wrapped.clientWidth);
    expect(wrappedText.clientHeight).toBeGreaterThan(text.clientHeight);
    const removeButton = badge.querySelector('button')!;
    expect(removeButton.getBoundingClientRect().right).toBeLessThanOrEqual(badge.getBoundingClientRect().right);
    await page.getByRole('button', { name: 'Remove' }).click();
    expect(remove).toHaveBeenCalledOnce();
  });
}
