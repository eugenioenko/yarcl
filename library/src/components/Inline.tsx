import { alignClass, cx, gapClass, justifyClass, wrapClass } from '../classes';
import type { Responsive } from '../types';
import type { LayoutProps } from './Stack';
import { useDefaults } from '../runtime';


/** Props for {@link Inline}. */
export interface InlineProps extends LayoutProps {
  /**
   * Wraps children onto new lines when they don't fit. Accepts a boolean or breakpoint map.
   * @default true
   */
  wrap?: Responsive<boolean>;
}

/**
 * Lays out children horizontally with a gap from the spacing scale. Centers children vertically by default.
 *
 * @example
 * ```tsx
 * <Inline gap="tight" justify="end">
 *   <Button variant="outline">Cancel</Button>
 *   <Button>Save</Button>
 * </Inline>
 * ```
 */
export function Inline({ as = 'div', gap, align = 'center', justify, wrap = true, className, ...props }: InlineProps) {
  const own = useDefaults('Inline');
  const Tag = as as 'div';
  return (
    <Tag
      className={cx(
        'yarcl-inline',
        gapClass(gap ?? own.gap, own.gap),
        alignClass(align, 'center'),
        justifyClass(justify),
        wrapClass(wrap),
        className,
      )}
      {...props}
    />
  );
}
