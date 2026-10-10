import axe from 'axe-core';
import { createRef, useState } from 'react';
import { afterEach, beforeEach, expect, inject, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Button, TreeView, config, type TreeViewItem, type Color, type Size, type Radius } from '@yarcl/react';
import { applyTheme, resetTheme } from '@yarcl/react/css';
import { themes } from '@yarcl/react/themes';
import { page } from './page';

const items = [
  { id: 'projects', label: 'Projects', children: [
    { id: 'alpha', label: 'Alpha', children: [{ id: 'notes', label: 'Notes' }] },
    { id: 'beta', label: 'Beta' },
    { id: 'blocked', label: 'Blocked', disabled: true },
  ] },
  { id: 'archive', label: 'Archive', selectable: false, children: [{ id: 'old', label: 'Old files' }] },
  { id: 'readme', label: 'Readme' },
] as const satisfies readonly TreeViewItem[];

function node(name: string) {
  return page.getByRole('treeitem', { name, exact: true });
}
async function key(key: string) {
  await page.keyboard.press(key);
}
function label() {
  const id = document.activeElement?.getAttribute('aria-labelledby');
  return id ? document.getElementById(id)?.textContent : null;
}
function pixels(value: string) {
  const probe = document.createElement('div');
  probe.style.width = value;
  document.body.append(probe);
  const result = getComputedStyle(probe).width;
  probe.remove();
  return result;
}

