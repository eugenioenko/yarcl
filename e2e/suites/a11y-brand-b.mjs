import { audit } from './a11y.mjs';

/** @param {import('../run.mjs').SuiteContext} ctx */
export default async function (ctx) {
  const { page } = ctx;
  await page.evaluate(() => document.fonts.ready);
  await audit(ctx, 'shop page');
  await audit(ctx, 'pagination', '.yarcl-pagination');

  await page.getByRole('button', { name: 'Delivery date' }).click();
  await audit(ctx, 'date picker open', '.yarcl-floating');
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'Size guide' }).click();
  await audit(ctx, 'size guide dialog', 'dialog[open]');
  await page.keyboard.press('Escape');

  await page.getByRole('link', { name: 'Design reference' }).click();
  await page.waitForURL(/page=reference/);
  await audit(ctx, 'design reference page');
}
