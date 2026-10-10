import { useId, useLayoutEffect, useRef, type ComponentProps, type CSSProperties, type ReactNode } from 'react';
import { useMergeRefs } from '@floating-ui/react';
import { colorClass, cx, radiusClass, sizeClass } from '../classes';
import { useControllable } from '../hooks';
import { useDefaults } from '../runtime';
import type { TokenProps } from '../types';

/** Props for {@link SplitPane}. Pane sizes are percentages of the space available around the separator. */
export interface SplitPaneProps extends Omit<ComponentProps<'div'>, 'children' | 'color' | 'defaultValue' | 'onChange'>, TokenProps<'SplitPane'> {
  /** Content of the first pane, at the inline start or top. */
  primary: ReactNode;
  /** Content of the second pane. */
  secondary: ReactNode;
  /** Accessible name shared by the first pane and its separator. */
  primaryLabel: string;
  /** Optional accessible name for the second pane. */
  secondaryLabel?: string;
  /** Pane arrangement. The separator has the opposite orientation. @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';
  /** Controlled percentage assigned to the first pane. */
  value?: number;
  /** Initial first-pane percentage when uncontrolled. @default 50 */
  defaultValue?: number;
  /** Called while dragging or using the keyboard. */
  onValueChange?: (value: number) => void;
  /** Called after a completed drag or a keyboard adjustment. Canceled drags do not commit. */
  onValueCommit?: (value: number) => void;
  /** Smallest first-pane percentage, between zero and max. @default 10 */
  min?: number;
  /** Largest first-pane percentage, between min and 100. @default 90 */
  max?: number;
  /** Percentage-point adjustment for arrow keys. Dragging remains continuous. @default 1 */
  step?: number;
  /** Percentage-point adjustment for PageUp and PageDown. @default 10 */
  largeStep?: number;
  /** Prevents resizing and removes the separator from the tab order. */
  disabled?: boolean;
  /** Optional screen-reader description of the first pane's percentage. */
  formatValue?: (value: number) => string;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Two scrollable panes separated by a pointer- and keyboard-resizable divider.
 * Arrow keys resize, Home/End reach the limits, and Enter minimizes or restores the first pane.
 * Nest SplitPane components to create additional panes.
 * @example
 * ```tsx
 * <SplitPane primaryLabel="Files" primary={<FileList />} secondary={<Editor />}
 *   defaultValue={30} min={20} max={60} />
 * ```
 */
export function SplitPane({ primary, secondary, primaryLabel, secondaryLabel, orientation = 'horizontal', value: valueProp, defaultValue = 50, onValueChange, onValueCommit, min = 10, max = 90, step = 1, largeStep = 10, disabled, formatValue, size, radius, color, className, style, ref, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onLostPointerCapture, onKeyDown, onFocus, onBlur, ...rest }: SplitPaneProps) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max > 100 || min >= max) throw new Error('yarcl: SplitPane requires 0 <= min < max <= 100');
  if (!Number.isFinite(step) || step <= 0 || !Number.isFinite(largeStep) || largeStep <= 0) throw new Error('yarcl: SplitPane steps must be positive and finite');
  if (!Number.isFinite(valueProp ?? defaultValue)) throw new Error('yarcl: SplitPane value must be finite');
  const own = useDefaults('SplitPane');
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLDivElement>(null);
  const second = useRef<HTMLDivElement>(null);
  const mergedRef = useMergeRefs([root, ref]);
  const [raw, setValue] = useControllable(valueProp, defaultValue, onValueChange);
  const value = clamp(raw, min, max);
  const previous = useRef(value > min ? value : clamp(defaultValue > min ? defaultValue : (min + max) / 2, min, max));
  const focused = useRef<HTMLElement | null>(null);
  const dragging = useRef<{ id: number; coordinate: number; value: number; extent: number; direction: number; latest: number } | null>(null);

  function cancel() {
    const drag = dragging.current;
    dragging.current = null;
    if (drag && handle.current?.hasPointerCapture(drag.id)) handle.current.releasePointerCapture(drag.id);
  }
  useLayoutEffect(() => {
    if (value > min) previous.current = value;
    if (disabled) cancel();
    const target = focused.current;
    if (target && (document.activeElement === target || document.activeElement === document.body)
      && ((value === 0 && first.current?.contains(target)) || (value === 100 && second.current?.contains(target)))) handle.current?.focus();
  });
  useLayoutEffect(() => cancel, [orientation, min, max]);

  function update(next: number, commit = false) {
    next = clamp(next, min, max);
    if (next !== value) setValue(next);
    if (commit && next !== value) onValueCommit?.(next);
    return next;
  }

  return <div {...rest} ref={mergedRef} className={cx('yarcl-split', `yarcl-split-${orientation}`, sizeClass(size ?? own.size, 'SplitPane'), radiusClass(radius ?? own.radius, size ?? own.size), colorClass(color ?? own.color), className)} style={{ ...style, '--yarcl-split-primary': `${value}fr`, '--yarcl-split-secondary': `${100 - value}fr` } as CSSProperties} data-disabled={disabled || undefined}
    onFocus={(event) => { onFocus?.(event); focused.current = event.target; }}
    onBlur={(event) => { onBlur?.(event); if (!event.currentTarget.contains(event.relatedTarget) && !(event.relatedTarget === null && (event.target as HTMLElement).closest('[hidden]'))) focused.current = null; }}
    onPointerDown={(event) => {
      onPointerDown?.(event);
      if (event.defaultPrevented || disabled || dragging.current || event.target !== handle.current || event.button !== 0 || !event.isPrimary) return;
      const rect = root.current!.getBoundingClientRect();
      const separator = handle.current.getBoundingClientRect();
      const horizontal = orientation === 'horizontal';
      const extent = horizontal ? rect.width - separator.width : rect.height - separator.height;
      if (extent <= 0) return;
      event.preventDefault();
      dragging.current = { id: event.pointerId, coordinate: horizontal ? event.clientX : event.clientY, value, extent, direction: horizontal && getComputedStyle(root.current!).direction === 'rtl' ? -1 : 1, latest: value };
      handle.current.setPointerCapture(event.pointerId);
      handle.current.focus();
    }}
    onPointerMove={(event) => {
      onPointerMove?.(event);
      const drag = dragging.current;
      if (!drag || drag.id !== event.pointerId || disabled || event.defaultPrevented) return;
      const coordinate = orientation === 'horizontal' ? event.clientX : event.clientY;
      drag.latest = update(drag.value + (coordinate - drag.coordinate) / drag.extent * 100 * drag.direction);
    }}
    onPointerUp={(event) => { onPointerUp?.(event); const drag = dragging.current; if (!drag || drag.id !== event.pointerId) return; cancel(); if (!disabled && !event.defaultPrevented) onValueCommit?.(drag.latest); }}
    onPointerCancel={(event) => { onPointerCancel?.(event); if (dragging.current?.id === event.pointerId) cancel(); }}
    onLostPointerCapture={(event) => { onLostPointerCapture?.(event); if (dragging.current?.id === event.pointerId) cancel(); }}
    onKeyDown={(event) => {
      onKeyDown?.(event);
      if (disabled || event.defaultPrevented || event.target !== handle.current) return;
      const horizontal = orientation === 'horizontal';
      const forward = horizontal ? (getComputedStyle(event.currentTarget).direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
      const backward = horizontal ? (forward === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
      let next: number;
      if (event.key === forward) next = value + step;
      else if (event.key === backward) next = value - step;
      else if (event.key === 'Home') next = min;
      else if (event.key === 'End') next = max;
      else if (event.key === 'PageUp') next = value + largeStep;
      else if (event.key === 'PageDown') next = value - largeStep;
      else if (event.key === 'Enter') next = value === min ? previous.current : min;
      else return;
      event.preventDefault();
      update(next, true);
    }}>
    <div ref={first} id={`${id}-primary`} role="region" aria-label={primaryLabel} tabIndex={0} hidden={value === 0} className="yarcl-split-pane yarcl-split-primary" data-part="primary">{primary}</div>
    <div ref={handle} role="separator" tabIndex={disabled ? -1 : 0} aria-label={primaryLabel} aria-controls={`${id}-primary`} aria-orientation={orientation === 'horizontal' ? 'vertical' : 'horizontal'} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-valuetext={formatValue?.(value)} aria-disabled={disabled || undefined} className="yarcl-split-handle" data-part="separator" />
    <div ref={second} role={secondaryLabel ? 'region' : undefined} aria-label={secondaryLabel} tabIndex={0} hidden={value === 100} className="yarcl-split-pane yarcl-split-secondary" data-part="secondary">{secondary}</div>
  </div>;
}