/** Exercises tree semantics, focus, selection, expansion, data updates and consumer token styling. */
export function testTreeView() {
  beforeEach(async () => {
    await page.throttleCpu();
    document.documentElement.style.colorScheme = inject('scheme');
    await page.mouse.move(innerWidth - 1, innerHeight - 1);
  });
  afterEach(() => resetTheme());

  test('renders a named tree with correct nested roles and sibling metadata', async () => {
    const screen = await render(<TreeView aria-label="Files" items={items} defaultExpanded={['projects', 'alpha']} />);
    const tree = screen.container.querySelector('[role="tree"]')!;
    expect(tree.getAttribute('aria-label')).toBe('Files');
    const alpha = await node('Alpha').element();
    expect(alpha.getAttribute('aria-level')).toBe('2');
    expect(alpha.getAttribute('aria-posinset')).toBe('1');
    expect(alpha.getAttribute('aria-setsize')).toBe('3');
    expect(alpha.parentElement!.getAttribute('role')).toBe('group');
    expect((await node('Readme').element()).hasAttribute('aria-expanded')).toBe(false);
    expect((await node('Archive').element()).hasAttribute('aria-selected')).toBe(false);
    expect(screen.container.querySelectorAll('[tabindex="0"]').length).toBe(1);
  });

  test('tabs into the selected visible item and leaves with a single tab', async () => {
    await render(<><Button>Before</Button><TreeView aria-label="Files" items={items} defaultValue="readme" /><Button>After</Button></>);
    await page.getByRole('button', { name: 'Before', exact: true }).click();
    await key('Tab');
    expect(label()).toBe('Readme');
    await key('Tab');
    expect(document.activeElement?.textContent).toBe('After');
  });

  test('focuses the first item when the selection is hidden', async () => {
    const screen = await render(<TreeView aria-label="Files" items={items} defaultValue="beta" />);
    expect(screen.container.querySelector('[tabindex="0"]')?.getAttribute('aria-labelledby')).toBe(screen.container.querySelector('[role="treeitem"]')?.getAttribute('aria-labelledby'));
  });

  test('right opens a parent, enters its child, then left collapses or returns to its parent', async () => {
    await render(<TreeView aria-label="Files" items={items} />);
    await node('Projects').locator(':scope > .yarcl-tree-row').click();
    await key('ArrowRight');
    expect(await node('Projects').getAttribute('aria-expanded')).toBe('true');
    expect(label()).toBe('Projects');
    await key('ArrowRight');
    expect(label()).toBe('Alpha');
    await key('ArrowRight');
    await key('ArrowRight');
    expect(label()).toBe('Notes');
    await key('ArrowLeft');
    expect(label()).toBe('Alpha');
    await key('ArrowLeft');
    expect(await node('Alpha').getAttribute('aria-expanded')).toBe('false');
    await key('ArrowLeft');
    expect(label()).toBe('Projects');
  });

  test('up/down navigate visible items without wrapping or selecting', async () => {
    const change = vi.fn();
    await render(<TreeView aria-label="Files" items={items} defaultExpanded={['projects']} onValueChange={change} />);
    await node('Projects').locator(':scope > .yarcl-tree-row').click();
    change.mockClear();
    await key('ArrowUp');
    expect(label()).toBe('Projects');
    await key('ArrowDown');
    expect(label()).toBe('Alpha');
    await key('ArrowDown');
    expect(label()).toBe('Beta');
    await key('End');
    expect(label()).toBe('Readme');
    await key('ArrowDown');
    expect(label()).toBe('Readme');
    expect(change).not.toHaveBeenCalled();
  });

  test('home and end skip children in collapsed groups', async () => {
    await render(<TreeView aria-label="Files" items={items} />);
    await node('Projects').locator(':scope > .yarcl-tree-row').click();
    await key('End');
    expect(label()).toBe('Readme');
    await key('Home');
    expect(label()).toBe('Projects');
  });

  test('typing matches rich textValue labels and cycles repeated characters', async () => {
    await render(<TreeView aria-label="People" items={[{ id: 'first', label: 'Ada' }, { id: 'second', label: <strong>Account</strong>, textValue: 'Alan' }, { id: 'third', label: 'Grace' }]} />);
    await node('Ada').locator(':scope > .yarcl-tree-row').click();
    await key('a');
    expect(label()).toBe('Account');
    await key('a');
    expect(label()).toBe('Ada');
    await key('l');
    expect(label()).toBe('Account');
  });

  test('matches multiple type-ahead characters before the configured timeout', async () => {
    applyTheme({ ...config, timing: { ...config.timing, typeaheadTimeout: 10000 } });
    await render(<TreeView aria-label="Files" items={items} defaultExpanded={['projects']} />);
    await node('Projects').locator(':scope > .yarcl-tree-row').click();
    await key('b');
    expect(label()).toBe('Beta');
    await key('l');
    expect(label()).toBe('Blocked');
  });

  test('zero type-ahead timeout starts a fresh search after time advances', async () => {
    applyTheme({ ...config, timing: { ...config.timing, typeaheadTimeout: 0 } });
    await render(<TreeView aria-label="Files" items={items} defaultExpanded={['projects']} />);
    await node('Projects').locator(':scope > .yarcl-tree-row').click();
    await key('b');
    expect(label()).toBe('Beta');
    await key('r');
    expect(label()).toBe('Readme');
  });

  test('asterisk expands enabled siblings without selecting', async () => {
    const expanded = vi.fn();
    await render(<TreeView aria-label="Files" items={items} onExpandedChange={expanded} />);
    await node('Projects').locator(':scope > .yarcl-tree-row').click();
    await key('*');
    expect(expanded).toHaveBeenLastCalledWith(['projects', 'archive']);
    expect(await node('Archive').getAttribute('aria-expanded')).toBe('true');
    await key('*');
    expect(expanded).toHaveBeenCalledTimes(1);
  });

  test('selects with Enter and Space while focus stays on the current item', async () => {
    const selected = vi.fn();
    await render(<TreeView aria-label="Files" items={items} onValueChange={selected} />);
    await node('Projects').locator(':scope > .yarcl-tree-row').click();
    await key('End');
    await key('Enter');
    expect(selected).toHaveBeenLastCalledWith('readme');
    expect(await node('Readme').getAttribute('aria-selected')).toBe('true');
    await key(' ');
    expect(selected).toHaveBeenCalledTimes(2);
    expect(label()).toBe('Readme');
  });

  test('disclosure clicks expand without changing selection', async () => {
    const selected = vi.fn();
    const screen = await render(<TreeView aria-label="Files" items={items} onValueChange={selected} />);
    const toggle = screen.container.querySelector('[data-tree-toggle]') as HTMLElement;
    toggle.click();
    await expect.poll(() => screen.container.querySelector('[role="treeitem"]')?.getAttribute('aria-expanded')).toBe('true');
    expect(selected).not.toHaveBeenCalled();
    expect(label()).toBe('Projects');
  });

  test('double clicks expand a parent row', async () => {
    const screen = await render(<TreeView aria-label="Files" items={items} />);
    const row = screen.container.querySelector('.yarcl-tree-row')!;
    row.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    await expect.poll(() => screen.container.querySelector('[role="treeitem"]')?.getAttribute('aria-expanded')).toBe('true');
  });

  test('multiple selection toggles independently without modifiers', async () => {
    const changed = vi.fn();
    await render(<TreeView aria-label="Files" items={items} selectionMode="multiple" onValueChange={changed} />);
    await node('Projects').locator(':scope > .yarcl-tree-row').click();
    await key('End');
    await key(' ');
    expect(changed).toHaveBeenLastCalledWith(['projects', 'readme']);
    await key('Home');
    await key(' ');
    expect(changed).toHaveBeenLastCalledWith(['readme']);
    expect(await page.getByRole('tree', { name: 'Files', exact: true }).getAttribute('aria-multiselectable')).toBe('true');
  });

  test('switching multiple selection to single exposes only one selected item', async () => {
    const screen = await render(<TreeView aria-label="Files" items={items} selectionMode="multiple" defaultValue={['projects', 'readme']} />);
    await screen.rerender(<TreeView aria-label="Files" items={items} selectionMode="single" />);
    expect(screen.container.querySelectorAll('[aria-selected="true"]')).toHaveLength(1);
  });

  test('updating items while focus is outside the tree does not steal focus', async () => {
    function Example() {
      const [remove, setRemove] = useState(false);
      return <><TreeView aria-label="Files" items={remove ? items.slice(0, 2) : items} /><Button onClick={() => setRemove(true)}>Refresh files</Button></>;
    }
    await render(<Example />);
    await node('Readme').locator(':scope > .yarcl-tree-row').click();
    await page.getByRole('button', { name: 'Refresh files', exact: true }).click();
    expect(document.activeElement?.textContent).toBe('Refresh files');
  });

  test('controlled selection reports requests and waits for the parent', async () => {
    const changed = vi.fn();
    await render(<TreeView aria-label="Files" items={items} value="projects" onValueChange={changed} />);
    await node('Readme').locator(':scope > .yarcl-tree-row').click();
    expect(changed).toHaveBeenLastCalledWith('readme');
    expect(await node('Readme').getAttribute('aria-selected')).toBe('false');
    expect(await node('Projects').getAttribute('aria-selected')).toBe('true');
  });

  test('controlled expansion reports requests and waits for the parent', async () => {
    const changed = vi.fn();
    await render(<TreeView aria-label="Files" items={items} expanded={[]} onExpandedChange={changed} />);
    await node('Projects').locator(':scope > .yarcl-tree-row').click();
    await key('ArrowRight');
    expect(changed).toHaveBeenLastCalledWith(['projects']);
    expect(await node('Projects').getAttribute('aria-expanded')).toBe('false');
  });

  test('navigation-only trees omit selection and activate branches with Enter', async () => {
    const screen = await render(<TreeView aria-label="Files" items={items} selectionMode="none" />);
    await node('Projects').locator(':scope > .yarcl-tree-row').click();
    await key('Enter');
    expect(await node('Projects').getAttribute('aria-expanded')).toBe('true');
    expect(screen.container.querySelector('[aria-selected]')).toBeNull();
  });

  test('nonselectable parents can expand but do not change selection', async () => {
    const changed = vi.fn();
    await render(<TreeView aria-label="Files" items={items} onValueChange={changed} />);
    await node('Archive').locator(':scope > .yarcl-tree-row').click();
    await key(' ');
    await key('ArrowRight');
    expect(await node('Archive').getAttribute('aria-expanded')).toBe('true');
    expect(changed).not.toHaveBeenCalled();
  });

  test('disabled items are discoverable and do not select or expand', async () => {
    const changed = vi.fn();
    await render(<TreeView aria-label="Files" items={items} defaultExpanded={['projects']} onValueChange={changed} />);
    await node('Beta').locator(':scope > .yarcl-tree-row').click();
    changed.mockClear();
    await key('ArrowDown');
    expect(label()).toBe('Blocked');
    await key('Enter');
    await key(' ');
    expect(changed).not.toHaveBeenCalled();
    expect(await node('Blocked').getAttribute('aria-disabled')).toBe('true');
  });

  test('a disabled tree has no tab stop and ignores pointer or keyboard interaction', async () => {
    const changed = vi.fn();
    const screen = await render(<TreeView aria-label="Files" items={items} disabled onValueChange={changed} />);
    expect(screen.container.querySelector('[tabindex="0"]')).toBeNull();
    await node('Projects').locator(':scope > .yarcl-tree-row').click({ force: true });
    await key('Enter');
    expect(changed).not.toHaveBeenCalled();
    expect(await node('Projects').getAttribute('aria-expanded')).toBe('false');
  });

  test('cancelled native click and key handlers suppress internal actions', async () => {
    const screen = await render(<TreeView aria-label="Files" items={items} onClick={(event) => event.preventDefault()} onKeyDown={(event) => event.preventDefault()} />);
    const first = screen.container.querySelector('[role="treeitem"]') as HTMLElement;
    first.focus();
    await node('Projects').locator(':scope > .yarcl-tree-row').click();
    await key('ArrowRight');
    expect(first.getAttribute('aria-selected')).toBe('false');
    expect(first.getAttribute('aria-expanded')).toBe('false');
  });

  test('external collapse restores focus to the nearest visible ancestor', async () => {
    function Example() {
      const [expanded, setExpanded] = useState<('projects' | 'alpha')[]>(['projects', 'alpha']);
      return <TreeView aria-label="Files" items={items} expanded={expanded} onKeyDown={(event) => { if (event.key === 'Escape') setExpanded([]); }} />;
    }
    await render(<Example />);
    await node('Notes').locator(':scope > .yarcl-tree-row').click();
    await key('Escape');
    await expect.poll(label).toBe('Projects');
    expect(await node('Projects').getAttribute('aria-expanded')).toBe('false');
  });

  test('removing a focused item restores an available tab stop and focus', async () => {
    function Example() {
      const [remove, setRemove] = useState(false);
      return <TreeView aria-label="Files" items={remove ? items.slice(0, 2) : items} onKeyDown={(event) => { if (event.key === 'Delete') setRemove(true); }} />;
    }
    await render(<Example />);
    await node('Readme').locator(':scope > .yarcl-tree-row').click();
    await key('Delete');
    await expect.poll(label).toBe('Projects');
  });

  test('empty trees remain named and keyboard reachable', async () => {
    const ref = createRef<HTMLDivElement>();
    await render(<TreeView ref={ref} aria-label="No files" items={[]} />);
    expect(ref.current?.tabIndex).toBe(0);
    expect(ref.current?.getAttribute('role')).toBe('tree');
  });

  test('RTL navigation mirrors expansion keys and uses logical indentation', async () => {
    const screen = await render(<TreeView aria-label="Files" items={items} dir="rtl" />);
    await node('Projects').locator(':scope > .yarcl-tree-row').click();
    await key('ArrowLeft');
    expect(await node('Projects').getAttribute('aria-expanded')).toBe('true');
    const group = screen.container.querySelector('[role="group"]')!;
    expect(getComputedStyle(group).paddingRight).toBe(pixels(config.sizes[config.defaults.size].paddingX));
    await key('ArrowRight');
    expect(await node('Projects').getAttribute('aria-expanded')).toBe('false');
  });

  test('native refs, attributes, tokens and caller classes reach the root', async () => {
    const ref = createRef<HTMLDivElement>();
    const size = Object.keys(config.sizes)[0] as Size;
    const color = Object.keys(config.colors)[0] as Color;
    const radius = Object.keys(config.radii)[0] as Radius;
    await render(<TreeView ref={ref} aria-label="Files" items={items} size={size} color={color} radius={radius} title="Workspace" className="custom-tree" data-owner="Sam" />);
    expect(ref.current?.getAttribute('data-owner')).toBe('Sam');
    expect(ref.current?.className).toContain('custom-tree');
    const row = ref.current!.querySelector('.yarcl-tree-row')!;
    expect(getComputedStyle(row).minHeight).toBe(pixels(config.sizes[size].height));
    expect(getComputedStyle(row).borderRadius).toBe(pixels(config.radii[radius]));
    expect(getComputedStyle(ref.current!).fontSize).toBe(pixels(config.sizes[size].fontSize));
    expect(ref.current?.style.length).toBe(0);
  });

  test('runtime component defaults and allowed size overrides apply', async () => {
    const size = Object.keys(config.sizes)[0] as Size;
    applyTheme({ ...config, components: { ...config.components, TreeView: { size, sizeOverrides: { [size]: { height: '52px' } } } } });
    const screen = await render(<TreeView aria-label="Files" items={items} />);
    expect(getComputedStyle(screen.container.querySelector('.yarcl-tree-row')!).minHeight).toBe('52px');
  });

  test('runtime theme changes preserve expanded nodes, selection and focus', async () => {
    await render(<TreeView aria-label="Files" items={items} defaultExpanded={['projects']} defaultValue="beta" />);
    await node('Beta').locator(':scope > .yarcl-tree-row').click();
    const element = await node('Beta').element();
    applyTheme(themes.brutalist);
    await expect.poll(() => document.activeElement).toBe(element);
    expect(await node('Projects').getAttribute('aria-expanded')).toBe('true');
    expect(element.getAttribute('aria-selected')).toBe('true');
  });

  test.each(['yarcl', 'brutalist'] as const)('passes axe collapsed, expanded, selected and disabled states in %s', async (theme) => {
    applyTheme(themes[theme]);
    const screen = await render(<div className="yarcl-root"><TreeView aria-label="Files" items={items} selectionMode="multiple" defaultValue={['readme']} /></div>);
    for (const expanded of [false, true]) {
      if (expanded) { await node('Projects').locator(':scope > .yarcl-tree-row').click(); await key('ArrowRight'); }
      const audit = await axe.run(screen.container, { rules: { region: { enabled: false } } });
      expect(audit.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) }))).toEqual([]);
    }
  });
}
