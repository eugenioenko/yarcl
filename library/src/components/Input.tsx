import type { ComponentProps } from 'react';
import { colorClass, cx, defaultsFor, radiusClass, sizeClass } from '../classes';
import { useFieldProps } from '../field-context';
import type { TokenProps } from '../types';

const own = defaultsFor('Input');

/**
 * Props for {@link Input}. Accepts all native `<input>` attributes except
 * `color` and `size`, which are replaced by design tokens.
 */
export interface InputProps extends Omit<ComponentProps<'input'>, 'color' | 'size'>, TokenProps {}

/**
 * A text input styled from the consumer's design tokens.
 * Shares the size scale with {@link Button}, so both have the same height at the same size.
 * `color` sets the focus border and ring. Inside a {@link Field}, it is labelled and described automatically.
 *
 * @example
 * ```tsx
 * <Input size="lg" placeholder="Email" />
 * ```
 */
export function Input(props: InputProps) {
  const { size, radius, color, className, ...rest } = useFieldProps(props);
  return <input className={cx('yarcl-input', sizeClass(size ?? own.size), radiusClass(radius ?? own.radius, size ?? own.size), colorClass(color ?? own.color), className)} {...rest} />;
}
