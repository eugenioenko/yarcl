import { beforeEach, expect, inject, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import axe from 'axe-core';
import { Pagination, config, type ComponentSize } from '@yarcl/react';
import { applyTheme, resetTheme } from '@yarcl/react/css';
import { page } from './page';

function pixels(value: string) {
  const probe = document.createElement('div');
  probe.style.width = value;
  document.body.append(probe);
  const result = getComputedStyle(probe).width;
  probe.remove();
  return result;
}

/** Checks compact pagination behavior, layout, tokens and accessibility in both brands. */
export function testPagination() {
  beforeEach(() => {
    document.documentElement.style.colorScheme = inject('scheme');
  });

  test('controlled compact pagination reports changes and supports custom summary and navigation labels', async () => {
    const changed = vi.fn();
    const ref = { current: null as HTMLElement | null };
    const screen = await render(<Pagination ref={ref} count={20} page={3} onPageChange={changed} layout="compact" className="result-pages" style={{ width: '100%' }} data-testid="result-pages" aria-label="Results" />);
    const root = ref.current!;
    expect(root.tagName).toBe('NAV');
    expect(root.classList.contains('result-pages')).toBe(true);
    expect(root.dataset.testid).toBe('result-pages');
    expect(root.hasAttribute('layout')).toBe(false);
    expect(root.hasAttribute('summaryLabel')).toBe(false);
    expect(root.querySelectorAll('button')).toHaveLength(2);
    expect(root.querySelector('[aria-current]')).toBeNull();
    expect(root.querySelector('.yarcl-pagination-ellipsis')).toBeNull();
    expect(root.querySelector('[role="status"]')?.textContent).toBe('Page 3 of 20');
    const next = page.getByRole('button', { name: 'Next page' });
    await next.click();
    expect(changed).toHaveBeenCalledExactlyOnceWith(4);
    expect(root.querySelector('[role="status"]')?.textContent).toBe('Page 3 of 20');
    await screen.rerender(<Pagination ref={ref} count={20} page={4} onPageChange={changed} layout="compact" summaryLabel={(page, count) => `${page} / ${count}`} previousLabel="Back" nextLabel="Forward" aria-label="Results" />);
    expect(ref.current).toBe(root);
    expect(root.querySelector('[role="status"]')?.textContent).toBe('4 / 20');
    await page.getByRole('button', { name: 'Back' }).click();
    expect(changed).toHaveBeenLastCalledWith(3);
    expect(await page.getByRole('button', { name: 'Forward' }).count()).toBe(1);
  });

  test('uncontrolled arrows stop at boundaries while retaining keyboard focus', async () => {
    const changed = vi.fn();
    await render(<Pagination count={3} layout="compact" onPageChange={changed} />);
    const previous = page.getByRole('button', { name: 'Previous page' });
    const next = page.getByRole('button', { name: 'Next page' });
    const status = page.getByRole('status');
    await previous.click({ force: true });
    expect(changed).not.toHaveBeenCalled();
    expect(await previous.getAttribute('aria-disabled')).toBe('true');
    await next.click();
    await expect.poll(() => status.textContent()).toBe('Page 2 of 3');
    await next.click();
    await expect.poll(() => status.textContent()).toBe('Page 3 of 3');
    expect(await next.getAttribute('aria-disabled')).toBe('true');
    expect(await next.evaluate((button) => button === document.activeElement)).toBe(true);
    await next.click({ force: true });
    expect(changed).toHaveBeenCalledTimes(2);
    await page.keyboard.press('Home');
    await page.keyboard.press('End');
    expect(await next.evaluate((button) => button === document.activeElement)).toBe(true);
    expect(await next.evaluate((button) => getComputedStyle(button).outlineStyle)).not.toBe('none');
    await page.keyboard.press('Enter');
    expect(changed).toHaveBeenCalledTimes(2);
    await previous.click();
    await expect.poll(() => status.textContent()).toBe('Page 2 of 3');
    expect(changed).toHaveBeenLastCalledWith(2);
  });

  test('normalizes empty and changing counts and disables all actions when requested', async () => {
    const changed = vi.fn();
    const screen = await render(<Pagination count={20} defaultPage={20} layout="compact" onPageChange={changed} />);
    const status = page.getByRole('status');
    await screen.rerender(<Pagination count={2.9} defaultPage={20} layout="compact" onPageChange={changed} />);
    expect(await status.textContent()).toBe('Page 2 of 2');
    await page.getByRole('button', { name: 'Previous page' }).click();
    expect(changed).toHaveBeenLastCalledWith(1);
    for (const count of [0, -5, 1]) {
      await screen.rerender(<Pagination count={count} defaultPage={20} layout="compact" onPageChange={changed} />);
      expect(await status.textContent()).toBe(count <= 0 ? 'Page 0 of 0' : 'Page 1 of 1');
      for (const button of ['Previous page', 'Next page']) {
        const action = page.getByRole('button', { name: button });
        expect(await action.getAttribute('aria-disabled')).toBe('true');
        await action.click({ force: true });
      }
    }
    expect(changed).toHaveBeenCalledTimes(1);
    await screen.rerender(<Pagination count={20} layout="compact" disabled onPageChange={changed} />);
    expect(await page.getByRole('button', { name: 'Previous page' }).isDisabled()).toBe(true);
    expect(await page.getByRole('button', { name: 'Next page' }).isDisabled()).toBe(true);
  });

  test('aligns controls at the inline end and supports keyboard navigation in both directions', async () => {
    const screen = await render(<Pagination count={20} defaultPage={3} layout="compact" />);
    for (const dir of ['ltr', 'rtl']) {
      await screen.rerender(<Pagination count={20} defaultPage={3} layout="compact" dir={dir} style={{ width: '100%' }} />);
      const root = screen.container.querySelector('nav')!;
      const group = root.querySelector('.yarcl-button-group')!;
      const summary = root.querySelector('[role="status"]')!;
      const rootRect = root.getBoundingClientRect();
      const groupRect = group.getBoundingClientRect();
      const summaryRect = summary.getBoundingClientRect();
      expect(dir === 'ltr' ? groupRect.right : groupRect.left).toBeCloseTo(dir === 'ltr' ? rootRect.right : rootRect.left);
      expect(dir === 'ltr' ? summaryRect.left : summaryRect.right).toBeCloseTo(dir === 'ltr' ? rootRect.left : rootRect.right);
      expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
      const previous = page.getByRole('button', { name: 'Previous page' });
      const next = page.getByRole('button', { name: 'Next page' });
      await previous.focus();
      await page.keyboard.press(dir === 'ltr' ? 'ArrowRight' : 'ArrowLeft');
      expect(await next.evaluate((button) => button === document.activeElement)).toBe(true);
      await page.keyboard.press('Home');
      expect(await previous.evaluate((button) => button === document.activeElement)).toBe(true);
      await page.keyboard.press('End');
      expect(await next.evaluate((button) => button === document.activeElement)).toBe(true);
      await page.keyboard.press('Space');
      await expect.poll(() => page.getByRole('status').textContent()).toBe(dir === 'ltr' ? 'Page 4 of 20' : 'Page 5 of 20');
      expect(getComputedStyle(group.querySelector('svg')!).transform).toBe(dir === 'rtl' ? 'matrix(-1, 0, 0, 1, 0, 0)' : 'none');
    }
    await screen.rerender(<Pagination count={20} defaultPage={3} layout="compact" onKeyDown={(event) => event.preventDefault()} />);
    const previous = page.getByRole('button', { name: 'Previous page' });
    await previous.focus();
    await page.keyboard.press('ArrowRight');
    expect(await previous.evaluate((button) => button === document.activeElement)).toBe(true);
  });

  test('switches layouts without resetting the current page and joins compact arrows when attached', async () => {
    const screen = await render(<Pagination count={20} defaultPage={3} layout="compact" attached />);
    const next = page.getByRole('button', { name: 'Next page' });
    await next.click();
    const buttons = [...screen.container.querySelectorAll('button')];
    const [previousRect, nextRect] = buttons.map((button) => button.getBoundingClientRect());
    const border = parseFloat(getComputedStyle(buttons[0]).borderRightWidth);
    expect(previousRect.right - nextRect.left).toBeCloseTo(border);
    await screen.rerender(<Pagination count={20} defaultPage={3} />);
    expect(screen.container.querySelector('[aria-current="page"]')?.textContent).toBe('4');
    expect(screen.container.querySelector('[role="status"]')).toBeNull();
    await screen.rerender(<Pagination count={20} defaultPage={3} layout="compact" />);
    expect(await page.getByRole('status').textContent()).toBe('Page 4 of 20');
  });

  test('uses configured sizes for the summary and arrows and follows runtime defaults', async () => {
    const shape = config as unknown as {
      defaults: { size: string };
      sizes: Record<string, { height: string; fontSize: string; iconSize: string; paddingX: string }>;
      components?: { Pagination?: { size?: string; allowedSizes?: readonly string[]; sizeOverrides?: Record<string, Partial<{ height: string; fontSize: string; iconSize: string; paddingX: string }>> } };
    };
    const sizes = (shape.components?.Pagination?.allowedSizes ?? Object.keys(shape.sizes)) as ComponentSize<'Pagination'>[];
    const screen = await render(<>{sizes.map((size) => <Pagination key={size} layout="compact" count={20} defaultPage={3} size={size} aria-label={`Size ${size}`} />)}</>);
    for (const [index, root] of [...screen.container.querySelectorAll('nav')].entries()) {
      const token = { ...shape.sizes[sizes[index]], ...shape.components?.Pagination?.sizeOverrides?.[sizes[index]] };
      expect(getComputedStyle(root.querySelector('[role="status"]')!).fontSize).toBe(pixels(token.fontSize));
      expect(getComputedStyle(root).gap).toBe(pixels(token.paddingX));
      for (const button of root.querySelectorAll('button')) {
        expect(getComputedStyle(button).height).toBe(pixels(token.height));
        expect(getComputedStyle(button.querySelector('svg')!).width).toBe(pixels(token.iconSize));
      }
    }
    await screen.rerender(<Pagination count={20} defaultPage={3} layout="compact" />);
    const next = page.getByRole('button', { name: 'Next page' });
    await next.click();
    const button = screen.container.querySelectorAll('button')[1];
    const nextSize = sizes.find((size) => size !== (shape.components?.Pagination?.size ?? shape.defaults.size))!;
    try {
      applyTheme({ ...config, components: { ...config.components, Pagination: { ...shape.components?.Pagination, size: nextSize } } } as Parameters<typeof applyTheme>[0]);
      await expect.poll(() => getComputedStyle(button).height).toBe(pixels(shape.sizes[nextSize].height));
      expect(screen.container.querySelectorAll('button')[1]).toBe(button);
      expect(document.activeElement).toBe(button);
      expect(await page.getByRole('status').textContent()).toBe('Page 4 of 20');
    } finally {
      resetTheme();
    }
  });

  test('has clean accessibility audits at boundaries, without results and while disabled', async () => {
    const screen = await render(<Pagination count={20} page={3} layout="compact" />);
    for (const [count, current, disabled] of [[20, 3, false], [20, 1, false], [20, 20, false], [0, 0, false], [1, 1, false], [20, 3, true]] as const) {
      await screen.rerender(<Pagination count={count} page={current} layout="compact" disabled={disabled} />);
      const { violations } = await axe.run(screen.container, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } });
      expect(violations.map(({ id }) => id), `page ${current} of ${count}, disabled ${disabled}`).toEqual([]);
    }
  });
}
