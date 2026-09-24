/** @param {import('../../test-utils/suite.ts').SuiteContext} ctx */
export default async function ({ page, check, focused }) {
  const trail = page.getByRole('navigation', { name: 'Breadcrumb', exact: true });
  await trail.scrollIntoViewIfNeeded();
  check('nav landmark with an ordered list', (await trail.locator('> ol > li').count()) === 4);
  const current = trail.locator('[aria-current="page"]');
  check('last item is the current page', (await current.count()) === 1 && (await current.textContent()) === 'Settings');
  check('earlier items are links', (await trail.getByRole('link').count()) === 3);
  const separators = trail.locator('.yarcl-breadcrumb-separator');
  check('separators between items only', (await separators.count()) === 3);
  check('separators hidden from screen readers', (await separators.evaluateAll((els) => els.every((el) => el.getAttribute('aria-hidden') === 'true'))));
  const fontSize = (locator) => locator.evaluate((el) => getComputedStyle(el).fontSize);
  check('component default text style (label = 14px)', (await fontSize(trail)) === '14px', await fontSize(trail));
  const color = (locator) => locator.evaluate((el) => getComputedStyle(el).color);
  const home = trail.getByRole('link', { name: 'Home' });
  const brand = await page.evaluate(() => {
    const probe = document.createElement('span');
    probe.className = 'yarcl-color-brand';
    probe.style.color = 'var(--yarcl-c-text)';
    document.body.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  });
  check('links use the config color', (await color(home)) === brand, `${await color(home)} vs ${brand}`);
  check('current item uses the text color', (await color(current)) !== brand);

  const docs = page.getByRole('navigation', { name: 'Documentation path' });
  check('collapsed: middle items hidden', (await docs.getByRole('link').count()) === 2 && !(await docs.getByRole('link', { name: 'Documentation' }).count()));
  const expand = docs.getByRole('button', { name: 'Show all breadcrumbs' });
  check('collapsed: custom separator', (await docs.locator('.yarcl-breadcrumb-separator').first().textContent()) === '/');
  await expand.focus();
  await page.keyboard.press('Enter');
  const revealed = docs.getByRole('link', { name: 'Documentation' });
  await revealed.waitFor();
  check('expand: all items shown', (await docs.locator('> ol > li').count()) === 5);
  check('expand: focus moves to the first revealed item', await focused(revealed));
  check('expand: ellipsis removed', (await expand.count()) === 0);
}
