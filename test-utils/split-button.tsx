import { expect, inject, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { SplitButton, config, type SplitButtonOption } from '@yarcl/react';
import { applyTheme, resetTheme } from '@yarcl/react/css';
import { page } from './page';

const options: SplitButtonOption<'draft' | 'publish' | 'schedule'>[] = [
  { value: 'draft', label: 'Save draft', icon: <svg viewBox="0 0 24 24"><path d="M4 12h16" /></svg> },
  { value: 'publish', label: 'Publish' },
  { value: 'schedule', label: 'Schedule', disabled: true },
];

function pixels(value: string) {
  const probe = document.createElement('div');
  probe.style.width = value;
  document.body.append(probe);
  const result = getComputedStyle(probe).width;
  probe.remove();
  return result;
}

/** Checks action selection, execution, native behavior and config styling in both brands. */
export function testSplitButton() {
  test('selects without executing, exposes checked choices and restores trigger focus', async () => {
    document.documentElement.style.colorScheme = inject('scheme');
    const action = vi.fn();
    const changed = vi.fn();
    const submitted = vi.fn();
    const root = { current: null as HTMLDivElement | null };
    await render(<form onSubmit={(event) => { event.preventDefault(); submitted(); }}>
      <SplitButton ref={root} aria-label="Save actions" options={options} onAction={action} onValueChange={changed} />
    </form>);
    expect(root.current?.getAttribute('role')).toBe('group');
    const trigger = page.getByRole('button', { name: 'Choose action', exact: true });
    const endRadius = await trigger.evaluate((el) => getComputedStyle(el).borderStartEndRadius);
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    expect(action).toHaveBeenLastCalledWith('draft');
    expect(submitted).not.toHaveBeenCalled();
    action.mockClear();
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await page.getByRole('menuitemradio', { name: 'Save draft', checked: true }).waitFor();
    expect(await trigger.evaluate((el) => getComputedStyle(el).borderStartEndRadius)).toBe(endRadius);
    expect(await page.getByRole('menuitemradio', { name: 'Schedule' }).isDisabled()).toBe(true);
    await page.getByRole('menuitemradio', { name: 'Publish' }).click();
    expect(changed).toHaveBeenCalledExactlyOnceWith('publish');
    expect(action).not.toHaveBeenCalled();
    await expect.poll(() => page.getByRole('menu').count()).toBe(0);
    await expect.poll(() => trigger.evaluate((el) => el === document.activeElement)).toBe(true);
    await page.keyboard.press('Shift+Tab');
    await expect.poll(() => page.getByRole('button', { name: 'Publish', exact: true }).evaluate((el) => el === document.activeElement)).toBe(true);
    await page.keyboard.press('Enter');
    expect(action).toHaveBeenLastCalledWith('publish');
    expect(submitted).not.toHaveBeenCalled();
    await trigger.focus();
    await page.keyboard.press('Enter');
    await page.getByRole('menuitemradio', { name: 'Publish', checked: true }).waitFor();
    await page.keyboard.press('End');
    await expect.poll(() => page.getByRole('menuitemradio', { name: 'Publish' }).evaluate((el) => el === document.activeElement)).toBe(true);
    await page.keyboard.press('Home');
    await expect.poll(() => page.getByRole('menuitemradio', { name: 'Save draft' }).evaluate((el) => el === document.activeElement)).toBe(true);
    await page.keyboard.press('p');
    await expect.poll(() => page.getByRole('menuitemradio', { name: 'Publish' }).evaluate((el) => el === document.activeElement)).toBe(true);
    await page.keyboard.press('Escape');
    await expect.poll(() => page.getByRole('menu').count()).toBe(0);
    await expect.poll(() => trigger.evaluate((el) => el === document.activeElement)).toBe(true);
  });

  test('controlled selection waits for the parent and follows updated labels and icons', async () => {
    const changed = vi.fn();
    const action = vi.fn();
    const screen = await render(<SplitButton options={options} value="draft" onValueChange={changed} onAction={action} />);
    await page.getByRole('button', { name: 'Choose action', exact: true }).click();
    await page.getByRole('menuitemradio', { name: 'Publish' }).click();
    expect(changed).toHaveBeenLastCalledWith('publish');
    expect(await page.getByRole('button', { name: 'Save draft', exact: true }).count()).toBe(1);
    await screen.rerender(<SplitButton options={options} value="publish" onAction={action} />);
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    expect(action).toHaveBeenLastCalledWith('publish');
    await screen.rerender(<SplitButton options={[{ value: 'publish', label: 'Publish now', icon: options[0].icon }]} value="publish" />);
    expect(await page.getByRole('button', { name: 'Publish now', exact: true }).count()).toBe(1);
    expect(screen.container.querySelector('.yarcl-button-icon')?.getAttribute('aria-hidden')).toBe('true');
  });

  test('loading and disabled close the menu and disable both segments until unlocked', async () => {
    const screen = await render(<SplitButton options={options} />);
    const trigger = page.getByRole('button', { name: 'Choose action', exact: true });
    await trigger.click();
    await page.getByRole('menu').waitFor();
    await screen.rerender(<SplitButton options={options} loading />);
    await expect.poll(() => page.getByRole('menu').count()).toBe(0);
    expect(await trigger.isDisabled()).toBe(true);
    const action = page.getByRole('button', { name: 'Save draft', exact: true });
    expect(await action.isDisabled()).toBe(true);
    expect(await action.getAttribute('aria-busy')).toBe('true');
    expect(screen.container.querySelector('.yarcl-spinner')).not.toBeNull();
    expect(screen.container.querySelector('.yarcl-button-icon')).toBeNull();
    await screen.rerender(<SplitButton options={options} disabled />);
    expect(await action.isDisabled()).toBe(true);
    expect(await trigger.isDisabled()).toBe(true);
    await screen.rerender(<SplitButton options={options} />);
    expect(await trigger.isDisabled()).toBe(false);
    expect(await page.getByRole('menu').count()).toBe(0);
    await trigger.click();
    await page.getByRole('menu').waitFor();
    await page.keyboard.press('Escape');
  });

  test('handles empty, disabled and removed options without executing an unavailable action', async () => {
    const action = vi.fn();
    const screen = await render(<SplitButton options={[]} onAction={action} dropdownLabel="Change action" placeholder="Select an action" />);
    const trigger = page.getByRole('button', { name: 'Change action', exact: true });
    expect(await trigger.isDisabled()).toBe(true);
    expect(await page.getByRole('button', { name: 'Select an action', exact: true }).isDisabled()).toBe(true);
    await screen.rerender(<SplitButton options={options} value="schedule" onAction={action} dropdownLabel="Change action" />);
    expect(await page.getByRole('button', { name: 'Schedule', exact: true }).isDisabled()).toBe(true);
    expect(await trigger.isDisabled()).toBe(false);
    await screen.rerender(<SplitButton options={options.slice(1)} value="draft" onAction={action} dropdownLabel="Change action" />);
    expect(await page.getByRole('button', { name: 'Choose action', exact: true }).isDisabled()).toBe(true);
    expect(await trigger.isDisabled()).toBe(false);
    await screen.rerender(<SplitButton options={options.map((option) => ({ ...option, disabled: true }))} onAction={action} dropdownLabel="Change action" />);
    expect(await trigger.isDisabled()).toBe(true);
    expect(action).not.toHaveBeenCalled();
    await screen.rerender(<SplitButton key="first-enabled" options={[{ value: 'a', label: 'Unavailable', disabled: true }, { value: 'b', label: 'Available' }]} />);
    expect(await page.getByRole('button', { name: 'Available', exact: true }).isDisabled()).toBe(false);
  });

  test('both segments use component defaults, overrides and runtime theme changes', async () => {
    const screen = await render(<SplitButton options={options} />);
    const shape = config as unknown as {
      defaults: { size: string; radius: string; color: string; variant: string };
      sizes: Record<string, { height: string; paddingX: string; fontSize: string; iconSize: string }>;
      components?: { SplitButton?: { size?: string; radius?: string; color?: string; variant?: string; sizeOverrides?: Record<string, Partial<{ height: string; paddingX: string; fontSize: string; iconSize: string }>> } };
    };
    const own = shape.components?.SplitButton;
    const size = own?.size ?? shape.defaults.size;
    const token = { ...shape.sizes[size], ...own?.sizeOverrides?.[size] };
    const buttons = screen.container.querySelectorAll('button');
    for (const button of buttons) {
      expect(button.classList.contains(`yarcl-sized-SplitButton`)).toBe(true);
      expect(button.classList.contains(`yarcl-color-${own?.color ?? shape.defaults.color}`)).toBe(true);
      expect(button.classList.contains(`yarcl-variant-${own?.variant ?? shape.defaults.variant}`)).toBe(true);
      expect(getComputedStyle(button).height).toBe(pixels(token.height));
      expect(getComputedStyle(button).fontSize).toBe(pixels(token.fontSize));
      expect(getComputedStyle(button.querySelector('svg')!).width).toBe(pixels(token.iconSize));
    }
    expect(getComputedStyle(buttons[0]).paddingInlineStart).toBe(pixels(token.paddingX));
    expect(getComputedStyle(buttons[1]).width).toBe(pixels(token.height));
    expect(getComputedStyle(buttons[0]).borderStartEndRadius).toBe('0px');
    expect(getComputedStyle(buttons[1]).borderStartStartRadius).toBe('0px');
    const nextSize = Object.keys(shape.sizes).find((key) => key !== size)!;
    try {
      applyTheme({ ...config, components: { ...config.components, SplitButton: { size: nextSize, sizeOverrides: undefined } } } as Parameters<typeof applyTheme>[0]);
      await expect.poll(() => getComputedStyle(buttons[0]).height).toBe(pixels(shape.sizes[nextSize].height));
      expect(getComputedStyle(buttons[1]).height).toBe(pixels(shape.sizes[nextSize].height));
    } finally {
      resetTheme();
    }
  });
}
