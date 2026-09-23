import type { ComponentProps } from 'react';
import { colorClass, cx } from '../classes';
import type { Color } from '../types';

/** Props for {@link Link}. Accepts all native `<a>` attributes except `color`. */
export interface LinkProps extends Omit<ComponentProps<'a'>, 'color'> {
  /**
   * Link color, from the `colors` config.
   * @default config.defaults.color
   */
  color?: Color;
  /**
   * When to underline. Keep `'always'` for links inside running text, so they don't rely on color alone.
   * @default 'always'
   */
  underline?: 'always' | 'hover' | 'none';
  /** Opens in a new tab with `rel="noopener noreferrer"`. */
  external?: boolean;
}

/**
 * A text link that inherits the surrounding text style.
 *
 * @example
 * ```tsx
 * <Link href="/docs">Read the docs</Link>
 * <Link href="https://example.com" external>Example</Link>
 * ```
 */
export function Link({ color, underline = 'always', external, className, ...props }: LinkProps) {
  return (
    <a
      className={cx('yarcl-link', `yarcl-link-underline-${underline}`, colorClass(color), className)}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      {...props}
    />
  );
}
