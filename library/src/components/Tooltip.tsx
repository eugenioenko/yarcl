import {
  autoUpdate,
  FloatingArrow,
  FloatingPortal,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  type Placement,
} from '@floating-ui/react';
import { useRef, useState, type ReactElement, type ReactNode } from 'react';
import { floatingMiddleware, useTrigger } from '../floating';

/** Props for {@link Tooltip}. */
export interface TooltipProps {
  /** Short text describing the trigger. Keep it plain; tooltips can't contain interactive content. */
  content: ReactNode;
  /** A single focusable element, e.g. an {@link IconButton}. */
  children: ReactElement;
  /**
   * Preferred side. Flips when there isn't room.
   * @default 'top'
   */
  placement?: Placement;
  /**
   * Delay before opening on hover, in ms. Opens immediately on keyboard focus.
   * @default 400
   */
  delay?: number;
}

/**
 * A short label shown on hover and keyboard focus.
 *
 * @example
 * ```tsx
 * <Tooltip content="Search">
 *   <IconButton aria-label="Search"><SearchIcon /></IconButton>
 * </Tooltip>
 * ```
 */
export function Tooltip({ content, children, placement = 'top', delay = 400 }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const arrowRef = useRef<SVGSVGElement>(null);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: floatingMiddleware({ gap: 8, arrowRef }),
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { move: false, delay: { open: delay, close: 0 } }),
    useFocus(context),
    useDismiss(context),
    useRole(context, { role: 'tooltip' }),
  ]);
  const trigger = useTrigger(children, refs.setReference, getReferenceProps);

  return (
    <>
      {trigger}
      {open && (
        <FloatingPortal>
          <div ref={refs.setFloating} style={floatingStyles} className="yarcl-floating yarcl-tooltip" {...getFloatingProps()}>
            {content}
            <FloatingArrow ref={arrowRef} context={context} className="yarcl-tooltip-arrow" width={10} height={5} />
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
