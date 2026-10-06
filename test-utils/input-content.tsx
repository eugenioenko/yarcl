import { expect, inject, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Button, Field, Input, config, type ComponentSize } from '@yarcl/react';
import { applyTheme, resetTheme } from '@yarcl/react/css';
import { page } from './page';

const icon = <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" /></svg>;

function pixels(value: string) {
  const probe = document.createElement('div');
  probe.style.width = value;
  document.body.append(probe);
  const result = getComputedStyle(probe).width;
  probe.remove();
  return result;
}

function resolveColor(element: Element, variable: string) {
  const probe = document.createElement('span');
  probe.style.color = `var(${variable})`;
  element.append(probe);
  const result = getComputedStyle(probe).color;
  probe.remove();
  return result;
}

/** Checks native input behavior, interactive slots and token styling in both brands. */
export function testInputContent() {
  test('keeps labels, descriptions, validation, refs and native form values on the input', async () => {
    document.documentElement.style.colorScheme = inject('scheme');
    const ref = { current: null as HTMLInputElement | null };
    const changed = vi.fn();
    const screen = await render(<form>
      <Field label="Account amount" description="Amount in US dollars." error="Check the amount." required>
        <Input ref={ref} name="amount" defaultValue="25" onChange={changed} startContent="$" endContent="USD" className="amount-control" style={{ width: '20rem' }} data-testid="amount-field" />
      </Field>
    </form>);
    const input = ref.current!;
    const control = input.parentElement!;
    expect(input.tagName).toBe('INPUT');
    expect(input.getAttribute('name')).toBe('amount');
    expect(input.dataset.testid).toBe('amount-field');
    expect(input.required).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const descriptions = input.getAttribute('aria-describedby')!.split(' ').map((id) => document.getElementById(id)?.textContent);
    expect(descriptions).toEqual(['Amount in US dollars.', 'Check the amount.']);
    expect(screen.container.querySelector('label')?.htmlFor).toBe(input.id);
    expect(control.classList.contains('amount-control')).toBe(true);
    expect(input.classList.contains('amount-control')).toBe(false);
    expect(control.style.width).toBe('20rem');
    expect(input.style.width).toBe('');
    expect(input.hasAttribute('startContent')).toBe(false);
    expect(input.hasAttribute('endContent')).toBe(false);
    expect(control.firstElementChild?.textContent).toBe('$');
    expect(control.lastElementChild?.textContent).toBe('USD');
    expect(getComputedStyle(control).borderTopColor).toBe(resolveColor(control, '--yarcl-error'));
    await page.getByRole('textbox', { name: 'Account amount' }).fill('30');
    expect(changed).toHaveBeenCalled();
    expect(new FormData(screen.container.querySelector('form')!).get('amount')).toBe('30');
  });

  test('hidden inputs and their content stay out of layout while retaining form values', async () => {
    const screen = await render(<form><Input type="hidden" name="token" defaultValue="secret" /></form>);
    const input = screen.container.querySelector('input')!;
    const control = input.parentElement!;
    expect(getComputedStyle(control).display).toBe('none');
    expect(control.getClientRects()).toHaveLength(0);
    expect(new FormData(screen.container.querySelector('form')!).get('token')).toBe('secret');
    await screen.rerender(<form><Input type="hidden" name="token" defaultValue="secret" startContent="Token" endContent={<Button>Token action</Button>} /></form>);
    expect(screen.container.querySelector('input')).toBe(input);
    expect(control.getClientRects()).toHaveLength(0);
    const button = control.querySelector('button')!;
    button.focus();
    expect(document.activeElement).not.toBe(button);
    expect(new FormData(screen.container.querySelector('form')!).get('token')).toBe('secret');
    await screen.rerender(<form><Input type="text" name="token" defaultValue="secret" aria-label="Token" startContent="Token" /></form>);
    expect(screen.container.querySelector('input')).toBe(input);
    expect(control.getClientRects()).toHaveLength(1);
    expect(input.value).toBe('secret');
  });

  test('actions remain keyboard accessible and independently enabled when the input is disabled', async () => {
    const clicked = vi.fn();
    const screen = await render(<Input aria-label="Search" startContent={icon} endContent={<Button onClick={clicked}>Clear search</Button>} />);
    const input = page.getByRole('textbox', { name: 'Search', exact: true });
    await input.focus();
    const control = screen.container.querySelector('.yarcl-input-control')!;
    await expect.poll(() => getComputedStyle(control).outlineStyle).not.toBe('none');
    expect(getComputedStyle(control).borderTopColor).toBe(resolveColor(control, '--yarcl-c'));
    expect(getComputedStyle(screen.container.querySelector('input')!).outlineStyle).toBe('none');
    await page.keyboard.press('Tab');
    const button = page.getByRole('button', { name: 'Clear search' });
    await expect.poll(() => button.evaluate((el) => el === document.activeElement)).toBe(true);
    expect(await button.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
    await page.keyboard.press('Enter');
    expect(clicked).toHaveBeenCalledTimes(1);
    expect(screen.container.querySelector('.yarcl-input-content:last-child')?.hasAttribute('aria-hidden')).toBe(false);
    await screen.rerender(<Input aria-label="Search" disabled startContent={icon} endContent={<Button onClick={clicked}>Clear search</Button>} />);
    expect(await input.isDisabled()).toBe(true);
    expect(await button.isDisabled()).toBe(false);
    await button.click();
    expect(clicked).toHaveBeenCalledTimes(2);
  });

  test('slot changes preserve the native input, uncontrolled value and focus', async () => {
    const ref = { current: null as HTMLInputElement | null };
    const screen = await render(<Input ref={ref} aria-label="Query" defaultValue="Initial" />);
    const native = ref.current!;
    const input = page.getByRole('textbox', { name: 'Query' });
    await input.fill('Keep this text');
    await screen.rerender(<Input ref={ref} aria-label="Query" defaultValue="Initial" startContent={icon} endContent="results" />);
    expect(ref.current).toBe(native);
    expect(native.value).toBe('Keep this text');
    expect(document.activeElement).toBe(native);
    await screen.rerender(<Input ref={ref} aria-label="Query" defaultValue="Initial" startContent={0} endContent={<Button>Run query</Button>} />);
    expect(ref.current).toBe(native);
    expect(native.value).toBe('Keep this text');
    expect(native.parentElement?.firstElementChild?.textContent).toBe('0');
    await screen.rerender(<Input ref={ref} aria-label="Query" defaultValue="Initial" startContent={false} endContent={null} />);
    expect(ref.current).toBe(native);
    expect(native.parentElement?.querySelectorAll('.yarcl-input-content')).toHaveLength(0);
    expect(document.activeElement).toBe(native);
  });

  test('supports constrained widths, multiple actions and logical slot order in RTL', async () => {
    const screen = await render(<Input aria-label="Constrained" dir="rtl" style={{ width: '20rem' }} startContent={icon} endContent={<><Button>Clear</Button><Button>Go</Button></>} />);
    const root = screen.container.querySelector('.yarcl-input-control')!;
    const input = root.querySelector('input')!;
    const start = root.firstElementChild!;
    const end = root.lastElementChild!;
    expect(root.getAttribute('dir')).toBe('rtl');
    expect(input.getAttribute('dir')).toBe('rtl');
    expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
    expect(start.getBoundingClientRect().left).toBeGreaterThanOrEqual(input.getBoundingClientRect().right);
    expect(end.getBoundingClientRect().right).toBeLessThanOrEqual(input.getBoundingClientRect().left);
    expect(end.querySelectorAll('button')).toHaveLength(2);
    for (const button of end.querySelectorAll('button')) expect(button.getBoundingClientRect().height).toBeLessThanOrEqual(root.getBoundingClientRect().height);
    await screen.rerender(<Input aria-label="Constrained" hidden startContent={icon} endContent="USD" />);
    expect(getComputedStyle(root).display).toBe('none');
  });

  test('uses the input tokens at every configured size and follows runtime themes', async () => {
    const shape = config as unknown as {
      defaults: { size: string };
      sizes: Record<string, { height: string; fontSize: string; iconSize: string; paddingX: string }>;
      components?: { Input?: { size?: string; allowedSizes?: readonly string[]; sizeOverrides?: Record<string, Partial<{ height: string; fontSize: string; iconSize: string; paddingX: string }>> } };
    };
    const sizes = (shape.components?.Input?.allowedSizes ?? Object.keys(shape.sizes)) as ComponentSize<'Input'>[];
    const screen = await render(<>{sizes.map((size) => <Input key={size} size={size} aria-label={`Size ${size}`} startContent={icon} endContent="USD" />)}</>);
    const controls = screen.container.querySelectorAll('.yarcl-input-control');
    for (const [index, root] of [...controls].entries()) {
      const token = { ...shape.sizes[sizes[index]], ...shape.components?.Input?.sizeOverrides?.[sizes[index]] };
      expect(getComputedStyle(root).height).toBe(pixels(token.height));
      expect(getComputedStyle(root).paddingInlineStart).toBe(pixels(token.paddingX));
      expect(getComputedStyle(root).gap).toBe(pixels(`calc(${token.paddingX} / 2)`));
      expect(getComputedStyle(root.querySelector('input')!).fontSize).toBe(pixels(token.fontSize));
      expect(getComputedStyle(root.querySelector('svg')!).width).toBe(pixels(token.iconSize));
    }
    await screen.rerender(<Input aria-label="Themed" startContent={icon} endContent="USD" />);
    const input = screen.container.querySelector('input')!;
    const root = input.parentElement!;
    const nextSize = sizes.find((size) => size !== (shape.components?.Input?.size ?? shape.defaults.size))!;
    try {
      applyTheme({ ...config, components: { ...config.components, Input: { size: nextSize, sizeOverrides: undefined } } } as Parameters<typeof applyTheme>[0]);
      await expect.poll(() => getComputedStyle(root).height).toBe(pixels(shape.sizes[nextSize].height));
      expect(getComputedStyle(root.querySelector('svg')!).width).toBe(pixels(shape.sizes[nextSize].iconSize));
      expect(root.querySelector('input')).toBe(input);
    } finally {
      resetTheme();
    }
  });
}
