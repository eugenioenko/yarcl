import { createElement, StrictMode, type ComponentType } from 'react';
import { expect, inject, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { config, toast } from '@yarcl/react';
import { applyTheme, resetTheme } from '@yarcl/react/css';
import type { YarclShape } from '@yarcl/react/define';
import { onNavigate, page, resetPage, type Locator, type Page } from './page';

export interface SuiteContext {
  page: Page;
  check: (label: string, ok: unknown, detail?: string) => void;
  focused: (locator: Locator) => Promise<boolean>;
  htmlOverflow: () => Promise<string>;
  setTiming: (timing: Partial<YarclShape['timing']>) => void;
}

const instant = { tooltipDelay: 0, hoverOpenDelay: 0, hoverCloseDelay: 0 };

/** Applies the app's config with hover delays zeroed, plus any overrides a check needs. */
function setTiming(timing: Partial<YarclShape['timing']> = {}) {
  const shape = config as unknown as YarclShape;
  applyTheme({ ...shape, timing: { ...shape.timing, ...instant, ...timing } });
  // Only the runtime values matter here; re-injecting the CSS would restart web font loading.
  document.getElementById('yarcl-theme')?.remove();
}

export type Suite = (context: SuiteContext) => Promise<void>;

/** Runs a Playwright-style suite against the demo app, in the color scheme of the current browser instance. */
export function runSuite(App: ComponentType, name: string, suite: Suite) {
  const scheme = inject('scheme');
  test(name, async () => {
    history.replaceState(null, '', `?scheme=${scheme}`);
    resetPage();
    setTiming();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.throttleCpu();
    const errors: string[] = [];
    const onError = (event: ErrorEvent) => errors.push(event.message);
    addEventListener('error', onError);
    const consoleError = vi.spyOn(console, 'error').mockImplementation((...args) => {
      errors.push(args.map(String).join(' '));
    });
    try {
      const app = (key: number) => createElement(StrictMode, null, createElement(App, { key }));
      const screen = await render(app(0));
      await expect.poll(() => screen.container.childElementCount).toBeGreaterThan(0);
      let mounts = 0;
      onNavigate(async (search) => {
        const params = new URLSearchParams(search);
        params.set('scheme', scheme);
        history.replaceState(null, '', `?${params}`);
        await screen.rerender(app(++mounts));
      });
      await suite({
        page,
        check: (label, ok, detail = '') => expect.soft(ok, detail ? `${label}: ${detail}` : label).toBe(true),
        focused: (locator) =>
          locator.evaluate((el) => el === document.activeElement || el.contains(document.activeElement)),
        htmlOverflow: async () => getComputedStyle(document.documentElement).overflow,
        setTiming,
      });
    } finally {
      toast.dismiss();
      resetTheme();
      consoleError.mockRestore();
      removeEventListener('error', onError);
      resetPage();
    }
    expect(errors, 'no console errors').toEqual([]);
  });
}
