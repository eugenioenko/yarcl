import {
  autoUpdate,
  FloatingPortal,
  safePolygon,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  type Placement,
} from '@floating-ui/react';
import { useState, type ReactElement, type ReactNode } from 'react';
import { cx, defaultsFor, paddingClass, radiusClass } from '../classes';
import { floatingMiddleware, useTrigger } from '../floating';
import type { Radius, Spacing } from '../types';

const own = defaultsFor('HoverCard');

/** Props for {@link HoverCard}. */
export interface HoverCardProps {
  /** Rich preview content. Can contain links; the pointer can move into the card without closing it. */
  content: ReactNode;
  /** A single focusable element, usually a {@link Link}. */
  children: ReactElement;
  /**
   * Preferred side. Flips when there isn't room.
   * @default 'bottom'
   */
  placement?: Placement;
  /**
   * Delay before opening, in ms.
   * @default 300
   */
  openDelay?: number;
  /**
   * Delay before closing after the pointer leaves, in ms.
   * @default 150
   */
  closeDelay?: number;
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

/**
 * A preview card shown on hover or focus, e.g. for a user or a link.
 * Supplementary only: don't put content here that isn't reachable elsewhere.
 *
 * @example
 * ```tsx
 * <HoverCard content={<UserPreview id="ada" />}>
 *   <Link href="/users/ada">@ada</Link>
 * </HoverCard>
 * ```
 */
export function HoverCard({
  content,
  children,
  placement = 'bottom',
  openDelay = 300,
  closeDelay = 150,
  padding,
  radius,
}: HoverCardProps) {
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: floatingMiddleware({ gap: 8 }),
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { delay: { open: openDelay, close: closeDelay }, handleClose: safePolygon() }),
    useFocus(context),
    useDismiss(context),
  ]);
  const trigger = useTrigger(children, refs.setReference, getReferenceProps);

  return (
    <>
      {trigger}
      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className={cx('yarcl-floating yarcl-panel yarcl-hover-card', paddingClass(padding ?? own.padding), radiusClass(radius ?? own.radius))}
            {...getFloatingProps()}
          >
            {content}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
