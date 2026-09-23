import type { ButtonHTMLAttributes } from 'react';
import { cx, tokenClasses } from '../classes';
import type { TokenProps } from '../types';

/** Props for {@link Button}. Accepts all native `<button>` attributes except `color`. */
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>, TokenProps {}

/**
 * A button styled from the consumer's design tokens.
 * Shares the size scale with {@link Input}, so both have the same height at the same size.
 *
 * @example
 * ```tsx
 * <Button size="lg" color="danger" radius="pill">Delete</Button>
 * ```
 */
export function Button({ size, radius, color, className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cx('yarcl-button', tokenClasses({ size, radius, color }), className)} {...props} />;
}
