import { useId, useLayoutEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { useMergeRefs } from '@floating-ui/react';
import { colorClass, cx, gapClass, radiusClass, sizeClass } from '../classes';
import { useControllable } from '../hooks';
import { useDefaults, useLabels } from '../runtime';
import type { Responsive, Spacing, TokenProps } from '../types';

/** A uniquely identified stage in a {@link Stepper}. Labels and descriptions should be noninteractive. */
export interface StepperItem<V extends string = string> {
  /** Stable identifier, unique within the stepper. */
  id: V;
  /** Visible accessible label. */
  label: ReactNode;
  /** Optional supporting content, announced as the step description. */
  description?: ReactNode;
  /** Marks a completed stage independently of its position or current state. */
  completed?: boolean;
  /** Prevents activation and skips this stage during keyboard navigation. */
  disabled?: boolean;
}

/** Native ordered-list attributes, state and token props for {@link Stepper}. */
export interface StepperBaseProps<V extends string = string> extends Omit<ComponentProps<'ol'>, 'children' | 'color' | 'defaultValue' | 'onChange' | 'start' | 'reversed'>, TokenProps<'Stepper'> {
  /** Ordered stages, with unique identifiers. */
  items: readonly StepperItem<V>[];
  /** Controlled current stage. `null` represents no current stage. */
  value?: NoInfer<V> | null;
  /** Initially current stage when uncontrolled. @default first enabled item */
  defaultValue?: NoInfer<V> | null;
  /** Called when an enabled stage is activated. Keyboard focus movement does not change the current stage. */
  onValueChange?: (value: V) => void;
  /** Arranges stages horizontally or vertically. @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';
  /** Displays static progress without interactive step buttons. */
  readOnly?: boolean;
  /** Prevents all activation and removes step buttons from the tab order. */
  disabled?: boolean;
  /** Space between stages, including typed responsive breakpoint overrides. @default config.defaults.gap */
  gap?: Responsive<Spacing>;
}

/** Props for {@link Stepper}. Supply an accessible name and a sequence of stages. */
export type StepperProps<V extends string = string> = StepperBaseProps<V>
  & ({ 'aria-label': string; 'aria-labelledby'?: string } | { 'aria-label'?: string; 'aria-labelledby': string });

/**
 * Shows progress through named stages with current, completed and disabled states.
 * Interactive stages share a roving tab stop. Arrows and Home/End move focus; Enter/Space activate.
 * Use readOnly for progress controlled by a separate form or navigation flow.
 * @example
 * ```tsx
 * <Stepper aria-label="Checkout" defaultValue="payment" items={[
 *   { id: 'details', label: 'Details', completed: true },
 *   { id: 'payment', label: 'Payment' },
 *   { id: 'review', label: 'Review', disabled: true },
 * ]} />
 * ```
 */
export function Stepper<const V extends string = string>({ items, value: valueProp, defaultValue, onValueChange, orientation = 'horizontal', readOnly, disabled, gap, size, radius, color, className, ref, onClick, onKeyDown, onFocus, onBlur, ...rest }: StepperProps<V>) {
  const ids = new Set<V>();
  for (const item of items) {
    if (ids.has(item.id)) throw new Error(`yarcl: Stepper item id "${item.id}" must be unique`);
    ids.add(item.id);
  }
  const own = useDefaults('Stepper');
  const labels = useLabels();
  const uid = useId();
  const root = useRef<HTMLOListElement>(null);
  const mergedRef = useMergeRefs([root, ref]);
  const enabled = items.filter((item) => !item.disabled);
  const [value, setValue] = useControllable<V | null>(valueProp, defaultValue === undefined ? enabled[0]?.id ?? null : defaultValue, (next) => { if (next !== null) onValueChange?.(next); });
  const [active, setActive] = useState<V | null>(null);
  const hadFocus = useRef(false);
  const focusId = enabled.find((item) => item.id === active)?.id ?? enabled.find((item) => item.id === value)?.id ?? enabled[0]?.id ?? null;

  function element(item: StepperItem<V>) {
    return root.current?.querySelector<HTMLButtonElement>(`button[data-step-index="${items.indexOf(item)}"]`);
  }
  function focus(item: StepperItem<V> | undefined) {
    if (!item) return;
    setActive(item.id);
    element(item)?.focus();
  }
  function eventItem(target: EventTarget | null) {
    if (!(target instanceof Element) || target.closest('.yarcl-stepper') !== root.current) return;
    const button = target.closest<HTMLButtonElement>('button[data-step-index]');
    return button ? items[Number(button.dataset.stepIndex)] : undefined;
  }
  useLayoutEffect(() => {
    if (!hadFocus.current) return;
    const item = enabled.find((item) => item.id === focusId);
    const target = !readOnly && !disabled && item ? element(item) : root.current;
    if (target && target !== document.activeElement && (document.activeElement === document.body || root.current?.contains(document.activeElement))) target.focus();
  });

  return <ol {...rest} ref={mergedRef} role="list" tabIndex={rest.tabIndex ?? (readOnly || disabled ? -1 : enabled.length ? undefined : 0)} aria-disabled={disabled || undefined} className={cx('yarcl-stepper', `yarcl-stepper-${orientation}`, sizeClass(size ?? own.size, 'Stepper'), radiusClass(radius ?? own.radius, size ?? own.size), colorClass(color ?? own.color), gapClass(gap ?? own.gap, own.gap), className)}
    onFocus={(event) => { onFocus?.(event); hadFocus.current = true; const item = eventItem(event.target); if (item) setActive(item.id); }}
    onBlur={(event) => { onBlur?.(event); if (!event.currentTarget.contains(event.relatedTarget)) hadFocus.current = false; }}
    onClick={(event) => { onClick?.(event); if (event.defaultPrevented || disabled || readOnly) return; const item = eventItem(event.target); if (item && !item.disabled) { focus(item); if (item.id !== value) setValue(item.id); } }}
    onKeyDown={(event) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || disabled || readOnly) return;
      const item = eventItem(event.target);
      if (!item || item.disabled) return;
      const index = enabled.indexOf(item);
      const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
      const forward = orientation === 'vertical' ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
      const backward = orientation === 'vertical' ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
      if (event.key === forward) focus(enabled[Math.min(index + 1, enabled.length - 1)]);
      else if (event.key === backward) focus(enabled[Math.max(index - 1, 0)]);
      else if (event.key === 'Home') focus(enabled[0]);
      else if (event.key === 'End') focus(enabled[enabled.length - 1]);
      else return;
      event.preventDefault();
    }}>{items.map((item, index) => {
      const current = item.id === value;
      const content = <>
        <span className="yarcl-stepper-indicator" aria-hidden="true">{item.completed ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 12 4 4L19 6" /></svg> : index + 1}</span>
        <span className="yarcl-stepper-content"><span className="yarcl-stepper-label" id={`${uid}-${index}-label`}>{item.label}</span>{item.description != null && <span className="yarcl-stepper-description" id={`${uid}-${index}-description`}>{item.description}</span>}{item.completed && <span className="yarcl-visually-hidden" id={`${uid}-${index}-completed`}>{labels.stepCompleted}</span>}</span>
      </>;
      return <li key={item.id} className="yarcl-stepper-item" data-current={current || undefined} data-completed={item.completed || undefined} data-disabled={disabled || item.disabled || undefined} aria-current={readOnly && current ? 'step' : undefined} aria-disabled={readOnly && (disabled || item.disabled) || undefined}>
        {readOnly ? <div className="yarcl-stepper-entry" data-part="item">{content}</div> : <button type="button" className="yarcl-stepper-entry" data-part="item" data-step-index={index} disabled={disabled || item.disabled} tabIndex={!disabled && focusId === item.id ? 0 : -1} aria-current={current ? 'step' : undefined} aria-labelledby={`${uid}-${index}-label`} aria-describedby={cx(item.description != null && `${uid}-${index}-description`, item.completed && `${uid}-${index}-completed`) || undefined}>{content}</button>}
      </li>;
    })}</ol>;
}
