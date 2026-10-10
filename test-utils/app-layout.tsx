import axe from 'axe-core';
import { createRef, useState, type ComponentProps } from 'react';
import { afterEach, beforeEach, expect, inject, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { AppLayout, Button, Dialog, Input, NavItem, NavSection, Text, config, type Breakpoint, type Spacing } from '@yarcl/react';
import { themes } from '@yarcl/react/themes';
import { applyTheme, resetTheme } from '@yarcl/react/css';
import { page } from './page';

const icon = <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /></svg>;
const breakpoint = 'lg' as Breakpoint;

function navigation(note = true) {
  return <NavSection title="Work"><NavItem href="#projects" icon={icon} active onClick={(event) => event.preventDefault()}>Projects</NavItem><NavItem href="#settings" icon={icon} onClick={(event) => event.preventDefault()}>Settings</NavItem>{note && <Input aria-label="Navigation note" defaultValue="Keep this" />}</NavSection>;
}

function Frame(props: Partial<ComponentProps<typeof AppLayout>>) {
  return <AppLayout desktopBreakpoint={breakpoint} sidebarWidth="sidebar" navigationLabel="Workspace" menuLabel="Open navigation" navigation={navigation()} navbar={<Text>Acme</Text>} footer={<Text>Support</Text>} style={{ height: '500px' }} {...props}><h1>Projects</h1><div style={{ height: '1600px' }}>Long content</div></AppLayout>;
}

function rect(element: Element) {
  const box = element.getBoundingClientRect();
  return { x: box.x, y: box.y, width: box.width, height: box.height, bottom: box.bottom, right: box.right };
}

function pixels(value: string) {
  const probe = document.createElement('div');
  probe.style.width = value;
  document.body.append(probe);
  const result = parseFloat(getComputedStyle(probe).width);
  probe.remove();
  return result;
}

async function resize(width: number, height = 800) {
  await page.setViewportSize({ width, height });
  await expect.poll(() => innerWidth).toBe(width);
}

/** Checks responsive app frames, native drawers, retained navigation, scrolling and accessibility. */
export function testAppLayout() {
  beforeEach(async () => {
    document.documentElement.style.colorScheme = inject('scheme');
    await resize(1100);
    await page.mouse.move(innerWidth - 1, innerHeight - 1);
  });
  afterEach(async () => {
    resetTheme();
    await resize(1100);
  });

  test('places the navbar, left navigation, main and footer using consumer width tokens', async () => {
    const ref = createRef<HTMLDivElement>();
    const screen = await render(<Frame ref={ref} />);
    const root = ref.current!;
    await expect.poll(() => root.hasAttribute('data-desktop')).toBe(true);
    const sidebar = screen.container.querySelector('aside')!;
    const main = screen.container.querySelector('main')!;
    const navbar = screen.container.querySelector('header')!;
    const footer = screen.container.querySelector('footer')!;
    expect(screen.container.querySelector('dialog')!.open).toBe(false);
    expect(rect(sidebar).width).toBeCloseTo(pixels(config.widths.sidebar), 0);
    expect(rect(main).x).toBeCloseTo(rect(sidebar).right, 0);
    expect(rect(main).y).toBeCloseTo(rect(navbar).bottom, 0);
    expect(rect(footer).y).toBeCloseTo(rect(main).bottom, 0);
    expect(rect(navbar).width).toBeCloseTo(rect(root).width, 0);
    expect(getComputedStyle(screen.container.querySelector('.yarcl-app-layout-menu')!).display).toBe('none');
    expect(root.style.getPropertyValue('--yarcl-app-width')).toBe('');
  });

  test('scrolls the main area without moving the navbar, footer or navigation', async () => {
    const screen = await render(<Frame />);
    const main = screen.container.querySelector('main')!;
    const fixed = [...screen.container.querySelectorAll('header,footer,aside')];
    const before = fixed.map(rect);
    expect(main.scrollHeight).toBeGreaterThan(main.clientHeight);
    main.scrollTop = 800;
    expect(main.scrollTop).toBe(800);
    expect(fixed.map(rect)).toEqual(before);
    expect(getComputedStyle(main).overscrollBehavior).toBe('contain');
    expect(rect(screen.container.querySelector('.yarcl-app-layout')!).height).toBe(500);
  });

  test('independently scrolls long desktop navigation', async () => {
    const screen = await render(<Frame navigation={<div style={{ height: '1400px' }}>Many destinations</div>} />);
    const body = screen.container.querySelector('aside')!;
    expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    body.scrollTop = 500;
    expect(body.scrollTop).toBe(500);
    expect(screen.container.querySelector('main')!.scrollTop).toBe(0);
  });

  test('uses the configured desktop boundary, including equality', async () => {
    const boundary = pixels(config.breakpoints[breakpoint]);
    await resize(boundary - 1);
    const screen = await render(<Frame />);
    const root = screen.container.querySelector('.yarcl-app-layout')!;
    expect(root.hasAttribute('data-desktop')).toBe(false);
    expect(screen.container.querySelector('dialog')!.open).toBe(false);
    await resize(boundary);
    await expect.poll(() => root.hasAttribute('data-desktop')).toBe(true);
    await resize(boundary - 1);
    await expect.poll(() => root.hasAttribute('data-desktop')).toBe(false);
  });

  test('opens a left mobile drawer with a named burger and native focus trapping', async () => {
    await resize(390, 844);
    const screen = await render(<Frame />);
    const button = screen.container.querySelector('.yarcl-app-layout-menu')!;
    const dialog = screen.container.querySelector('dialog')!;
    expect(button.getAttribute('aria-controls')).toBe(dialog.id);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    await expect.poll(() => dialog.matches(':modal')).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(rect(dialog).x).toBe(0);
    expect(rect(dialog).width).toBeCloseTo(pixels(config.widths.sidebar), 0);
    expect(dialog.getAttribute('aria-labelledby')).toBe(dialog.querySelector('h2')!.id);
    expect(dialog.contains(document.activeElement)).toBe(true);
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      expect(document.activeElement === document.body || dialog.contains(document.activeElement)).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect.poll(() => dialog.open).toBe(false);
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  test('dismisses the drawer with its close button and backdrop and restores focus', async () => {
    await resize(390, 844);
    const screen = await render(<Frame closeLabel="Dismiss navigation" />);
    const dialog = screen.container.querySelector('dialog')!;
    for (const close of ['button', 'backdrop']) {
      await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
      await expect.poll(() => dialog.matches(':modal')).toBe(true);
      if (close === 'button') await page.getByRole('button', { name: 'Dismiss navigation', exact: true }).click();
      else await page.mouse.click(innerWidth - 1, 400);
      await expect.poll(() => dialog.open).toBe(false);
      expect(document.activeElement).toBe(screen.container.querySelector('.yarcl-app-layout-menu'));
    }
  });

  test('closes after router navigation even when the router prevents the native click', async () => {
    await resize(390);
    const screen = await render(<Frame />);
    const dialog = screen.container.querySelector('dialog')!;
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    await page.getByRole('link', { name: 'Projects', exact: true }).click();
    await expect.poll(() => dialog.open).toBe(false);
  });

  test('keeps the drawer open for modified clicks, downloads and new-tab links', async () => {
    await resize(390);
    const prevent = (event: React.MouseEvent<HTMLAnchorElement>) => event.preventDefault();
    const screen = await render(<Frame navigation={<><NavItem href="#modified" onClick={prevent}>Modified</NavItem><NavItem href="#download" download onClick={prevent}>Download</NavItem><NavItem href="#external" target="_blank" onClick={prevent}>External</NavItem></>} />);
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    const dialog = screen.container.querySelector('dialog')!;
    screen.container.querySelector('a[href="#modified"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }));
    await page.getByRole('link', { name: 'Download', exact: true }).click();
    await page.getByRole('link', { name: 'External', exact: true }).click();
    expect(dialog.open).toBe(true);
  });

  test('retains one navigation tree and its input state across closing and breakpoint changes', async () => {
    const screen = await render(<Frame />);
    const note = screen.container.querySelector('input')!;
    await page.getByRole('textbox', { name: 'Navigation note', exact: true }).fill('Keep my draft');
    await resize(390);
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    expect(screen.container.querySelector('input')).toBe(note);
    expect(note.value).toBe('Keep my draft');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    expect(note.value).toBe('Keep my draft');
    await resize(1100);
    await expect.poll(() => screen.container.querySelector('dialog')!.matches(':modal')).toBe(false);
    expect(screen.container.querySelector('input')).toBe(note);
    await resize(390);
    await expect.poll(() => screen.container.querySelector('dialog')!.open).toBe(false);
    expect(screen.container.querySelectorAll('nav')).toHaveLength(1);
  });

  test('collapses only desktop links and expands them in the mobile drawer', async () => {
    const screen = await render(<Frame collapsed navigation={navigation(false)} />);
    const root = screen.container.querySelector('.yarcl-app-layout')!;
    const dialog = screen.container.querySelector('dialog')!;
    expect(screen.container.querySelectorAll('.yarcl-nav-item-collapsed')).toHaveLength(2);
    const sidebar = screen.container.querySelector('aside')!;
    const rail = pixels(config.sizes[config.defaults.size].height) + pixels(getComputedStyle(root).getPropertyValue('--yarcl-app-padding')) * 2 + pixels(config.borders.width);
    expect(rect(sidebar).width).toBeCloseTo(rail, 0);
    expect(sidebar.scrollWidth).toBe(sidebar.clientWidth);
    await resize(390);
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    expect(screen.container.querySelector('.yarcl-nav-item-collapsed')).toBeNull();
    expect(root.hasAttribute('data-collapsed')).toBe(true);
    expect(rect(dialog).width).toBeCloseTo(pixels(config.widths.sidebar), 0);
  });

  test('owns the controlled drawer state and emits open and close callbacks', async () => {
    await resize(390);
    const changed = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(false);
      return <Frame navigationOpen={open} onNavigationOpenChange={(next) => { changed(next); setOpen(next); }} />;
    }
    const screen = await render(<Controlled />);
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    await expect.poll(() => screen.container.querySelector('dialog')!.open).toBe(true);
    await resize(1100);
    await expect.poll(() => changed.mock.calls.at(-1)?.[0]).toBe(false);
    expect(changed.mock.calls.map(([value]) => value)).toEqual([true, false]);
    await resize(390);
    await expect.poll(() => screen.container.querySelector('dialog')!.open).toBe(false);
  });

  test('supports initial mobile state and clears it after a desktop transition', async () => {
    await resize(390);
    const screen = await render(<Frame defaultNavigationOpen />);
    await expect.poll(() => screen.container.querySelector('dialog')!.matches(':modal')).toBe(true);
    await resize(1100);
    await expect.poll(() => screen.container.querySelector('dialog')!.matches(':modal')).toBe(false);
    await resize(390);
    await expect.poll(() => screen.container.querySelector('dialog')!.open).toBe(false);
  });

  test('reacts to runtime width and breakpoint changes and resets the theme', async () => {
    const screen = await render(<Frame />);
    const root = screen.container.querySelector('.yarcl-app-layout')!;
    const note = screen.container.querySelector('input')!;
    applyTheme({ ...config, widths: { ...config.widths, sidebar: '18rem' }, breakpoints: { ...config.breakpoints, [breakpoint]: '80rem' } });
    await expect.poll(() => root.hasAttribute('data-desktop')).toBe(false);
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    expect(rect(screen.container.querySelector('dialog')!).width).toBeCloseTo(pixels('18rem'), 0);
    resetTheme();
    await expect.poll(() => root.hasAttribute('data-desktop')).toBe(true);
    expect(screen.container.querySelector('input')).toBe(note);
    expect(rect(screen.container.querySelector('aside')!).width).toBeCloseTo(pixels(config.widths.sidebar), 0);
  });

  test('resolves padding from component defaults and lets explicit padding win', async () => {
    const small = Object.keys(config.spacing)[0] as Spacing;
    const large = Object.keys(config.spacing).at(-1) as Spacing;
    applyTheme({ ...config, components: { ...config.components, AppLayout: { padding: small } } });
    const screen = await render(<Frame />);
    expect(parseFloat(getComputedStyle(screen.container.querySelector('main')!).paddingTop)).toBe(pixels(config.spacing[small]));
    await screen.rerender(<Frame padding={large} />);
    expect(parseFloat(getComputedStyle(screen.container.querySelector('main')!).paddingTop)).toBe(pixels(config.spacing[large]));
    expect(parseFloat(getComputedStyle(screen.container.querySelector('header')!).paddingTop)).toBe(pixels(config.spacing[large]));
    await resize(390);
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    expect(parseFloat(getComputedStyle(screen.container.querySelector('.yarcl-modal-body')!).paddingLeft)).toBe(pixels(config.spacing[large]));
  });

  test('preserves root and main refs, scroll events, native attributes and embedding semantics', async () => {
    const root = createRef<HTMLDivElement>();
    const main = createRef<HTMLElement>();
    const scroll = vi.fn();
    const screen = await render(<Frame ref={root} mainAs="section" data-workspace="team" mainProps={{ ref: main, id: 'team-content', 'aria-label': 'Team content', onScroll: scroll, className: 'custom-content' }} />);
    expect(root.current?.dataset.workspace).toBe('team');
    expect(main.current).toBe(screen.container.querySelector('section'));
    expect(main.current?.id).toBe('team-content');
    expect(main.current?.classList.contains('custom-content')).toBe(true);
    main.current!.scrollTop = 800;
    await expect.poll(() => scroll.mock.calls.length).toBeGreaterThan(0);
    await screen.rerender(<Frame ref={root} mainAs="main" mainProps={{ ref: main }} />);
    expect(main.current).toBe(screen.container.querySelector('main'));
  });

  test('offers a keyboard skip link that focuses main content', async () => {
    const screen = await render(<Frame skipLabel="Skip to content" mainProps={{ id: 'content' }} />);
    const link = screen.container.querySelector('.yarcl-app-layout-skip') as HTMLElement;
    link.focus();
    await page.keyboard.press('Enter');
    expect(document.activeElement).toBe(screen.container.querySelector('main'));
    expect(link.getAttribute('href')).toBe('#content');
  });

  test('does not steal focus on initial desktop render', async () => {
    const screen = await render(<><Input aria-label="Outside" autoFocus /><Frame /></>);
    await expect.poll(() => document.activeElement).toBe(screen.container.querySelector('input[aria-label="Outside"]'));
  });

  test('stacks another modal above mobile navigation and keeps the drawer open after dismissal', async () => {
    await resize(390);
    const screen = await render(<Frame navigation={<Dialog title="Help" trigger={<Button>Show help</Button>}>Support details</Dialog>} />);
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    await page.getByRole('button', { name: 'Show help', exact: true }).click();
    const dialogs = screen.container.querySelectorAll('dialog');
    await expect.poll(() => dialogs[1].matches(':modal')).toBe(true);
    expect(dialogs[0].hasAttribute('data-yarcl-covered')).toBe(true);
    await page.keyboard.press('Escape');
    await expect.poll(() => dialogs[1].open).toBe(false);
    expect(dialogs[0].matches(':modal')).toBe(true);
    await page.keyboard.press('Escape');
    await expect.poll(() => dialogs[0].open).toBe(false);
  });

  test.each(['yarcl', 'brutalist'] as const)('audits desktop and mobile layouts in the %s theme', async (name) => {
    applyTheme(themes[name]);
    const screen = await render(<Frame />);
    expect((await axe.run(screen.container, { rules: { region: { enabled: false } } })).violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ failureSummary }) => failureSummary) }))).toEqual([]);
    await resize(390);
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    await expect.poll(() => screen.container.querySelector('dialog')!.matches(':modal')).toBe(true);
    expect((await axe.run(screen.container, { rules: { region: { enabled: false } } })).violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ failureSummary }) => failureSummary) }))).toEqual([]);
  });
}
