import type { ComponentProps, ReactNode } from 'react';
import { colorClass, cx, radiusClass, sizeClass, softVariantClass } from '../classes';
import type { Color, ComponentSize, Radius, ComponentVariant } from '../types';
import { useDefaults } from '../runtime';


/** Props for {@link Badge}. */
export interface BadgeProps extends Omit<ComponentProps<'span'>, 'color'> {
  /**
   * Semantic color, from the `colors` config.
   * @default config.defaults.color
   */
  color?: Color;
  /**
   * Style recipe, from this component's variant map or shared `variants`.
   * @default config.defaults.softVariant
   */
  variant?: ComponentVariant<'Badge'>;
  /**
   * Scales with the size's font size, from the `sizes` config.
   * @default config.defaults.size
   */
  size?: ComponentSize<'Badge'>;
  /**
   * Corner radius, from the `radii` config.
   * @default config.defaults.radius
   */
  radius?: Radius | 'size';
  /** Decorative icon before the label, sized from the badge size. */
  startIcon?: ReactNode;
  /** Decorative icon after the label, sized from the badge size. */
  endIcon?: ReactNode;
  /** Allows the label to wrap onto multiple lines instead of truncating with an ellipsis. */
  wrap?: boolean;
  /** Shows a remove button, making the badge a removable tag. Called when it is pressed. */
  onRemove?: () => void;
  /**
   * Accessible label of the remove button.
   * @default 'Remove'
   */
  removeLabel?: string;
}

/**
 * A small label for status, counts or categories. With `onRemove`, a removable tag.
 * Uses the same variant recipes as {@link Button}.
 *
 * @example
 * ```tsx
 * <Badge color="success">Active</Badge>
 * <Badge onRemove={() => removeTag('react')}>react</Badge>
 * ```
 */
export function Badge({
  color,
  variant,
  size,
  radius,
  startIcon,
  endIcon,
  wrap,
  onRemove,
  removeLabel = 'Remove',
  className,
  children,
  ...props
}: BadgeProps) {
  const own = useDefaults('Badge');
  const s = size ?? own.size;
  return (
    <span
      className={cx('yarcl-badge', wrap && 'yarcl-badge-wrap', colorClass(color ?? own.color), softVariantClass(variant ?? own.variant, 'Badge'), sizeClass(s, 'Badge'), radiusClass(radius ?? own.radius, s), className)}
      {...props}
    >
      {startIcon && <span className="yarcl-badge-icon" aria-hidden="true">{startIcon}</span>}
      <span className="yarcl-badge-label">{children}</span>
      {endIcon && <span className="yarcl-badge-icon" aria-hidden="true">{endIcon}</span>}
      {onRemove && <BadgeRemove aria-label={removeLabel} onClick={onRemove} />}
    </span>
  );
}

export function BadgeRemove(props: Omit<ComponentProps<'button'>, 'children'>) {
  return (
    <button type="button" className="yarcl-badge-remove" {...props}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
        <path d="M7 7l10 10M17 7 7 17" />
      </svg>
    </button>
  );
}
