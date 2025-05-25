import { forwardRef } from 'react';
import type { InputProps } from './Input.types';
import { inputVariants } from './Input.variants';
import { twMerge } from 'tailwind-merge';

function InputBase(
  {
    variant,
    color,
    size,
    radius,
    error,
    disabled,
    className = '',
    type = 'text',
    prefix,
    prefixClassName = '',
    suffix,
    suffixClassName = '',
    ...props
  }: InputProps,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const slots = inputVariants.slots;

  // Adjust border radius for input, prefix, and suffix
  const inputRadiusClass = prefix && suffix
    ? 'rounded-none'
    : prefix
      ? 'rounded-r-md rounded-l-none'
      : suffix
        ? 'rounded-l-md rounded-r-none'
        : radius ? `rounded-${radius}` : 'rounded-md'; // Apply radius if no prefix/suffix

  const prefixRadiusClass = radius ? `rounded-l-${radius}` : 'rounded-l-md';
  const suffixRadiusClass = radius ? `rounded-r-${radius}` : 'rounded-r-md';

  return (
    <div className={twMerge(slots.root, className)}>
      {prefix && (
        <span
          className={twMerge(slots.prefix, prefixRadiusClass, prefixClassName)}
        >
          {prefix}
        </span>
      )}
      <input
        ref={ref}
        type={type}
        className={twMerge(
          slots.input,
          inputVariants({ variant, color, size, radius, error }), // Apply base and variant styles to input
          inputRadiusClass
        )}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        aria-invalid={error || undefined}
        {...props}
      />
      {suffix && (
        <span
          className={twMerge(slots.suffix, suffixRadiusClass, suffixClassName)}
        >
          {suffix}
        </span>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputProps>(InputBase);
Input.displayName = 'Input';
