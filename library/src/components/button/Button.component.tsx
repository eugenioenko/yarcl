import { yarcl } from '@yarcl/config';
import type { ButtonProps } from './Button.types';
import './button.css';

export function Button({
  size = 'md' as ButtonProps['size'],
  radius = 'md' as ButtonProps['radius'],
  color = 'primary',
  children,
  style,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const height = yarcl.button.sizes[size as keyof typeof yarcl.button.sizes];
  const borderRadius = yarcl.button.radii[radius as keyof typeof yarcl.button.radii];

  const classes = ['btn btn--solid', className].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      style={{
        '--btn-h': height,
        '--btn-radius': borderRadius,
        '--btn-color': `var(--color-${color})`,
        '--btn-color-light': `var(--color-${color}-light)`,
        '--btn-color-active': `var(--color-${color}-active)`,
        ...style,
      } as React.CSSProperties}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      {...props}
    >
      {children}
    </button>
  );
}
