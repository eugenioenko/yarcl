import type { ButtonHTMLAttributes } from 'react';
import { tokenStyle } from '../tokens';
import type { TokenProps } from '../types';
import '../styles.css';

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
export function Button({ size, radius, color, className, style, ...props }: ButtonProps) {
  return (
    <button
      className={['y-control y-button', className].filter(Boolean).join(' ')}
      style={{ ...tokenStyle({ size, radius, color }), ...style }}
      {...props}
    />
  );
}
