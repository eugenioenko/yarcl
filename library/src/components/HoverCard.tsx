import {
  autoUpdate,
  safePolygon,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  type Placement,
} from '@floating-ui/react';
import { useState, type ReactElement, type ReactNode } from 'react';
import { cx, paddingClass, radiusClass } from '../classes';
import { floatingMiddleware, useTrigger, type TriggerPassthrough, LayerPortal, useLayerStrategy } from '../floating';
import type { Responsive, Radius, Spacing } from '../types';
import { useConfig, useDefaults } from '../runtime';


/** Props for {@link HoverCard}. */
export interface HoverCardProps extends Omit<TriggerPassthrough, 'content' | 'children'> {
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
   * @default config.timing.hoverOpenDelay
   */
  openDelay?: number;
  /**
   * Delay before closing after the pointer leaves, in ms.
   * @default config.timing.hoverCloseDelay
   */
  closeDelay?: number;
  /**
   * Inner padding, from the `spacing` config. Accepts a scalar or breakpoint map.
   * @default config.defaults.padding
   */
  padding?: Responsive<Spacing>;
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
  openDelay,
  closeDelay,
  padding,
  radius,
  ...passthrough
}: HoverCardProps) {
  const own = useDefaults('HoverCard');
  const config = useConfig();
  const delay = { open: openDelay ?? config.timing.hoverOpenDelay, close: closeDelay ?? config.timing.hoverCloseDelay };
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    strategy: useLayerStrategy(),
    open,
    onOpenChange: setOpen,
    placement,
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: floatingMiddleware({ gap: 8 }),
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { delay, handleClose: safePolygon() }),
    useFocus(context),
    useDismiss(context),
  ]);
  const trigger = useTrigger(children, refs.setReference, getReferenceProps, passthrough);

  return (
    <>
      {trigger}
      {open && (
        <LayerPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className={cx('yarcl-floating yarcl-panel yarcl-hover-card', paddingClass(padding ?? own.padding, own.padding), radiusClass(radius ?? own.radius))}
            {...getFloatingProps()}
          >
            {content}
          </div>
        </LayerPortal>
      )}
    </>
  );
}
