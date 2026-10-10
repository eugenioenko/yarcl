import { Fragment, isValidElement, useContext, type ComponentProps, type ReactNode } from 'react';
import { cx, radiusClass, sizeClass } from '../classes';
import type { Radius, Size } from '../types';
import { useConfig } from '../runtime';
import { NavigationContext } from '../navigation';
import { Tooltip } from './Tooltip';

function hasContent(node: ReactNode): boolean {
  if (node == null || typeof node === 'boolean') return false;
  if (typeof node === 'string') return node.trim().length > 0;
  if (Array.isArray(node)) return node.some(hasContent);
  if (isValidElement<{ children?: ReactNode }>(node) && node.type === Fragment) return hasContent(node.props.children);
  return true;
}

/** Props for {@link NavItem}. Accepts native anchor attributes for router click handlers. */
export interface NavItemProps extends Omit<ComponentProps<'a'>, 'color'> {
  /** Icon displayed before the label. */
  icon?: ReactNode;
  /** Marks the current page with `aria-current="page"`. */
  active?: boolean;
  /** Shows only the icon, preserving the link name and a focus/hover tooltip. @default parent navigation state */
  collapsed?: boolean;
  /** Item height and icon size from the `sizes` config. @default config.defaults.size */
  size?: Size;
  /** Corner radius from the `radii` config. @default config.defaults.radius */
  radius?: Radius;
}

/**
 * A navigation link with an icon, label and current-page state.
 * @example
 * ```tsx
 * <NavItem href="/projects" icon={<ProjectsIcon />} collapsed>Projects</NavItem>
 * ```
 */
export function NavItem({ icon, active, collapsed, size, radius, className, children, 'aria-current': ariaCurrent, ...props }: NavItemProps) {
  const { defaults } = useConfig();
  const inherited = useContext(NavigationContext);
  const hasIcon = hasContent(icon);
  const isCollapsed = (collapsed ?? inherited) && hasIcon;
  const link = (
    <a
      className={cx('yarcl-nav-item', isCollapsed && 'yarcl-nav-item-collapsed', sizeClass(size ?? defaults.size), radiusClass(radius ?? defaults.radius, size ?? defaults.size), className)}
      aria-current={ariaCurrent ?? (active ? 'page' : undefined)}
      {...props}
    >
      {hasIcon && <span className="yarcl-nav-item-icon" aria-hidden="true">{icon}</span>}
      <span className={cx('yarcl-nav-item-label', isCollapsed && 'yarcl-visually-hidden')}>{children}</span>
    </a>
  );
  return isCollapsed ? <Tooltip content={props['aria-label'] ?? children} describe={props['aria-labelledby'] != null} placement="right">{link}</Tooltip> : link;
}
