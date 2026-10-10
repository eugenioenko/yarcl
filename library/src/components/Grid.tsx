import type { ComponentProps, CSSProperties } from 'react';
import { cx, gapClass } from '../classes';
import { useDefaults } from '../runtime';
import type { Responsive, Spacing } from '../types';
import { responsiveEntries } from '../responsive';
import type { LayoutElement } from './Stack';

/** Props for {@link Grid}. */
export interface GridProps extends ComponentProps<'div'> {
  /**
   * Element to render. Use `li` children when rendering a list.
   * @default 'div'
   */
  as?: LayoutElement;
  /**
   * Number of equal-width columns, a CSS grid track definition, or a breakpoint map of either. Ignored when `minItemWidth` is set.
   * @default 1
   */
  columns?: Responsive<number | string>;
  /** Minimum item width for auto-fit columns. Items shrink to fit narrower containers. */
  minItemWidth?: string;
  /**
   * Space between rows and columns, from the `spacing` config. Accepts a scalar or breakpoint map.
   * @default config.defaults.gap
   */
  gap?: Responsive<Spacing>;
}

/**
 * Lays out children in columns and automatically creates rows as needed.
 * Use `minItemWidth` for responsive cards or a track definition for a sidebar layout.
 *
 * @example
 * ```tsx
 * <Grid minItemWidth="16rem" gap="md">
 *   <Card>Revenue</Card>
 *   <Card>Subscriptions</Card>
 * </Grid>
 * ```
 */
export function Grid({ as = 'div', columns = 1, minItemWidth, gap, className, style, ...props }: GridProps) {
  const own = useDefaults('Grid');
  const tracks = (value: number | string) => typeof value === 'number'
    ? `repeat(${Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1}, minmax(0, 1fr))`
    : value;
  const responsive = !minItemWidth && typeof columns === 'object';
  const gridStyle = minItemWidth
    ? { '--yarcl-grid-columns': `repeat(auto-fit, minmax(min(100%, ${minItemWidth}), 1fr))` }
    : typeof columns === 'object'
      ? Object.fromEntries([['--yarcl-grid-columns-base', tracks(columns.base ?? 1)], ...responsiveEntries<number | string>(columns).map(([breakpoint, value]) => [`--yarcl-grid-columns-${breakpoint}`, tracks(value)])])
      : { '--yarcl-grid-columns': tracks(columns) };
  const Tag = as as 'div';
  return (
    <Tag
      className={cx('yarcl-grid', responsive && 'yarcl-grid-responsive', gapClass(gap ?? own.gap, own.gap), className)}
      style={{ ...gridStyle, ...style } as CSSProperties}
      {...props}
    />
  );
}
