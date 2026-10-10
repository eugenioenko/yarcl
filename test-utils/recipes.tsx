import { useState } from 'react';
import axe from 'axe-core';
import { afterEach, expect, inject, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Button, createComponent, useRecipe, config, type ExtendedComponentProps } from '@yarcl/react';
import { applyTheme, resetTheme } from '@yarcl/react/css';
import { page } from './page';

const Action = createComponent('Action', Button);
const Status = createComponent('OrderStatus', 'div', ({ rootProps, slots }) => (
  <div {...rootProps}>
    <span className={slots.icon} aria-hidden="true">✓</span>
    <span className={slots.label}>{rootProps.children}</span>
  </div>
));

function InteractiveStatus({ onToggle, ...props }: ExtendedComponentProps<'OrderStatus', 'button'> & { onToggle: () => void }) {
  const { rootProps, slots } = useRecipe('OrderStatus', props);
  return <button {...rootProps} type="button" onClick={onToggle}><span className={slots.label}>{props.children}</span></button>;
}

function pixels(value: string) {
  const probe = document.createElement('div');
  probe.style.width = value;
  document.body.append(probe);
  const result = getComputedStyle(probe).width;
  probe.remove();
  return result;
}

function cssColor(value: string) {
  const probe = document.createElement('span');
  probe.style.color = value;
  document.body.append(probe);
  const result = getComputedStyle(probe).color;
  probe.remove();
  return result;
}

