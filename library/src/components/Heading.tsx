import config from '@yarcl/config';
import type { ComponentProps } from 'react';
import { colorClass, cx, typeClass } from '../classes';
import type { Color, TextStyle } from '../types';

/** Props for {@link Heading}. */
export interface HeadingProps extends Omit<ComponentProps<'h2'>, 'color'> {
  /** Heading level: renders `<h1>` … `<h6>`. Choose by document structure, not by size. */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Text style, from the `typography.styles` config. Sets the visual size independently of `level`.
   * @default config.defaults.headingStyle
   */
  textStyle?: TextStyle;
  /** Semantic color, from the `colors` config. Uses the default text color when omitted. */
  color?: Color;
}

/**
 * A section heading. `level` sets the semantics, `textStyle` sets the look.
 *
 * @example
 * ```tsx
 * <Heading level={1} textStyle="display">Settings</Heading>
 * ```
 */
export function Heading({ level, textStyle = config.defaults.headingStyle, color, className, ...props }: HeadingProps) {
  const Tag = `h${level}` as 'h2';
  return (
    <Tag
      className={cx('yarcl-heading', typeClass(textStyle), color && cx('yarcl-text-colored', colorClass(color)), className)}
      {...props}
    />
  );
}
