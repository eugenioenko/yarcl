import type { InputHTMLAttributes } from 'react';
import { tokenStyle } from '../tokens';
import type { TokenProps } from '../types';
import '../styles.css';

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
export function Input({ size, radius, color, className, style, ...props }: InputProps) {
  return (
    <input
      className={['y-control y-input', className].filter(Boolean).join(' ')}
      style={{ ...tokenStyle({ size, radius, color }), ...style }}
      {...props}
    />
  );
}
