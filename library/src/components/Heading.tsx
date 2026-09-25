import type { ComponentProps } from 'react';
import { colorClass, cx, typeClass } from '../classes.js';
import type { Color, TextStyle } from '../types.js';
import { useConfig } from '../runtime.js';

/** Props for {@link Heading}. */
export interface HeadingProps extends Omit<ComponentProps<'h2'>, 'color'> {
  /** Heading level: renders `<h1>` … `<h6>`. Choose by document structure, not by size. */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Text style, from the `typography.styles` config. Overrides the level's style when the
   * visual size should differ from the document structure.
   * @default config.typography.headings[`h${level}`]
   */
  textStyle?: TextStyle;
  /** Semantic color, from the `colors` config. Uses the default text color when omitted. */
  color?: Color;
}

/**
 * A section heading. Renders `<h1>` … `<h6>` styled with the level's text style from
 * `typography.headings`; `textStyle` overrides the look without changing the level.
 *
 * @example
 * ```tsx
 * <Heading level={1}>Settings</Heading>
 * <Heading level={2} textStyle="display">Big section title</Heading>
 * ```
 */
export function Heading({ level, textStyle, color, className, ...props }: HeadingProps) {
  const config = useConfig();
  const Tag = `h${level}` as 'h2';
  const style: TextStyle = textStyle ?? config.typography.headings[`h${level}`];
  return (
    <Tag
      className={cx('yarcl-heading', typeClass(style), color && cx('yarcl-text-colored', colorClass(color)), className)}
      {...props}
    />
  );
}
