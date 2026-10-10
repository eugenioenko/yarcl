import type { ComponentProps } from 'react';
import { cx, paddingClass, radiusClass, shadowClass } from '../classes';
import type { Radius, Shadow, Spacing } from '../types';
import { useDefaults } from '../runtime';
import { useSlotClass } from '../slot-classes';


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
function CardRoot({ as = 'div', padding, radius, shadow, className, ...props }: CardProps) {
  const own = useDefaults('Card');
  const Tag = as as 'div';
  return (
    <Tag
      data-part="root"
      className={cx('yarcl-card', useSlotClass('Card', 'root', { padding, radius, shadow }), paddingClass(padding ?? own.padding), radiusClass(radius ?? own.radius), shadowClass(shadow ?? own.shadow), className)}
      {...props}
    />
  );
}

/** Props for Card.Header, Card.Body and Card.Footer. Each spreads its props and ref onto a div. */
export interface CardPartProps extends ComponentProps<'div'> {}

function CardHeader({ className, ...props }: CardPartProps) {
  return <div {...props} data-part="header" className={cx(useSlotClass('Card', 'header'), className)} />;
}

function CardBody({ className, ...props }: CardPartProps) {
  return <div {...props} data-part="body" className={cx(useSlotClass('Card', 'body'), className)} />;
}

function CardFooter({ className, ...props }: CardPartProps) {
  return <div {...props} data-part="footer" className={cx(useSlotClass('Card', 'footer'), className)} />;
}

/** A bordered surface. Optional Header, Body and Footer parts receive their configured slot styles. */
export const Card = Object.assign(CardRoot, { Header: CardHeader, Body: CardBody, Footer: CardFooter });
