import type { ComponentProps } from 'react';
import { alignClass, cx, gapClass, justifyClass } from '../classes';
import type { Responsive, Align, Justify, Spacing } from '../types';
import { useDefaults } from '../runtime';


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
   * Space between children, from the `spacing` config. Accepts a scalar or breakpoint map.
   * @default config.defaults.gap
   */
  gap?: Responsive<Spacing>;
  /** Cross-axis alignment of children, as a scalar or breakpoint map. */
  align?: Responsive<Align>;
  /** Main-axis distribution of children, as a scalar or breakpoint map. */
  justify?: Responsive<Justify>;
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
  const own = useDefaults('Stack');
  const Tag = as as 'div';
  return (
    <Tag
      className={cx(
        'yarcl-stack',
        gapClass(gap ?? own.gap, own.gap),
        alignClass(align),
        justifyClass(justify),
        className,
      )}
      {...props}
    />
  );
}
