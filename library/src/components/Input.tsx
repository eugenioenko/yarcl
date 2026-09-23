import type { InputHTMLAttributes } from 'react';
import { cx, tokenClasses } from '../classes';
import type { TokenProps } from '../types';

/**
 * Props for {@link Input}. Accepts all native `<input>` attributes except
 * `color` and `size`, which are replaced by design tokens.
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'color' | 'size'>, TokenProps {}

/**
 * A text input styled from the consumer's design tokens.
 * Shares the size scale with {@link Button}, so both have the same height at the same size.
 * `color` sets the focus border and ring.
 *
 * @example
 * ```tsx
 * <Input size="lg" color="danger" placeholder="Email" />
 * ```
 */
export function Input({ size, radius, color, className, ...props }: InputProps) {
  return <input className={cx('yarcl-input', tokenClasses({ size, radius, color }), className)} {...props} />;
}
