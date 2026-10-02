import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { Slider, type Color } from '@yarcl/react';
import { page } from './page';

/** Checks track annotations and accessible band names in both consumer brands. */
export function testSliderMarks(colors: readonly [Color, Color]) {
  test('renders clipped marks and colored bands without changing keyboard scoring', async () => {
    const screen = await render(<Slider
      aria-label="Score"
      min={0}
      max={30}
      defaultValue={22}
      marks={[{ value: 0, label: '0' }, { value: 20 }, { value: 30, label: '30' }, { value: 40, label: 'Outside' }]}
      segments={[
        { from: 0, to: 20, color: colors[0], label: 'Developing' },
        { from: 20, to: 30, color: colors[1], label: 'Proficient' },
        { from: 40, to: 50, label: 'Outside' },
      ]}
    />);
    const root = screen.container.querySelector('.yarcl-slider')!;
    expect(root.querySelectorAll('.yarcl-slider-mark')).toHaveLength(3);
    expect(root.querySelectorAll('.yarcl-slider-segment')).toHaveLength(2);
    expect(root.querySelector('.yarcl-slider-labels')?.textContent).toBe('030');
    expect(root.querySelector('.yarcl-slider-legend')?.textContent).toBe('DevelopingProficient');
    expect(root.querySelectorAll('.yarcl-slider-segment')[0].classList).toContain(`yarcl-color-${colors[0]}`);
    const thumb = page.getByRole('slider', { name: 'Score' });
    expect(await thumb.getAttribute('aria-valuetext')).toBe('22, Proficient');
    await thumb.focus();
    await page.keyboard.press('ArrowRight');
    expect(await thumb.getAttribute('aria-valuenow')).toBe('23');
  });
}
