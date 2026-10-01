import type { ComponentProps, ReactNode } from 'react';
import { cx, radiusClass, sizeClass } from '../classes';
import type { Radius, Size } from '../types';
import { useConfig } from '../runtime';

/** Props for {@link NavItem}. Accepts native anchor attributes for router click handlers. */
export interface NavItemProps extends Omit<ComponentProps<'a'>, 'color'> {
  /** Icon displayed before the label. */
  icon?: ReactNode;
  /** Marks the current page with `aria-current="page"`. */
  active?: boolean;
  /** Item height and icon size from the `sizes` config. @default config.defaults.size */
  size?: Size;
  /** Corner radius from the `radii` config. @default config.defaults.radius */
  radius?: Radius;
}

/** A navigation link with an icon, label and current-page state. */
export function NavItem({ icon, active, size, radius, className, children, 'aria-current': ariaCurrent, ...props }: NavItemProps) {
  const { defaults } = useConfig();
  return (
    <a
      className={cx('yarcl-nav-item', sizeClass(size ?? defaults.size), radiusClass(radius ?? defaults.radius, size ?? defaults.size), className)}
      aria-current={ariaCurrent ?? (active ? 'page' : undefined)}
      {...props}
    >
      {icon && <span className="yarcl-nav-item-icon" aria-hidden="true">{icon}</span>}
      <span className="yarcl-nav-item-label">{children}</span>
    </a>
  );
}
