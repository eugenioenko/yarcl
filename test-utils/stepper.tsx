import axe from 'axe-core';
import { createRef, useState } from 'react';
import { afterEach, beforeEach, expect, inject, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Button, Stepper, config, type StepperItem, type Color, type Radius, type Size, type Spacing } from '@yarcl/react';
import { applyTheme, resetTheme } from '@yarcl/react/css';
import { themes } from '@yarcl/react/themes';
import { page } from './page';

const items = [
  { id: 'details', label: 'Details', description: 'Your information', completed: true },
  { id: 'payment', label: 'Payment', description: 'Your card' },
  { id: 'blocked', label: 'Blocked', disabled: true },
  { id: 'review', label: 'Review' },
] as const satisfies readonly StepperItem[];
const button = (name: string) => page.getByRole('button', { name, exact: true });
const current = () => document.querySelector('.yarcl-stepper [aria-current="step"]');
const focused = () => document.activeElement?.getAttribute('aria-labelledby');
async function key(value: string) { await page.keyboard.press(value); }
function pixels(value: string) { const probe = document.createElement('div'); probe.style.width = value; document.body.append(probe); const result = getComputedStyle(probe).width; probe.remove(); return result; }

/** Exercises ordered progress, activation, roving focus, dynamic data, copy and consumer tokens. */
export function testStepper() {
  beforeEach(async () => { await page.throttleCpu(); document.documentElement.style.colorScheme = inject('scheme'); await page.mouse.move(innerWidth - 1, innerHeight - 1); });
  afterEach(() => resetTheme());

  test('renders a named ordered list with current, completed and disabled stages', async () => {
    const screen = await render(<Stepper aria-label="Checkout" items={items} defaultValue="payment" />);
    expect(screen.container.querySelector('ol')?.getAttribute('aria-label')).toBe('Checkout');
    expect(screen.container.querySelectorAll('li')).toHaveLength(4); expect(current()).toBe(await button('Payment').element());
    expect((await button('Details').element()).closest('li')?.hasAttribute('data-completed')).toBe(true);
    expect((await button('Blocked').element() as HTMLButtonElement).disabled).toBe(true);
    expect(screen.container.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  });

  test('step labels exclude supporting descriptions from the accessible name', async () => {
    const screen = await render(<Stepper aria-label="Checkout" items={items} />);
    const details = await button('Details').element();
    const description = details.getAttribute('aria-describedby')!.split(' ').map((id) => document.getElementById(id)?.textContent).join(' ');
    expect(description).toBe(`Your information ${config.labels.stepCompleted}`);
    expect(screen.container.querySelector('.yarcl-stepper-indicator')?.getAttribute('aria-hidden')).toBe('true');
  });

  test('uncontrolled current stage starts at the first enabled item', async () => {
    await render(<Stepper aria-label="Checkout" items={[{ id: 'blocked', label: 'Blocked', disabled: true }, { id: 'details', label: 'Details' }]} />);
    expect(current()).toBe(await button('Details').element());
  });

  test('explicit null represents no current stage', async () => {
    const screen = await render(<Stepper aria-label="Checkout" items={items} defaultValue={null} />);
    expect(current()).toBeNull(); expect(screen.container.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  });

  test('arrow focus skips disabled stages without changing current state', async () => {
    const change = vi.fn(); await render(<Stepper aria-label="Checkout" items={items} onValueChange={change} />);
    await button('Details').focus(); await key('ArrowRight'); expect(document.activeElement).toBe(await button('Payment').element());
    await key('ArrowRight'); expect(document.activeElement).toBe(await button('Review').element());
    await key('ArrowRight'); expect(document.activeElement).toBe(await button('Review').element());
    await key('ArrowLeft'); expect(document.activeElement).toBe(await button('Payment').element());
    expect(current()).toBe(await button('Details').element()); expect(change).not.toHaveBeenCalled();
  });

  test('Home and End focus enabled edges and backward movement clamps', async () => {
    await render(<Stepper aria-label="Checkout" items={items} />); await button('Payment').focus(); await key('End');
    expect(document.activeElement).toBe(await button('Review').element()); await key('Home'); await key('ArrowLeft'); expect(document.activeElement).toBe(await button('Details').element());
  });

  test('vertical steps use up/down and ignore horizontal navigation', async () => {
    await render(<Stepper aria-label="Checkout" items={items} orientation="vertical" />); await button('Details').focus();
    await key('ArrowDown'); expect(document.activeElement).toBe(await button('Payment').element()); await key('ArrowRight'); expect(document.activeElement).toBe(await button('Payment').element());
    await key('ArrowUp'); expect(document.activeElement).toBe(await button('Details').element());
  });

  test('RTL mirrors horizontal movement', async () => {
    await render(<Stepper aria-label="Checkout" items={items} dir="rtl" />); await button('Details').focus();
    await key('ArrowLeft'); expect(document.activeElement).toBe(await button('Payment').element()); await key('ArrowRight'); expect(document.activeElement).toBe(await button('Details').element());
  });

  test('Enter and Space activate focused stages using native buttons', async () => {
    const change = vi.fn(); await render(<Stepper aria-label="Checkout" items={items} onValueChange={change} />);
    await button('Payment').focus(); await key('Enter'); expect(current()).toBe(await button('Payment').element()); expect(change).toHaveBeenLastCalledWith('payment');
    await key('End'); await key('Space'); expect(current()).toBe(await button('Review').element()); expect(change).toHaveBeenLastCalledWith('review'); expect(change).toHaveBeenCalledTimes(2);
  });

  test('click activates a stage and clicking the current stage does not repeat callbacks', async () => {
    const change = vi.fn(); await render(<Stepper aria-label="Checkout" items={items} onValueChange={change} />);
    await button('Payment').click(); await button('Payment').click(); expect(change).toHaveBeenCalledTimes(1); expect(document.activeElement).toBe(await button('Payment').element());
  });

  test('disabled stages cannot activate even through a dispatched click', async () => {
    const change = vi.fn(); await render(<Stepper aria-label="Checkout" items={items} onValueChange={change} />);
    (await button('Blocked').element()).dispatchEvent(new MouseEvent('click', { bubbles: true })); expect(change).not.toHaveBeenCalled(); expect(current()).toBe(await button('Details').element());
  });

  test('controlled stages report requests and wait for acceptance', async () => {
    const change = vi.fn(); const screen = await render(<Stepper aria-label="Checkout" items={items} value="details" onValueChange={change} />);
    await button('Payment').click(); expect(change).toHaveBeenLastCalledWith('payment'); expect(current()).toBe(await button('Details').element());
    await screen.rerender(<Stepper aria-label="Checkout" items={items} value="payment" onValueChange={change} />); expect(current()).toBe(await button('Payment').element());
  });

  test('controlled parent updates progress and can clear the current stage', async () => {
    function Example() { const [value, setValue] = useState<string | null>('details'); return <><Stepper aria-label="Checkout" items={items} value={value as 'details' | 'payment' | 'blocked' | 'review' | null} onValueChange={setValue} /><Button onClick={() => setValue(null)}>Finish</Button></>; }
    await render(<Example />); await button('Payment').click(); expect(current()).toBe(await button('Payment').element()); await button('Finish').click(); expect(current()).toBeNull();
  });

  test('completion is independent of order and does not change on activation', async () => {
    const screen = await render(<Stepper aria-label="Checkout" items={[{ id: 'first', label: 'First' }, { id: 'last', label: 'Last', completed: true }]} />);
    await button('Last').click(); expect(screen.container.querySelectorAll('[data-completed]')).toHaveLength(1); expect(current()).toBe(await button('Last').element());
    expect((await button('First').element()).closest('li')?.hasAttribute('data-completed')).toBe(false);
  });

  test('read-only progress keeps ordered semantics and current state without buttons', async () => {
    const screen = await render(<Stepper aria-label="Checkout" items={items} value="payment" readOnly />);
    expect(screen.container.querySelectorAll('button')).toHaveLength(0); expect(current()?.tagName).toBe('LI'); expect(screen.container.querySelectorAll('[aria-current]')).toHaveLength(1);
    expect(screen.container.querySelector('ol')?.tabIndex).toBe(-1); expect(screen.container.textContent).toContain(config.labels.stepCompleted);
  });

  test('read-only progress never activates through pointer or keyboard input', async () => {
    const change = vi.fn(); const screen = await render(<Stepper aria-label="Checkout" items={items} readOnly onValueChange={change} />);
    const root = screen.container.querySelector('ol')!; root.focus(); await key('End'); screen.container.querySelectorAll('[data-part="item"]')[1].dispatchEvent(new MouseEvent('click', { bubbles: true })); expect(change).not.toHaveBeenCalled();
  });

  test('disabling the root removes every stage from keyboard interaction', async () => {
    const change = vi.fn(); const screen = await render(<Stepper aria-label="Checkout" items={items} disabled onValueChange={change} />);
    expect(screen.container.querySelectorAll('[tabindex="0"]')).toHaveLength(0); expect(screen.container.querySelectorAll('button:disabled')).toHaveLength(4);
    expect(screen.container.querySelector('ol')?.getAttribute('aria-disabled')).toBe('true'); expect(change).not.toHaveBeenCalled();
  });

  test('native key handlers can prevent focus movement and activation', async () => {
    const change = vi.fn(); await render(<Stepper aria-label="Checkout" items={items} onValueChange={change} onKeyDown={(event) => event.preventDefault()} />);
    await button('Payment').focus(); const id = focused(); await key('ArrowRight'); await key('Enter'); expect(focused()).toBe(id); expect(change).not.toHaveBeenCalled();
  });

  test('native click handlers can prevent activation', async () => {
    const change = vi.fn(); await render(<Stepper aria-label="Checkout" items={items} onValueChange={change} onClick={(event) => event.preventDefault()} />);
    await button('Payment').click(); expect(change).not.toHaveBeenCalled(); expect(current()).toBe(await button('Details').element());
  });

  test('one tab enters the current stage and the next leaves the stepper', async () => {
    await render(<><Button>Before</Button><Stepper aria-label="Checkout" items={items} defaultValue="payment" /><Button>After</Button></>);
    await button('Before').click(); await key('Tab'); expect(document.activeElement).toBe(await button('Payment').element());
    const style = getComputedStyle(document.activeElement!); expect(style.outlineStyle).toBe((config.focusRing as { style?: string }).style ?? 'solid'); expect(style.outlineWidth).toBe(pixels(config.focusRing.width));
    await key('Tab'); expect(document.activeElement).toBe(await button('After').element());
  });

  test('removing the focused stage restores focus to an enabled stage', async () => {
    const screen = await render(<Stepper aria-label="Checkout" items={items} />); await button('Payment').focus();
    await screen.rerender(<Stepper aria-label="Checkout" items={items.filter((item) => item.id !== 'payment')} />);
    await expect.poll(() => document.activeElement).toBe(await button('Details').element());
  });

  test('disabling the focused stage moves focus to an enabled stage', async () => {
    const screen = await render(<Stepper aria-label="Checkout" items={items} />); await button('Payment').focus();
    await screen.rerender(<Stepper aria-label="Checkout" items={items.map((item) => ({ ...item, disabled: item.id === 'payment' || ('disabled' in item && item.disabled) }))} />);
    await expect.poll(() => document.activeElement).toBe(await button('Details').element());
  });

  test('switching to read-only preserves focus within the named list', async () => {
    const screen = await render(<Stepper aria-label="Checkout" items={items} />); await button('Payment').focus();
    await screen.rerender(<Stepper aria-label="Checkout" items={items} readOnly />); await expect.poll(() => document.activeElement).toBe(screen.container.querySelector('ol'));
  });

  test('external changes never steal focus from another control', async () => {
    const screen = await render(<><Button>Outside</Button><Stepper aria-label="Checkout" items={items} /></>); await button('Outside').click(); const outside = document.activeElement;
    await screen.rerender(<><Button>Outside</Button><Stepper aria-label="Checkout" items={[]} /></>); expect(document.activeElement).toBe(outside);
  });

  test('empty and entirely disabled sequences remain named and discoverable', async () => {
    const screen = await render(<Stepper aria-label="Checkout" items={[]} />); const root = screen.container.querySelector('ol')!; expect(root.tabIndex).toBe(0); expect(root.getAttribute('aria-label')).toBe('Checkout');
    await screen.rerender(<Stepper aria-label="Checkout" items={[{ id: 'blocked', label: 'Blocked', disabled: true }]} />); expect(root.tabIndex).toBe(0); expect(current()).toBeNull();
  });

  test('native refs, naming references, attributes and token dimensions work', async () => {
    const ref = createRef<HTMLOListElement>(); const size = Object.keys(config.sizes)[0] as Size, color = Object.keys(config.colors)[0] as Color, radius = Object.keys(config.radii)[0] as Radius;
    await render(<><span id="checkout-label">Checkout</span><Stepper aria-labelledby="checkout-label" ref={ref} items={items} size={size} color={color} radius={radius} className="custom-stepper" data-owner="Sam" /></>);
    expect(ref.current?.tagName).toBe('OL'); expect(ref.current?.getAttribute('data-owner')).toBe('Sam'); expect(ref.current?.className).toContain('custom-stepper'); expect(ref.current?.className).toContain(`yarcl-color-${color}`);
    const indicator = ref.current!.querySelector('.yarcl-stepper-indicator')!; expect(getComputedStyle(indicator).height).toBe(pixels(config.sizes[size].height)); expect(getComputedStyle(indicator).borderRadius).toBe(pixels(config.radii[radius])); expect(ref.current?.style.length).toBe(0);
  });

  test('runtime component defaults and size overrides apply to indicators', async () => {
    const size = Object.keys(config.sizes)[0] as Size; applyTheme({ ...config, components: { ...config.components, Stepper: { size, sizeOverrides: { [size]: { height: '52px' } } } } });
    const screen = await render(<Stepper aria-label="Checkout" items={items} />); expect(getComputedStyle(screen.container.querySelector('.yarcl-stepper-indicator')!).height).toBe('52px');
  });

  test('responsive spacing resolves from this consumer and follows its breakpoints', async () => {
    const gap = Object.keys(config.spacing)[0] as Spacing; const later = Object.keys(config.spacing).at(-1) as Spacing;
    const screen = await render(<Stepper aria-label="Checkout" items={items} gap={{ base: gap, lg: later }} />); const root = screen.container.querySelector('ol')!;
    await page.setViewportSize({ width: 390, height: 800 }); await expect.poll(() => innerWidth).toBe(390); await expect.poll(() => getComputedStyle(root).gap).toBe(pixels(config.spacing[gap]));
    await page.setViewportSize({ width: 1400, height: 800 }); await expect.poll(() => innerWidth).toBe(1400); await expect.poll(() => getComputedStyle(root).gap).toBe(pixels(config.spacing[later]));
    await page.setViewportSize({ width: 1100, height: 800 });
  });

  test('runtime theme updates retain progress, content identity and focus', async () => {
    const screen = await render(<Stepper aria-label="Checkout" items={items} defaultValue="payment" />); await button('Review').focus(); const target = document.activeElement, first = screen.container.querySelector('li');
    applyTheme(themes.brutalist); await expect.poll(() => document.activeElement).toBe(target); expect(current()).toBe(await button('Payment').element()); expect(screen.container.querySelector('li')).toBe(first);
  });

  test('completion copy changes with the runtime language catalog', async () => {
    const screen = await render(<Stepper aria-label="Checkout" items={items} />); applyTheme({ ...config, labels: { ...config.labels, stepCompleted: 'Terminé' } });
    await expect.poll(() => screen.container.querySelector('[id$="-completed"]')?.textContent).toBe('Terminé');
  });

  test('hovered stage descriptions keep accessible contrast', async () => {
    applyTheme(themes.yarcl);
    const screen = await render(<div className="yarcl-root"><Stepper aria-label="Checkout" items={items} defaultValue="payment" /></div>);
    const rect = (await button('Payment').element()).getBoundingClientRect(); await page.mouse.move(rect.left + rect.width / 2, rect.top + rect.height / 2);
    const audit = await axe.run(screen.container, { rules: { region: { enabled: false } } }); expect(audit.violations.map(({ id }) => id)).toEqual([]);
  });

  test.each(['yarcl', 'brutalist'] as const)('passes axe for interactive, static, vertical and disabled progress in %s', async (theme) => {
    applyTheme(themes[theme]); const screen = await render(<div className="yarcl-root"><Stepper aria-label="Checkout" items={items} defaultValue="payment" /></div>);
    for (const props of [{}, { orientation: 'vertical' as const }, { readOnly: true }, { disabled: true }, { value: null }]) {
      await screen.rerender(<div className="yarcl-root"><Stepper aria-label="Checkout" items={items} defaultValue="payment" {...props} /></div>);
      const audit = await axe.run(screen.container, { rules: { region: { enabled: false } } }); expect(audit.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) }))).toEqual([]);
    }
  });
}
