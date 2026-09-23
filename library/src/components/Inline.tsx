import { cx, gapClass } from '../classes';
import type { LayoutProps } from './Stack';

/** Props for {@link Inline}. */
export interface InlineProps extends LayoutProps {
  /**
   * Wraps children onto new lines when they don't fit.
   * @default true
   */
  wrap?: boolean;
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
  const Tag = as as 'div';
  return (
    <Tag
      className={cx(
        'yarcl-inline',
        gapClass(gap),
        `yarcl-align-${align}`,
        justify && `yarcl-justify-${justify}`,
        !wrap && 'yarcl-inline-nowrap',
        className,
      )}
      {...props}
    />
  );
}
