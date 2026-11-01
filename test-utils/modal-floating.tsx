import axe from 'axe-core';
import { beforeEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { AppLayout, Button, Combobox, Dialog, Drawer, HoverCard, Menu, Popover, Select, Tooltip } from '@yarcl/react';
import type { ReactNode } from 'react';
import { page } from './page';

const options = [{ value: 'public', label: 'Public' }, { value: 'confidential', label: 'Confidential' }];

async function openEditor(Shell: typeof Dialog | typeof Drawer, children: ReactNode) {
  const screen = await render(<main className="yarcl-root"><Shell title="Edit client" trigger={<Button>Open editor</Button>}>{children}</Shell></main>);
  await page.getByRole('button', { name: 'Open editor', exact: true }).click();
  const dialog = screen.container.querySelector('dialog')!;
  await expect.poll(() => dialog.matches(':modal')).toBe(true);
  return dialog;
}

async function panelIn(dialog: HTMLDialogElement, selector: string, interactive = true) {
  await expect.poll(() => dialog.querySelector(selector)).not.toBeNull();
  const panel = dialog.querySelector<HTMLElement>(selector)!;
  expect(panel.closest('dialog')).toBe(dialog);
  expect(getComputedStyle(panel).position).toBe('fixed');
  if (interactive) await expect.poll(() => {
    const box = panel.getBoundingClientRect();
    const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
    return hit != null && panel.contains(hit);
  }).toBe(true);
  return panel;
}

/** Checks modal portal roots, pointer hit testing, keyboard dismissal and nested focus in both brands. */
export function testModalFloating() {
  beforeEach(async () => {
    await page.setViewportSize({ width: 1100, height: 800 });
    await page.mouse.move(0, 0);
  });

  for (const [name, Shell] of [['dialog', Dialog], ['drawer', Drawer]] as const) {
    for (const kind of ['select', 'combobox', 'menu', 'popover', 'tooltip', 'hover card'] as const) {
      test(`${kind} remains interactive inside a ${name}`, async () => {
        const changed = vi.fn();
        const children = kind === 'select' ? <Select aria-label="Client type" defaultValue="public" onValueChange={changed} options={options} />
          : kind === 'combobox' ? <Combobox aria-label="Client type" defaultValue="public" onValueChange={changed} options={options} />
          : kind === 'menu' ? <Menu><Menu.Trigger><Button>Actions</Button></Menu.Trigger><Menu.Content><Menu.Item onSelect={changed}>Update client</Menu.Item></Menu.Content></Menu>
          : kind === 'popover' ? <Popover><Popover.Trigger><Button>Actions</Button></Popover.Trigger><Popover.Content aria-label="Client actions"><Button onClick={changed}>Update client</Button></Popover.Content></Popover>
          : kind === 'tooltip' ? <Tooltip content="Client help" delay={0}><Button>Help</Button></Tooltip>
          : <HoverCard content={<Button onClick={changed}>Preview action</Button>} openDelay={0} closeDelay={0}><Button>Preview</Button></HoverCard>;
        const dialog = await openEditor(Shell, children);
        if (kind === 'select' || kind === 'combobox') {
          await page.getByRole('combobox', { name: 'Client type', exact: true }).click();
          await panelIn(dialog, '[role="listbox"]');
          await page.getByRole('option', { name: 'Confidential', exact: true }).click();
          expect(changed).toHaveBeenCalledWith('confidential');
        } else if (kind === 'menu' || kind === 'popover') {
          await page.getByRole('button', { name: 'Actions', exact: true }).click();
          await panelIn(dialog, kind === 'menu' ? '[role="menu"]' : '.yarcl-popover');
          await page.getByRole(kind === 'menu' ? 'menuitem' : 'button', { name: 'Update client', exact: true }).click();
          expect(changed).toHaveBeenCalledOnce();
        } else if (kind === 'tooltip') {
          await page.getByRole('button', { name: 'Help', exact: true }).hover();
          await panelIn(dialog, '[role="tooltip"]', false);
        } else {
          await page.getByRole('button', { name: 'Preview', exact: true }).hover();
          await panelIn(dialog, '.yarcl-hover-card');
          await page.getByRole('button', { name: 'Preview action', exact: true }).click();
          expect(changed).toHaveBeenCalledOnce();
        }
        expect(dialog.open).toBe(true);
      });
    }

    for (const kind of ['menu', 'popover'] as const) {
      test(`an initially open ${kind} waits for its ${name} portal root`, async () => {
        await render(<main className="yarcl-root"><Shell defaultOpen title="Edit client">{kind === 'menu'
          ? <Menu defaultOpen><Menu.Trigger><Button>Actions</Button></Menu.Trigger><Menu.Content><Menu.Item>Update client</Menu.Item></Menu.Content></Menu>
          : <Popover defaultOpen><Popover.Trigger><Button>Actions</Button></Popover.Trigger><Popover.Content aria-label="Client actions"><Button>Update client</Button></Popover.Content></Popover>}
        </Shell></main>);
        const dialog = document.querySelector('dialog')!;
        await expect.poll(() => dialog.matches(':modal')).toBe(true);
        await panelIn(dialog, kind === 'menu' ? '[role="menu"]' : '.yarcl-popover');
      });
    }

    test(`Escape closes the popup before its ${name} and restores focus`, async () => {
      const dialog = await openEditor(Shell, <Select aria-label="Client type" options={options} />);
      const trigger = page.getByRole('combobox', { name: 'Client type', exact: true });
      await trigger.click();
      await panelIn(dialog, '[role="listbox"]');
      await page.keyboard.press('Escape');
      await expect.poll(() => dialog.querySelector('[role="listbox"]')).toBeNull();
      expect(dialog.open).toBe(true);
      expect(await trigger.evaluate((element) => element === document.activeElement)).toBe(true);
      await page.keyboard.press('Escape');
      await expect.poll(() => dialog.open).toBe(false);
      expect(await page.getByRole('button', { name: 'Open editor', exact: true }).evaluate((element) => element === document.activeElement)).toBe(true);
    });

    test(`a popup can extend beyond the ${name} without being clipped or closing it`, async () => {
      const changed = vi.fn();
      const dialog = await openEditor(Shell, <div style={{ display: 'flex', justifyContent: name === 'dialog' ? 'end' : 'start' }}>
        <Popover placement={name === 'dialog' ? 'right-start' : 'left-start'}><Popover.Trigger><Button>Actions</Button></Popover.Trigger>
          <Popover.Content aria-label="Client actions"><Button onClick={changed}>Update client</Button></Popover.Content>
        </Popover>
      </div>);
      await page.getByRole('button', { name: 'Actions', exact: true }).click();
      const panel = await panelIn(dialog, '.yarcl-popover');
      const box = panel.getBoundingClientRect();
      const frame = dialog.getBoundingClientRect();
      expect(name === 'dialog' ? box.right > frame.right : box.left < frame.left).toBe(true);
      await page.getByRole('button', { name: 'Update client', exact: true }).click();
      expect(changed).toHaveBeenCalledOnce();
      expect(dialog.open).toBe(true);
    });

    test(`a modal popover traps its focus without dismissing the ${name}`, async () => {
      const dialog = await openEditor(Shell, <Popover modal><Popover.Trigger><Button>Actions</Button></Popover.Trigger>
        <Popover.Content aria-label="Client actions"><Button>First action</Button><Button>Last action</Button></Popover.Content>
      </Popover>);
      await page.getByRole('button', { name: 'Actions', exact: true }).click();
      const panel = await panelIn(dialog, '.yarcl-popover');
      for (let index = 0; index < 4; index++) {
        await page.keyboard.press('Tab');
        expect(panel.contains(document.activeElement)).toBe(true);
      }
      await page.keyboard.press('Escape');
      await expect.poll(() => dialog.querySelector('.yarcl-popover')).toBeNull();
      expect(dialog.open).toBe(true);
    });
  }

  test('nested modals use the nearest dialog as the popup root', async () => {
    const changed = vi.fn();
    await openEditor(Drawer, <Dialog title="Nested editor" trigger={<Button>Open nested</Button>}>
      <Select aria-label="Client type" onValueChange={changed} options={options} />
    </Dialog>);
    await page.getByRole('button', { name: 'Open nested', exact: true }).click();
    const dialogs = document.querySelectorAll('dialog');
    await expect.poll(() => dialogs[1].matches(':modal')).toBe(true);
    await page.getByRole('combobox', { name: 'Client type', exact: true }).click();
    await panelIn(dialogs[1], '[role="listbox"]');
    await page.getByRole('option', { name: 'Confidential', exact: true }).click();
    expect(changed).toHaveBeenCalledWith('confidential');
    await page.keyboard.press('Escape');
    await expect.poll(() => dialogs[1].open).toBe(false);
    expect(dialogs[0].open).toBe(true);
  });

  test('portals outside modals retain absolute positioning and body placement', async () => {
    await render(<main className="yarcl-root"><Select aria-label="Client type" options={options} /></main>);
    await page.getByRole('combobox', { name: 'Client type', exact: true }).click();
    const panel = document.querySelector<HTMLElement>('[role="listbox"]')!;
    expect(panel.closest('dialog')).toBeNull();
    expect(getComputedStyle(panel).position).toBe('absolute');
    expect(document.body.contains(panel)).toBe(true);
  });

  test('navigation controls follow AppLayout into its mobile modal drawer', async () => {
    const changed = vi.fn();
    const screen = await render(<AppLayout desktopBreakpoint="lg" sidebarWidth="sidebar" navigationLabel="Workspace" menuLabel="Open navigation"
      navigation={<Select aria-label="Client type" onValueChange={changed} options={options} />} style={{ height: '500px' }}>Content</AppLayout>);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    const dialog = screen.container.querySelector('dialog')!;
    await expect.poll(() => dialog.matches(':modal')).toBe(true);
    await page.getByRole('combobox', { name: 'Client type', exact: true }).click();
    await panelIn(dialog, '[role="listbox"]');
    await page.keyboard.press('Escape');
    await expect.poll(() => dialog.querySelector('[role="listbox"]')).toBeNull();
    expect(dialog.open).toBe(true);
    await page.getByRole('combobox', { name: 'Client type', exact: true }).click();
    await page.getByRole('option', { name: 'Confidential', exact: true }).click();
    expect(changed).toHaveBeenCalledWith('confidential');
  });

  test('an open navigation popup moves between modal and page portal roots', async () => {
    const screen = await render(<AppLayout desktopBreakpoint="lg" sidebarWidth="sidebar" navigationLabel="Workspace" menuLabel="Open navigation"
      navigation={<Popover open><Popover.Trigger><Button>Actions</Button></Popover.Trigger><Popover.Content aria-label="Client actions"><Button>Update client</Button></Popover.Content></Popover>}
      style={{ height: '500px' }}>Content</AppLayout>);
    await expect.poll(() => document.querySelector('.yarcl-popover')?.closest('dialog')).toBeNull();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    const dialog = screen.container.querySelector('dialog')!;
    await expect.poll(() => dialog.matches(':modal')).toBe(true);
    await panelIn(dialog, '.yarcl-popover');
    await page.setViewportSize({ width: 1100, height: 800 });
    await expect.poll(() => document.querySelector('.yarcl-popover')?.closest('dialog')).toBeNull();
    expect(getComputedStyle(document.querySelector('.yarcl-popover')!).position).toBe('absolute');
  });

  test('modal controls and their portaled options pass accessibility checks', async () => {
    const dialog = await openEditor(Dialog, <Select aria-label="Client type" options={options} />);
    await page.getByRole('combobox', { name: 'Client type', exact: true }).click();
    await panelIn(dialog, '[role="listbox"]');
    expect((await axe.run(dialog)).violations.map(({ id }) => id)).toEqual([]);
  });
}
