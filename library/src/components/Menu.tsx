import {
  autoUpdate,
  FloatingFocusManager,
  FloatingList,
  FloatingPortal,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListItem,
  useListNavigation,
  useMergeRefs,
  useRole,
  useTypeahead,
  type Placement,
} from '@floating-ui/react';
import {
  createContext,
  useContext,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { colorClass, cx, sizeClass } from '../classes';
import { CheckIcon, floatingMiddleware, useTrigger } from '../floating';
import { useControllable } from '../hooks';
import type { Color, ComponentSize } from '../types';
import { useDefaults } from '../runtime';
import { useSlotClass } from '../slot-classes';


type MenuContextValue = ReturnType<typeof useMenuState>;

const MenuContext = createContext<MenuContextValue | null>(null);

const MenuRadioContext = createContext<{ value: string | null; select: (value: string) => void } | null>(null);

function useMenuContext(component: string) {
  const context = useContext(MenuContext);
  if (!context) throw new Error(`yarcl: <${component}> must be inside <Menu>`);
  return context;
}

function useMenuState({ open: openProp, defaultOpen = false, onOpenChange, placement = 'bottom-start', size }: MenuProps) {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const elementsRef = useRef<(HTMLElement | null)[]>([]);
  const labelsRef = useRef<(string | null)[]>([]);

  const floating = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: floatingMiddleware(),
  });
  const interactions = useInteractions([
    useClick(floating.context),
    useDismiss(floating.context),
    useRole(floating.context, { role: 'menu' }),
    useListNavigation(floating.context, {
      listRef: elementsRef,
      activeIndex,
      onNavigate: setActiveIndex,
      loop: true,
    }),
    useTypeahead(floating.context, {
      listRef: labelsRef,
      activeIndex,
      onMatch: open ? setActiveIndex : undefined,
    }),
  ]);

  return { open, setOpen, activeIndex, setActiveIndex, elementsRef, labelsRef, size, ...floating, ...interactions };
}

/** Props for {@link Menu}. */
export interface MenuProps {
  /** `Menu.Trigger` and `Menu.Content`. */
  children?: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /**
   * Initial open state when uncontrolled.
   * @default false
   */
  defaultOpen?: boolean;
  /** Called when the menu opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Preferred side. Flips when there isn't room.
   * @default 'bottom-start'
   */
  placement?: Placement;
  /**
   * Item size, from the `sizes` config.
   * @default config.defaults.size
   */
  size?: ComponentSize<'Menu'>;
}

function MenuRoot(props: MenuProps) {
  const state = useMenuState(props);
  return <MenuContext.Provider value={state}>{props.children}</MenuContext.Provider>;
}

/** Props for `Menu.Trigger`. */
export interface MenuTriggerProps {
  /** A single element, usually a {@link Button}. */
  children: ReactElement;
}

function MenuTrigger({ children }: MenuTriggerProps) {
  const { refs, getReferenceProps } = useMenuContext('Menu.Trigger');
  return useTrigger(children, refs.setReference, getReferenceProps);
}

/** Props for `Menu.Content`. */
export interface MenuContentProps extends ComponentProps<'div'> {}

function MenuContent({ className, style, children, ...props }: MenuContentProps) {
  const own = useDefaults('Menu');
  const panelSlot = useSlotClass('Menu', 'panel');
  const { open, size, refs, floatingStyles, context, getFloatingProps, elementsRef, labelsRef } =
    useMenuContext('Menu.Content');
  if (!open) return null;
  return (
    <FloatingPortal>
      <FloatingFocusManager context={context} modal={false} initialFocus={0}>
        <div
          ref={refs.setFloating}
          style={{ ...floatingStyles, ...style }}
          data-part="panel"
          className={cx(panelSlot, 'yarcl-floating yarcl-panel yarcl-listbox', sizeClass(size ?? own.size, 'Menu'), colorClass(), className)}
          {...getFloatingProps(props)}
        >
          <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
            {children}
          </FloatingList>
        </div>
      </FloatingFocusManager>
    </FloatingPortal>
  );
}

