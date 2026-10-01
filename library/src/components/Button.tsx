import type { ComponentProps } from 'react';
import { colorClass, cx, radiusClass, sizeClass, variantClass } from '../classes';
import type { TokenProps, VariantProps } from '../types';
import { useButtonGroup } from './ButtonGroup';
import { Spinner } from './Spinner';
import { useDefaults } from '../runtime';


/** Props for the action form of {@link Button}. Accepts native `<button>` attributes except `color`. */
export interface ButtonProps extends Omit<ComponentProps<'button'>, 'color'>, TokenProps<'Button'>, VariantProps {
  href?: never;
  /** Shows a {@link Spinner}, disables the button and sets `aria-busy`. */
  loading?: boolean;
}

/** Props for the link form of {@link Button}. Accepts native anchor attributes except `color` and `type`. */
export interface ButtonLinkProps extends Omit<ComponentProps<'a'>, 'color' | 'href' | 'type' | 'disabled'>, TokenProps<'Button'>, VariantProps {
  /** Destination. Renders a native link with the same visual styles as a button. */
  href: string;
  type?: never;
  disabled?: never;
  loading?: never;
}

/**
 * An action or navigation link styled from the consumer's design tokens.
 * Shares the base size scale with {@link Input}; component size overrides can adjust either one.
 * Icons (`<svg>`) inside are sized from the size's `iconSize`.
 *
 * @example
 * ```tsx
 * <Button size="lg" color="danger" variant="outline" radius="pill">Delete</Button>
 * ```
 */
export function Button(props: ButtonProps | ButtonLinkProps) {
  const own = useDefaults('Button');
  const group = useButtonGroup();
  const { size, radius, color, variant, className, children, ...elementProps } = props;
  const classes = cx(
    'yarcl-button',
    sizeClass(size ?? group?.size ?? own.size, 'Button'),
    radiusClass(radius ?? group?.radius ?? own.radius, size ?? group?.size ?? own.size),
    colorClass(color ?? group?.color ?? own.color),
    variantClass(variant ?? group?.variant ?? own.variant),
    className,
  );
  if (elementProps.href !== undefined) return <a className={classes} {...elementProps}>{children}</a>;

  const { loading, disabled, type = 'button', ...buttonProps } = elementProps;
  return <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...buttonProps}>
    {loading && <Spinner label="" aria-hidden="true" />}
    {children}
  </button>;
}
