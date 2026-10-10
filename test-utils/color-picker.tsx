import axe from 'axe-core';
import { createRef, useState } from 'react';
import { afterEach, beforeEach, expect, inject, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Button, ColorPicker, Field, config, type Color, type Radius, type Size, type ColorPickerValue } from '@yarcl/react';
import { applyTheme, resetTheme } from '@yarcl/react/css';
import { themes } from '@yarcl/react/themes';
import { page } from './page';

const presets = [{ value: '#123456', label: 'Ocean' }, { value: '#abcdef', label: 'Sky' }, { value: '#fff', label: 'White', disabled: true }] as const;
const text = () => page.getByRole('textbox', { name: 'Accent', exact: true });
const input = () => document.querySelector<HTMLInputElement>('.yarcl-color-picker-hex')!;
const chooser = () => document.querySelector<HTMLInputElement>('.yarcl-color-picker-native')!;
const button = (name: string) => page.getByRole('button', { name, exact: true });
const preset = (name: string) => button(name);
function pixels(value: string) { const probe = document.createElement('div'); probe.style.width = value; document.body.append(probe); const result = getComputedStyle(probe).width; probe.remove(); return result; }
async function choose(value: ColorPickerValue) {
  const target = chooser(); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(target, value); target.dispatchEvent(new Event('input', { bubbles: true })); target.dispatchEvent(new Event('change', { bubbles: true }));
  await expect.poll(() => chooser().value).toBe(value);
}

