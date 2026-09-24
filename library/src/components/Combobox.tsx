import {
  autoUpdate,
  FloatingPortal,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
} from '@floating-ui/react';
import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { colorClass, cx, radiusClass, sizeClass } from '../classes';
import { useFieldProps } from '../field-context';
import { CheckIcon, floatingMiddleware } from '../floating';
import { useControllable } from '../hooks';
import type { TokenProps } from '../types';
import type { SelectOption } from './Select';
import { useDefaults } from '../runtime';


/** Props for {@link Combobox}. */
export interface ComboboxProps<V extends string = string>
  extends TokenProps,
    Omit<ComponentProps<'input'>, 'color' | 'size' | 'value' | 'defaultValue' | 'onChange' | 'children'> {
  /** The options to suggest. For async search, update this as results arrive and set `filter={false}`. */
  options: readonly SelectOption<V>[];
  /** Controlled selected value. `null` means nothing is selected. */
  value?: V | null;
  /**
   * Initial selected value when uncontrolled.
   * @default null
   */
  defaultValue?: V | null;
  /** Called when an option is chosen, or with the typed text when `allowCustomValue` is set. */
  onValueChange?: (value: V | null) => void;
  /** Controlled text in the input. */
  inputValue?: string;
  /** Called on every keystroke with the input text. Use it to fetch options for async search. */
  onInputValueChange?: (text: string) => void;
  /**
   * How options are matched against the typed text.
   * `true`: case-insensitive "contains" on the label; a function for custom matching;
   * `false` to show `options` as given (e.g. already filtered by a server).
   * @default true
   */
  filter?: boolean | ((option: SelectOption<V>, text: string) => boolean);
  /**
   * Accepts typed text that doesn't match an option (typeahead / autocomplete).
   * When `false`, the input resets to the selected option's label on blur.
   * @default false
   */
  allowCustomValue?: boolean;
  /** Shows a loading row instead of options. */
  loading?: boolean;
  /**
   * Shown when no options match.
   * @default 'No results'
   */
  emptyMessage?: ReactNode;
  /**
   * Shown while `loading` is set.
   * @default 'Loading…'
   */
  loadingMessage?: ReactNode;
}

const contains = (option: SelectOption, text: string) => option.label.toLowerCase().includes(text.trim().toLowerCase());

/**
 * A text input with a filtered list of suggestions.
 * Covers searchable select (default), typeahead / autocomplete (`allowCustomValue`)
 * and async search (`filter={false}` + `onInputValueChange` + `loading`).
 * Shares the size scale with {@link Input}. Works inside a {@link Field}.
 *
 * @example
 * ```tsx
 * <Combobox placeholder="Country" options={countries} onValueChange={setCountry} />
 * ```
 */
export function Combobox<V extends string = string>(props: ComboboxProps<V>) {
  const own = useDefaults('Combobox');
  const {
    options,
    value: valueProp,
    defaultValue = null,
    onValueChange,
    inputValue: inputValueProp,
    onInputValueChange,
    filter = true,
    allowCustomValue = false,
    loading = false,
    emptyMessage = 'No results',
    loadingMessage = 'Loading…',
    size,
    radius,
    color,
    className,
    onBlur,
    ...rest
  } = useFieldProps(props);

  const [value, setValue] = useControllable<V | null>(valueProp, defaultValue, onValueChange);
  const labelOf = (v: V | null) => options.find((option) => option.value === v)?.label ?? (allowCustomValue ? (v ?? '') : '');
  const [text, setText] = useControllable(inputValueProp, labelOf(defaultValue), onInputValueChange);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const listRef = useRef<(HTMLElement | null)[]>([]);
  const idPrefix = useId();

  const match = filter === true ? contains : filter === false ? () => true : filter;
  const visible = options.filter((option) => match(option, text));

  function close() {
    setOpen(false);
    setActiveIndex(null);
  }

  function choose(option: SelectOption<V>) {
    if (option.disabled) return;
    setValue(option.value);
    setText(option.label);
    close();
  }

  function restore() {
    if (allowCustomValue) return;
    const label = labelOf(value);
    if (text !== label) setText(label);
  }

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange(next) {
      setOpen(next);
      if (!next) restore();
    },
    placement: 'bottom-start',
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: floatingMiddleware({ gap: 4, matchWidth: true }),
  });
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    useRole(context, { role: 'combobox' }),
    useDismiss(context),
    useListNavigation(context, {
      listRef,
      activeIndex,
      onNavigate: setActiveIndex,
      virtual: true,
      loop: true,
      disabledIndices: visible.flatMap((option, i) => (option.disabled ? [i] : [])),
    }),
  ]);

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    setText(next);
    setOpen(true);
    setActiveIndex(next ? 0 : null);
    if (allowCustomValue) setValue(next ? (next as V) : null);
    else if (!next) setValue(null);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter' || !open) return;
    event.preventDefault();
    const option = activeIndex != null ? visible[activeIndex] : undefined;
    if (option) choose(option);
    else close();
  }

  const showList = open && (loading || visible.length > 0 || text.trim() !== '');

  return (
    <>
      <input
        ref={refs.setReference}
        className={cx('yarcl-input yarcl-combobox', sizeClass(size ?? own.size), radiusClass(radius ?? own.radius, size ?? own.size), colorClass(color ?? own.color), className)}
        autoComplete="off"
        aria-autocomplete="list"
        {...getReferenceProps({
          ...rest,
          value: text,
          onChange,
          onKeyDown,
          onFocus: () => setOpen(true),
          onClick: () => setOpen(true),
          onBlur(event) {
            restore();
            onBlur?.(event as FocusEvent<HTMLInputElement>);
          },
        })}
      />
      {showList && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className={cx('yarcl-floating yarcl-panel yarcl-listbox', sizeClass(size ?? own.size), colorClass(color ?? own.color))}
            {...getFloatingProps({ onMouseDown: (event) => event.preventDefault() })}
          >
            {loading ? (
              <div className="yarcl-listbox-message">{loadingMessage}</div>
            ) : visible.length === 0 ? (
              <div className="yarcl-listbox-message">{emptyMessage}</div>
            ) : (
              visible.map((option, i) => {
                const isActive = i === activeIndex;
                const isSelected = option.value === value;
                return (
                  <div
                    key={option.value}
                    id={`${idPrefix}-${i}`}
                    ref={(node) => {
                      listRef.current[i] = node;
                    }}
                    aria-disabled={option.disabled || undefined}
                    data-active={isActive || undefined}
                    className="yarcl-option"
                    {...getItemProps({ active: isActive, selected: isSelected, onClick: () => choose(option) })}
                  >
                    <span className="yarcl-option-label">{option.label}</span>
                    {isSelected && <CheckIcon />}
                  </div>
                );
              })
            )}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
