import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { Text } from '@yarcl/react';

/** Checks line preservation and word wrapping in both consumer brands. */
export function testTextWrapping() {
  test('preserves newlines and wraps long words', async () => {
    const screen = await render(<Text as="p" whiteSpace="pre-wrap" wrap="anywhere">{'line one\naverylongunbrokenword'}</Text>);
    const element = screen.container.querySelector('p')!;
    const style = getComputedStyle(element);
    expect(style.whiteSpace).toBe('pre-wrap');
    expect(style.overflowWrap).toBe('anywhere');
    expect(element.textContent).toBe('line one\naverylongunbrokenword');
  });
}
