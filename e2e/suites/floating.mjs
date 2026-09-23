/** @param {import('../run.mjs').SuiteContext} ctx */
export default async function ({ page, check, focused, htmlOverflow }) {
  // Tooltip
  await page.getByRole('heading', { name: 'Floating' }).scrollIntoViewIfNeeded();
  const floatingSearch = page.locator('section', { has: page.getByRole('heading', { name: 'Floating' }) }).getByRole('button', { name: 'Search' });
  await floatingSearch.hover();
  await page.waitForTimeout(600);
  check('tooltip opens on hover', await page.getByRole('tooltip').isVisible());
  check('tooltip describes trigger', (await floatingSearch.getAttribute('aria-describedby')) !== null);
  await page.mouse.move(0, 0);
  await page.waitForTimeout(100);
  check('tooltip closes on leave', !(await page.getByRole('tooltip').isVisible()));

  // Menu
  const actions = page.getByRole('button', { name: 'Actions' });
  await actions.click();
  const menu = page.getByRole('menu');
  check('menu opens on click', await menu.isVisible());
  check('menu trigger aria-expanded', (await actions.getAttribute('aria-expanded')) === 'true');
  await page.keyboard.press('Escape');
  await actions.focus();
  await page.keyboard.press('Enter');
  check('keyboard open focuses first item', await page.getByRole('menuitem', { name: 'Rename' }).evaluate((el) => el === document.activeElement));
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  check('arrow keys skip disabled item', await page.getByRole('menuitem', { name: 'Delete' }).evaluate((el) => el === document.activeElement));
  await page.keyboard.press('Enter');
  check('Enter selects and closes', !(await menu.isVisible()) && (await page.getByTestId('menu-log').innerText()).includes('Delete'));
  check('focus returns to trigger', await actions.evaluate((el) => el === document.activeElement));
  await actions.click();
  await page.keyboard.type('du');
  check('typeahead jumps to Duplicate', await page.getByRole('menuitem', { name: 'Duplicate' }).evaluate((el) => el === document.activeElement));
  await page.keyboard.press('Escape');
  check('Esc closes menu', !(await menu.isVisible()));

  // Popover
  const filters = page.getByRole('button', { name: 'Filters' });
  await filters.click();
  check('popover opens', await page.getByRole('dialog').isVisible());
  await page.keyboard.press('Escape');
  check('Esc closes popover', !(await page.getByRole('dialog').isVisible()));

  // HoverCard
  const ada = page.getByRole('link', { name: '@ada' });
  await ada.hover();
  await page.waitForTimeout(500);
  const card = page.locator('.yarcl-hover-card').getByText('Ada Lovelace');
  check('hover card opens', await card.isVisible());
  await card.hover();
  await page.waitForTimeout(400);
  check('hover card stays open when pointer moves in', await card.isVisible());
  await page.mouse.move(0, 0);
  await page.waitForTimeout(400);

  // Select
  const plan = page.getByRole('combobox', { name: 'Plan' });
  check('select labelled by Field', (await plan.count()) === 1);
  check('select shows value', (await plan.innerText()).includes('Pro'));
  await plan.click();
  const listbox = page.getByRole('listbox');
  check('select opens listbox', await listbox.isVisible());
  check('selected option focused', await page.getByRole('option', { name: 'Pro' }).evaluate((el) => el === document.activeElement));
  await page.keyboard.press('ArrowDown');
  check('select ArrowDown moves', await page.getByRole('option', { name: 'Team' }).evaluate((el) => el === document.activeElement));
  await page.keyboard.press('ArrowDown');
  check('select skips disabled and loops', await page.getByRole('option', { name: 'Free' }).evaluate((el) => el === document.activeElement));
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Enter');
  check('select Enter chooses', (await plan.innerText()).includes('Team') && (await page.getByText('Value: team').isVisible()));
  await plan.focus();
  await page.keyboard.type('f');
  await page.waitForTimeout(100);
  check('closed typeahead selects', (await plan.innerText()).includes('Free'));

  // Combobox (searchable select)
  const country = page.getByRole('combobox', { name: 'Country' });
  await country.click();
  await country.fill('sw');
  const opts = await page.getByRole('option').allInnerTexts();
  check('combobox filters', JSON.stringify(opts) === JSON.stringify(['Sweden', 'Switzerland']), JSON.stringify(opts));
  check('first match active', (await country.getAttribute('aria-activedescendant')) !== null);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  check('combobox Enter chooses', (await country.inputValue()) === 'Switzerland' && (await page.getByText('Value: switzerland').isVisible()));
  await country.fill('xyz');
  check('empty message', await page.getByText('No results').isVisible());
  await page.keyboard.press('Tab');
  check('blur restores label', (await country.inputValue()) === 'Switzerland', await country.inputValue());
  await country.click();
  await country.fill('can');
  await page.getByRole('option', { name: 'Canada' }).click();
  check('click chooses option', (await country.inputValue()) === 'Canada');

  // Combobox (free text)
  const fw = page.getByRole('combobox', { name: 'Framework' });
  await fw.click();
  await fw.fill('Lit');
  await page.keyboard.press('Tab');
  check('custom value kept', (await fw.inputValue()) === 'Lit' && (await page.getByText('Value: Lit').isVisible()));

  // Combobox (async)
  const remote = page.getByRole('combobox', { name: 'Async search' });
  await remote.click();
  check('async shows nothing before typing', (await page.getByRole('listbox').count()) === 0);
  await remote.fill('ar');
  check('async loading', await page.getByText('Loading…').isVisible());
  await page.waitForTimeout(700);
  check('async results', (await page.getByRole('option').allInnerTexts()).join() === 'Argentina');
  await page.keyboard.press('Escape');
}
