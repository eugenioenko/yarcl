import { useLayoutEffect, useRef, type ComponentProps } from 'react';
import { useMergeRefs } from '@floating-ui/react';
import { cx } from '../classes';
import { Checkbox } from './Checkbox';
import type { TableColumnState } from '../table-columns';

/** Props for `Table.Columns`. */
export interface TableColumnsProps extends Omit<ComponentProps<'colgroup'>, 'children' | 'span'> {
  /** Visible columns, in the same order used for header and body cells. Widths are CSS pixels. */
  columns: readonly Pick<TableColumnState, 'id' | 'width'>[];
}

/** Renders explicit column widths. Pair with useTableColumns.tableStyle for a stable fixed table layout. */
export function TableColumns({ columns, className, ...props }: TableColumnsProps) {
  if (new Set(columns.map((column) => column.id)).size !== columns.length || columns.some((column) => !Number.isFinite(column.width) || column.width <= 0)) throw new Error('yarcl: Table.Columns requires unique identifiers and positive finite widths');
  return <colgroup {...props} className={cx('yarcl-table-columns', className)}>{columns.map((column) => <col key={column.id} style={{ width: column.width }} />)}</colgroup>;
}

/** Props for `Table.ColumnVisibility`. */
export interface TableColumnVisibilityProps<Id extends string = string> extends Omit<ComponentProps<'fieldset'>, 'children' | 'onChange'> {
  /** Resolved columns from useTableColumns, including hidden columns. */
  columns: readonly TableColumnState<Id>[];
  /** Visible legend naming the group. */
  label: string;
  /** Requests a column visibility change. Pass useTableColumns.setVisible. */
  onVisibilityChange: (id: Id, visible: boolean) => void;
}

/** Displays labeled native checkboxes, keeping required and last-visible columns selected. */
export function TableColumnVisibility<Id extends string>({ columns, label, onVisibilityChange, className, ...props }: TableColumnVisibilityProps<Id>) {
  return <fieldset {...props} className={cx('yarcl-table-column-visibility', className)}><legend>{label}</legend>
    {columns.map((column) => <Checkbox key={column.id} checked={column.visible} disabled={!column.hideable} onChange={(event) => onVisibilityChange(column.id, event.currentTarget.checked)}>{column.label}</Checkbox>)}
  </fieldset>;
}

/** Props for `Table.ColumnResizer` and Table.HeaderCell.resize. Width values are CSS pixels. */
export interface TableColumnResizerProps extends Omit<ComponentProps<'span'>, 'children' | 'onChange' | 'aria-label'> {
  /** Accessible name identifying the column being resized. */
  'aria-label': string;
  /** Accepted column width in CSS pixels. */
  value: number;
  /** Smallest width in CSS pixels. Must be positive and finite. */
  min: number;
  /** Largest width in CSS pixels. Must be finite and greater than min. */
  max: number;
  /** Requests a new width during pointer movement or keyboard adjustment. */
  onValueChange?: (value: number) => void;
  /** Called after a completed drag or keyboard adjustment. Canceled drags do not commit. */
  onValueCommit?: (value: number) => void;
  /** Width adjustment for arrow keys, in CSS pixels. @default 1 */
  step?: number;
  /** Width adjustment for PageUp and PageDown, in CSS pixels. @default 10 */
  largeStep?: number;
  /** Prevents resizing and removes the handle from the tab order. */
  disabled?: boolean;
  /** Optional accessible description of the width. */
  formatValue?: (value: number) => string;
}

/** A vertical separator for pointer and keyboard column resizing. Usually rendered by Table.HeaderCell.resize. */
export function TableColumnResizer({ value: raw, min, max, onValueChange, onValueCommit, step = 1, largeStep = 10, disabled, formatValue, className, ref, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onLostPointerCapture, onKeyDown, ...props }: TableColumnResizerProps) {
  if (!Number.isFinite(raw) || !Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || min >= max) throw new Error('yarcl: Table.ColumnResizer requires a finite width and 0 < min < max');
  if (!Number.isFinite(step) || step <= 0 || !Number.isFinite(largeStep) || largeStep <= 0) throw new Error('yarcl: Table.ColumnResizer steps must be positive and finite');
  const root = useRef<HTMLSpanElement>(null);
  const mergedRef = useMergeRefs([root, ref]);
  const clamp = (width: number) => Math.min(max, Math.max(min, width));
  const value = clamp(raw);
  const dragging = useRef<{ id: number; x: number; width: number; direction: number; latest: number } | null>(null);
  function cancel() {
    const drag = dragging.current;
    dragging.current = null;
    if (drag && root.current?.hasPointerCapture(drag.id)) root.current.releasePointerCapture(drag.id);
  }
  useLayoutEffect(() => { if (disabled) cancel(); });
  useLayoutEffect(() => cancel, [min, max, props.dir]);
  function update(width: number, commit = false) {
    const next = clamp(width);
    if (next !== value) { onValueChange?.(next); if (commit) onValueCommit?.(next); }
    return next;
  }
  return <span {...props} ref={mergedRef} role="separator" aria-orientation="vertical" aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-valuetext={formatValue?.(value)} aria-disabled={disabled || undefined} tabIndex={disabled ? -1 : 0} className={cx('yarcl-table-column-resizer', className)}
    onPointerDown={(event) => {
      onPointerDown?.(event);
      if (event.defaultPrevented || disabled || dragging.current || event.button !== 0 || !event.isPrimary) return;
      event.preventDefault();
      dragging.current = { id: event.pointerId, x: event.clientX, width: value, direction: getComputedStyle(event.currentTarget).direction === 'rtl' ? -1 : 1, latest: value };
      event.currentTarget.setPointerCapture(event.pointerId); event.currentTarget.focus();
    }}
    onPointerMove={(event) => {
      onPointerMove?.(event); const drag = dragging.current;
      if (!drag || drag.id !== event.pointerId || disabled || event.defaultPrevented) return;
      drag.latest = update(drag.width + (event.clientX - drag.x) * drag.direction);
    }}
    onPointerUp={(event) => { onPointerUp?.(event); const drag = dragging.current; if (!drag || drag.id !== event.pointerId) return; cancel(); if (!disabled && !event.defaultPrevented) onValueCommit?.(drag.latest); }}
    onPointerCancel={(event) => { onPointerCancel?.(event); if (dragging.current?.id === event.pointerId) cancel(); }}
    onLostPointerCapture={(event) => { onLostPointerCapture?.(event); if (dragging.current?.id === event.pointerId) cancel(); }}
    onKeyDown={(event) => {
      onKeyDown?.(event); if (disabled || event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey) return;
      const forward = getComputedStyle(event.currentTarget).direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      const backward = forward === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
      let next: number;
      if (event.key === forward) next = value + step;
      else if (event.key === backward) next = value - step;
      else if (event.key === 'PageUp') next = value + largeStep;
      else if (event.key === 'PageDown') next = value - largeStep;
      else if (event.key === 'Home') next = min;
      else if (event.key === 'End') next = max;
      else return;
      event.preventDefault(); update(next, true);
    }} />;
}
