import type { ComponentProps, CSSProperties } from 'react';
import { colorClass, cx, typeClass } from '../classes';
import type { Color, TextStyle } from '../types';
import { useConfig, useDefaults } from '../runtime';


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
  /** Inherits the surrounding font instead of applying the component's default text style. An explicit `textStyle` takes precedence. */
  inherit?: boolean;
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
  textStyle,
  inherit,
  color,
  muted,
  truncate,
  className,
  style,
  ...props
}: TextProps) {
  const config = useConfig();
  const own = useDefaults('Text');
  const Tag = as as 'span';
  const lines = truncate === true ? 1 : truncate || 0;
  const resolvedTextStyle = inherit && textStyle === undefined ? undefined : textStyle ?? own.textStyle ?? config.defaults.textStyle;
  return (
    <Tag
      className={cx(
        'yarcl-text',
        resolvedTextStyle && typeClass(resolvedTextStyle),
        !inherit && textStyle === undefined && own.textStyle === undefined && 'yarcl-text-auto-size',
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
