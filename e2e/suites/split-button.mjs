import { poll } from './poll.mjs';

/** @param {import('../../test-utils/suite.ts').SuiteContext} ctx */
export default async function ({ page, check, focused }) {
  const group = page.getByRole('group', { name: 'Save actions', exact: true });
  const trigger = group.getByRole('button', { name: 'Choose action', exact: true });
  const initial = await group.locator('.yarcl-split-button-action').textContent();
  const log = page.getByTestId('split-button-log');
  await trigger.focus();
  await page.keyboard.press('Enter');
  await page.getByRole('menuitemradio', { name: initial.trim(), checked: true }).waitFor();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  check('selection closes the menu', await poll(async () => (await page.getByRole('menu').count()) === 0));
  check('selection returns focus to the arrow button', await poll(() => focused(trigger)));
  check('selection updates the main label', (await group.locator('.yarcl-split-button-action').textContent()) !== initial);
  check('selection does not execute', (await log.textContent()) === 'Nothing executed');
  await group.locator('.yarcl-split-button-action').click();
  check('main button executes the selected action', (await log.textContent()) !== 'Nothing executed');
}
