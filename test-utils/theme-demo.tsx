import { afterEach, beforeEach, expect, inject, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { resetTheme } from '@yarcl/react/css';
import { themes, themeNames } from '@yarcl/react/themes';
import { ThemeDemo } from '../consumer/src/ThemeDemo';
import { page } from './page';

/** Checks the themed demo using both consumer configs and both color schemes. */
export function testThemeDemo() {
  const original = location.href;
  beforeEach(async () => {
    await page.mouse.move(0, 0);
  });
  afterEach(() => {
    resetTheme();
    history.replaceState(null, '', original);
    document.documentElement.style.colorScheme = inject('scheme');
  });

  test.each(Object.keys(themes) as (keyof typeof themes)[])('opens the %s theme from its URL', async (theme) => {
    history.replaceState(null, '', `?page=themes&theme=${theme}&scheme=${inject('scheme')}`);
    const screen = await render(<ThemeDemo />);
    await expect.poll(() => screen.container.querySelector('main')?.getAttribute('data-theme')).toBe(theme);
    await expect.poll(() => document.getElementById('yarcl-theme')?.textContent).toContain(themes[theme].colors.primary.light);
    expect(await page.getByRole('combobox', { name: 'Theme', exact: true }).textContent()).toBe(themeNames[theme]);
    expect(document.documentElement.style.colorScheme).toBe(inject('scheme'));
    expect(await page.getByRole('heading', { name: 'Component showcase', exact: true }).count()).toBe(1);
  });

  test('changes theme and scheme through the controls while preserving form state', async () => {
    history.replaceState(null, '', '?page=themes&theme=yarcl&scheme=light');
    const screen = await render(<ThemeDemo />);
    const name = page.getByRole('textbox', { name: 'Name', exact: true });
    await name.fill('Grace Hopper');
    await page.getByRole('combobox', { name: 'Theme', exact: true }).click();
    await page.getByRole('option', { name: themeNames.brutalist, exact: true }).click();
    await expect.poll(() => screen.container.querySelector('main')?.getAttribute('data-theme')).toBe('brutalist');
    expect(await name.inputValue()).toBe('Grace Hopper');
    expect(new URLSearchParams(location.search).get('theme')).toBe('brutalist');
    await page.getByRole('combobox', { name: 'Color scheme', exact: true }).click();
    await page.getByRole('option', { name: 'Dark', exact: true }).click();
    await expect.poll(() => document.documentElement.style.colorScheme).toBe('dark');
    expect(new URLSearchParams(location.search).get('scheme')).toBe('dark');
    expect(await name.inputValue()).toBe('Grace Hopper');
    await page.getByRole('combobox', { name: 'Theme', exact: true }).click();
    await page.getByRole('option', { name: themeNames.bloom, exact: true }).click();
    await expect.poll(() => screen.container.querySelector('main')?.getAttribute('data-theme')).toBe('bloom');
    expect(await name.inputValue()).toBe('Grace Hopper');
  });

  test('normalizes unknown theme and scheme names to the default theme and system scheme', async () => {
    history.replaceState(null, '', '?page=themes&theme=constructor&scheme=unknown');
    const screen = await render(<ThemeDemo />);
    await expect.poll(() => screen.container.querySelector('main')?.getAttribute('data-theme')).toBe('yarcl');
    expect(new URLSearchParams(location.search).get('theme')).toBe('yarcl');
    expect(new URLSearchParams(location.search).get('scheme')).toBe('light dark');
    expect(document.documentElement.style.colorScheme).toBe('light dark');
  });
}
