/** @param {import('../run.mjs').SuiteContext} ctx */
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

  const plan = page.getByRole('group', { name: 'Plan' });
  const pro = plan.getByRole('radio', { name: 'Pro' });
  check('radio group: labelled by legend', await pro.isChecked());
  await plan.getByRole('radio', { name: 'Team' }).check();
  check('radio group: one checked', (await plan.getByRole('radio', { checked: true }).count()) === 1);
  const billing = page.getByRole('group', { name: 'Billing' });
  check('radio group: error described and invalid', (await billing.getAttribute('aria-describedby')) !== null && (await billing.getByRole('radio').first().getAttribute('aria-invalid')) === 'true');

  const h1 = page.getByRole('heading', { name: 'Heading level 1' });
  const h6 = page.getByRole('heading', { name: 'Heading level 6' });
  check('heading levels render h1..h6', (await h1.evaluate((el) => el.tagName)) === 'H1' && (await h6.evaluate((el) => el.tagName)) === 'H6');
  const [s1, s6] = await Promise.all([h1, h6].map((h) => h.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))));
  check('heading levels use configured styles', s1 > s6, `${s1} > ${s6}`);
}