/** Checks typed component extensions and custom slots in both consumers and color schemes. */
export function testRecipes() {
  afterEach(() => resetTheme());

  test('extends Button while preserving native behavior, refs, classes and disabled state', async () => {
    document.documentElement.style.colorScheme = inject('scheme');
    const clicked = vi.fn();
    const ref = { current: null as HTMLButtonElement | null };
    const screen = await render(<Action emphasis="strong" ref={ref} onClick={clicked} className="consumer-action" data-custom="kept">Save changes</Action>);
    const button = screen.container.querySelector('button')!;
    expect(ref.current).toBe(button);
    expect(button.classList.contains('yarcl-button')).toBe(true);
    expect(button.classList.contains('consumer-action')).toBe(true);
    expect(button.getAttribute('data-custom')).toBe('kept');
    expect(button.hasAttribute('emphasis')).toBe(false);
    expect(getComputedStyle(button).fontWeight).toBe('700');
    const buttonRadius = config.recipes.Action.slots.root.borderRadius;
    expect(getComputedStyle(button).borderTopLeftRadius).toBe(pixels(config.radii[buttonRadius.key as keyof typeof config.radii]));
    await page.getByRole('button', { name: 'Save changes' }).focus();
    await page.keyboard.press('Enter');
    expect(clicked).toHaveBeenCalledTimes(1);
    await screen.rerender(<Action emphasis="strong" onClick={clicked} disabled>Save changes</Action>);
    expect(button.disabled).toBe(true);
    expect(button.hasAttribute('disabled')).toBe(true);
  });

  test('keeps Button link and loading semantics and forwards anchor refs', async () => {
    const ref = { current: null as HTMLAnchorElement | null };
    const screen = await render(<Action href="/account" ref={ref} emphasis="strong">Account</Action>);
    expect(ref.current).toBe(screen.container.querySelector('a'));
    expect(ref.current?.getAttribute('href')).toBe('/account');
    expect(ref.current?.hasAttribute('emphasis')).toBe(false);
    expect(await page.getByRole('link', { name: 'Account' }).count()).toBe(1);
    await screen.rerender(<Action loading emphasis="strong">Account</Action>);
    const button = screen.container.querySelector('button')!;
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.querySelector('.yarcl-spinner')).not.toBeNull();
  });

  test('resolves defaults, independent variants and compounds across custom slots', async () => {
    document.documentElement.style.colorScheme = inject('scheme');
    const ref = { current: null as HTMLDivElement | null };
    const screen = await render(<Status ref={ref} id="order-status">Payment pending</Status>);
    const root = ref.current!;
    const icon = root.children[0];
    const label = root.children[1];
    expect(root.id).toBe('order-status');
    expect(root.style.length).toBe(0);
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(getComputedStyle(icon).opacity).toBe('0.5');
    expect(getComputedStyle(icon).color).toBe(cssColor(`var(--yarcl-color-${config.recipes.OrderStatus.slots.icon.color.key})`));
    expect(getComputedStyle(label).fontWeight).toBe('500');
    expect(getComputedStyle(root).display).toBe('inline-flex');
    const gap = config.recipes.OrderStatus.slots.root.gap;
    expect(getComputedStyle(root).gap).toBe(pixels(config.spacing[gap.key as keyof typeof config.spacing]));
    await screen.rerender(<Status status="paid" emphasis="strong">Payment received</Status>);
    expect(getComputedStyle(icon).opacity).toBe('1');
    expect(getComputedStyle(label).fontWeight).toBe('700');
    expect(getComputedStyle(label).textDecorationLine).toBe('underline');
    expect(root.hasAttribute('status')).toBe(false);
    expect(root.hasAttribute('emphasis')).toBe(false);
    await screen.rerender(<Status status="pending" emphasis="strong">Payment pending</Status>);
    expect(getComputedStyle(label).textDecorationLine).toBe('none');
  });

  test('combines literal CSS, externally supplied variables and token references', async () => {
    const screen = await render(<div style={{ '--status-width': '180px' } as React.CSSProperties}><Status>Pending</Status></div>);
    const root = screen.container.querySelector('[class*="yarcl-recipe-"]')!;
    expect(getComputedStyle(root).width).toBe('180px');
    expect(getComputedStyle(root).alignItems).toBe('center');
    expect(root.getAttribute('style')).toBeNull();
  });

  test('useRecipe supports custom state and consumes recipe props without removing native props', async () => {
    function Example() {
      const [paid, setPaid] = useState(false);
      return <InteractiveStatus status={paid ? 'paid' : 'pending'} emphasis={paid ? 'strong' : 'subtle'} onToggle={() => setPaid(!paid)} aria-pressed={paid}>{paid ? 'Paid' : 'Pending'}</InteractiveStatus>;
    }
    const screen = await render(<Example />);
    await page.getByRole('button', { name: 'Pending' }).click();
    const button = screen.container.querySelector('button')!;
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.hasAttribute('status')).toBe(false);
    expect(getComputedStyle(button.firstElementChild!).fontWeight).toBe('700');
    await page.getByRole('button', { name: 'Paid' }).click();
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  test('updates recipe defaults and token values with the active theme and restores them on reset', async () => {
    document.documentElement.style.colorScheme = inject('scheme');
    const screen = await render(<Status>Payment status</Status>);
    const root = screen.container.firstElementChild!;
    const before = getComputedStyle(root).padding;
    const beforeColor = getComputedStyle(root.children[0]).color;
    const gap = config.recipes.OrderStatus.slots.root.padding.key;
    const color = config.recipes.OrderStatus.slots.icon.color.key;
    const next = {
      ...config,
      spacing: { ...config.spacing, [gap]: '3rem' },
      colors: { ...config.colors, [color]: { light: '#111111', dark: '#eeeeee' } },
      recipes: { ...config.recipes, OrderStatus: { ...config.recipes.OrderStatus, defaults: { status: 'paid', emphasis: 'strong' } } },
    };
    applyTheme(next);
    await expect.poll(() => getComputedStyle(root.children[0]).opacity).toBe('1');
    expect(getComputedStyle(root).padding).toBe(pixels('3rem'));
    expect(getComputedStyle(root.children[1]).fontWeight).toBe('700');
    expect(getComputedStyle(root.children[0]).color).not.toBe(beforeColor);
    expect(getComputedStyle(root.children[0]).color).toBe(cssColor(inject('scheme') === 'light' ? '#111111' : '#eeeeee'));
    resetTheme();
    await expect.poll(() => getComputedStyle(root.children[0]).opacity).toBe('0.5');
    expect(getComputedStyle(root).padding).toBe(before);
    expect(getComputedStyle(root.children[0]).color).toBe(beforeColor);
  });

  test('explicit recipe props override runtime defaults', async () => {
    const screen = await render(<Status status="pending" emphasis="subtle">Pending</Status>);
    applyTheme({ ...config, recipes: { ...config.recipes, OrderStatus: { ...config.recipes.OrderStatus, defaults: { status: 'paid', emphasis: 'strong' } } } });
    const root = screen.container.firstElementChild!;
    await expect.poll(() => getComputedStyle(root.children[0]).opacity).toBe('0.5');
    expect(getComputedStyle(root.children[1]).fontWeight).toBe('500');
  });

  test('extensions and custom markup retain accessible names and pass axe', async () => {
    document.documentElement.style.colorScheme = inject('scheme');
    await page.mouse.move(innerWidth - 1, innerHeight - 1);
    const screen = await render(<main className="yarcl-root"><Action>Save changes</Action><Status status="paid">Payment received</Status></main>);
    for (const hover of [false, true]) {
      if (hover) {
        await page.getByRole('button', { name: 'Save changes' }).hover();
        const button = screen.container.querySelector('button')!;
        const target = cssColor(getComputedStyle(button).getPropertyValue('--yarcl-v-bg-hover'));
        await expect.poll(() => getComputedStyle(button).backgroundColor).toBe(target);
      }
      const results = await axe.run(screen.container, { rules: { region: { enabled: false } } });
      expect(results.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ html, failureSummary }) => ({ html, failureSummary })) }))).toEqual([]);
    }
    expect(await page.getByRole('button', { name: 'Save changes' }).count()).toBe(1);
  });
}
