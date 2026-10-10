import axe from 'axe-core';
import { createRef, useEffect } from 'react';
import { afterEach, beforeEach, expect, inject, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Alert, AppLayout, Button, Card, EmptyState, Grid, HoverCard, Inline, Input, NavItem, NavSection, Popover, Stack, Toaster, Tooltip, config, toast, type Responsive, type Spacing } from '@yarcl/react';
import { applyTheme, resetTheme } from '@yarcl/react/css';
import { themes } from '@yarcl/react/themes';
import { page } from './page';

const keys = Object.keys(config.spacing) as Spacing[];
const small = keys[0];
const large = keys[keys.length - 1];
const spacing: Responsive<Spacing> = { base: small, lg: large };

function pixels(value: string) {
  const probe = document.createElement('div');
  probe.style.width = value;
  document.body.append(probe);
  const result = parseFloat(getComputedStyle(probe).width);
  probe.remove();
  return result;
}

async function resize(width: number) {
  await page.setViewportSize({ width, height: 800 });
  await expect.poll(() => innerWidth).toBe(width);
}

async function expectSpace(element: Element, property: 'gap' | 'paddingTop', token: Spacing, multiplier = 1) {
  await expect.poll(() => parseFloat(getComputedStyle(element)[property])).toBe(pixels(config.spacing[token]) * multiplier);
}

function columns(element: Element) {
  return getComputedStyle(element).gridTemplateColumns.split(' ').length;
}

