import { poll } from './poll.mjs';

/** @param {import('../../test-utils/suite.ts').SuiteContext} ctx */
export default async function ({ page, check, focused }) {
  const compact = page.getByRole('navigation', { name: 'Compact results', exact: true });
  const summary = compact.getByRole('status');
  const previous = compact.getByRole('button', { name: 'Previous page' });
  const next = compact.getByRole('button', { name: 'Next page' });
  check('compact layout shows the current page and total', (await summary.textContent()) === 'Page 3 of 20');
  check('compact layout has only previous and next buttons', (await compact.getByRole('button').count()) === 2);
  check('compact controls align with the right edge', await compact.evaluate((root) => Math.abs(root.getBoundingClientRect().right - root.lastElementChild.getBoundingClientRect().right) < 0.1));
  await next.focus();
  await page.keyboard.press('Enter');
  check('next updates the live summary', await poll(async () => (await summary.textContent()) === 'Page 4 of 20'));
  check('focus stays on the next button', await focused(next));
  await page.keyboard.press('ArrowLeft');
  check('arrow keys move focus to the previous button', await focused(previous));
  await page.keyboard.press('Space');
  check('previous returns to the preceding page', await poll(async () => (await summary.textContent()) === 'Page 3 of 20'));
}
