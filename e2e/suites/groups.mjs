/** @param {import('../../test-utils/suite.ts').SuiteContext} ctx */
export default async function ({ page, check, focused }) {
  const range = page.getByRole('group', { name: 'Range' });
  await range.scrollIntoViewIfNeeded();
  const day = range.getByRole('button', { name: 'Day' });
  const week = range.getByRole('button', { name: 'Week' });
  check('single toggle: default pressed', (await week.getAttribute('aria-pressed')) === 'true');
  check('single toggle: one tab stop on selected', (await range.locator('[tabindex="0"]').count()) === 1 && (await week.getAttribute('tabindex')) === '0');
  await day.click();
  check('single toggle: click selects', (await day.getAttribute('aria-pressed')) === 'true' && (await week.getAttribute('aria-pressed')) === 'false');
  await day.click();
  check('single toggle: required keeps selection', (await day.getAttribute('aria-pressed')) === 'true');
  await day.focus();
  await page.keyboard.press('ArrowRight');
  check('toggle: arrow moves focus', await focused(week));
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  check('toggle: arrows skip disabled and wrap', await focused(day));

  const formatting = page.getByRole('group', { name: 'Formatting' });
  await formatting.getByRole('button', { name: 'Italic' }).click();
  const pressed = await formatting.locator('[aria-pressed="true"]').count();
  check('multiple toggle: several on', pressed === 2, String(pressed));
  await formatting.getByRole('button', { name: 'Bold' }).click();
  check('multiple toggle: turn off', (await formatting.getByRole('button', { name: 'Bold' }).getAttribute('aria-pressed')) === 'false');

  const pagination = page.getByRole('group', { name: 'Pagination' });
  const buttons = pagination.getByRole('button');
  const heights = await Promise.all([0, 1, 2, 3].map(async (i) => (await buttons.nth(i).boundingBox()).height));
  check('button group: equal heights', new Set(heights).size === 1, heights.join());
  const [a, b] = [await buttons.nth(0).boundingBox(), await buttons.nth(1).boundingBox()];
  check('button group: attached (borders overlap)', Math.abs(a.x + a.width - b.x - 1) < 0.5, `${a.x + a.width} vs ${b.x}`);

  const invoices = page.getByRole('navigation', { name: 'Invoice pages' });
  await invoices.scrollIntoViewIfNeeded();
  const prev = invoices.getByRole('button', { name: 'Previous page' });
  const next = invoices.getByRole('button', { name: 'Next page' });
  const current = () => invoices.locator('[aria-current="page"]').getAttribute('aria-label');
  check('pagination: first page current', (await current()) === 'Page 1');
  check('pagination: previous disabled on first page', (await prev.getAttribute('aria-disabled')) === 'true');
  const labels = await invoices.getByRole('button').evaluateAll((els) => els.map((el) => el.getAttribute('aria-label')));
  check('pagination: boundary, siblings and ellipsis', labels.join() === 'Previous page,Page 1,Page 2,Page 3,Page 4,Page 5,Page 12,Next page', labels.join());
  await next.click();
  check('pagination: next advances (controlled)', (await current()) === 'Page 2' && (await page.getByTestId('invoice-page').textContent()) === 'Page 2 of 12');
  check('pagination: focus stays on next', await focused(next));
  await invoices.getByRole('button', { name: 'Page 12' }).click();
  check('pagination: next disabled on last page', (await next.getAttribute('aria-disabled')) === 'true');
  await next.click({ force: true });
  check('pagination: disabled next does nothing', (await current()) === 'Page 12');
  await invoices.getByRole('button', { name: 'Page 12' }).focus();
  await page.keyboard.press('ArrowLeft');
  check('pagination: arrow moves focus', await focused(invoices.getByRole('button', { name: 'Page 11' })));
  await page.keyboard.press('Enter');
  check('pagination: enter selects page', (await current()) === 'Page 11');
  await page.keyboard.press('Home');
  check('pagination: home focuses previous', await focused(prev));
  await page.keyboard.press('End');
  check('pagination: end focuses next', await focused(next));

  const results = page.getByRole('navigation', { name: 'Search results' });
  const resultLabels = await results.getByRole('button').evaluateAll((els) => els.map((el) => el.textContent || el.getAttribute('aria-label')));
  check('pagination: two siblings, two ellipses', resultLabels.join() === 'Previous page,1,8,9,10,11,12,50,Next page' && (await results.locator('.yarcl-pagination-ellipsis').count()) === 2, resultLabels.join());
  const resultButtons = results.getByRole('button');
  const [r0, r1] = [await resultButtons.nth(0).boundingBox(), await resultButtons.nth(1).boundingBox()];
  check('pagination: attached (borders overlap)', Math.abs(r0.x + r0.width - r1.x - 1) < 0.5, `${r0.x + r0.width} vs ${r1.x}`);
  const bg = (locator) => locator.evaluate((el) => getComputedStyle(el).backgroundColor);
  check('pagination: current page uses selected variant', (await bg(results.getByRole('button', { name: 'Page 10' }))) !== (await bg(results.getByRole('button', { name: 'Page 9' }))));
  const sizeHeight = await results.getByRole('button', { name: 'Page 9' }).evaluate((el) => el.getBoundingClientRect().height);
  const invoiceHeight = await invoices.getByRole('button', { name: 'Page 11' }).evaluate((el) => el.getBoundingClientRect().height);
  check('pagination: size prop applies', sizeHeight < invoiceHeight, `${sizeHeight} < ${invoiceHeight}`);

  const plan = page.getByRole('group', { name: 'Plan' });
  const pro = plan.getByRole('radio', { name: 'Pro' });
  check('radio group: labelled by legend', await pro.isChecked());
  await plan.getByRole('radio', { name: 'Team' }).check();
  check('radio group: one checked', (await plan.getByRole('radio', { checked: true }).count()) === 1);
  const billing = page.getByRole('group', { name: 'Billing' });
  check('radio group: error described and invalid', (await billing.getAttribute('aria-describedby')) !== null && (await billing.getByRole('radio').first().getAttribute('aria-invalid')) === 'true');

  const radius = (locator) => locator.evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius));
  const sizes = page.locator('section', { has: page.getByRole('heading', { name: 'Sizes', exact: true }) });
  const xsButton = sizes.getByRole('button', { name: 'Button' }).first();
  const xlButton = sizes.getByRole('button', { name: 'Button' }).last();
  const input = sizes.getByRole('textbox').first();
  check('default radius md on every size', (await radius(xsButton)) === 6 && (await radius(xlButton)) === 6 && (await radius(input)) === 6, `${await radius(xsButton)} / ${await radius(xlButton)} / ${await radius(input)}`);
  check('radius prop overrides size', (await radius(page.getByRole('group', { name: 'View' }).getByRole('button').first())) > 100);
  const badge = page.locator('.yarcl-badge').first();
  check('component default (Badge → rounded)', (await radius(badge)) > 100);
  const card = page.locator('.yarcl-card').first();
  check('default radius md on cards', (await radius(card)) === 6, String(await radius(card)));

  const h1 = page.getByRole('heading', { name: 'Heading level 1' });
  const h6 = page.getByRole('heading', { name: 'Heading level 6' });
  check('heading levels render h1..h6', (await h1.evaluate((el) => el.tagName)) === 'H1' && (await h6.evaluate((el) => el.tagName)) === 'H6');
  const [s1, s6] = await Promise.all([h1, h6].map((h) => h.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))));
  check('heading levels use configured styles', s1 > s6, `${s1} > ${s6}`);
}
