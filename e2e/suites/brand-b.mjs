/** @param {import('../run.mjs').SuiteContext} ctx */
export default async function ({ page, check }) {
  await page.evaluate(() => document.fonts.ready);
  check('web font from fontFaces loaded', await page.evaluate(() => document.fonts.check('500 44px Fraunces')));
  const h1 = page.getByRole('heading', { level: 1 });
  check('h1 uses the serif family', (await h1.evaluate((el) => getComputedStyle(el).fontFamily)).startsWith('Fraunces'));

  const add = page.getByRole('button', { name: 'Add to bag' });
  const save = page.getByRole('button', { name: 'Save' });
  check('talla-l buttons share height', (await add.boundingBox()).height === (await save.boundingBox()).height);
  check('component default: buttons square', (await add.evaluate((el) => getComputedStyle(el).borderRadius)) === '0px');
  const shade = page.getByRole('combobox', { name: 'Shade' });
  check('global default: other controls hairline', (await shade.evaluate((el) => getComputedStyle(el).borderRadius)) === '2px');

  await add.click();
  check('size required before adding', await page.getByRole('alert').filter({ hasText: 'Choose a size first.' }).isVisible());
  const sizes = page.getByRole('group', { name: 'SIZE' });
  await sizes.getByRole('button', { name: 'M', exact: true }).click();
  check('size error clears', (await page.getByRole('alert').filter({ hasText: 'Choose a size first.' }).count()) === 0);
  await add.click();
  check('toast confirms', await page.getByRole('status').filter({ hasText: 'Added to bag' }).isVisible());

  await page.getByRole('button', { name: 'Size guide' }).click();
  const guide = page.getByRole('dialog', { name: 'Size guide' });
  check('size guide dialog with table', await guide.getByRole('table', { name: 'Chest and length' }).isVisible());
  await page.keyboard.press('Escape');

  await page.getByRole('link', { name: 'Design reference' }).click();
  await page.waitForURL(/page=reference/);
  check('reference page renders from config', await page.getByRole('heading', { name: 'Maison Talla design system' }).isVisible());
  check('reference lists consumer sizes', await page.getByRole('rowheader', { name: 'talla-l' }).isVisible());
}
