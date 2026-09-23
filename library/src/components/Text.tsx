import config from '@yarcl/config';
import type { ComponentProps, CSSProperties } from 'react';
import { colorClass, cx, defaultsFor, typeClass } from '../classes';
import type { Color, TextStyle } from '../types';

const own = defaultsFor('Text');

/** Elements {@link Text} can render as. */
export type TextElement = 'span' | 'p' | 'div' | 'strong' | 'em' | 'small' | 'code' | 'label';

/** Props for {@link Text}. */
export interface TextProps extends Omit<ComponentProps<'span'>, 'color'> {
  /**
   * Element to render.
   * @default 'span'
   */
  as?: TextElement;
  /**
   * Text style, from the `typography.styles` config.
   * @default config.defaults.textStyle
   */
  textStyle?: TextStyle;
  /** Semantic color, from the `colors` config. Inherits the surrounding color when omitted. */
  color?: Color;
  /** Uses the muted neutral color, for secondary text. */
  muted?: boolean;
  /** Truncates with an ellipsis: `true` for one line, a number for that many lines. */
  truncate?: boolean | number;
}

/**
 * Text in one of the consumer's text styles.
 *
 * @example
 * ```tsx
 * <Text as="p" textStyle="caption" muted>Updated 2 minutes ago</Text>
 * ```
 */
export function Text({
  as = 'span',
  textStyle = own.textStyle ?? config.defaults.textStyle,
  color,
  muted,
  truncate,
  className,
  style,
  ...props
}: TextProps) {
  const Tag = as as 'span';
  const lines = truncate === true ? 1 : truncate || 0;
  return (
    <Tag
      className={cx(
        'yarcl-text',
        typeClass(textStyle),
        (color ?? own.color) && cx('yarcl-text-colored', colorClass(color ?? own.color)),
        muted && 'yarcl-text-muted',
        lines === 1 && 'yarcl-text-truncate',
        lines > 1 && 'yarcl-text-clamp',
        className,
      )}
      style={lines > 1 ? ({ '--yarcl-lines': lines, ...style } as CSSProperties) : style}
      {...props}
    />
  );
}
