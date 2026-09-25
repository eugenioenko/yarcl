import type { ComponentProps } from 'react';
import { cx } from '../classes.js';

/** Props for {@link Divider}. */
export interface DividerProps extends Omit<ComponentProps<'hr'>, 'children'> {
  /**
   * Direction of the line. Use `'vertical'` inside an {@link Inline}.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * A thin separator line in the neutral border color.
 * Spacing around it comes from the parent's `gap`.
 *
 * @example
 * ```tsx
 * <Stack>
 *   <Text>Above</Text>
 *   <Divider />
 *   <Text>Below</Text>
 * </Stack>
 * ```
 */
export function Divider({ orientation = 'horizontal', className, ...props }: DividerProps) {
  return (
    <hr
      className={cx('yarcl-divider', `yarcl-divider-${orientation}`, className)}
      aria-orientation={orientation === 'vertical' ? 'vertical' : undefined}
      {...props}
    />
  );
}