/** Verifies typed breakpoint maps against both consumers, schemes, native CSS, themes and focus. */
export function testResponsive() {
  beforeEach(async () => {
    await page.throttleCpu();
    document.documentElement.style.colorScheme = inject('scheme');
    await resize(390);
    await page.mouse.move(389, 799);
  });
  afterEach(async () => {
    toast.dismiss();
    resetTheme();
    await resize(1100);
  });

  test('changes token gaps at the exact configured boundary and back', async () => {
    const screen = await render(<Stack gap={spacing}><span>One</span><span>Two</span></Stack>);
    const element = screen.container.firstElementChild!;
    const boundary = pixels(config.breakpoints.lg);
    await resize(boundary - 1);
    await expectSpace(element, 'gap', small);
    await resize(boundary);
    await expectSpace(element, 'gap', large);
    await resize(boundary - 1);
    await expectSpace(element, 'gap', small);
    expect(element.getAttribute('style')).toBeNull();
  });

  test('applies media queries without resize or matchMedia listeners', async () => {
    const add = vi.spyOn(window, 'addEventListener');
    const media = vi.spyOn(window, 'matchMedia');
    try {
      const screen = await render(<Stack gap={spacing} />);
      expect(add.mock.calls.some(([type]) => type === 'resize')).toBe(false);
      expect(media).not.toHaveBeenCalled();
      await resize(pixels(config.breakpoints.lg));
      await expectSpace(screen.container.firstElementChild!, 'gap', large);
    } finally {
      add.mockRestore();
      media.mockRestore();
    }
  });

  test('uses component defaults when the base value is omitted', async () => {
    const screen = await render(<Grid gap={{ lg: large }} />);
    const element = screen.container.firstElementChild!;
    await expectSpace(element, 'gap', config.components.Grid.gap);
    await resize(pixels(config.breakpoints.lg));
    await expectSpace(element, 'gap', large);
  });

  test('omitted base respects runtime defaults on both Stack and Inline', async () => {
    applyTheme({ ...config, components: { ...config.components, Stack: { gap: small }, Inline: { gap: large } } });
    const screen = await render(<><Stack gap={{ lg: large }} /><Inline gap={{ lg: small }} /></>);
    await expectSpace(screen.container.querySelector('.yarcl-stack')!, 'gap', small);
    await expectSpace(screen.container.querySelector('.yarcl-inline')!, 'gap', large);
    await resize(pixels(config.breakpoints.lg));
    await expectSpace(screen.container.querySelector('.yarcl-stack')!, 'gap', large);
    await expectSpace(screen.container.querySelector('.yarcl-inline')!, 'gap', small);
  });

  test('uses global defaults when no component default exists', async () => {
    const screen = await render(<Stack gap={{ lg: large }} />);
    await expectSpace(screen.container.firstElementChild!, 'gap', config.defaults.gap);
  });

  test('treats empty and undefined maps as default spacing', async () => {
    const screen = await render(<><Stack gap={{}} /><Card padding={{ base: undefined, lg: undefined }} /></>);
    await expectSpace(screen.container.querySelector('.yarcl-stack')!, 'gap', config.defaults.gap);
    await expectSpace(screen.container.querySelector('.yarcl-card')!, 'paddingTop', config.defaults.padding);
  });

  test('uses additional consumer breakpoint names in generated CSS', async () => {
    const entries = Object.entries(config.breakpoints);
    const [key, width] = entries.find(([name]) => name === 'studio') ?? entries[0];
    const screen = await render(<Stack gap={{ base: small, [key]: large }} />);
    const element = screen.container.firstElementChild!;
    await resize(pixels(width) - 1);
    await expectSpace(element, 'gap', small);
    await resize(pixels(width));
    await expectSpace(element, 'gap', large);
  });

  test('keeps sparse spacing overrides above later unspecified breakpoints', async () => {
    const screen = await render(<Stack gap={{ base: small, md: large }} />);
    const element = screen.container.firstElementChild!;
    await resize(pixels(config.breakpoints.md));
    await expectSpace(element, 'gap', large);
    await resize(pixels(config.breakpoints.xl) + 1);
    await expectSpace(element, 'gap', large);
  });

  test('uses config breakpoint order independently of prop object order', async () => {
    const screen = await render(<><Stack gap={{ lg: large, base: config.defaults.gap, md: small }} /><Stack gap={{ md: small, base: config.defaults.gap, lg: large }} /></>);
    const elements = [...screen.container.children];
    for (const [width, token] of [[pixels(config.breakpoints.md), small], [pixels(config.breakpoints.lg), large]] as const) {
      await resize(width);
      for (const element of elements) await expectSpace(element, 'gap', token);
    }
  });

  test('child default classes prevent parent responsive gaps from leaking', async () => {
    const screen = await render(<Stack gap={spacing}><Inline><span>Child</span></Inline></Stack>);
    await resize(pixels(config.breakpoints.lg));
    await expectSpace(screen.container.querySelector('.yarcl-stack')!, 'gap', large);
    await expectSpace(screen.container.querySelector('.yarcl-inline')!, 'gap', config.defaults.gap);
  });

  test('changes cross and main axis alignment on Stack', async () => {
    const screen = await render(<Stack align={{ base: 'stretch', lg: 'end' }} justify={{ base: 'start', lg: 'between' }} />);
    const element = screen.container.firstElementChild!;
    expect(getComputedStyle(element).alignItems).toBe('stretch');
    expect(getComputedStyle(element).justifyContent).toBe('flex-start');
    await resize(pixels(config.breakpoints.lg));
    await expect.poll(() => getComputedStyle(element).alignItems).toBe('flex-end');
    expect(getComputedStyle(element).justifyContent).toBe('space-between');
  });

  test('retains Inline default center alignment below its first override', async () => {
    const screen = await render(<Inline align={{ lg: 'start' }} />);
    const element = screen.container.firstElementChild!;
    expect(getComputedStyle(element).alignItems).toBe('center');
    await resize(pixels(config.breakpoints.lg));
    await expect.poll(() => getComputedStyle(element).alignItems).toBe('flex-start');
  });

  test.each([true, false])('changes Inline wrapping with base %s', async (base) => {
    const screen = await render(<Inline wrap={{ base, lg: !base }} />);
    const element = screen.container.firstElementChild!;
    expect(getComputedStyle(element).flexWrap).toBe(base ? 'wrap' : 'nowrap');
    await resize(pixels(config.breakpoints.lg));
    await expect.poll(() => getComputedStyle(element).flexWrap).toBe(base ? 'nowrap' : 'wrap');
    await resize(390);
    await expect.poll(() => getComputedStyle(element).flexWrap).toBe(base ? 'wrap' : 'nowrap');
  });

  test('defaults wrapping to true when base is omitted', async () => {
    const screen = await render(<Inline wrap={{ lg: false }} />);
    const element = screen.container.firstElementChild!;
    expect(getComputedStyle(element).flexWrap).toBe('wrap');
    await resize(pixels(config.breakpoints.lg));
    await expect.poll(() => getComputedStyle(element).flexWrap).toBe('nowrap');
  });

  test('changes numeric Grid columns and preserves sparse overrides', async () => {
    const screen = await render(<Grid columns={{ base: 1, md: 2, lg: 4 }} gap={spacing}>{[1, 2, 3, 4].map((i) => <div key={i}>{i}</div>)}</Grid>);
    const element = screen.container.firstElementChild!;
    expect(columns(element)).toBe(1);
    await resize(pixels(config.breakpoints.md));
    await expect.poll(() => columns(element)).toBe(2);
    await resize(pixels(config.breakpoints.lg));
    await expect.poll(() => columns(element)).toBe(4);
    await resize(pixels(config.breakpoints.xl) + 1);
    expect(columns(element)).toBe(4);
    await expectSpace(element, 'gap', large);
  });

  test('defaults Grid to one column when the base is omitted', async () => {
    const screen = await render(<Grid columns={{ md: 3 }}><span>Content</span></Grid>);
    const element = screen.container.firstElementChild!;
    expect(columns(element)).toBe(1);
    await resize(pixels(config.breakpoints.md));
    await expect.poll(() => columns(element)).toBe(3);
    await resize(pixels(config.breakpoints.xl));
    expect(columns(element)).toBe(3);
  });

  test('supports responsive raw CSS grid tracks and reverse map key order', async () => {
    const screen = await render(<Grid columns={{ lg: '120px minmax(0, 1fr)', md: 2, base: 1 }}><span>Menu</span><span>Content</span></Grid>);
    const element = screen.container.firstElementChild!;
    await resize(pixels(config.breakpoints.lg));
    await expect.poll(() => getComputedStyle(element).gridTemplateColumns.split(' ')[0]).toBe('120px');
    expect(columns(element)).toBe(2);
  });

  test('nested responsive Grids do not inherit parent breakpoint tracks', async () => {
    const screen = await render(<Grid columns={{ base: 1, md: 4 }}><Grid columns={{ base: 1, lg: 2 }}><span>One</span><span>Two</span></Grid></Grid>);
    const grids = [...screen.container.querySelectorAll('.yarcl-grid')];
    await resize(pixels(config.breakpoints.md));
    await expect.poll(() => columns(grids[0])).toBe(4);
    expect(columns(grids[1])).toBe(1);
    await resize(pixels(config.breakpoints.lg));
    await expect.poll(() => columns(grids[1])).toBe(2);
    expect(columns(grids[0])).toBe(4);
  });

  test('minItemWidth takes precedence over a responsive column map', async () => {
    const screen = await render(<Grid columns={{ base: 1, lg: 30 }} minItemWidth="150px"><span>One</span><span>Two</span></Grid>);
    const element = screen.container.firstElementChild!;
    expect(element.classList.contains('yarcl-grid-responsive')).toBe(false);
    await resize(pixels(config.breakpoints.lg));
    expect(columns(element)).toBeLessThan(30);
  });

  test('caller Grid style takes precedence over generated tracks', async () => {
    const screen = await render(<Grid columns={{ base: 1, lg: 4 }} style={{ gridTemplateColumns: '100px 1fr' }} />);
    const element = screen.container.firstElementChild!;
    await resize(pixels(config.breakpoints.lg));
    await expect.poll(() => getComputedStyle(element).gridTemplateColumns.split(' ')[0]).toBe('100px');
    expect(columns(element)).toBe(2);
  });

  test.each([
    ['Card', <Card padding={spacing}>Content</Card>, '.yarcl-card', 'paddingTop'],
    ['Alert padding', <Alert padding={spacing}>Saved</Alert>, '.yarcl-alert', 'paddingTop'],
    ['Alert gap', <Alert gap={spacing}>Saved</Alert>, '.yarcl-alert', 'gap'],
    ['EmptyState padding', <EmptyState title="No projects" padding={spacing} />, '.yarcl-empty-state', 'paddingTop'],
    ['EmptyState gap', <EmptyState title="No projects" gap={spacing} />, '.yarcl-empty-state', 'gap'],
    ['NavSection', <NavSection title="Work" gap={spacing}><NavItem href="#projects">Projects</NavItem></NavSection>, '.yarcl-nav-section', 'gap'],
  ] as const)('responds to spacing on %s', async (_name, content, selector, property) => {
    const screen = await render(content);
    const element = screen.container.querySelector(selector)!;
    await expectSpace(element, property, small, _name === 'Alert padding' ? 0.875 : _name === 'Alert gap' ? 1.5 : 1);
    await resize(pixels(config.breakpoints.lg));
    await expectSpace(element, property, large, _name === 'Alert padding' ? 0.875 : _name === 'Alert gap' ? 1.5 : 1);
  });

  test('responsive Card padding overrides root slots while preserving body slots', async () => {
    applyTheme({ ...config, components: { ...config.components, Card: { padding: small, slots: { root: { padding: large }, body: { padding: large } } } } });
    const screen = await render(<Card padding={{ lg: large }}><Card.Body>Content</Card.Body></Card>);
    const root = screen.container.querySelector('.yarcl-card')!;
    await expectSpace(root, 'paddingTop', small);
    await expectSpace(screen.container.querySelector('[data-part="body"]')!, 'paddingTop', large);
    await resize(pixels(config.breakpoints.lg));
    await expectSpace(root, 'paddingTop', large);
  });

  test('responsive AppLayout padding reaches the independently scrolling main', async () => {
    const screen = await render(<AppLayout desktopBreakpoint="lg" sidebarWidth="sidebar" navigationLabel="Work" navigation={<NavItem href="#projects">Projects</NavItem>} padding={spacing}><h1>Projects</h1></AppLayout>);
    const main = screen.container.querySelector('main')!;
    await expectSpace(main, 'paddingTop', small);
    await resize(pixels(config.breakpoints.lg));
    await expectSpace(main, 'paddingTop', large);
  });

  test('responsive toast gaps and padding use the active viewport', async () => {
    const screen = await render(<Toaster />);
    toast({ title: 'Saved', duration: 0, gap: spacing, padding: spacing });
    await expect.poll(() => screen.container.querySelector('.yarcl-toast')).not.toBeNull();
    const notification = screen.container.querySelector('.yarcl-toast')!;
    await expectSpace(notification, 'gap', small, 1.5);
    await expectSpace(notification, 'paddingTop', small, 0.75);
    await resize(pixels(config.breakpoints.lg));
    await expectSpace(notification, 'gap', large, 1.5);
    await expectSpace(notification, 'paddingTop', large, 0.75);
  });

  test('responsive Popover padding works in a portal', async () => {
    await render(<Popover defaultOpen><Popover.Trigger><Button>Details</Button></Popover.Trigger><Popover.Content padding={spacing} aria-label="Details">Content</Popover.Content></Popover>);
    await expect.poll(() => document.querySelector('.yarcl-popover')).not.toBeNull();
    const panel = document.querySelector('.yarcl-popover')!;
    await expectSpace(panel, 'paddingTop', small);
    await resize(pixels(config.breakpoints.lg));
    await expectSpace(panel, 'paddingTop', large);
    await page.keyboard.press('Escape');
  });

  test.each(['tooltip', 'hover-card'])('responsive %s padding works on a focusable trigger', async (kind) => {
    const screen = await render(kind === 'tooltip' ? <Tooltip padding={spacing} content="Help"><Button>Help</Button></Tooltip> : <HoverCard padding={spacing} content="Help"><Button>Help</Button></HoverCard>);
    (screen.container.querySelector('button') as HTMLButtonElement).focus();
    await page.mouse.move(100, 100);
    if (kind === 'hover-card') await page.getByRole('button', { name: 'Help', exact: true }).hover();
    await expect.poll(() => document.querySelector(`.yarcl-${kind}`)).not.toBeNull();
    const panel = document.querySelector(`.yarcl-${kind}`)!;
    await expectSpace(panel, 'paddingTop', small, kind === 'tooltip' ? 0.75 : 1);
    await resize(pixels(config.breakpoints.lg));
    await expectSpace(panel, 'paddingTop', large, kind === 'tooltip' ? 0.75 : 1);
    await page.keyboard.press('Escape');
  });

  test('keeps input value, focus, ref and mounted effects across viewport changes', async () => {
    const mounted = vi.fn();
    const ref = createRef<HTMLInputElement>();
    function Form() {
      useEffect(mounted, []);
      return <Stack as="form" gap={spacing} aria-label="Project"><Input ref={ref} aria-label="Project name" defaultValue="Draft" /></Stack>;
    }
    await render(<Form />);
    const original = ref.current!;
    original.focus();
    await page.keyboard.type(' project');
    const value = original.value;
    await resize(pixels(config.breakpoints.lg));
    await resize(390);
    expect(ref.current).toBe(original);
    expect(original.value).toBe(value);
    expect(document.activeElement).toBe(original);
    expect(mounted).toHaveBeenCalledTimes(1);
  });

  test('theme changes update spacing and breakpoint CSS without a resize', async () => {
    const screen = await render(<Stack gap={spacing}><Input aria-label="Note" defaultValue="Keep me" /></Stack>);
    const element = screen.container.firstElementChild!;
    const input = screen.container.querySelector('input')!;
    const next = { ...config, spacing: { ...config.spacing, [large]: '40px' }, breakpoints: { ...config.breakpoints, lg: '350px' } };
    applyTheme(next);
    await expect.poll(() => getComputedStyle(element).gap).toBe('40px');
    expect(screen.container.querySelector('input')).toBe(input);
    expect(input.value).toBe('Keep me');
    resetTheme();
    await expectSpace(element, 'gap', small);
  });

  test('unlayered caller CSS overrides responsive spacing and alignment', async () => {
    const style = document.createElement('style');
    style.textContent = '.custom-responsive { gap: 7px; align-items: baseline; }';
    document.head.append(style);
    try {
      const screen = await render(<Stack className="custom-responsive" gap={spacing} align={{ lg: 'end' }} />);
      await resize(pixels(config.breakpoints.lg));
      const element = screen.container.firstElementChild!;
      expect(getComputedStyle(element).gap).toBe('7px');
      expect(getComputedStyle(element).alignItems).toBe('baseline');
    } finally {
      style.remove();
    }
  });

  test.each(['yarcl', 'brutalist'] as const)('passes accessibility in the %s theme at narrow and wide viewports', async (name) => {
    applyTheme(themes[name]);
    const screen = await render(<Stack as="main" gap={{ base: 'sm', lg: 'lg' } as unknown as Responsive<Spacing>}><h1>Projects</h1><Grid columns={{ base: 1, lg: 2 }}><Card><Input aria-label="Project name" /></Card><Card><Button>Save</Button></Card></Grid></Stack>);
    for (const width of [390, 1100]) {
      await resize(width);
      const results = await axe.run(screen.container, { rules: { region: { enabled: false } } });
      expect(results.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) }))).toEqual([]);
    }
  });
}
