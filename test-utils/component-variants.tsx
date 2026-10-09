import axe from 'axe-core';
import { afterEach, beforeEach, expect, inject, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import {
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  ButtonGroup,
  DatePicker,
  IconButton,
  Label,
  Pagination,
  SplitButton,
  ToggleGroup,
  config,
  type ComponentVariant,
} from '@yarcl/react';
import { applyTheme, resetTheme } from '@yarcl/react/css';
import type { YarclShape } from '@yarcl/react/define';
import { DesignReference } from '@yarcl/react/reference';
import { page } from './page';

const fill = { background: 'fill', border: 'color', text: 'on' } as const;
const plain = { background: 'none', border: 'none', text: 'neutral' } as const;
const shared = Object.keys(config.components.Badge.variants).find(
  (key) => key in config.components.Button.variants,
)! as ComponentVariant<'Button'> & ComponentVariant<'Badge'>;
const selected = config.defaults.variant;
const idle = config.defaults.softVariant;

/** Checks component-specific recipes, shared fallbacks and composite inheritance in both consumers. */
export function testComponentVariants() {
  beforeEach(async () => {
    document.documentElement.style.colorScheme = inject('scheme');
    await page.mouse.move(0, 0);
  });
  afterEach(() => resetTheme());

  test('reads distinct component defaults while other components use shared variants', async () => {
    const screen = await render(
      <main className="yarcl-root">
        <Button>Save</Button>
        <Badge>Approved</Badge>
        <Alert title="Shared recipe" />
      </main>,
    );
    const button = screen.container.querySelector('button')!;
    const badge = screen.container.querySelector('.yarcl-badge')!;
    const alert = screen.container.querySelector('.yarcl-alert')!;
    expect(button.classList.contains(`yarcl-Button-variant-${config.components.Button.variant}`)).toBe(true);
    expect(badge.classList.contains(`yarcl-Badge-variant-${config.components.Badge.variant}`)).toBe(true);
    expect(alert.classList.contains(`yarcl-variant-${idle}`)).toBe(true);
    expect(getComputedStyle(button).getPropertyValue('--yarcl-v-bg')).toBe(
      getComputedStyle(button).getPropertyValue('--yarcl-c'),
    );
    expect(getComputedStyle(badge).getPropertyValue('--yarcl-v-bg')).toContain('color-mix');
    const results = await axe.run(screen.container, { rules: { region: { enabled: false } } });
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
  });

  test('previews shared recipes and each local map separately in the design reference', async () => {
    const screen = await render(<DesignReference />);
    const sections = [...screen.container.querySelectorAll('section')];
    const section = (title: string) => sections.find((element) => element.querySelector('h2')?.textContent === title)!;
    const sharedButtons = [...section('Variants').querySelectorAll('button')];
    for (const key of Object.keys(config.variants)) {
      expect(sharedButtons.filter((button) => button.classList.contains(`yarcl-variant-${key}`))).toHaveLength(
        Object.keys(config.colors).length,
      );
    }
    for (const component of ['Button', 'Badge'] as const) {
      const buttons = [...section(`${component} variants`).querySelectorAll('button')];
      for (const key of Object.keys(config.components[component].variants)) {
        expect(buttons.filter((button) => button.classList.contains(`yarcl-${component}-variant-${key}`))).toHaveLength(
          Object.keys(config.colors).length,
        );
      }
    }
  });

  test('isolates identical keys, responds to theme changes and restores build-time recipes', async () => {
    const screen = await render(
      <main className="yarcl-root">
        <Button variant={shared}>Shared name</Button>
        <Badge variant={shared}>Shared name</Badge>
      </main>,
    );
    const button = screen.container.querySelector('button')!;
    const badge = screen.container.querySelector('.yarcl-badge')!;
    const before = [getComputedStyle(button).backgroundColor, getComputedStyle(badge).backgroundColor];
    const theme: YarclShape = {
      ...config,
      components: {
        ...config.components,
        Button: { ...config.components.Button, variants: { ...config.components.Button.variants, [shared]: fill } },
        Badge: { ...config.components.Badge, variants: { ...config.components.Badge.variants, [shared]: plain } },
      },
    };
    applyTheme(theme);
    await expect.poll(() => getComputedStyle(badge).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(button).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(button.classList.contains(`yarcl-Button-variant-${shared}`)).toBe(true);
    expect(badge.classList.contains(`yarcl-Badge-variant-${shared}`)).toBe(true);
    resetTheme();
    await expect
      .poll(() => [getComputedStyle(button).backgroundColor, getComputedStyle(badge).backgroundColor])
      .toEqual(before);
  });

  test('inherits a Button recipe through ButtonGroup while explicit child variants win', async () => {
    const clicked = vi.fn();
    const ref = { current: null as HTMLButtonElement | null };
    const screen = await render(
      <ButtonGroup variant={config.components.Button.variant} aria-label="Workflow">
        <Button ref={ref} onClick={clicked}>
          Save
        </Button>
        <IconButton aria-label="Grouped icon">+</IconButton>
        <Button variant={shared}>Explicit child</Button>
      </ButtonGroup>,
    );
    const buttons = [...screen.container.querySelectorAll('button')];
    const groupClass = `yarcl-Button-variant-${config.components.Button.variant}`;
    expect(buttons[0].classList.contains(groupClass)).toBe(true);
    expect(buttons[1].classList.contains(groupClass)).toBe(true);
    expect(buttons[2].classList.contains(`yarcl-Button-variant-${shared}`)).toBe(true);
    expect(ref.current).toBe(buttons[0]);
    await page.getByRole('button', { name: 'Save', exact: true }).focus();
    await page.keyboard.press('Enter');
    expect(clicked).toHaveBeenCalledTimes(1);
  });

  test('updates a group when a runtime theme removes the component map', async () => {
    const screen = await render(
      <ButtonGroup variant={shared} aria-label="Workflow">
        <Button>Save</Button>
        <IconButton aria-label="Grouped icon">+</IconButton>
      </ButtonGroup>,
    );
    applyTheme({ ...config, components: { ...config.components, Button: { variant: shared } } });
    await expect
      .poll(() =>
        [...screen.container.querySelectorAll('button')].every((button) =>
          button.classList.contains(`yarcl-variant-${shared}`),
        ),
      )
      .toBe(true);
    resetTheme();
    await expect
      .poll(() =>
        [...screen.container.querySelectorAll('button')].every((button) =>
          button.classList.contains(`yarcl-Button-variant-${shared}`),
        ),
      )
      .toBe(true);
  });

  test('keeps nested avatars independent from a ButtonGroup recipe', async () => {
    const screen = await render(
      <ButtonGroup variant={config.components.Button.variant} aria-label="Team actions">
        <Button>
          <Avatar name="Ada" />
          Contact Ada
        </Button>
      </ButtonGroup>,
    );
    const button = screen.container.querySelector('button')!;
    const avatar = screen.container.querySelector('.yarcl-avatar')!;
    expect(button.classList.contains(`yarcl-Button-variant-${config.components.Button.variant}`)).toBe(true);
    expect(avatar.classList.contains(`yarcl-variant-${idle}`)).toBe(true);
    expect([...avatar.classList].some((name) => name.startsWith('yarcl-Button-variant-'))).toBe(false);
  });

  test('uses local maps for links, split segments and alerts while Label stays plain without a default', async () => {
    const theme: YarclShape = {
      ...config,
      components: {
        ...config.components,
        IconButton: { variant: selected, variants: { [selected]: plain } },
        SplitButton: { variant: selected, variants: { [selected]: plain } },
        Alert: { variant: idle, variants: { [idle]: plain } },
        Label: { variants: { [idle]: fill } },
      },
    };
    applyTheme(theme);
    const screen = await render(
      <main className="yarcl-root">
        <Button href="/settings">Settings</Button>
        <IconButton href="/profile" aria-label="Profile">+</IconButton>
        <SplitButton options={[{ value: 'save', label: 'Save' }]} />
        <Alert title="Local alert" />
        <Label color={config.defaults.color}>Name</Label>
      </main>,
    );
    const button = screen.container.querySelector('a:not(.yarcl-icon-button)')!;
    const icon = screen.container.querySelector('.yarcl-icon-button')!;
    expect(button.classList.contains(`yarcl-Button-variant-${config.components.Button.variant}`)).toBe(true);
    expect(icon.classList.contains(`yarcl-IconButton-variant-${selected}`)).toBe(true);
    expect(getComputedStyle(icon).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    const segments = [...screen.container.querySelectorAll('.yarcl-split-button button')];
    expect(segments).toHaveLength(2);
    expect(segments.every((segment) => segment.classList.contains(`yarcl-SplitButton-variant-${selected}`))).toBe(true);
    expect(screen.container.querySelector('.yarcl-alert')!.classList.contains(`yarcl-Alert-variant-${idle}`)).toBe(true);
    const label = screen.container.querySelector('.yarcl-label')!;
    expect(label.classList.contains('yarcl-label-variant')).toBe(false);
    applyTheme({
      ...theme,
      components: { ...theme.components, Label: { variant: idle, variants: { [idle]: fill } } },
    });
    await expect.poll(() => label.classList.contains(`yarcl-Label-variant-${idle}`)).toBe(true);
    expect(getComputedStyle(label).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('applies a DatePicker recipe to selected days and preserves keyboard selection', async () => {
    applyTheme({
      ...config,
      components: {
        ...config.components,
        DatePicker: { variant: selected, variants: { [selected]: plain } },
      },
    });
    const changed = vi.fn();
    await render(<DatePicker aria-label="Date" defaultValue={new Date(2026, 8, 15)} onValueChange={changed} />);
    const trigger = page.getByRole('button', { name: 'Date', exact: true });
    await trigger.click();
    const day = page.getByRole('gridcell', { name: 'Tuesday, September 15th, 2026', exact: true });
    await expect.poll(() => day.getAttribute('class')).toContain(`yarcl-DatePicker-variant-${selected}`);
    expect(await day.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect.poll(() => page.getByRole('grid').count()).toBe(0);
    expect(changed.mock.calls[0][0].getDate()).toBe(16);
    await expect.poll(() => trigger.evaluate((element) => element === document.activeElement)).toBe(true);
  });

  test('uses ToggleGroup recipes on its Button children for selected and unselected states', async () => {
    const shape = config as YarclShape;
    applyTheme({
      ...config,
      components: {
        ...config.components,
        ToggleGroup: { ...shape.components?.ToggleGroup, variants: { [idle]: plain, [selected]: fill } },
      },
    });
    const screen = await render(
      <ToggleGroup type="single" defaultValue="first" aria-label="View">
        <ToggleGroup.Item value="first">First</ToggleGroup.Item>
        <ToggleGroup.Item value="second">Second</ToggleGroup.Item>
      </ToggleGroup>,
    );
    const buttons = [...screen.container.querySelectorAll('button')];
    expect(buttons[0].classList.contains(`yarcl-ToggleGroup-variant-${selected}`)).toBe(true);
    expect(buttons[1].classList.contains(`yarcl-ToggleGroup-variant-${idle}`)).toBe(true);
    await page.getByRole('button', { name: 'Second', exact: true }).click();
    await expect.poll(() => buttons[1].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[0].classList.contains(`yarcl-ToggleGroup-variant-${idle}`)).toBe(true);
    expect(buttons[1].classList.contains(`yarcl-ToggleGroup-variant-${selected}`)).toBe(true);
    expect(
      buttons.every((button) => ![...button.classList].some((name) => name.startsWith('yarcl-Button-variant-'))),
    ).toBe(true);
  });

  test('uses Pagination recipes on pages and navigation icons', async () => {
    const shape = config as YarclShape;
    applyTheme({
      ...config,
      components: {
        ...config.components,
        Pagination: {
          ...shape.components?.Pagination,
          variant: idle,
          selectedVariant: selected,
          variants: { [idle]: plain, [selected]: fill },
        },
      },
    });
    const screen = await render(<Pagination count={3} defaultValue={1} />);
    const active = () => screen.container.querySelector('button[aria-current="page"]')!;
    expect(active().classList.contains(`yarcl-Pagination-variant-${selected}`)).toBe(true);
    const others = [...screen.container.querySelectorAll('button:not([aria-current])')];
    expect(others.every((button) => button.classList.contains(`yarcl-Pagination-variant-${idle}`))).toBe(true);
    await page.locator('.yarcl-pagination-page').filter({ hasText: '2' }).click();
    await expect.poll(() => active().textContent).toBe('2');
    expect(active().classList.contains(`yarcl-Pagination-variant-${selected}`)).toBe(true);
  });

  test('inherits AvatarGroup recipes and preserves an explicit individual recipe', async () => {
    applyTheme({
      ...config,
      components: {
        ...config.components,
        Avatar: { variant: selected, variants: { [selected]: plain } },
        AvatarGroup: { variant: idle, variants: { [idle]: fill } },
      },
    });
    const screen = await render(
      <AvatarGroup aria-label="Team">
        <Avatar name="Ada" />
        <Avatar name="Grace" variant={selected} />
      </AvatarGroup>,
    );
    const avatars = [...screen.container.querySelectorAll('.yarcl-avatar')];
    expect(avatars[0].classList.contains(`yarcl-AvatarGroup-variant-${idle}`)).toBe(true);
    expect(avatars[1].classList.contains(`yarcl-Avatar-variant-${selected}`)).toBe(true);
    expect(getComputedStyle(avatars[0]).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(avatars[1]).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });

  test('inherits Avatar component defaults when the group has no variant config', async () => {
    applyTheme({
      ...config,
      components: {
        ...config.components,
        Avatar: { variant: selected, variants: { [selected]: fill } },
        AvatarGroup: {},
      },
    });
    const screen = await render(
      <AvatarGroup aria-label="Team">
        <Avatar name="Ada" />
      </AvatarGroup>,
    );
    expect(
      screen.container.querySelector('.yarcl-avatar')!.classList.contains(`yarcl-Avatar-variant-${selected}`),
    ).toBe(true);
  });
}
