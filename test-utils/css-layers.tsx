import axe from 'axe-core';
import { afterEach, beforeEach, expect, inject, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { Button, Dialog, Input, Label, Slider, Table, Text, config, createComponent } from '@yarcl/react';
import { applyTheme, generateCss, resetTheme } from '@yarcl/react/css';
import { generateTokensCss } from '@yarcl/react/generate';
import baseCss from '../library/src/styles.css?raw';
import referenceCss from '../library/src/reference/reference.css?raw';
import starlightReset from '../docs-web/node_modules/@astrojs/starlight/dist/style/reset.css?raw';
import tailwindReset from 'tailwindcss/preflight.css?raw';
import { page } from './page';

const Action = createComponent('Action', Button);
const added: HTMLElement[] = [];

/** Loads consumer CSS before library styles and registers it for cleanup. */
function prependCss(css: string) {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.prepend(style);
  added.push(style);
}

/** Resolves a config dimension using the browser's active root font size. */
function pixels(value: string) {
  const probe = document.createElement('div');
  probe.style.width = value;
  document.body.append(probe);
  const width = getComputedStyle(probe).width;
  probe.remove();
  return width;
}

/** Verifies consumer overrides, stylesheet ordering and reset integration with both design systems. */
export function testCssLayers() {
  const scheme = inject('scheme');
  beforeEach(() => {
    document.documentElement.style.colorScheme = scheme;
  });
  afterEach(() => {
    added.splice(0).forEach((element) => element.remove());
    resetTheme();
  });

  test('lets an earlier consumer class override base styles, interactive states and recipe styles', async () => {
    prependCss('.consumer-action { background: rgb(12, 34, 56); font-weight: 300; opacity: 0.7; transition: none; }');
    const screen = await render(
      <Action emphasis="strong" className="consumer-action">
        Save changes
      </Action>,
    );
    const button = screen.container.querySelector('button')!;
    const overrides = () => {
      const style = getComputedStyle(button);
      expect(style.backgroundColor).toBe('rgb(12, 34, 56)');
      expect(style.fontWeight).toBe('300');
      expect(style.opacity).toBe('0.7');
    };
    overrides();
    const box = button.getBoundingClientRect();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    overrides();
    await page.mouse.down();
    try {
      overrides();
    } finally {
      await page.mouse.up();
    }
    await screen.rerender(
      <Action emphasis="strong" className="consumer-action" disabled>
        Save changes
      </Action>,
    );
    overrides();
    applyTheme({
      ...config,
      recipes: { ...config.recipes, Action: { ...config.recipes.Action, slots: { root: { fontWeight: 900 } } } },
    });
    await expect.poll(() => getComputedStyle(button).fontWeight).toBe('300');
    overrides();
    resetTheme();
    overrides();
  });

  test('keeps earlier consumer token overrides when applying and resetting a theme', async () => {
    prependCss(':root { --yarcl-neutral-bg: rgb(23, 45, 67); }');
    const screen = await render(<main className="yarcl-root">Application</main>);
    const root = screen.container.firstElementChild!;
    expect(getComputedStyle(root).backgroundColor).toBe('rgb(23, 45, 67)');
    applyTheme({ ...config, neutrals: { ...config.neutrals, bg: { light: '#ffffff', dark: '#000000' } } });
    await expect.poll(() => getComputedStyle(root).backgroundColor).toBe('rgb(23, 45, 67)');
    resetTheme();
    expect(getComputedStyle(root).backgroundColor).toBe('rgb(23, 45, 67)');
  });

  test('lets a later application layer override yarcl even when its rules load first', async () => {
    prependCss(
      '@layer theme, base, yarcl, components, utilities; @layer utilities { .consumer-utility { background: rgb(12, 34, 56); font-weight: 300; } }',
    );
    const screen = await render(
      <Action emphasis="strong" className="consumer-utility">
        Utility override
      </Action>,
    );
    const button = screen.container.querySelector('button')!;
    expect(getComputedStyle(button).backgroundColor).toBe('rgb(12, 34, 56)');
    expect(getComputedStyle(button).fontWeight).toBe('300');
  });

  test('loads every library selector and animation inside a named layer', () => {
    for (const css of [baseCss, referenceCss, generateCss(config), generateTokensCss(config)]) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
      const rules = [...sheet.cssRules];
      expect(rules[0].cssText).toBe('@layer yarcl.tokens, yarcl.base, yarcl.recipes;');
      const blocks = rules.slice(1).filter((rule) => !rule.cssText.startsWith('@custom-media '));
      expect(blocks.length).toBeGreaterThan(0);
      for (const block of blocks) {
        expect(block).toBeInstanceOf(CSSLayerBlockRule);
        expect(['yarcl.base', 'yarcl.tokens', 'yarcl.recipes']).toContain((block as CSSLayerBlockRule).name);
        expect((block as CSSLayerBlockRule).cssRules.length).toBeGreaterThan(0);
      }
    }
    expect(baseCss).not.toContain('!important');
    expect(referenceCss).not.toContain('!important');
  });

  test.each(['base-first', 'tokens-first'] as const)(
    'preserves tokens and recipes when styles load %s',
    async (order) => {
      await page.mouse.move(0, 0);
      const screen = await render(
        <>
          <Action emphasis="strong">Layer order</Action>
          <Label size={config.defaults.size}>Sized label</Label>
          <Slider.Range defaultValue={[20, 80]} aria-label="Invalid range" aria-invalid="true" />
          <Table density={config.defaults.density}>
            <Table.Body>
              <Table.Row>
                <Table.Cell data-layer-cell>Plain text</Table.Cell>
                <Table.Cell>
                  <Text data-layer-auto>Automatic text</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text textStyle={config.defaults.textStyle} data-layer-explicit>
                    Explicit text
                  </Text>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </>,
      );
      const frame = document.createElement('iframe');
      added.push(frame);
      document.body.append(frame);
      const doc = frame.contentDocument!;
      const styles = order === 'base-first' ? [baseCss, generateCss(config)] : [generateCss(config), baseCss];
      for (const css of styles) {
        const style = doc.createElement('style');
        style.textContent = css;
        doc.head.append(style);
      }
      doc.documentElement.style.colorScheme = scheme;
      doc.body.innerHTML = screen.container.innerHTML;
      const button = doc.querySelector('button')!;
      const style = frame.contentWindow!.getComputedStyle(button);
      expect(style.fontWeight).toBe('700');
      const radius = config.recipes.Action.slots.root.borderRadius;
      expect(style.borderTopLeftRadius).toBe(pixels(config.radii[radius.key as keyof typeof config.radii]));
      expect(style.backgroundColor).toBe(getComputedStyle(screen.container.querySelector('button')!).backgroundColor);
      expect(style.height).toBe(getComputedStyle(screen.container.querySelector('button')!).height);
      const computed = (selector: string) => frame.contentWindow!.getComputedStyle(doc.querySelector(selector)!);
      expect(computed('.yarcl-label').fontSize).toBe(pixels(computed('.yarcl-label').getPropertyValue('--yarcl-fs')));
      expect(computed('[data-layer-auto]').fontSize).toBe(computed('[data-layer-cell]').fontSize);
      expect(computed('[data-layer-explicit]').fontSize).toBe(
        pixels(config.typography.styles[config.defaults.textStyle].size),
      );
      expect(computed('.yarcl-slider').getPropertyValue('--yarcl-c')).toBe(
        computed('html').getPropertyValue('--yarcl-error'),
      );
    },
  );

  const resets = [
    ['Tailwind', `@layer theme, base, yarcl, components, utilities; @layer base { ${tailwindReset} }`],
    ['Starlight', `@layer starlight, yarcl; ${starlightReset}`],
  ];
  test.each(resets)(
    'preserves keyboard focus, dialog centering and accessibility under a %s reset',
    async (_, reset) => {
      prependCss(reset);
      const screen = await render(
        <main className="yarcl-root">
          <Dialog trigger={<Button>Open settings</Button>} title="Settings" description="Account details">
            <label>
              Email
              <Input type="email" />
            </label>
          </Dialog>
        </main>,
      );
      await page.keyboard.press('Tab');
      await page.getByRole('button', { name: 'Open settings' }).focus();
      const button = screen.container.querySelector('button')!;
      expect(button.matches(':focus-visible')).toBe(true);
      expect(getComputedStyle(button).outlineStyle).toBe(
        'style' in config.focusRing ? config.focusRing.style : 'solid',
      );
      expect(getComputedStyle(button).outlineWidth).toBe(pixels(config.focusRing.width));
      expect(getComputedStyle(button).outlineOffset).toBe(pixels(config.focusRing.offset));
      await page.keyboard.press('Enter');
      const dialog = screen.container.querySelector('dialog')!;
      await expect.poll(() => dialog.open).toBe(true);
      const box = dialog.getBoundingClientRect();
      expect(Math.abs(box.left - (innerWidth - box.right))).toBeLessThan(2);
      expect(Math.abs(box.top - (innerHeight - box.bottom))).toBeLessThan(2);
      expect(getComputedStyle(document.documentElement).overflow).toBe('hidden');
      expect(dialog.contains(document.activeElement)).toBe(true);
      const results = await axe.run(dialog, { rules: { region: { enabled: false } } });
      expect(results.violations.map((violation) => violation.id)).toEqual([]);
      await page.keyboard.press('Escape');
      await expect.poll(() => dialog.open).toBe(false);
      expect(document.activeElement).toBe(button);
      expect(getComputedStyle(document.documentElement).overflow).not.toBe('hidden');
    },
  );
}
