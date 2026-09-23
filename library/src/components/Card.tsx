import type { ComponentProps } from 'react';
import { cx, defaultsFor, paddingClass, radiusClass, shadowClass } from '../classes';
import type { Radius, Shadow, Spacing } from '../types';

const own = defaultsFor('Card');

/** Props for {@link Card}. */
export interface CardProps extends ComponentProps<'div'> {
  /**
   * Element to render.
   * @default 'div'
   */
  as?: 'div' | 'section' | 'article' | 'aside';
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
  /** Elevation, from the `shadows` config. No shadow when omitted. */
  shadow?: Shadow;
}

/**
 * A bordered surface for grouping content.
 *
 * @example
 * ```tsx
 * <Card shadow="md">
 *   <Stack>
 *     <Heading level={3}>Plan</Heading>
 *     <Text muted>Pro, billed yearly</Text>
 *   </Stack>
 * </Card>
 * ```
 */
export function Card({ as = 'div', padding, radius, shadow, className, ...props }: CardProps) {
  const Tag = as as 'div';
  return (
    <Tag
      className={cx('yarcl-card', paddingClass(padding ?? own.padding), radiusClass(radius ?? own.radius), shadowClass(shadow ?? own.shadow), className)}
      {...props}
    />
  );
}
