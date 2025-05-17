import { tv } from 'tailwind-variants';
import { forwardRef, type ReactNode } from 'react';

// Add color variants
const button = tv({
  base: [
    'inline-flex items-center justify-center font-medium transition-colors disabled:opacity-60 ',
    'cursor-pointer disabled:pointer-events-none',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'font-normal'
  ],
  variants: {
    variant: {
      solid: '',
      outlined: '',
      ghost: '',
      link: '',
    },
    color: {
      primary: '',
      secondary: '',
      success: '',
      danger: '',
      warning: '',
      info: '',
      accent: '',
      neutral: '',
    },
    size: {
      xs: 'py-1 px-2 text-xs',
      sm: 'py-1.5 px-3 text-sm',
      md: 'py-2 px-4 text-base',
      lg: 'py-3 px-6 text-lg',
      xl: 'py-4 px-8 text-xl',
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
    disabled: {
      true: 'opacity-80 pointer-events-none cursor-default',
      false: '',
    },
    iconOnly: {
      true: 'p-0 aspect-square',
      false: '',
    },
  },
  compoundVariants: [
    // Solid
    { variant: 'solid', color: 'primary', class: 'bg-primary text-inverse hover:bg-primary-dark' },
    { variant: 'solid', color: 'secondary', class: 'bg-secondary text-inverse hover:bg-secondary-dark' },
    { variant: 'solid', color: 'success', class: 'bg-success text-inverse hover:bg-success-dark' },
    { variant: 'solid', color: 'danger', class: 'bg-danger text-inverse hover:bg-danger-dark' },
    { variant: 'solid', color: 'warning', class: 'bg-warning text-inverse hover:bg-warning-dark' },
    { variant: 'solid', color: 'info', class: 'bg-info text-inverse hover:bg-info-dark' },
    { variant: 'solid', color: 'accent', class: 'bg-accent text-inverse hover:bg-accent-dark' },
    { variant: 'solid', color: 'neutral', class: 'bg-neutral text-inverse hover:bg-neutral-dark' },
    // Outlined
    { variant: 'outlined', color: 'primary', class: 'border border-primary text-primary bg-transparent hover:bg-primary hover:text-inverse' },
    { variant: 'outlined', color: 'secondary', class: 'border border-secondary text-secondary bg-transparent hover:bg-secondary hover:text-inverse' },
    { variant: 'outlined', color: 'success', class: 'border border-success text-success bg-transparent hover:bg-success hover:text-inverse' },
    { variant: 'outlined', color: 'danger', class: 'border border-danger text-danger bg-transparent hover:bg-danger hover:text-inverse' },
    { variant: 'outlined', color: 'warning', class: 'border border-warning text-warning bg-transparent hover:bg-warning hover:text-inverse' },
    { variant: 'outlined', color: 'info', class: 'border border-info text-info bg-transparent hover:bg-info hover:text-inverse' },
    { variant: 'outlined', color: 'accent', class: 'border border-accent text-accent bg-transparent hover:bg-accent hover:text-inverse' },
    { variant: 'outlined', color: 'neutral', class: 'border border-neutral text-neutral bg-transparent hover:bg-neutral hover:text-inverse' },
    // Ghost
    { variant: 'ghost', color: 'primary', class: 'bg-transparent text-primary hover:bg-primary-light' },
    { variant: 'ghost', color: 'secondary', class: 'bg-transparent text-secondary hover:bg-secondary-light' },
    { variant: 'ghost', color: 'success', class: 'bg-transparent text-success hover:bg-success-light' },
    { variant: 'ghost', color: 'danger', class: 'bg-transparent text-danger hover:bg-danger-light' },
    { variant: 'ghost', color: 'warning', class: 'bg-transparent text-warning hover:bg-warning-light' },
    { variant: 'ghost', color: 'info', class: 'bg-transparent text-info hover:bg-info-light' },
    { variant: 'ghost', color: 'accent', class: 'bg-transparent text-accent hover:bg-accent-light' },
    { variant: 'ghost', color: 'neutral', class: 'bg-transparent text-neutral hover:bg-neutral-light' },
    // Link
    { variant: 'link', color: 'primary', class: 'bg-transparent text-primary underline-offset-4 hover:underline p-0' },
    { variant: 'link', color: 'secondary', class: 'bg-transparent text-secondary underline-offset-4 hover:underline p-0' },
    { variant: 'link', color: 'success', class: 'bg-transparent text-success underline-offset-4 hover:underline p-0' },
    { variant: 'link', color: 'danger', class: 'bg-transparent text-danger underline-offset-4 hover:underline p-0' },
    { variant: 'link', color: 'warning', class: 'bg-transparent text-warning underline-offset-4 hover:underline p-0' },
    { variant: 'link', color: 'info', class: 'bg-transparent text-info underline-offset-4 hover:underline p-0' },
    { variant: 'link', color: 'accent', class: 'bg-transparent text-accent underline-offset-4 hover:underline p-0' },
    { variant: 'link', color: 'neutral', class: 'bg-transparent text-neutral underline-offset-4 hover:underline p-0' },

    // Disabled states
    { variant: 'solid', color: 'primary', disabled: true, class: 'bg-primary text-inverse' },
    { variant: 'solid', color: 'secondary', disabled: true, class: 'bg-secondary text-inverse' },
    { variant: 'solid', color: 'success', disabled: true, class: 'bg-success text-inverse' },
    { variant: 'solid', color: 'danger', disabled: true, class: 'bg-danger text-inverse' },
    { variant: 'solid', color: 'warning', disabled: true, class: 'bg-warning text-inverse' },
    { variant: 'solid', color: 'info', disabled: true, class: 'bg-info text-inverse' },
    { variant: 'solid', color: 'accent', disabled: true, class: 'bg-accent text-inverse' },
    { variant: 'solid', color: 'neutral', disabled: true, class: 'bg-neutral text-inverse' },

    { variant: 'outlined', color: 'primary', disabled: true, class: 'border-primary-light text-primary' },
    { variant: 'outlined', color: 'secondary', disabled: true, class: 'border-secondary-light text-secondary' },
    { variant: 'outlined', color: 'success', disabled: true, class: 'border-success-light text-success' },
    { variant: 'outlined', color: 'danger', disabled: true, class: 'border-danger-light text-danger' },
    { variant: 'outlined', color: 'warning', disabled: true, class: 'border-warning-light text-warning' },
    { variant: 'outlined', color: 'info', disabled: true, class: 'border-info-light text-info' },
    { variant: 'outlined', color: 'accent', disabled: true, class: 'border-accent-light text-accent' },
    { variant: 'outlined', color: 'neutral', disabled: true, class: 'border-neutral-light text-neutral' },

    { variant: 'ghost', color: 'primary', disabled: true, class: 'text-primary' },
    { variant: 'ghost', color: 'secondary', disabled: true, class: 'text-secondary' },
    { variant: 'ghost', color: 'success', disabled: true, class: 'text-success' },
    { variant: 'ghost', color: 'danger', disabled: true, class: 'text-danger' },
    { variant: 'ghost', color: 'warning', disabled: true, class: 'text-warning' },
    { variant: 'ghost', color: 'info', disabled: true, class: 'text-info' },
    { variant: 'ghost', color: 'accent', disabled: true, class: 'text-accent' },
    { variant: 'ghost', color: 'neutral', disabled: true, class: 'text-neutral' },

    { variant: 'link', color: 'primary', disabled: true, class: 'text-primary' },
    { variant: 'link', color: 'secondary', disabled: true, class: 'text-secondary' },
    { variant: 'link', color: 'success', disabled: true, class: 'text-success' },
    { variant: 'link', color: 'danger', disabled: true, class: 'text-danger' },
    { variant: 'link', color: 'warning', disabled: true, class: 'text-warning' },
    { variant: 'link', color: 'info', disabled: true, class: 'text-info' },
    { variant: 'link', color: 'accent', disabled: true, class: 'text-accent' },
    { variant: 'link', color: 'neutral', disabled: true, class: 'text-neutral' },
  ],
  defaultVariants: {
    variant: 'solid',
    color: 'primary',
    size: 'md',
    radius: 'md',
    disabled: false,
    iconOnly: false,
  },
});

export type ButtonVariant = 'solid' | 'outlined' | 'ghost' | 'link';
export type ButtonColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'accent' | 'neutral';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonRadius = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'none';
export type ButtonIconPosition = 'left' | 'right';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  radius?: ButtonRadius;
  icon?: ReactNode;
  iconPosition?: ButtonIconPosition;
  iconSize?: number | string;
}

export function ButtonBase({
  variant,
  color,
  size,
  radius,
  disabled,
  icon,
  iconPosition = 'left',
  iconSize,
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const isIconOnly = !!icon && !children;

  // Accessibility: enforce aria-label for icon-only buttons
  if (isIconOnly && !props['aria-label']) {
    console.warn('Icon-only buttons must have an aria-label for accessibility.');
  }

  // Merge className properly
  const mergedClassName = [
    button({ variant, color, size, radius, disabled, iconOnly: isIconOnly }),
    className,
  ].filter(Boolean).join(' ');

  // Icon rendering helper
  const renderIcon = () => (
    <span
      className={children ? (iconPosition === 'left' ? 'mr-2 flex items-center' : 'ml-2 flex items-center') : ''}
      style={iconSize ? { fontSize: iconSize, width: iconSize, height: iconSize } : {}}
    >
      {icon}
    </span>
  );

  return (
    <button
      type={type}
      className={mergedClassName}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      {...props}
    >
      {icon && iconPosition === 'left' && renderIcon()}
      {children}
      {icon && iconPosition === 'right' && renderIcon()}
    </button>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(ButtonBase);
Button.displayName = 'Button';