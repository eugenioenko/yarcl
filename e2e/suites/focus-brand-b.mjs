import { highlightContrast, tabThrough } from './focus.mjs';

/** @param {import('../run.mjs').SuiteContext} ctx */
export default async function (ctx) {
  const { page } = ctx;
  await tabThrough(ctx);
  await highlightContrast(ctx, 'Select', async () => {
    await page.getByRole('combobox', { name: 'Shade' }).focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowDown');
  });
  await highlightContrast(ctx, 'CommandPalette', async () => {
    await page.getByRole('button', { name: 'Search' }).focus();
    await page.keyboard.press('Control+k');
  });
}
