import { useContext, useId, type ComponentProps } from 'react';
import { cx, gapClass, typeClass } from '../classes';
import { NavigationContext } from '../navigation';
import { useConfig, useDefaults } from '../runtime';
import type { Spacing, TextStyle } from '../types';

/** Props for {@link NavSection}. */
export interface NavSectionProps extends Omit<ComponentProps<'div'>, 'title'> {
  /** Visible heading and accessible name of the group. */
  title: string;
  /** Hides the heading visually and collapses descendant items. @default parent navigation state */
  collapsed?: boolean;
  /** Spacing between the heading and links. @default config.components.NavSection.gap ?? config.defaults.gap */
  gap?: Spacing;
  /** Heading typography. @default config.components.NavSection.textStyle ?? config.defaults.labelStyle */
  textStyle?: TextStyle;
}

/**
 * A named group of navigation links, with an optional icon rail.
 * @example
 * ```tsx
 * <NavSection title="Workspace"><NavItem href="/projects">Projects</NavItem></NavSection>
 * ```
 */
export function NavSection({ title, collapsed, gap, textStyle, className, children, ...props }: NavSectionProps) {
  const inherited = useContext(NavigationContext);
  const isCollapsed = collapsed ?? inherited;
  const config = useConfig();
  const own = useDefaults('NavSection');
  const id = useId();
  return (
    <NavigationContext value={isCollapsed}>
      <div role="group" aria-labelledby={id} className={cx('yarcl-nav-section', gapClass(gap ?? own.gap), className)} {...props}>
        <span id={id} className={cx('yarcl-nav-section-heading', typeClass(textStyle ?? own.textStyle ?? config.defaults.labelStyle), isCollapsed && 'yarcl-visually-hidden')}>{title}</span>
        {children}
      </div>
    </NavigationContext>
  );
}
