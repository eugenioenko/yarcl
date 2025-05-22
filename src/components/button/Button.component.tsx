import { forwardRef } from 'react';
import { useTheme } from '../../theme/Theme.context';
import { buttonVariants } from './Button.variants';
import { twMerge } from 'tailwind-merge';
import type { ButtonProps } from './Button.types';

export function ButtonBase({
  variant,
  color,
  size,
  radius,
  shadow,
  disabled,
  children,
  className,
  type,
  ...props
}: ButtonProps) {
  const theme = useTheme();

  const finalProps: ButtonProps = {
    variant: variant ?? theme.button.variant,
    color: color ?? theme.button.color,
    size: size ?? theme.button.size,
    radius: radius ?? theme.button.radius,
    shadow: shadow ?? theme.button.shadow,
    disabled: disabled ?? false,
    type,
    ...props,
  };

  const mergedClassName = twMerge(
    buttonVariants({
      variant: finalProps.variant,
      color: finalProps.color,
      size: finalProps.size,
      radius: finalProps.radius,
      shadow: finalProps.shadow,
      disabled: finalProps.disabled,
    }),
    finalProps.className
  );

  return (
    <button
      type={finalProps.type}
      className={mergedClassName}
      disabled={finalProps.disabled}
      aria-disabled={finalProps.disabled || undefined}
      {...finalProps}
    >
      {children}
    </button>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(ButtonBase);
Button.displayName = 'Button';