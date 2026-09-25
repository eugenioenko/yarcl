import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { colorClass, cx, typeClass } from '../classes.js';
import type { Color, TextStyle } from '../types.js';
import { useConfig, useDefaults } from '../runtime.js';
import type { LinkProps } from './Link.js';

interface BreadcrumbItemContextValue {
  current: boolean;
  separator: ReactNode;
  color: Color;
  underline: NonNullable<LinkProps['underline']>;
  itemRef?: (node: HTMLElement | null) => void;
}

const BreadcrumbItemContext = createContext<BreadcrumbItemContextValue | null>(null);

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function Separator({ children }: { children: ReactNode }) {
  return (
    <span className="yarcl-breadcrumb-separator" aria-hidden="true">
      {children}
    </span>
  );
}

/** Props for {@link Breadcrumb}. Accepts all native `<nav>` attributes except `color`. */
export interface BreadcrumbProps extends Omit<ComponentProps<'nav'>, 'color'> {
  /** `Breadcrumb.Item`s, from the root to the current page. */
  children?: ReactNode;
  /**
   * Content between items. Hidden from screen readers.
   * @default a chevron icon
   * @example
   * ```tsx
   * <Breadcrumb separator="/">…</Breadcrumb>
   * ```
   */
  separator?: ReactNode;
  /** Collapses the middle of the trail into an expandable ellipsis when there are more items than this. Without it, the trail never collapses. */
  maxItems?: number;
  /**
   * Items shown before the ellipsis when collapsed.
   * @default 1
   */
  itemsBeforeCollapse?: number;
  /**
   * Items shown after the ellipsis when collapsed.
   * @default 2
   */
  itemsAfterCollapse?: number;
  /**
   * Accessible label of the ellipsis button.
   * @default 'Show all breadcrumbs'
   */
  expandLabel?: string;
  /**
   * Text style, from the `typography.styles` config.
   * @default config.defaults.textStyle
   */
  textStyle?: TextStyle;
  /**
   * Link color, from the `colors` config.
   * @default config.defaults.color
   */
  color?: Color;
  /**
   * When to underline the links.
   * @default 'hover'
   */
  underline?: LinkProps['underline'];
}

function BreadcrumbRoot({
  children,
  separator = <ChevronIcon />,
  maxItems,
  itemsBeforeCollapse = 1,
  itemsAfterCollapse = 2,
  expandLabel = 'Show all breadcrumbs',
  textStyle,
  color,
  underline = 'hover',
  className,
  'aria-label': ariaLabel = 'Breadcrumb',
  ...props
}: BreadcrumbProps) {
  const config = useConfig();
  const own = useDefaults('Breadcrumb');
  const [expanded, setExpanded] = useState(false);
  const focusNext = useRef(false);
  const items = Children.toArray(children).filter(isValidElement);
  const resolvedColor = color ?? own.color ?? config.defaults.color;
  const before = Math.max(0, itemsBeforeCollapse);
  const after = Math.max(1, itemsAfterCollapse);
  const collapsible = maxItems !== undefined && items.length > maxItems && before + after < items.length;
  const collapsed = collapsible && !expanded;
  const hiddenEnd = items.length - after;

  const context = (index: number): BreadcrumbItemContextValue => ({
    current: index === items.length - 1,
    separator,
    color: resolvedColor,
    underline,
    itemRef:
      collapsible && index === before
        ? (node) => {
            if (node && focusNext.current) {
              focusNext.current = false;
              node.focus();
            }
          }
        : undefined,
  });

  const rendered: ReactNode[] = [];
  items.forEach((item, index) => {
    if (collapsed && index >= before && index < hiddenEnd) {
      if (index === before) {
        rendered.push(
          <li key="yarcl-breadcrumb-ellipsis" className="yarcl-breadcrumb-item">
            <button
              type="button"
              className="yarcl-breadcrumb-ellipsis"
              aria-label={expandLabel}
              onClick={() => {
                focusNext.current = true;
                setExpanded(true);
              }}
            >
              <span aria-hidden="true">…</span>
            </button>
            <Separator>{separator}</Separator>
          </li>,
        );
      }
      return;
    }
    rendered.push(
      <BreadcrumbItemContext.Provider key={item.key ?? index} value={context(index)}>
        {item}
      </BreadcrumbItemContext.Provider>,
    );
  });

  return (
    <nav
      aria-label={ariaLabel}
      className={cx(
        'yarcl-breadcrumb',
        typeClass(textStyle ?? own.textStyle ?? config.defaults.textStyle),
        colorClass(resolvedColor),
        className,
      )}
      {...props}
    >
      <ol className="yarcl-breadcrumb-list">{rendered}</ol>
    </nav>
  );
}

/** Props for `Breadcrumb.Item`. Accepts all native `<a>` attributes except `color`. */
export interface BreadcrumbItemProps extends Omit<ComponentProps<'a'>, 'color'> {
  /** The item's label. */
  children?: ReactNode;
  /** Where the item links to. Without it, the item renders as plain text. */
  href?: string;
}

function BreadcrumbItem({ href, className, children, ...props }: BreadcrumbItemProps) {
  const context = useContext(BreadcrumbItemContext);
  if (!context) throw new Error('yarcl: <Breadcrumb.Item> must be inside <Breadcrumb>');
  const { current, separator, color, underline, itemRef } = context;
  return (
    <li className="yarcl-breadcrumb-item">
      {href ? (
        <a
          ref={itemRef}
          href={href}
          aria-current={current ? 'page' : undefined}
          className={cx(
            'yarcl-link',
            current ? 'yarcl-breadcrumb-current yarcl-link-underline-none' : `yarcl-link-underline-${underline}`,
            colorClass(color),
            className,
          )}
          {...props}
        >
          {children}
        </a>
      ) : (
        <span
          ref={itemRef}
          tabIndex={itemRef ? -1 : undefined}
          aria-current={current ? 'page' : undefined}
          className={cx('yarcl-breadcrumb-text', current && 'yarcl-breadcrumb-current', className)}
          {...(props as ComponentProps<'span'>)}
        >
          {children}
        </span>
      )}
      {!current && <Separator>{separator}</Separator>}
    </li>
  );
}

/**
 * Shows where the current page sits in a hierarchy. The last item is the current page
 * and gets `aria-current="page"`. Set `maxItems` to collapse long trails into an ellipsis
 * that expands the full trail.
 *
 * @example
 * ```tsx
 * <Breadcrumb maxItems={4}>
 *   <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
 *   <Breadcrumb.Item href="/projects">Projects</Breadcrumb.Item>
 *   <Breadcrumb.Item href="/projects/apollo">Apollo</Breadcrumb.Item>
 *   <Breadcrumb.Item>Settings</Breadcrumb.Item>
 * </Breadcrumb>
 * ```
 */
export const Breadcrumb = Object.assign(BreadcrumbRoot, {
  Item: BreadcrumbItem,
});
