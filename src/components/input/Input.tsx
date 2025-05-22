import { tv, type VariantProps } from 'tailwind-variants';
import { forwardRef } from 'react';

const inputStyles = tv({
  base: [
    'flex w-full appearance-none bg-transparent text-foreground outline-none transition-colors duration-200 ease-in-out',
    'disabled:opacity-60 disabled:pointer-events-none disabled:cursor-not-allowed',
    'focus:ring-2 focus:ring-offset-2 focus:ring-primary', // Default focus style
    'font-normal',
  ],
  variants: {
    variant: {
      outlined: 'border border-border hover:border-foreground/70 focus:border-primary',
      filled: 'border border-transparent bg-surface hover:bg-surface/90 focus:border-primary',
    },
    color: {
      primary: 'focus:ring-primary focus:border-primary',
      secondary: 'focus:ring-secondary focus:border-secondary',
      success: 'focus:ring-success focus:border-success',
      danger: 'focus:ring-danger focus:border-danger !border-danger text-danger placeholder:text-danger/70', // Error state takes precedence
      warning: 'focus:ring-warning focus:border-warning',
      info: 'focus:ring-info focus:border-info',
      accent: 'focus:ring-accent focus:border-accent',
      neutral: 'focus:ring-neutral focus:border-neutral',
    },
    size: {
      xs: 'py-0.5 px-2 text-xs',
      sm: 'py-1 px-3 text-sm',
      md: 'py-1.5 px-4 text-base',
      lg: 'py-2 px-5 text-lg',
      xl: 'py-2.5 px-6 text-xl',
    },
    radius: {
      xs: 'rounded-xs',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
      none: 'rounded-none',
    },
    error: {
      true: '!border-danger text-danger placeholder:text-danger/70 focus:ring-danger focus:!border-danger', // Ensure error styles override others
      false: '',
    }
  },
  compoundVariants: [
    // Error states for outlined variant
    { variant: 'outlined', error: true, class: '!border-danger hover:!border-danger/70' },
    // Error states for filled variant
    { variant: 'filled', error: true, class: '!border-danger bg-danger/10 hover:bg-danger/20' },
  ],
  defaultVariants: {
    variant: 'outlined',
    color: 'neutral', // Default color for focus ring if not error
    size: 'md',
    radius: 'md',
    error: false,
  },
});

export type InputVariantProps = VariantProps<typeof inputStyles>;
export type InputVariant = InputVariantProps['variant'];
export type InputColor = InputVariantProps['color'];
export type InputSize = InputVariantProps['size'];
export type InputRadius = InputVariantProps['radius'];

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'color'> {
  variant?: InputVariant;
  color?: InputColor;
  size?: InputSize;
  radius?: InputRadius;
  error?: boolean;
}

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
    ...props
  }: InputProps,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const mergedClassName = [
    inputStyles({ variant, color, size, radius, error }),
    className,
  ].filter(Boolean).join(' ');

  return (
    <input
      ref={ref}
      type={type}
      className={mergedClassName}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      aria-invalid={error || undefined}
      {...props}
    />
  );
}

export const Input = forwardRef<HTMLInputElement, InputProps>(InputBase);
Input.displayName = 'Input';
