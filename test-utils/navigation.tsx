import axe from 'axe-core';
import { createRef } from 'react';
import { afterEach, beforeEach, expect, inject, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { NavItem, NavSection, config, type Size, type Spacing, type TextStyle } from '@yarcl/react';
import { applyTheme, resetTheme } from '@yarcl/react/css';
import { page } from './page';

const icon = <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /></svg>;

function px(value: string) {
  const probe = document.createElement('span');
  probe.style.width = value;
  document.body.append(probe);
  const result = getComputedStyle(probe).width;
  probe.remove();
  return result;
}

/** Checks named navigation groups, rail behavior, themes, native refs and accessibility. */
export function testNavigation() {
  beforeEach(async () => {
    document.documentElement.style.colorScheme = inject('scheme');
    await page.mouse.move(innerWidth - 1, innerHeight - 1);
  });
  afterEach(() => resetTheme());

  test('keeps a collapsed link named and square using consumer size tokens', async () => {
    const size = Object.keys(config.sizes)[0] as Size;
    const ref = createRef<HTMLAnchorElement>();
    const screen = await render(<NavItem ref={ref} href="#projects" active collapsed size={size} icon={icon}>Projects</NavItem>);
    const link = ref.current!;
    expect(link.href).toContain('#projects');
    expect(link.getAttribute('aria-current')).toBe('page');
    expect(getComputedStyle(link).width).toBe(px(config.sizes[size].height));
    expect(getComputedStyle(link).height).toBe(px(config.sizes[size].height));
    expect(getComputedStyle(link).gap).toBe('0px');
    expect(getComputedStyle(link.querySelector('.yarcl-nav-item-icon')!).width).toBe(px(config.sizes[size].iconSize));
    expect(link.querySelector('.yarcl-visually-hidden')?.textContent).toBe('Projects');
    expect(link.getAttribute('style')).toBeNull();
    await expect.element(screen.getByRole('link', { name: 'Projects', exact: true })).toBeVisible();
  });

  test('shows the rail label on keyboard focus and closes it with Escape', async () => {
    await render(<NavItem href="#projects" collapsed icon={icon}>Projects</NavItem>);
    await page.keyboard.press('Tab');
    await page.getByRole('link', { name: 'Projects', exact: true }).focus();
    await expect.poll(() => document.querySelector('[role="tooltip"]')?.textContent).toBe('Projects');
    const link = page.getByRole('link', { name: 'Projects', exact: true }).resolve()[0];
    expect(link.getAttribute('aria-describedby')).toBeNull();
    await page.keyboard.press('Escape');
    await expect.poll(() => document.querySelector('[role="tooltip"]')).toBeNull();
    expect(document.activeElement).toBe(link);
  });

  test('shows the rail label on hover and removes it after leaving', async () => {
    applyTheme({ ...config, timing: { ...config.timing, tooltipDelay: 0 } });
    await render(<NavItem href="#reports" collapsed icon={icon}>Reports</NavItem>);
    await page.getByRole('link', { name: 'Reports', exact: true }).hover();
    await expect.poll(() => document.querySelector('[role="tooltip"]')?.textContent).toBe('Reports');
    await page.mouse.move(innerWidth - 1, innerHeight - 1);
    await expect.poll(() => document.querySelector('[role="tooltip"]')).toBeNull();
  });

  test('preserves router handlers, native attributes, custom names and current state', async () => {
    const clicked = vi.fn((event: React.MouseEvent<HTMLAnchorElement>) => event.preventDefault());
    const screen = await render(<NavItem href="/projects" collapsed icon={icon} aria-label="My projects" aria-current="step" onClick={clicked} target="_blank">Projects</NavItem>);
    await page.getByRole('link', { name: 'My projects', exact: true }).click();
    expect(clicked).toHaveBeenCalledTimes(1);
    const link = screen.container.querySelector('a')!;
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('aria-current')).toBe('step');
    await expect.poll(() => document.querySelector('[role="tooltip"]')?.textContent).toBe('My projects');
  });

  test('keeps text visible when a collapsed item has no icon', async () => {
    const screen = await render(<NavItem href="#help" collapsed>Help</NavItem>);
    expect(screen.container.querySelector('.yarcl-visually-hidden')).toBeNull();
    expect(screen.container.querySelector('.yarcl-nav-item-collapsed')).toBeNull();
  });

  test.each([false, true, '', [], [null, false], <></>])('keeps labels visible for an empty icon %s', async (icon) => {
    const screen = await render(<NavItem href="#help" collapsed icon={icon}>Help</NavItem>);
    expect(screen.container.querySelector('.yarcl-visually-hidden')).toBeNull();
    expect(screen.container.querySelector('.yarcl-nav-item-icon')).toBeNull();
  });

  test('preserves a custom description without repeating the tooltip label', async () => {
    const screen = await render(<><span id="project-hint">Your team's work</span><NavItem href="#projects" collapsed icon={icon} aria-describedby="project-hint">Projects</NavItem></>);
    await page.keyboard.press('Tab');
    await page.getByRole('link', { name: 'Projects', exact: true }).focus();
    await expect.poll(() => document.querySelector('[role="tooltip"]')?.textContent).toBe('Projects');
    expect(screen.container.querySelector('a')?.getAttribute('aria-describedby')).toBe('project-hint');
  });

  test('keeps a tooltip description when an external label provides a different name', async () => {
    const screen = await render(<><span id="external-name">Team workspace</span><NavItem href="#projects" collapsed icon={icon} aria-labelledby="external-name">Projects</NavItem></>);
    await page.keyboard.press('Tab');
    await page.getByRole('link', { name: 'Team workspace', exact: true }).focus();
    await expect.poll(() => document.querySelector('[role="tooltip"]')?.textContent).toBe('Projects');
    expect(screen.container.querySelector('a')?.getAttribute('aria-describedby')).toBe(document.querySelector('[role="tooltip"]')?.id);
  });

  test('names sections independently and inherits collapse with explicit item overrides', async () => {
    const ref = createRef<HTMLDivElement>();
    const screen = await render(<nav className="yarcl-root" aria-label="Workspace"><NavSection ref={ref} title="Work" collapsed><NavItem href="#projects" icon={icon}>Projects</NavItem><NavItem href="#reports" icon={icon} collapsed={false}>Reports</NavItem></NavSection><NavSection title="Support"><NavItem href="#help" icon={icon}>Help</NavItem></NavSection></nav>);
    const groups = screen.container.querySelectorAll('[role="group"]');
    expect(ref.current).toBe(groups[0]);
    expect(groups[0].getAttribute('aria-labelledby')).not.toBe(groups[1].getAttribute('aria-labelledby'));
    expect(groups[0].querySelector('.yarcl-nav-section-heading')?.classList.contains('yarcl-visually-hidden')).toBe(true);
    expect(groups[0].querySelectorAll('.yarcl-nav-item-collapsed')).toHaveLength(1);
    expect(groups[1].querySelector('.yarcl-nav-item-collapsed')).toBeNull();
    await expect.element(screen.getByRole('group', { name: 'Work', exact: true })).toBeVisible();
    expect((await axe.run(screen.container, { rules: { region: { enabled: false } } })).violations).toEqual([]);
  });

  test('resolves section tokens from defaults and changes them with the active theme', async () => {
    const gap = Object.keys(config.spacing)[0] as Spacing;
    const textStyle = config.defaults.helperStyle as TextStyle;
    applyTheme({ ...config, components: { ...config.components, NavSection: { gap, textStyle } } });
    const screen = await render(<NavSection title="Workspace"><NavItem href="#projects">Projects</NavItem></NavSection>);
    const group = screen.container.querySelector('[role="group"]')!;
    expect(getComputedStyle(group).gap).toBe(px(config.spacing[gap]));
    expect(getComputedStyle(group.firstElementChild!).fontSize).toBe(px(config.typography.styles[textStyle].size));
    const other = Object.keys(config.spacing).at(-1) as Spacing;
    applyTheme({ ...config, components: { ...config.components, NavSection: { gap: other, textStyle: config.defaults.labelStyle } } });
    await expect.poll(() => getComputedStyle(group).gap).toBe(px(config.spacing[other]));
  });

  test('explicit section tokens win and expanded headings remain visible', async () => {
    const gap = Object.keys(config.spacing)[0] as Spacing;
    applyTheme({ ...config, components: { ...config.components, NavSection: { gap: Object.keys(config.spacing).at(-1)! } } });
    const screen = await render(<NavSection title="Work" gap={gap}><NavItem href="#projects" icon={icon}>Projects</NavItem></NavSection>);
    expect(getComputedStyle(screen.container.firstElementChild!).gap).toBe(px(config.spacing[gap]));
    expect(screen.container.querySelector('.yarcl-visually-hidden')).toBeNull();
  });

  test('audits expanded navigation and a keyboard-focused rail tooltip', async () => {
    const screen = await render(<nav className="yarcl-root" aria-label="Workspace"><NavSection title="Work"><NavItem href="#projects" icon={icon}>Projects</NavItem></NavSection><NavSection title="Admin" collapsed><NavItem href="#people" icon={icon}>People</NavItem></NavSection></nav>);
    expect((await axe.run(screen.container, { rules: { region: { enabled: false } } })).violations).toEqual([]);
    await page.getByRole('link', { name: 'Projects', exact: true }).focus();
    await page.keyboard.press('Tab');
    await expect.poll(() => document.querySelector('[role="tooltip"]')).not.toBeNull();
    expect((await axe.run(document.body, { rules: { region: { enabled: false } } })).violations).toEqual([]);
  });
}
