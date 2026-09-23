/** @param {import('../run.mjs').SuiteContext} ctx */
export default async function ({ page, check, focused, htmlOverflow }) {
  const section = page.locator('section', { has: page.getByRole('heading', { name: 'Feedback' }) });
  await section.scrollIntoViewIfNeeded();

  await section.getByRole('button', { name: 'Remove vite' }).click();
  const tags = await section.locator('.yarcl-badge:has(.yarcl-badge-remove)').allInnerTexts();
  check('tag removed', JSON.stringify(tags.map((t) => t.trim())) === JSON.stringify(['react', 'typescript', 'css']), JSON.stringify(tags));

  const trial = section.getByText('Trial ends in 3 days');
  await section.getByRole('button', { name: 'Dismiss' }).click();
  check('alert dismissed', !(await trial.isVisible()));
  check('static alerts have no live role', (await section.locator('.yarcl-alert[role]').count()) === 0);

  const save = section.getByRole('button', { name: 'Save' });
  await save.click();
  const saving = section.getByRole('button', { name: 'Saving…' });
  check('loading button disabled and busy', (await saving.isDisabled()) && (await saving.getAttribute('aria-busy')) === 'true');
  check('loading spinner inside button', (await saving.locator('.yarcl-spinner').count()) === 1);
  const add = section.getByRole('button', { name: 'Add' });
  check('icon button swaps icon for spinner', (await add.locator('svg').count()) === 0 && (await add.locator('.yarcl-spinner').count()) === 1);
  const hBusy = (await saving.boundingBox()).height;
  await page.waitForTimeout(1700);
  check('loading ends', await save.isEnabled());
  check('button height unchanged while loading', Math.abs((await save.boundingBox()).height - hBusy) < 0.5);

  check('spinners labelled', (await section.getByRole('status', { name: 'Loading' }).count()) === Object.keys({ xs: 1, sm: 1, md: 1, lg: 1, xl: 1 }).length);

  const card = section.locator('.skeleton-card');
  check('loading region aria-busy', (await card.getAttribute('aria-busy')) === 'true');
  check('skeleton hidden from a11y', (await card.locator('[aria-hidden="true"]').count()) >= 4);
  const skel = card.locator('.yarcl-skeleton-control').first();
  const skelH = (await skel.boundingBox()).height;
  const lines = await card.locator('.yarcl-skeleton-line').count();
  check('skeleton text lines', lines === 3, String(lines));
  await section.getByRole('button', { name: 'Show content' }).click();
  const follow = card.getByRole('button', { name: 'Follow' });
  const btnH = (await follow.boundingBox()).height;
  check('control skeleton matches button height', Math.abs(skelH - btnH) < 0.5, `${skelH} vs ${btnH}`);
}
