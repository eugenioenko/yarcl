/** @param {import('../run.mjs').SuiteContext} ctx */
export default async function ({ page, check, focused }) {
  const section = page.locator('section', { has: page.locator('h2', { hasText: /^Date picker$/ }) });
  await section.scrollIntoViewIfNeeded();
  const active = () => page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
  const title = () => page.locator('.yarcl-date-picker-title').innerText();

  // Single date
  const trigger = page.getByRole('button', { name: 'Appointment', includeHidden: true });
  check('trigger labelled by Field', (await trigger.count()) === 1);
  check('trigger shows the value', (await trigger.innerText()).includes('Sep 15, 2026'));
  check('trigger announces a dialog', (await trigger.getAttribute('aria-haspopup')) === 'dialog');
  const input = page.getByRole('textbox', { name: 'Name', exact: true });
  const solid = await page.getByRole('button', { name: 'Button' }).first().evaluate((el) => getComputedStyle(el).backgroundColor);
  const bg = (locator) => locator.evaluate((el) => getComputedStyle(el).backgroundColor);
  check('trigger matches Input height', (await trigger.boundingBox()).height === (await input.boundingBox()).height);

  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Choose date' });
  check('calendar opens', await dialog.isVisible());
  check('trigger aria-expanded', (await trigger.getAttribute('aria-expanded')) === 'true');
  const grid = dialog.getByRole('grid', { name: 'September 2026' });
  check('grid labelled by month', await grid.isVisible());
  check('month buttons labelled', (await dialog.getByRole('button', { name: 'Previous month' }).count()) === 1 && (await dialog.getByRole('button', { name: 'Next month' }).count()) === 1);
  check('weekday headers', (await grid.getByRole('columnheader').allInnerTexts()).join() === 'Su,Mo,Tu,We,Th,Fr,Sa');
  check('selected day focused on open', (await active()) === 'Tuesday, September 15th, 2026');
  check('selected day aria-selected', (await grid.getByRole('gridcell', { name: 'Tuesday, September 15th, 2026' }).getAttribute('aria-selected')) === 'true');
  check('selected day uses the default variant and color', (await bg(grid.getByRole('gridcell', { name: 'Tuesday, September 15th, 2026' }))) === solid);
  check('other days have no fill', (await bg(grid.getByRole('gridcell', { name: 'Friday, September 18th, 2026' }))) === 'rgba(0, 0, 0, 0)');
  check('one tab stop in the grid', (await grid.locator('[tabindex="0"]').count()) === 1);

  await page.keyboard.press('ArrowRight');
  check('ArrowRight moves a day', (await active()) === 'Wednesday, September 16th, 2026');
  await page.keyboard.press('ArrowDown');
  check('ArrowDown moves a week', (await active()) === 'Wednesday, September 23rd, 2026');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowLeft');
  check('ArrowUp and ArrowLeft move back', (await active()) === 'Tuesday, September 15th, 2026');
  await page.keyboard.press('Home');
  check('Home goes to start of week', (await active()) === 'Sunday, September 13th, 2026');
  await page.keyboard.press('End');
  check('End goes to end of week', (await active()) === 'Saturday, September 19th, 2026');
  await page.keyboard.press('PageDown');
  check('PageDown moves a month', (await active()) === 'Monday, October 19th, 2026' && (await title()) === 'October 2026');
  await page.keyboard.press('Shift+PageDown');
  check('Shift+PageDown moves a year', (await active()) === 'Tuesday, October 19th, 2027' && (await title()) === 'October 2027');
  await page.keyboard.press('Shift+PageUp');
  await page.keyboard.press('PageUp');
  check('PageUp and Shift+PageUp move back', (await active()) === 'Saturday, September 19th, 2026');
  const ring = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  check('focused day shows a focus ring', ring !== 'none', ring);
  await page.keyboard.press('Enter');
  check('Enter picks and closes', !(await dialog.isVisible()) && (await trigger.innerText()).includes('Sep 19, 2026'));
  check('onValueChange reports the day', await section.getByText('Value: 2026-09-19').isVisible());
  check('focus returns to trigger', await focused(trigger));

  await page.keyboard.press('Space');
  check('Space opens from the trigger', await dialog.isVisible());
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Escape');
  check('Esc closes without picking', !(await dialog.isVisible()) && (await trigger.innerText()).includes('Sep 19, 2026'));
  check('Esc returns focus to trigger', await focused(trigger));

  await trigger.click();
  const next = dialog.getByRole('button', { name: 'Next month' });
  await next.click();
  check('Next month button changes month', (await title()) === 'October 2026');
  check('focus stays on the month button', await focused(next));
  await dialog.getByRole('button', { name: 'Previous month' }).click();
  await grid.getByRole('gridcell', { name: 'Monday, September 21st, 2026' }).click();
  check('click picks a day', (await trigger.innerText()).includes('Sep 21, 2026') && !(await dialog.isVisible()));

  // Min, max and disabled dates
  const delivery = page.getByRole('button', { name: 'Delivery day', includeHidden: true });
  await delivery.click();
  const cell = (name) => page.getByRole('gridcell', { name });
  check('before min is disabled', (await cell('Wednesday, September 9th, 2026').getAttribute('aria-disabled')) === 'true');
  check('after max is disabled', (await cell('Monday, September 21st, 2026').getAttribute('aria-disabled')) === 'true');
  check('disabled weekend', (await cell('Saturday, September 12th, 2026').getAttribute('aria-disabled')) === 'true');
  check('month buttons disabled at the limits', (await page.getByRole('button', { name: 'Previous month' }).getAttribute('aria-disabled')) === 'true');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Enter');
  check('disabled day focusable but not pickable', (await active()) === 'Sunday, September 13th, 2026' && (await page.getByRole('dialog').isVisible()));
  await page.keyboard.press('PageUp');
  check('navigation clamps to min', (await active()) === 'Thursday, September 10th, 2026');
  await page.keyboard.press('Escape');
  check('hidden input submits ISO date', (await page.locator('input[name="delivery"]').inputValue()) === '2026-09-14');

  // Range
  const stay = page.getByRole('button', { name: 'Stay', includeHidden: true });
  check('range trigger shows both days', (await stay.innerText()).includes('Sep 3, 2026 – Sep 7, 2026'));
  await stay.click();
  const rangeGrid = page.getByRole('grid');
  check('range grid is multiselectable', (await rangeGrid.getAttribute('aria-multiselectable')) === 'true');
  check('range days selected', (await rangeGrid.locator('[aria-selected="true"]').count()) === 5);
  const middle = await bg(cell('Saturday, September 5th, 2026'));
  check('days inside the range use the soft variant', middle !== solid && middle !== 'rgba(0, 0, 0, 0)', middle);
  check('range opens on the start day', (await active()) === 'Thursday, September 3rd, 2026');
  await cell('Thursday, September 10th, 2026').click();
  check('first click keeps the calendar open', await page.getByRole('dialog').isVisible());
  check('first click reports the start', await section.getByText('From 2026-09-10 to none').isVisible());
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Enter');
  check('earlier end day swaps the range', await section.getByText('From 2026-09-08 to 2026-09-10').isVisible());
  check('second pick closes', !(await page.getByRole('dialog').isVisible()));

  // Locale and today
  const termin = page.getByRole('button', { name: 'Termin (German)', includeHidden: true });
  await termin.click();
  const german = page.getByRole('dialog', { name: 'Datum wählen' });
  check('localized dialog and month buttons', await german.getByRole('button', { name: 'Nächster Monat' }).isVisible());
  check('localized week starts on Monday', (await german.getByRole('columnheader').first().innerText()) === 'Mo');
  const today = german.locator('[aria-current="date"]');
  check('today is marked and focused when empty', (await today.count()) === 1 && (await focused(today)));
  await page.keyboard.press('Enter');
  const expected = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  check('localized display format', (await termin.innerText()).includes(expected), await termin.innerText());
}