/** Exercises keyboard drafts, native color selection, accepted form data, reset, labels and consumer tokens. */
export function testColorPicker() {
  beforeEach(async () => { await page.throttleCpu(); document.documentElement.style.colorScheme = inject('scheme'); await page.mouse.move(innerWidth - 1, innerHeight - 1); });
  afterEach(() => resetTheme());

  test('normalizes shorthand and case in text, preview, presets and submitted state', async () => {
    const screen = await render(<form><ColorPicker aria-label="Accent" defaultValue="#AbC" presets={[{ value: '#abc', label: 'Sky' }]} name="accent" /></form>);
    expect(input().value).toBe('#aabbcc'); expect(chooser().value).toBe('#aabbcc'); expect(await preset('Sky').getAttribute('aria-pressed')).toBe('true');
    expect(new FormData(screen.container.querySelector('form')!).getAll('accent')).toEqual(['#aabbcc']);
  });

  test('typing is a draft until Enter commits without changing the focused input', async () => {
    const change = vi.fn(); await render(<ColorPicker aria-label="Accent" defaultValue="#123456" onValueChange={change} />);
    await text().fill('#ABC'); expect(chooser().value).toBe('#123456'); expect(change).not.toHaveBeenCalled();
    await page.keyboard.press('Enter'); expect(input().value).toBe('#aabbcc'); expect(chooser().value).toBe('#aabbcc'); expect(change).toHaveBeenCalledExactlyOnceWith('#aabbcc'); expect(document.activeElement).toBe(input());
  });

  test('blur commits valid text, including surrounding whitespace', async () => {
    const change = vi.fn(); await render(<><ColorPicker aria-label="Accent" defaultValue="#123456" onValueChange={change} /><Button>Outside</Button></>);
    await text().fill('  #ABCDEF  '); expect(input().checkValidity()).toBe(true); await button('Outside').click(); expect(input().value).toBe('#abcdef'); expect(change).toHaveBeenCalledExactlyOnceWith('#abcdef');
  });

  test.each(['#12', '#12345g', 'rgb(1 2 3)', ''])('invalid draft %s exposes invalid state and restores the accepted color on Enter', async (draft) => {
    const change = vi.fn(); await render(<ColorPicker aria-label="Accent" defaultValue="#123456" onValueChange={change} />);
    await text().fill(draft); expect(input().getAttribute('aria-invalid')).toBe('true'); await page.keyboard.press('Enter'); expect(input().value).toBe('#123456'); expect(input().hasAttribute('aria-invalid')).toBe(false); expect(change).not.toHaveBeenCalled();
  });

  test('invalid blur restores accepted text without reporting a change', async () => {
    const change = vi.fn(); await render(<><ColorPicker aria-label="Accent" defaultValue="#123456" onValueChange={change} /><Button>Outside</Button></>);
    await text().fill('#xyz'); await button('Outside').click(); expect(input().value).toBe('#123456'); expect(change).not.toHaveBeenCalled();
  });

  test('Escape restores the accepted color and retains focus', async () => {
    const change = vi.fn(); await render(<ColorPicker aria-label="Accent" defaultValue="#123456" onValueChange={change} />);
    await text().fill('#abc'); await page.keyboard.press('Escape'); expect(input().value).toBe('#123456'); expect(document.activeElement).toBe(input()); expect(change).not.toHaveBeenCalled();
  });

  test('controlled requests wait for accepted props in preview, presets, text and form data', async () => {
    const change = vi.fn(); const screen = await render(<form><ColorPicker aria-label="Accent" value="#123456" onValueChange={change} name="accent" presets={presets} /></form>);
    await preset('Sky').click(); expect(change).toHaveBeenCalledExactlyOnceWith('#abcdef'); expect(input().value).toBe('#123456'); expect(chooser().value).toBe('#123456'); expect(new FormData(screen.container.querySelector('form')!).get('accent')).toBe('#123456');
    await screen.rerender(<form><ColorPicker aria-label="Accent" value="#abcdef" onValueChange={change} name="accent" presets={presets} /></form>);
    expect(input().value).toBe('#abcdef'); expect(chooser().value).toBe('#abcdef'); expect(await preset('Sky').getAttribute('aria-pressed')).toBe('true');
  });

  test('controlled text requests restore the accepted value when the parent declines', async () => {
    const change = vi.fn(); await render(<ColorPicker aria-label="Accent" value="#123456" onValueChange={change} />);
    await text().fill('#ABC'); await page.keyboard.press('Enter'); expect(change).toHaveBeenCalledExactlyOnceWith('#aabbcc'); expect(input().value).toBe('#123456'); expect(chooser().value).toBe('#123456');
  });

  test('external controlled updates preserve a draft until Escape restores the newest color', async () => {
    const screen = await render(<ColorPicker aria-label="Accent" value="#123456" />); await text().fill('#12');
    await screen.rerender(<ColorPicker aria-label="Accent" value="#abcdef" />); expect(input().value).toBe('#12'); expect(chooser().value).toBe('#abcdef');
    await page.keyboard.press('Escape'); expect(input().value).toBe('#abcdef');
  });

  test('controlled accepted selection works through state callbacks', async () => {
    function Example() { const [value, setValue] = useState<ColorPickerValue>('#123456'); return <ColorPicker aria-label="Accent" value={value} onValueChange={setValue} presets={presets} />; }
    await render(<Example />); await preset('Sky').click(); expect(input().value).toBe('#abcdef'); expect(chooser().value).toBe('#abcdef');
  });

  test('preset buttons support Enter and Space and skip disabled suggestions', async () => {
    const change = vi.fn(); await render(<ColorPicker aria-label="Accent" defaultValue="#123456" onValueChange={change} presets={presets} />);
    await preset('Sky').focus(); await page.keyboard.press('Enter'); expect(input().value).toBe('#abcdef');
    await preset('Ocean').focus(); await page.keyboard.press('Space'); expect(input().value).toBe('#123456'); expect(change).toHaveBeenCalledTimes(2);
    expect((await preset('White').element() as HTMLButtonElement).disabled).toBe(true);
    await preset('Sky').focus(); await page.keyboard.press('Tab'); expect(document.activeElement).not.toBe(await preset('White').element());
  });

  test('selecting the accepted color does not repeat callbacks', async () => {
    const change = vi.fn(); await render(<ColorPicker aria-label="Accent" defaultValue="#123456" onValueChange={change} presets={presets} />);
    await preset('Ocean').click(); await text().fill('#123456'); await page.keyboard.press('Enter'); expect(change).not.toHaveBeenCalled();
  });

  test('native chooser changes update the accepted hex value and callback', async () => {
    const change = vi.fn(); await render(<ColorPicker aria-label="Accent" defaultValue="#123456" onValueChange={change} />);
    await choose('#abcdef'); expect(input().value).toBe('#abcdef'); expect(change).toHaveBeenCalledExactlyOnceWith('#abcdef');
  });

  test('native form data contains a single accepted color even during an invalid text draft', async () => {
    const screen = await render(<form><ColorPicker aria-label="Accent" defaultValue="#123456" name="accent" /></form>);
    await text().fill('#12'); expect(input().checkValidity()).toBe(false); expect(new FormData(screen.container.querySelector('form')!).getAll('accent')).toEqual(['#123456']);
  });

  test('first Enter commits a draft and second Enter submits the normalized color', async () => {
    const submit = vi.fn(); await render(<form onSubmit={(event) => { event.preventDefault(); submit(new FormData(event.currentTarget).get('accent')); }}><ColorPicker aria-label="Accent" defaultValue="#123456" name="accent" /><button type="submit">Submit</button></form>);
    await text().fill('#ABC'); await page.keyboard.press('Enter'); expect(submit).not.toHaveBeenCalled(); await page.keyboard.press('Enter'); expect(submit).toHaveBeenCalledExactlyOnceWith('#aabbcc');
  });

  test.each(['button', 'programmatic'] as const)('accepted %s reset restores uncontrolled defaults and clears partial drafts', async (trigger) => {
    const change = vi.fn(); const screen = await render(<form><ColorPicker aria-label="Accent" defaultValue="#123456" name="accent" onValueChange={change} presets={presets} /><button type="reset">Reset</button></form>);
    await preset('Sky').click(); await text().fill('#12'); const form = screen.container.querySelector('form')!;
    if (trigger === 'button') await button('Reset').click(); else form.reset();
    await expect.poll(() => input().value).toBe('#123456'); expect(chooser().value).toBe('#123456'); expect(new FormData(form).get('accent')).toBe('#123456'); expect(change).toHaveBeenLastCalledWith('#123456');
  });

  test('canceled reset preserves the accepted value and text draft', async () => {
    const change = vi.fn(); const screen = await render(<form onReset={(event) => event.preventDefault()}><ColorPicker aria-label="Accent" defaultValue="#123456" onValueChange={change} presets={presets} /></form>);
    await preset('Sky').click(); await text().fill('#12'); screen.container.querySelector('form')!.reset(); await new Promise<void>((resolve) => setTimeout(resolve, 0));
    await expect.poll(() => input().value).toBe('#12'); expect(chooser().value).toBe('#abcdef'); expect(change).toHaveBeenCalledTimes(1);
  });

  test('controlled reset clears a draft and keeps the accepted prop without a change callback', async () => {
    const change = vi.fn(); const screen = await render(<form><ColorPicker aria-label="Accent" value="#abcdef" name="accent" onValueChange={change} /></form>);
    await text().fill('#12'); screen.container.querySelector('form')!.reset(); await expect.poll(() => input().value).toBe('#abcdef'); expect(chooser().value).toBe('#abcdef'); expect(change).not.toHaveBeenCalled();
  });

  test('explicit form association submits and resets a control outside the form', async () => {
    const screen = await render(<><form id="preferences" /><ColorPicker aria-label="Accent" defaultValue="#123456" name="accent" form="preferences" presets={presets} /></>);
    const form = screen.container.querySelector('form')!; await preset('Sky').click(); expect(new FormData(form).getAll('accent')).toEqual(['#abcdef']);
    await text().fill('#12'); form.reset(); await expect.poll(() => input().value).toBe('#123456'); expect(new FormData(form).get('accent')).toBe('#123456');
  });

  test('disabled controls block changes and do not submit', async () => {
    const change = vi.fn(); const screen = await render(<form><ColorPicker aria-label="Accent" defaultValue="#123456" name="accent" onValueChange={change} presets={presets} disabled /></form>);
    expect(input().disabled).toBe(true); expect(chooser().disabled).toBe(true); expect((await preset('Sky').element() as HTMLButtonElement).disabled).toBe(true); expect(new FormData(screen.container.querySelector('form')!).has('accent')).toBe(false); expect(change).not.toHaveBeenCalled();
  });

  test('read-only controls keep text focusable and submitted while locking chooser and presets', async () => {
    const change = vi.fn(); const screen = await render(<form><ColorPicker aria-label="Accent" value="#123456" name="accent" onValueChange={change} presets={presets} readOnly /></form>);
    expect(input().readOnly).toBe(true); expect(input().disabled).toBe(false); await text().focus(); expect(document.activeElement).toBe(input()); expect(chooser().disabled).toBe(true);
    expect((await preset('Sky').element() as HTMLButtonElement).disabled).toBe(true); expect(new FormData(screen.container.querySelector('form')!).get('accent')).toBe('#123456'); expect(change).not.toHaveBeenCalled();
  });

  test.each(['disabled', 'readOnly'] as const)('switching to %s discards an unfinished draft without changing the accepted color', async (mode) => {
    const change = vi.fn(); const screen = await render(<ColorPicker aria-label="Accent" defaultValue="#123456" onValueChange={change} />); await text().fill('#12');
    await screen.rerender(<ColorPicker aria-label="Accent" defaultValue="#123456" onValueChange={change} {...{ [mode]: true }} />);
    expect(input().value).toBe('#123456'); expect(input().hasAttribute('aria-invalid')).toBe(false); expect(change).not.toHaveBeenCalled();
    await screen.rerender(<ColorPicker aria-label="Accent" defaultValue="#123456" onValueChange={change} />); expect(input().value).toBe('#123456');
  });

  test('Field connects visible label, help, error and required state to the hex input', async () => {
    const screen = await render(<Field label="Accent" description="Hex color" error="Choose another color" required><ColorPicker defaultValue="#123456" /></Field>);
    const label = screen.container.querySelector('label')!; expect(label.htmlFor).toBe(input().id); expect(input().required).toBe(true); expect(input().getAttribute('aria-invalid')).toBe('true');
    const descriptions = input().getAttribute('aria-describedby')!.split(' ').map((id) => document.getElementById(id)?.textContent).join(' '); expect(descriptions).toBe('Hex color Choose another color');
    expect(chooser().getAttribute('aria-labelledby')?.split(' ')[0]).toBe(label.id); expect(chooser().getAttribute('aria-describedby')).toBe(input().getAttribute('aria-describedby'));
  });

  test('explicit naming references and descriptions remain native input attributes', async () => {
    await render(<><span id="accent-name">Accent</span><span id="accent-help">Choose a highlight</span><ColorPicker aria-labelledby="accent-name" aria-describedby="accent-help" defaultValue="#123456" /></>);
    expect(input().getAttribute('aria-labelledby')).toBe('accent-name'); expect(chooser().getAttribute('aria-labelledby')).toContain('accent-name'); expect(input().getAttribute('aria-describedby')).toBe('accent-help');
  });

  test('native handlers can cancel keyboard and blur commits', async () => {
    const change = vi.fn(); await render(<><ColorPicker aria-label="Accent" defaultValue="#123456" onValueChange={change} onKeyDown={(event) => event.preventDefault()} onBlur={(event) => event.preventDefault()} /><Button>Outside</Button></>);
    await text().fill('#abc'); await page.keyboard.press('Enter'); expect(input().value).toBe('#abc'); expect(change).not.toHaveBeenCalled(); await button('Outside').click(); expect(input().value).toBe('#abc'); expect(change).not.toHaveBeenCalled();
  });

  test('native refs and attributes target text while outer style, direction and classes stay on the control', async () => {
    const ref = createRef<HTMLInputElement>(); const screen = await render(<ColorPicker aria-label="Accent" defaultValue="#123456" ref={ref} data-owner="Sam" className="custom-picker" style={{ maxWidth: '320px' }} dir="rtl" />);
    expect(ref.current).toBe(input()); expect(input().dataset.owner).toBe('Sam'); expect(input().style.length).toBe(0); const root = screen.container.querySelector('.yarcl-color-picker')!;
    expect(root.className).toContain('custom-picker'); expect((root as HTMLElement).style.maxWidth).toBe('320px'); expect(root.getAttribute('dir')).toBe('rtl');
  });

  test('the native hidden attribute hides the complete control and can reveal it again', async () => {
    const screen = await render(<ColorPicker aria-label="Accent" defaultValue="#123456" presets={presets} hidden />);
    const root = screen.container.querySelector('.yarcl-color-picker')!; expect(getComputedStyle(root).display).toBe('none');
    await screen.rerender(<ColorPicker aria-label="Accent" defaultValue="#123456" presets={presets} />); expect(getComputedStyle(root).display).toBe('flex');
  });

  test('long preset names wrap inside a narrow control without clipping labels or overflowing', async () => {
    const screen = await render(<ColorPicker aria-label="Accent" defaultValue="#123456" style={{ width: '220px' }} presets={[{ value: '#abcdef', label: 'An extraordinarilylonghumanreadablecolorlabel' }]} />);
    const root = screen.container.querySelector('.yarcl-color-picker')!, option = await preset('An extraordinarilylonghumanreadablecolorlabel').element();
    expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth); expect(option.scrollWidth).toBeLessThanOrEqual(option.clientWidth); expect(option.textContent).toBe('An extraordinarilylonghumanreadablecolorlabel');
  });

  test('size, radius and focus color use this consumer config without inline token values', async () => {
    const size = Object.keys(config.sizes)[0] as Size, radius = Object.keys(config.radii)[0] as Radius, color = Object.keys(config.colors)[0] as Color;
    const screen = await render(<ColorPicker aria-label="Accent" defaultValue="#123456" size={size} radius={radius} color={color} />); const root = screen.container.querySelector('.yarcl-color-picker')!;
    expect(root.className).toContain(`yarcl-color-${color}`); expect(getComputedStyle(input()).height).toBe(pixels(config.sizes[size].height)); expect(getComputedStyle(chooser()).borderRadius).toBe(pixels(config.radii[radius])); expect(root.getAttribute('style')).toBeNull();
  });

  test('runtime component defaults and size overrides change chooser dimensions', async () => {
    const size = Object.keys(config.sizes)[0] as Size; applyTheme({ ...config, components: { ...config.components, ColorPicker: { size, sizeOverrides: { [size]: { height: '52px' } } } } });
    await render(<ColorPicker aria-label="Accent" defaultValue="#123456" />); expect(getComputedStyle(chooser()).height).toBe('52px'); expect(getComputedStyle(input()).height).toBe('52px');
  });

  test('shared configured focus rings cover the text input and preset buttons', async () => {
    await render(<ColorPicker aria-label="Accent" defaultValue="#123456" presets={presets} />); await text().focus(); await page.keyboard.press('Tab'); await preset('Sky').focus();
    const style = getComputedStyle(await preset('Sky').element()); expect(style.outlineStyle).toBe('style' in config.focusRing ? config.focusRing.style : 'solid'); expect(style.outlineWidth).toBe(pixels(config.focusRing.width));
    await text().focus(); expect(getComputedStyle(input()).outlineWidth).toBe(pixels(config.focusRing.width));
  });

  test('runtime themes preserve accepted color, a partial draft, focus and input identity', async () => {
    await render(<ColorPicker aria-label="Accent" defaultValue="#123456" />); await text().fill('#12'); const target = input(); applyTheme(themes.brutalist);
    await expect.poll(() => input()).toBe(target); expect(input().value).toBe('#12'); expect(chooser().value).toBe('#123456'); expect(document.activeElement).toBe(target);
  });

  test('translated chooser and preset labels update while instance overrides win', async () => {
    const screen = await render(<ColorPicker aria-label="Accent" defaultValue="#123456" presets={presets} />);
    applyTheme({ ...config, labels: { ...config.labels, chooseColor: 'Choisir une couleur', colorPresets: 'Couleurs suggérées' } });
    await expect.poll(() => chooser().getAttribute('aria-label')).toBe('Accent Choisir une couleur'); expect(screen.container.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Couleurs suggérées');
    await screen.rerender(<ColorPicker aria-label="Accent" defaultValue="#123456" presets={presets} pickerLabel="Pick accent" presetsLabel="Brand palette" />);
    expect(chooser().getAttribute('aria-label')).toBe('Accent Pick accent'); expect(screen.container.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Brand palette');
  });

  test.each(['yarcl', 'brutalist'] as const)('passes axe in editable, invalid, disabled, read-only and preset states in %s', async (theme) => {
    applyTheme(themes[theme]); const screen = await render(<div className="yarcl-root"><Field label="Accent"><ColorPicker defaultValue="#123456" presets={presets} /></Field></div>);
    for (const props of [{}, { disabled: true }, { readOnly: true }, { pickerLabel: 'Pick accent' }]) {
      await screen.rerender(<div className="yarcl-root"><Field label="Accent"><ColorPicker defaultValue="#123456" presets={presets} {...props} /></Field></div>);
      const audit = await axe.run(screen.container, { rules: { region: { enabled: false } } }); expect(audit.violations.map(({ id }) => id)).toEqual([]);
    }
    await text().fill('#12'); const audit = await axe.run(screen.container, { rules: { region: { enabled: false } } }); expect(audit.violations.map(({ id }) => id)).toEqual([]);
  });
}
