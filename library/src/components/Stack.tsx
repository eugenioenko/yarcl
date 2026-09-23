import type { ComponentProps } from 'react';
import { cx, defaultsFor, gapClass } from '../classes';
import type { Align, Justify, Spacing } from '../types';

const own = defaultsFor('Stack');

/** Elements layout components can render as. */
export type LayoutElement = 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'nav' | 'form' | 'ul' | 'ol';

/** Props shared by {@link Stack} and {@link Inline}. */
export interface LayoutProps extends ComponentProps<'div'> {
  /**
   * Element to render.
   * @default 'div'
   */
  as?: LayoutElement;
  /**
   * Space between children, from the `spacing` config.
   * @default config.defaults.gap
   */
  gap?: Spacing;
  /** Cross-axis alignment of children. */
  align?: Align;
  /** Main-axis distribution of children. */
  justify?: Justify;
}

/** Props for {@link Stack}. */
export type StackProps = LayoutProps;

/**
 * Lays out children vertically with a gap from the spacing scale.
 *
 * @example
 * ```tsx
 * <Stack gap="loose">
 *   <Heading level={2}>Profile</Heading>
 *   <Field label="Name"><Input /></Field>
 * </Stack>
 * ```
 */
export function Stack({ as = 'div', gap, align, justify, className, ...props }: StackProps) {
  const Tag = as as 'div';
  return (
    <Tag
      className={cx(
        'yarcl-stack',
        gapClass(gap ?? own.gap),
        align && `yarcl-align-${align}`,
        justify && `yarcl-justify-${justify}`,
        className,
      )}
      {...props}
    />
  );
}
