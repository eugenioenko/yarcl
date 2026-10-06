import { useState, type ComponentProps, type ReactNode } from 'react';
import { colorClass, cx, radiusClass, sizeClass, variantClass } from '../classes';
import { ChevronIcon } from '../floating';
import { useControllable } from '../hooks';
import { useDefaults } from '../runtime';
import type { TokenProps, VariantProps } from '../types';
import { Menu } from './Menu';
import { Spinner } from './Spinner';

/** An action available from a {@link SplitButton}. */
export interface SplitButtonOption<V extends string = string> {
  /** Value reported when this action is selected or executed. */
  value: V;
  /** Visible action label, also used for type-to-select. */
  label: string;
  /** Decorative icon shown before the label. */
  icon?: ReactNode;
  /** Prevents selecting or executing this action. */
  disabled?: boolean;
}

/** Props for {@link SplitButton}. Native attributes and refs go to the outer group. */
export interface SplitButtonProps<V extends string = string>
  extends Omit<ComponentProps<'div'>, 'color' | 'children' | 'defaultValue'>, TokenProps<'SplitButton'>, VariantProps {
  /** Actions to choose from. Values must be unique. */
  options: readonly SplitButtonOption<V>[];
  /** Controlled selected action. */
  value?: NoInfer<V>;
  /**
   * Initial selected action when uncontrolled.
   * @default The first enabled option's value.
   */
  defaultValue?: NoInfer<V>;
  /** Called when an action is selected. Selection does not execute the action. */
  onValueChange?: (value: V) => void;
  /** Called when the main button executes the selected action. */
  onAction?: (value: V) => void;
  /** Disables both buttons and closes the menu. */
  disabled?: boolean;
  /** Shows a spinner on the main button, disables both buttons and closes the menu. */
  loading?: boolean;
  /**
   * Accessible name for the dropdown button and its choices.
   * @default 'Choose action'
   */
  dropdownLabel?: string;
  /**
   * Main button label when the selected value has no matching option.
   * @default 'Choose action'
   */
  placeholder?: string;
}

/**
 * Executes a selected action with a separate dropdown for switching actions.
 * Choosing a menu option updates the main button without executing anything.
 * Arrow keys navigate the menu, typing finds a choice, and Escape closes it.
 *
 * @example
 * ```tsx
 * <SplitButton
 *   options={[{ value: 'draft', label: 'Save draft' }, { value: 'publish', label: 'Publish' }]}
 *   defaultValue="draft"
 *   onAction={save}
 * />
 * ```
 */
export function SplitButton<V extends string = string>({
  options,
  value: valueProp,
  defaultValue = options.find((option) => !option.disabled)?.value,
  onValueChange,
  onAction,
  disabled,
  loading,
  dropdownLabel = 'Choose action',
  placeholder = 'Choose action',
  size,
  radius,
  color,
  variant,
  className,
  ...props
}: SplitButtonProps<V>) {
  const own = useDefaults('SplitButton');
  const [value, setValue] = useControllable<V | undefined>(valueProp, defaultValue, (next) => {
    if (next !== undefined) onValueChange?.(next);
  });
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const locked = disabled || loading || !options.some((option) => !option.disabled);
  if (locked && open) setOpen(false);
  const classes = cx(
    'yarcl-button',
    sizeClass(size ?? own.size, 'SplitButton'),
    radiusClass(radius ?? own.radius, size ?? own.size),
    colorClass(color ?? own.color),
    variantClass(variant ?? own.variant),
  );

  return (
    <div
      role="group"
      aria-label="Actions"
      {...props}
      className={cx('yarcl-split-button yarcl-button-group yarcl-button-group-attached yarcl-button-group-horizontal', className)}
    >
      <button
        type="button"
        className={cx(classes, 'yarcl-split-button-action')}
        disabled={locked || !selected || selected.disabled}
        aria-busy={loading || undefined}
        onClick={() => {
          if (selected && !locked && !selected.disabled) onAction?.(selected.value);
        }}
      >
        {loading ? <Spinner label="" aria-hidden="true" /> : selected?.icon && (
          <span className="yarcl-button-icon" aria-hidden="true">{selected.icon}</span>
        )}
        {selected?.label ?? placeholder}
      </button>
      <Menu open={open && !locked} onOpenChange={setOpen} placement="bottom-end">
        <Menu.Trigger>
          <button type="button" className={cx(classes, 'yarcl-icon-button')} disabled={locked} aria-label={dropdownLabel}>
            <ChevronIcon />
          </button>
        </Menu.Trigger>
        <Menu.Content>
          <Menu.RadioGroup
            aria-label={dropdownLabel}
            value={value ?? null}
            onValueChange={(next) => {
              const option = options.find((option) => option.value === next);
              if (option && !option.disabled && !locked && next !== value) setValue(option.value);
            }}
          >
            {options.map((option) => (
              <Menu.RadioItem key={option.value} value={option.value} disabled={option.disabled} textValue={option.label}>
                {option.icon && <span className="yarcl-split-button-option-icon" aria-hidden="true">{option.icon}</span>}
                {option.label}
              </Menu.RadioItem>
            ))}
          </Menu.RadioGroup>
        </Menu.Content>
      </Menu>
    </div>
  );
}
