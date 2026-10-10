import axe from 'axe-core';
import { afterEach, beforeEach, expect, inject, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { Button, Card, Combobox, Dialog, Drawer, Input, Menu, Select, Table, Tabs, config, type Density, type Radius, type Shadow, type Spacing } from '@yarcl/react';
import { applyTheme, resetTheme } from '@yarcl/react/css';
import type { YarclShape } from '@yarcl/react/define';
import { page } from './page';

const spacing = Object.keys(config.spacing) as Spacing[];
const radii = Object.keys(config.radii) as Radius[];
const shadows = Object.keys(config.shadows) as Shadow[];
const densities = Object.keys(config.density) as Density[];
const small = spacing[0];
const large = spacing[spacing.length - 1];
const round = radii[radii.length - 1];
const style = config.defaults.helperStyle;

function measure(value: string) {
  const element = document.createElement('div');
  element.style.width = value;
  document.body.append(element);
  const width = getComputedStyle(element).width;
  element.remove();
  return width;
}

function theme(components: YarclShape['components']) {
  applyTheme({ ...config, components: { ...config.components, ...components } });
}

function cells() {
  return <><Table.Head><Table.Row><Table.SelectAllCell /><Table.HeaderCell sortable>Name</Table.HeaderCell></Table.Row></Table.Head><Table.Body><Table.Row><Table.SelectionCell aria-label="Select Ada" /><Table.Cell>Ada</Table.Cell></Table.Row></Table.Body></>;
}

/** Checks component parts, theme updates, precedence, portals and accessibility in both consumer brands. */
export function testComponentSlots() {
  beforeEach(async () => {
    document.documentElement.style.colorScheme = inject('scheme');
    await page.mouse.move(0, 0);
  });
  afterEach(() => resetTheme());

  test('loads slot settings from the injected consumer config', async () => {
    const screen = await render(<main className="yarcl-root"><Card><Card.Body>Details</Card.Body></Card><Table caption="People">{cells()}</Table></main>);
    const body = screen.container.querySelector('[data-part="body"]')!;
    const header = screen.container.querySelector('[data-part="header"]')!;
    expect(getComputedStyle(body).paddingTop).toBe(measure(config.spacing[config.components.Card.slots.body.padding]));
    expect(getComputedStyle(header).fontSize).toBe(measure(config.typography.styles.label.size));
    expect(getComputedStyle(header).fontWeight).toBe(String(config.typography.styles.label.weight));
    expect(screen.container.querySelectorAll('[data-part="root"]')).toHaveLength(2);
    expect(screen.container.querySelectorAll('[data-part="row"]')).toHaveLength(2);
    expect(screen.container.querySelectorAll('th[data-part="header"]')).toHaveLength(2);
    expect(screen.container.querySelectorAll('td[data-part="cell"]')).toHaveLength(2);
    expect(screen.container.querySelector('[data-part="root"]')!.getAttribute('style')).toBeNull();
    const results = await axe.run(screen.container, { rules: { region: { enabled: false } } });
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
  });

  test('styles all card parts while ordinary children keep their composition', async () => {
    theme({ Card: { slots: { root: { radius: 'square', border: 'double', borderWidth: 'width' }, header: { padding: small, textStyle: style }, body: { padding: large }, footer: { padding: small, background: 'tint' } } } });
    let headerRef: HTMLDivElement | null = null;
    const screen = await render(<Card as="article"><Card.Header ref={(element) => { headerRef = element; }}>Plan</Card.Header><Card.Body><Input aria-label="Name" /></Card.Body><Card.Footer><Button>Save</Button></Card.Footer></Card>);
    const root = screen.container.querySelector('article')!;
    expect(root.children).toHaveLength(3);
    expect(getComputedStyle(root).borderRadius).toBe(measure(config.radii.square));
    expect(getComputedStyle(root).borderTopStyle).toBe('double');
    expect(getComputedStyle(root).borderTopWidth).toBe(measure(config.borders.width));
    expect(headerRef).toBe(root.children[0]);
    expect(getComputedStyle(root.children[0]).paddingTop).toBe(measure(config.spacing[small]));
    expect(getComputedStyle(root.children[1]).paddingTop).toBe(measure(config.spacing[large]));
    expect(getComputedStyle(root.children[2]).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(root.children[0]).fontSize).toBe(measure(config.typography.styles[style].size));
  });

  test('keeps explicit card radius, padding and shadow above root slot settings', async () => {
    theme({ Card: { radius: 'square', padding: small, shadow: shadows[0], slots: { root: { radius: 'square', padding: small, shadow: shadows[0] } } } });
    const screen = await render(<><Card>Default</Card><Card radius={round} padding={large} shadow={shadows[shadows.length - 1]}>Explicit</Card></>);
    const [defaultCard, explicitCard] = screen.container.querySelectorAll('[data-part="root"]');
    expect(getComputedStyle(defaultCard).paddingTop).toBe(measure(config.spacing[small]));
    expect(getComputedStyle(explicitCard).paddingTop).toBe(measure(config.spacing[large]));
    expect(getComputedStyle(explicitCard).borderRadius).toBe(measure(config.radii[round]));
    expect(getComputedStyle(explicitCard).boxShadow).not.toBe(getComputedStyle(defaultCard).boxShadow);
  });

  test('lets root slots override component defaults when props are omitted', async () => {
    theme({ Card: { radius: round, padding: large, slots: { root: { radius: 'square', padding: small } } }, Table: { radius: round, slots: { root: { radius: 'square' } } } });
    const screen = await render(<><Card>Plan</Card><Table>{cells()}</Table></>);
    const [card, table] = screen.container.querySelectorAll('[data-part="root"]');
    expect(getComputedStyle(card).paddingTop).toBe(measure(config.spacing[small]));
    expect(getComputedStyle(card).borderRadius).toBe(measure(config.radii.square));
    expect(getComputedStyle(table).borderRadius).toBe(measure(config.radii.square));
  });

  test('styles all table cells and gives header text styles priority', async () => {
    theme({ Table: { slots: { root: { radius: 'square', border: 'dashed' }, cell: { density: densities[0], textStyle: style }, header: { textStyle: 'label' } } } });
    const screen = await render(<Table caption="People">{cells()}</Table>);
    for (const cell of screen.container.querySelectorAll('th, td')) {
      expect(getComputedStyle(cell.querySelector('.yarcl-table-sort-button') ?? cell).paddingTop).toBe(measure(config.density[densities[0]].paddingY));
    }
    expect(getComputedStyle(screen.container.querySelector('th')!).fontSize).toBe(measure(config.typography.styles.label.size));
    expect(getComputedStyle(screen.container.querySelector('td')!).fontSize).toBe(measure(config.typography.styles[style].size));
    expect(getComputedStyle(screen.container.querySelector('[data-part="root"]')!).borderTopStyle).toBe('dashed');
  });

  test('keeps explicit table radius and density above slot values', async () => {
    theme({ Table: { slots: { root: { radius: 'square' }, cell: { density: densities[0] } } } });
    const screen = await render(<Table radius={round} density={densities[densities.length - 1]}>{cells()}</Table>);
    expect(getComputedStyle(screen.container.querySelector('[data-part="root"]')!).borderRadius).toBe(measure(config.radii[round]));
    for (const cell of screen.container.querySelectorAll('th, td')) {
      expect(getComputedStyle(cell.querySelector('.yarcl-table-sort-button') ?? cell).paddingTop).toBe(measure(config.density[densities[densities.length - 1]].paddingY));
    }
  });

  test('keeps a nested table’s configured density independent of an outer explicit density', async () => {
    theme({ Table: { slots: { cell: { density: densities[0] } } } });
    const screen = await render(<Table density={densities[densities.length - 1]}><Table.Body><Table.Row><Table.Cell><Table><Table.Body><Table.Row><Table.Cell>Nested</Table.Cell></Table.Row></Table.Body></Table></Table.Cell></Table.Row></Table.Body></Table>);
    const [outer, inner] = screen.container.querySelectorAll('td');
    expect(getComputedStyle(outer).paddingTop).toBe(measure(config.density[densities[densities.length - 1]].paddingY));
    expect(getComputedStyle(inner).paddingTop).toBe(measure(config.density[densities[0]].paddingY));
  });

  test('keeps stripe backgrounds visible behind cells with configured backgrounds', async () => {
    theme({ Table: { slots: { row: { background: 'surface' }, cell: { background: 'tint' } } } });
    const screen = await render(<Table striped><Table.Body><Table.Row><Table.Cell>First</Table.Cell></Table.Row><Table.Row><Table.Cell>Second</Table.Cell></Table.Row></Table.Body></Table>);
    const [first, second] = screen.container.querySelectorAll('tr');
    expect(getComputedStyle(first).backgroundColor).not.toBe(getComputedStyle(second).backgroundColor);
    expect(getComputedStyle(second.children[0]).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });

  test('gives cell padding priority over the density spacing', async () => {
    theme({ Table: { slots: { cell: { padding: large, density: densities[0] } } } });
    const screen = await render(<Table>{cells()}</Table>);
    const cell = screen.container.querySelector('td')!;
    expect(getComputedStyle(cell.querySelector('.yarcl-table-sort-button') ?? cell).paddingTop).toBe(measure(config.spacing[large]));
    expect(getComputedStyle(cell).paddingLeft).toBe(measure(config.spacing[large]));
  });

  test('preserves selected and hovered row backgrounds with configured slots', async () => {
    theme({ Table: { slots: { row: { background: 'surface' }, cell: { background: 'tint' } } } });
    const screen = await render(<Table interactive><Table.Body><Table.Row><Table.Cell>Idle</Table.Cell></Table.Row><Table.Row selected><Table.Cell>Selected</Table.Cell></Table.Row></Table.Body></Table>);
    const [idle, selected] = screen.container.querySelectorAll('tr');
    expect(getComputedStyle(selected).backgroundColor).not.toBe(getComputedStyle(idle).backgroundColor);
    expect(getComputedStyle(selected.children[0]).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    await page.getByRole('cell', { name: 'Idle', exact: true }).hover();
    expect(getComputedStyle(idle).backgroundColor).not.toBe(getComputedStyle(selected).backgroundColor);
    expect(getComputedStyle(idle.children[0]).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });

  test('updates part styles without replacing mounted content and restores the injected config', async () => {
    theme({ Card: { slots: { body: { padding: large } } } });
    const screen = await render(<Card><Card.Body><Input aria-label="Project" /></Card.Body></Card>);
    const body = screen.container.querySelector('[data-part="body"]')!;
    await page.getByRole('textbox', { name: 'Project' }).fill('Keep this value');
    expect(getComputedStyle(body).paddingTop).toBe(measure(config.spacing[large]));
    theme({ Card: { slots: { body: { padding: small } } } });
    await expect.poll(() => getComputedStyle(body).paddingTop).toBe(measure(config.spacing[small]));
    expect(screen.container.querySelector('[data-part="body"]')).toBe(body);
    expect(await page.getByRole('textbox', { name: 'Project' }).inputValue()).toBe('Keep this value');
    resetTheme();
    await expect.poll(() => getComputedStyle(body).paddingTop).toBe(measure(config.spacing[config.components.Card.slots.body.padding]));
  });

  test('deactivates build-time slot rules when a runtime theme omits parts or properties', async () => {
    const screen = await render(<><Card><Card.Body>Details</Card.Body></Card><Table>{cells()}</Table></>);
    const body = screen.container.querySelector('[data-part="body"]')!;
    const header = screen.container.querySelector('th')!;
    expect(getComputedStyle(body).paddingTop).toBe(measure(config.spacing[config.components.Card.slots.body.padding]));
    theme({ Card: { slots: { body: { textStyle: style } } }, Table: { slots: { header: { background: 'surface' } } } });
    await expect.poll(() => getComputedStyle(body).paddingTop).toBe('0px');
    await expect.poll(() => getComputedStyle(header).fontWeight).toBe('600');
    applyTheme({ ...config, components: {} });
    await expect.poll(() => body.className).not.toContain('yarcl-slot-Card-body');
    expect(header.className).not.toContain('yarcl-slot-Table-header');
    expect(body.getAttribute('data-part')).toBe('body');
    expect(getComputedStyle(body).paddingTop).toBe('0px');
    resetTheme();
    await expect.poll(() => getComputedStyle(body).paddingTop).toBe(measure(config.spacing[config.components.Card.slots.body.padding]));
  });

  test.each([Dialog, Drawer])('styles native modal parts while keeping focus and Escape behavior', async (Modal) => {
    const settings = { root: { border: 'dotted', radius: 'square' }, header: { padding: small, textStyle: style }, body: { padding: large }, footer: { padding: small, background: 'tint' } } as const;
    theme({ Dialog: { slots: settings }, Drawer: { slots: settings } });
    const screen = await render(<main className="yarcl-root"><Modal trigger={<Button>Open panel</Button>} title="Settings" description="Choose preferences" footer={<Button>Save</Button>}><Input aria-label="Preference" /></Modal></main>);
    const trigger = page.getByRole('button', { name: 'Open panel' });
    await trigger.click();
    const dialog = screen.container.querySelector('dialog')!;
    expect(dialog.open).toBe(true);
    expect(getComputedStyle(dialog).borderLeftStyle).toBe('dotted');
    for (const part of ['header', 'body', 'footer']) expect(dialog.querySelector(`[data-part="${part}"]`)).not.toBeNull();
    expect(getComputedStyle(dialog.querySelector('[data-part="body"]')!).paddingTop).toBe(measure(config.spacing[large]));
    expect(getComputedStyle(dialog.querySelector('h2')!).fontSize).toBe(measure(config.typography.styles[style].size));
    expect(dialog.contains(document.activeElement)).toBe(true);
    const results = await axe.run(dialog, { rules: { region: { enabled: false } } });
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
    await page.keyboard.press('Escape');
    await expect.poll(() => dialog.open).toBe(false);
    expect(await trigger.evaluate((element) => element === document.activeElement)).toBe(true);
  });

  test('keeps an explicit dialog radius above its root slot', async () => {
    theme({ Dialog: { radius: 'square', slots: { root: { radius: 'square' } } } });
    const screen = await render(<Dialog defaultOpen title="Details" radius={round}>Content</Dialog>);
    expect(getComputedStyle(screen.container.querySelector('dialog')!).borderRadius).toBe(measure(config.radii[round]));
  });

  test('styles tab lists and triggers while keeping keyboard selection and the indicator', async () => {
    theme({ Tabs: { slots: { list: { padding: small, border: 'dashed' }, trigger: { radius: 'square', textStyle: style, background: 'tint' } } } });
    const screen = await render(<Tabs defaultValue="first"><Tabs.List aria-label="Details"><Tabs.Trigger value="first">First</Tabs.Trigger><Tabs.Trigger value="second">Second</Tabs.Trigger></Tabs.List><Tabs.Panel value="first">First content</Tabs.Panel><Tabs.Panel value="second">Second content</Tabs.Panel></Tabs>);
    const list = screen.container.querySelector('[data-part="list"]')!;
    expect(getComputedStyle(list).paddingTop).toBe(measure(config.spacing[small]));
    expect(getComputedStyle(list).borderTopStyle).toBe('dashed');
    const [first, second] = screen.container.querySelectorAll('[data-part="trigger"]');
    expect(getComputedStyle(first).fontSize).toBe(measure(config.typography.styles[style].size));
    expect(getComputedStyle(first).borderBottomColor).not.toBe(getComputedStyle(second).borderBottomColor);
    await page.getByRole('tab', { name: 'First', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    expect(second.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(second);
    const results = await axe.run(screen.container, { rules: { region: { enabled: false } } });
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
  });

  test('styles portaled menu items including radio items without losing active contrast', async () => {
    theme({ Menu: { slots: { panel: { radius: 'square', padding: small, border: 'dashed' }, item: { padding: large, textStyle: style, background: 'tint' } } } });
    await render(<Menu><Menu.Trigger><Button>Actions</Button></Menu.Trigger><Menu.Content><Menu.Item>Rename</Menu.Item><Menu.RadioGroup value="draft" aria-label="Status"><Menu.RadioItem value="draft">Draft</Menu.RadioItem></Menu.RadioGroup></Menu.Content></Menu>);
    await page.getByRole('button', { name: 'Actions' }).click();
    const panel = document.querySelector('[role="menu"]')!;
    expect(panel.getAttribute('data-part')).toBe('panel');
    expect(getComputedStyle(panel).borderTopStyle).toBe('dashed');
    const items = panel.querySelectorAll('[data-part="item"]');
    expect(items).toHaveLength(2);
    for (const item of items) expect(getComputedStyle(item).paddingTop).toBe(measure(config.spacing[large]));
    await page.keyboard.press('Home');
    await expect.poll(() => items[0].hasAttribute('data-active')).toBe(true);
    expect(getComputedStyle(items[0]).backgroundColor).not.toBe(getComputedStyle(items[1]).backgroundColor);
    const results = await axe.run(panel, { rules: { region: { enabled: false } } });
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
    await page.keyboard.press('Escape');
    await expect.poll(() => document.querySelector('[role="menu"]')).toBeNull();
  });

  test.each(['select', 'combobox', 'multiple'] as const)('styles the shared listbox in %s and preserves selection', async (kind) => {
    theme({ Listbox: { slots: { panel: { radius: 'square', padding: small, shadow: shadows[0] }, item: { padding: large, textStyle: style, background: 'tint' } } } });
    const options = [{ value: 'ada', label: 'Ada' }, { value: 'grace', label: 'Grace' }];
    await render(kind === 'select' ? <Select aria-label="Person" options={options} /> : kind === 'multiple' ? <Combobox multiple aria-label="Person" options={options} /> : <Combobox aria-label="Person" options={options} />);
    await page.getByRole('combobox', { name: 'Person', exact: true }).click();
    const panel = document.querySelector('[role="listbox"]')!;
    expect(panel.getAttribute('data-part')).toBe('panel');
    expect(getComputedStyle(panel).borderRadius).toBe(measure(config.radii.square));
    const items = panel.querySelectorAll('[data-part="item"]');
    expect(items).toHaveLength(2);
    for (const item of items) expect(getComputedStyle(item).paddingTop).toBe(measure(config.spacing[large]));
    const results = await axe.run(panel, { rules: { region: { enabled: false } } });
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
    await page.getByRole('option', { name: 'Grace', exact: true }).click();
    if (kind === 'select') expect(await page.getByRole('combobox', { name: 'Person', exact: true }).textContent()).toContain('Grace');
    else if (kind === 'combobox') expect(await page.getByRole('combobox', { name: 'Person', exact: true }).inputValue()).toBe('Grace');
    else expect(await page.getByRole('button', { name: /Remove Grace/ }).count()).toBe(1);
  });
}