/** Props for `Menu.Item`. */
export interface MenuItemProps extends Omit<ComponentProps<'button'>, 'color' | 'onSelect'> {
  /** Called when the item is chosen by click, Enter or Space. The menu closes afterwards. Calling `preventDefault` in `onClick` cancels selection and closing. */
  onSelect?: () => void;
  /** Semantic color for the item, e.g. a destructive action. From the `colors` config. */
  color?: Color;
  /** Text used for type-to-select. Defaults to `children` when it is a string. */
  textValue?: string;
}

function MenuItem({ onSelect, onClick, color, textValue, disabled, className, children, ref: incomingRef, ...props }: MenuItemProps) {
  const { activeIndex, setOpen, getItemProps } = useMenuContext('Menu.Item');
  const { ref, index } = useListItem({
    label: disabled ? null : (textValue ?? (typeof children === 'string' ? children : null)),
  });
  const active = activeIndex === index;
  const mergedRef = useMergeRefs([ref, incomingRef]);
  return (
    <button
      ref={mergedRef}
      type="button"
      role="menuitem"
      tabIndex={active ? 0 : -1}
      disabled={disabled}
      data-active={active || undefined}
      data-part="item"
      className={cx(useSlotClass('Menu', 'item'), 'yarcl-option', color && cx('yarcl-option-colored', colorClass(color)), className)}
      {...getItemProps({
        ...props,
        onClick(event: MouseEvent<HTMLButtonElement>) {
          onClick?.(event);
          if (event.defaultPrevented) return;
          onSelect?.();
          setOpen(false);
        },
      })}
    >
      {children}
    </button>
  );
}

/** Props for `Menu.RadioGroup`. */
export interface MenuRadioGroupProps extends Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  /** Controlled selected value. `null` means nothing is selected. */
  value: string | null;
  /** Called when a radio item is chosen. */
  onValueChange?: (value: string) => void;
}

/** A group of mutually exclusive menu choices. Name it with `aria-label` or `aria-labelledby`. */
function MenuRadioGroup({ value, onValueChange, children, ...props }: MenuRadioGroupProps) {
  useMenuContext('Menu.RadioGroup');
  return (
    <MenuRadioContext.Provider value={{ value, select: (next) => onValueChange?.(next) }}>
      <div role="group" {...props}>{children}</div>
    </MenuRadioContext.Provider>
  );
}

/** Props for `Menu.RadioItem`. */
export interface MenuRadioItemProps extends Omit<MenuItemProps, 'value' | 'role' | 'aria-checked'> {
  /** Value selected when this item is chosen. */
  value: string;
  role?: never;
  'aria-checked'?: never;
}

/** A menu choice with an accessible checked state and a decorative check indicator. */
function MenuRadioItem({ value, children, textValue, onSelect, ...props }: MenuRadioItemProps) {
  const group = useContext(MenuRadioContext);
  if (!group) throw new Error('yarcl: <Menu.RadioItem> must be inside <Menu.RadioGroup>');
  const checked = group.value === value;
  return (
    <MenuItem
      {...props}
      role="menuitemradio"
      aria-checked={checked}
      textValue={textValue ?? (typeof children === 'string' ? children : undefined)}
      onSelect={() => {
        group.select(value);
        onSelect?.();
      }}
    >
      <span className="yarcl-option-label">{children}</span>
      {checked && <CheckIcon />}
    </MenuItem>
  );
}

/** A line between groups of `Menu.Item`s. */
function MenuSeparator() {
  return <div role="separator" className="yarcl-listbox-separator" />;
}

/**
 * A list of actions opened from a trigger. Arrow keys move between items,
 * typing jumps to a matching item, Esc closes.
 *
 * @example
 * ```tsx
 * <Menu>
 *   <Menu.Trigger><Button variant="outline">Actions</Button></Menu.Trigger>
 *   <Menu.Content>
 *     <Menu.Item onSelect={rename}>Rename</Menu.Item>
 *     <Menu.Separator />
 *     <Menu.Item color="danger" onSelect={remove}>Delete</Menu.Item>
 *   </Menu.Content>
 * </Menu>
 * ```
 */
export const Menu = Object.assign(MenuRoot, {
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  Separator: MenuSeparator,
});
