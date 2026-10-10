import { useId, useLayoutEffect, useMemo, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { useMergeRefs } from '@floating-ui/react';
import { colorClass, cx, radiusClass, sizeClass } from '../classes';
import { useControllable } from '../hooks';
import { useConfig, useDefaults } from '../runtime';
import type { TokenProps } from '../types';

/** A uniquely identified node in a {@link TreeView}. Labels should contain noninteractive content. */
export interface TreeViewItem<V extends string = string> {
  /** Stable, unique identifier across the entire tree. */
  id: V;
  /** Visible accessible label. */
  label: ReactNode;
  /** Plain text for type-ahead when the label contains rich content. */
  textValue?: string;
  /** Decorative icon displayed before the label. */
  icon?: ReactNode;
  /** Prevents selection and expansion while keeping the item discoverable by keyboard. */
  disabled?: boolean;
  /** Allows focus and expansion without selection. @default true */
  selectable?: boolean;
  /** Nested nodes. An empty array makes this a leaf. */
  children?: readonly TreeViewItem<V>[];
}

/** Native attributes, expansion state and token props shared by every TreeView selection mode. */
export interface TreeViewBaseProps<V extends string = string> extends Omit<ComponentProps<'div'>, 'children' | 'color' | 'defaultValue' | 'onChange'>, TokenProps<'TreeView'> {
  /** Hierarchical items, with unique identifiers. */
  items: readonly TreeViewItem<V>[];
  /** Controlled expanded parent identifiers. */
  expanded?: readonly NoInfer<V>[];
  /** Initially expanded parents when uncontrolled. @default [] */
  defaultExpanded?: readonly NoInfer<V>[];
  /** Called when the expanded parent identifiers change. */
  onExpandedChange?: (expanded: V[]) => void;
  /** Disables all interaction and removes the tree from the tab order. */
  disabled?: boolean;
}

/** Props for {@link TreeView}. A name is required; selection mode determines the value and callback types. */
export type TreeViewProps<V extends string = string> = TreeViewBaseProps<V>
  & ({ 'aria-label': string; 'aria-labelledby'?: string } | { 'aria-label'?: string; 'aria-labelledby': string })
  & (
    | {
      /** Selects one item. @default 'single' */
      selectionMode?: 'single';
      /** Controlled selection. `null` clears selection. */
      value?: NoInfer<V> | null;
      /** Initially selected item when uncontrolled. @default null */
      defaultValue?: NoInfer<V> | null;
      /** Called when an item is selected. Focus movement does not select. */
      onValueChange?: (value: V | null) => void;
    }
    | {
      /** Toggles items independently without requiring modifier keys. */
      selectionMode: 'multiple';
      /** Controlled selected identifiers. */
      value?: readonly NoInfer<V>[];
      /** Initially selected identifiers when uncontrolled. @default [] */
      defaultValue?: readonly NoInfer<V>[];
      /** Called with the selected identifiers. */
      onValueChange?: (value: V[]) => void;
    }
    | {
      /** Allows navigation and expansion without selection. */
      selectionMode: 'none';
      value?: never;
      defaultValue?: never;
      onValueChange?: never;
    }
  );

interface Node<V extends string> {
  item: TreeViewItem<V>;
  parent: V | null;
  level: number;
  position: number;
  count: number;
  index: number;
}

function flatten<V extends string>(items: readonly TreeViewItem<V>[]) {
  const result: Node<V>[] = [];
  const ids = new Set<V>();
  function visit(nodes: readonly TreeViewItem<V>[], parent: V | null, level: number) {
    nodes.forEach((item, index) => {
      if (ids.has(item.id)) throw new Error(`yarcl: TreeView item id "${item.id}" must be unique`);
      ids.add(item.id);
      result.push({ item, parent, level, position: index + 1, count: nodes.length, index: result.length });
      visit(item.children ?? [], item.id, level + 1);
    });
  }
  visit(items, null, 1);
  return result;
}

const values = <V extends string>(value: V | readonly V[] | null | undefined): readonly V[] => value == null ? [] : typeof value === 'string' ? [value] : value;

/**
 * An accessible hierarchy with independent focus, expansion and single or multiple selection.
 * Arrow keys navigate, Home/End move to the edges, typing finds visible labels, and Enter/Space select.
 * @example
 * ```tsx
 * <TreeView aria-label="Files" defaultExpanded={['projects']}
 *   items={[{ id: 'projects', label: 'Projects', children: [{ id: 'readme', label: 'README' }] }]} />
 * ```
 */
export function TreeView<const V extends string = string>(props: TreeViewProps<V>) {
  const config = useConfig();
  const own = useDefaults('TreeView');
  const { items, expanded: expandedProp, defaultExpanded = [], onExpandedChange, selectionMode = 'single', value: valueProp, defaultValue, onValueChange: _onValueChange, size, radius, color, disabled, className, onKeyDown, onClick, onDoubleClick, onFocus, onBlur, ref, ...rest } = props;
  const root = useRef<HTMLDivElement>(null);
  const mergedRef = useMergeRefs([root, ref]);
  const id = useId();
  const all = useMemo(() => flatten(items), [items]);
  const byId = new Map(all.map((node) => [node.item.id, node]));
  const [expanded, setExpanded] = useControllable<readonly V[]>(expandedProp, defaultExpanded, (next) => onExpandedChange?.([...next]));
  const [selection, setSelected] = useControllable<readonly V[]>(valueProp === undefined ? undefined : values(valueProp), values(defaultValue), (next) => {
    if (props.selectionMode === 'multiple') props.onValueChange?.([...next]);
    else if (props.selectionMode !== 'none') props.onValueChange?.(next[0] ?? null);
  });
  const expandedIds = new Set(expanded);
  const selected = selectionMode === 'single' ? selection.slice(0, 1) : selection;
  const selectedIds = new Set(selected);
  const visible: Node<V>[] = [];
  const visibleIds = new Set<V>();
  for (const node of all) {
    if (node.parent !== null && (!visibleIds.has(node.parent) || !expandedIds.has(node.parent))) continue;
    visible.push(node);
    visibleIds.add(node.item.id);
  }
  const [active, setActive] = useState<V | null>(null);
  const hadFocus = useRef(false);
  const search = useRef({ text: '', time: 0 });
  let focusId = active;
  while (focusId !== null && !visibleIds.has(focusId)) focusId = byId.get(focusId)?.parent ?? null;
  focusId ??= visible.find((node) => selectedIds.has(node.item.id))?.item.id ?? visible[0]?.item.id ?? null;

  function element(node: Node<V>) {
    return root.current?.querySelector<HTMLDivElement>(`[data-tree-index="${node.index}"]`);
  }
  function focus(node: Node<V> | undefined) {
    if (!node) return;
    setActive(node.item.id);
    element(node)?.focus();
  }
  useLayoutEffect(() => {
    if (!hadFocus.current || disabled) return;
    const node = focusId === null ? undefined : byId.get(focusId);
    const target = node ? element(node) : root.current;
    if (target && target !== document.activeElement && (document.activeElement === document.body || root.current?.contains(document.activeElement))) target.focus();
  });

  function toggle(node: Node<V>) {
    if (disabled || node.item.disabled || !node.item.children?.length) return;
    setExpanded(expandedIds.has(node.item.id) ? expanded.filter((value) => value !== node.item.id) : [...expanded, node.item.id]);
  }
  function select(node: Node<V>) {
    if (disabled || node.item.disabled || node.item.selectable === false || selectionMode === 'none') return;
    const value = node.item.id;
    if (selectionMode === 'multiple') setSelected(selectedIds.has(value) ? selected.filter((entry) => entry !== value) : [...selected, value]);
    else if (selected[0] !== value) setSelected([value]);
  }
  function eventNode(target: EventTarget | null) {
    if (!(target instanceof Element) || target.closest('[role="tree"]') !== root.current) return;
    const row = target.closest<HTMLElement>('[data-tree-index]');
    return row ? all[Number(row.dataset.treeIndex)] : undefined;
  }
  function draw(nodes: readonly TreeViewItem<V>[]) {
    return nodes.map((item) => {
      const node = byId.get(item.id)!;
      const branch = !!item.children?.length;
      const open = branch && expandedIds.has(item.id);
      return <div key={item.id} role="treeitem" aria-labelledby={`${id}-${node.index}-label`} aria-expanded={branch ? open : undefined} aria-selected={selectionMode !== 'none' && item.selectable !== false ? selectedIds.has(item.id) : undefined} aria-disabled={disabled || item.disabled || undefined} aria-level={node.level} aria-posinset={node.position} aria-setsize={node.count} tabIndex={!disabled && focusId === item.id ? 0 : -1} className="yarcl-tree-item" data-tree-index={node.index}>
        <div className="yarcl-tree-row" data-part="item">
          <span className="yarcl-tree-toggle" data-tree-toggle={branch || undefined} aria-hidden="true">{branch && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 5 7 7-7 7" /></svg>}</span>
          {item.icon != null && <span className="yarcl-tree-icon" aria-hidden="true">{item.icon}</span>}
          <span className="yarcl-tree-label" id={`${id}-${node.index}-label`}>{item.label}</span>
        </div>
        {branch && <div role="group" className="yarcl-tree-group" hidden={!open}>{draw(item.children!)}</div>}
      </div>;
    });
  }

  return <div {...rest} ref={mergedRef} role="tree" aria-multiselectable={selectionMode === 'multiple' || undefined} aria-disabled={disabled || undefined} tabIndex={disabled ? -1 : rest.tabIndex ?? (visible.length ? undefined : 0)} className={cx('yarcl-tree', sizeClass(size ?? own.size, 'TreeView'), radiusClass(radius ?? own.radius, size ?? own.size), colorClass(color ?? own.color), className)}
    onFocus={(event) => { onFocus?.(event); hadFocus.current = true; const node = eventNode(event.target); if (node) setActive(node.item.id); }}
    onBlur={(event) => { onBlur?.(event); if (!event.currentTarget.contains(event.relatedTarget)) { hadFocus.current = false; search.current = { text: '', time: 0 }; } }}
    onClick={(event) => { onClick?.(event); if (event.defaultPrevented || disabled) return; const node = eventNode(event.target); if (!node) return; focus(node); if ((event.target as Element).closest('[data-tree-toggle]')) toggle(node); else select(node); }}
    onDoubleClick={(event) => { onDoubleClick?.(event); if (!event.defaultPrevented && !(event.target as Element).closest('[data-tree-toggle]')) { const node = eventNode(event.target); if (node) toggle(node); } }}
    onKeyDown={(event) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || disabled) return;
      const node = eventNode(event.target);
      if (!node) return;
      const index = visible.indexOf(node);
      const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
      const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
      const backward = rtl ? 'ArrowRight' : 'ArrowLeft';
      if (event.key === 'ArrowDown') focus(visible[Math.min(index + 1, visible.length - 1)]);
      else if (event.key === 'ArrowUp') focus(visible[Math.max(0, index - 1)]);
      else if (event.key === 'Home') focus(visible[0]);
      else if (event.key === 'End') focus(visible[visible.length - 1]);
      else if (event.key === forward) { if (node.item.children?.length) { if (!expandedIds.has(node.item.id)) toggle(node); else focus(visible[index + 1]); } }
      else if (event.key === backward) { if (expandedIds.has(node.item.id) && node.item.children?.length) toggle(node); else if (node.parent !== null) focus(byId.get(node.parent)); }
      else if (event.key === 'Enter' || event.key === ' ') { if (selectionMode === 'none') toggle(node); else select(node); }
      else if (event.key === '*') {
        const siblings = all.filter((entry) => entry.parent === node.parent && entry.item.children?.length && !entry.item.disabled && !expandedIds.has(entry.item.id));
        if (siblings.length) setExpanded([...expanded, ...siblings.map((entry) => entry.item.id)]);
      }
      else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const now = Date.now();
        const text = (now - search.current.time >= config.timing.typeaheadTimeout ? '' : search.current.text) + event.key.toLocaleLowerCase();
        const query = [...text].every((character) => character === text[0]) ? text[0] : text;
        search.current = { text: query, time: now };
        const candidates = [...visible.slice(index + 1), ...visible.slice(0, index + 1)];
        const match = candidates.find((entry) => (entry.item.textValue ?? element(entry)?.querySelector('.yarcl-tree-label')?.textContent ?? '').trim().toLocaleLowerCase().startsWith(query));
        focus(match);
      } else return;
      event.preventDefault();
    }}>{draw(items)}</div>;
}
