/** @param {import('../run.mjs').SuiteContext} ctx */
export default async function ({ page, check, focused }) {
  const guests = page.getByRole('spinbutton', { name: 'Guests' });
  await guests.scrollIntoViewIfNeeded();
  const field = guests.locator('xpath=..');
  const increase = field.getByRole('button', { name: 'Increase' });
  const decrease = field.getByRole('button', { name: 'Decrease' });

  check('labelled by the field and described', (await guests.getAttribute('aria-describedby')) !== null);
  check('spinbutton exposes value and range', (await guests.getAttribute('aria-valuenow')) === '2' && (await guests.getAttribute('aria-valuemin')) === '1' && (await guests.getAttribute('aria-valuemax')) === '12');
  check('stepper buttons are not tab stops', (await increase.getAttribute('tabindex')) === '-1' && (await decrease.getAttribute('tabindex')) === '-1');

  await increase.click();
  check('increment button steps up', (await guests.inputValue()) === '3');
  check('stepper click keeps focus off the button', !(await focused(increase)));
  await decrease.click();
  await decrease.click();
  check('decrement button steps down', (await guests.inputValue()) === '1');
  check('decrement disabled at min', await decrease.isDisabled());

  await guests.focus();
  await page.keyboard.press('ArrowUp');
  check('ArrowUp steps up', (await guests.inputValue()) === '2' && (await guests.getAttribute('aria-valuenow')) === '2');
  await page.keyboard.press('ArrowDown');
  check('ArrowDown steps down', (await guests.inputValue()) === '1');
  await page.keyboard.press('PageUp');
  check('PageUp steps ten', (await guests.inputValue()) === '11');
  await page.keyboard.press('End');
  check('End jumps to max', (await guests.inputValue()) === '12');
  check('increment disabled at max', await increase.isDisabled());
  await page.keyboard.press('ArrowUp');
  check('stays within max', (await guests.inputValue()) === '12');
  await page.keyboard.press('Home');
  check('Home jumps to min', (await guests.inputValue()) === '1');

  await guests.fill('40');
  await page.keyboard.press('Enter');
  check('typed value clamps on Enter', (await guests.inputValue()) === '12');
  await guests.fill('abc');
  await guests.blur();
  check('invalid text reverts on blur', (await guests.inputValue()) === '12');
  await guests.fill('5');
  await page.keyboard.press('ArrowUp');
  check('arrow steps from typed text', (await guests.inputValue()) === '6');

  const budget = page.getByRole('spinbutton', { name: 'Budget' });
  check('error marks it invalid', (await budget.getAttribute('aria-invalid')) === 'true');
  check('empty value has no aria-valuenow', (await budget.getAttribute('aria-valuenow')) === null);
  await budget.focus();
  await page.keyboard.press('ArrowUp');
  check('stepping from empty starts at zero', (await budget.inputValue()) === '0');
  await page.keyboard.press('ArrowUp');
  check('custom step', (await budget.inputValue()) === '10');
  await budget.fill('');
  await budget.blur();
  check('clearing gives an empty value', (await budget.inputValue()) === '' && (await budget.getAttribute('aria-valuenow')) === null);

  const sizes = page.locator('section', { has: page.getByRole('heading', { name: 'Sizes', exact: true }) });
  const rows = await sizes.locator('.yarcl-number-input').count();
  const mismatched = [];
  for (let i = 0; i < rows; i++) {
    const input = await sizes.locator('input.yarcl-input:not(.yarcl-number-input-field)').nth(i).boundingBox();
    const number = await sizes.locator('.yarcl-number-input').nth(i).boundingBox();
    if (input.height !== number.height) mismatched.push(`${input.height} vs ${number.height}`);
  }
  check(`matches Input height at every size (${rows} sizes)`, rows > 0 && mismatched.length === 0, mismatched.join(', '));

  const style = (locator, prop) => locator.evaluate((el, p) => getComputedStyle(el)[p], prop);
  await guests.focus();
  const [focusBorder, brand] = await Promise.all([
    style(guests, 'borderTopColor'),
    guests.evaluate((el) => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--yarcl-c)';
      el.parentElement.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    }),
  ]);
  check('focus border uses the color token', focusBorder === brand, `${focusBorder} vs ${brand}`);
  check('focus ring from the config', (await style(guests, 'outlineStyle')) !== 'none');
}
