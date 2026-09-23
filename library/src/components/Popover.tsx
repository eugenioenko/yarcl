import {
  autoUpdate,
  FloatingFocusManager,
  FloatingPortal,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  type Placement,
} from '@floating-ui/react';
import { createContext, useContext, type ComponentProps, type ReactElement, type ReactNode } from 'react';
import { cx, paddingClass, radiusClass } from '../classes';
import { floatingMiddleware, useTrigger } from '../floating';
import { useControllable } from '../hooks';
import type { Radius, Spacing } from '../types';

type PopoverContextValue = ReturnType<typeof usePopoverState>;

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext(component: string) {
  const context = useContext(PopoverContext);
  if (!context) throw new Error(`yarcl: <${component}> must be inside <Popover>`);
  return context;
}

function usePopoverState({ open: openProp, defaultOpen = false, onOpenChange, placement = 'bottom', modal = false }: PopoverProps) {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
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
    useRole(floating.context, { role: 'dialog' }),
  ]);
  return { open, setOpen, modal, ...floating, ...interactions };
}

/** Props for {@link Popover}. */
export interface PopoverProps {
  /** {@link Popover.Trigger} and {@link Popover.Content}. */
  children?: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /**
   * Initial open state when uncontrolled.
   * @default false
   */
  defaultOpen?: boolean;
  /** Called when the popover opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Preferred side. Flips when there isn't room.
   * @default 'bottom'
   */
  placement?: Placement;
  /**
   * Traps focus inside the content while open.
   * @default false
   */
  modal?: boolean;
}

function PopoverRoot(props: PopoverProps) {
  const state = usePopoverState(props);
  return <PopoverContext.Provider value={state}>{props.children}</PopoverContext.Provider>;
}

/** Props for {@link Popover.Trigger}. */
export interface PopoverTriggerProps {
  /** A single element, usually a {@link Button}. It receives the click handler and ARIA attributes. */
  children: ReactElement;
}

function PopoverTrigger({ children }: PopoverTriggerProps) {
  const { refs, getReferenceProps } = usePopoverContext('Popover.Trigger');
  return useTrigger(children, refs.setReference, getReferenceProps);
}

/** Props for {@link Popover.Content}. */
export interface PopoverContentProps extends ComponentProps<'div'> {
  /**
   * Inner padding, from the `spacing` config.
   * @default config.defaults.padding
   */
  padding?: Spacing;
  /**
   * Corner radius, from the `radii` config.
   * @default config.defaults.radius
   */
  radius?: Radius;
}

function PopoverContent({ padding, radius, className, style, ...props }: PopoverContentProps) {
  const { open, modal, refs, floatingStyles, context, getFloatingProps } = usePopoverContext('Popover.Content');
  if (!open) return null;
  return (
    <FloatingPortal>
      <FloatingFocusManager context={context} modal={modal}>
        <div
          ref={refs.setFloating}
          style={{ ...floatingStyles, ...style }}
          className={cx('yarcl-floating yarcl-panel yarcl-popover', paddingClass(padding), radiusClass(radius), className)}
          {...getFloatingProps(props)}
        />
      </FloatingFocusManager>
    </FloatingPortal>
  );
}

/**
 * A floating panel anchored to a trigger, opened by click. Closes on Esc or outside click.
 * The base for custom floating UI; use {@link Menu}, {@link Select} or {@link Combobox} for lists.
 *
 * @example
 * ```tsx
 * <Popover>
 *   <Popover.Trigger><Button variant="outline">Filters</Button></Popover.Trigger>
 *   <Popover.Content>
 *     <Stack><Checkbox>Archived</Checkbox></Stack>
 *   </Popover.Content>
 * </Popover>
 * ```
 */
export const Popover = Object.assign(PopoverRoot, { Trigger: PopoverTrigger, Content: PopoverContent });
