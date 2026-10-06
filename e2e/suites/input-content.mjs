import { poll } from './poll.mjs';

/** @param {import('../../test-utils/suite.ts').SuiteContext} ctx */
export default async function ({ page, check, focused }) {
  const demo = page.getByTestId('input-content-demo');
  const search = demo.getByRole('textbox', { name: 'Search catalog' });
  await search.fill('Cotton');
  await page.keyboard.press('Tab');
  const clear = demo.getByRole('button', { name: 'Clear', exact: true });
  check('end action is a keyboard stop', await focused(clear));
  check('example uses a solid action with a straight inner edge', await clear.evaluate((button) => {
    const style = getComputedStyle(button);
    return style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.borderStartStartRadius === '0px' && style.borderEndStartRadius === '0px';
  }));
  check('solid action fills the shared control without an outer gutter', await clear.evaluate((button) => {
    const root = button.closest('.yarcl-input-control');
    const rootRect = root.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const border = parseFloat(getComputedStyle(root).borderTopWidth);
    return Math.abs(buttonRect.right - (rootRect.right - border)) < 0.1 && Math.abs(buttonRect.height - (rootRect.height - border * 2)) < 0.1;
  }));
  await page.keyboard.press('Enter');
  check('clear action updates the input', (await search.inputValue()) === '');
  check('caller controls the action disabled state', await clear.isDisabled());
  const amount = demo.getByRole('textbox', { name: 'Amount', exact: true });
  await amount.fill('0');
  check('field marks the inner input invalid', await poll(async () => (await amount.getAttribute('aria-invalid')) === 'true'));
  check('field description and error reach the inner input', (await amount.getAttribute('aria-describedby')).split(' ').length === 2);
  for (const invalid of ['abc', 'Infinity', '1e309', '-1']) {
    await amount.fill('12.50');
    check(`amount is valid before checking ${invalid}`, await poll(async () => (await amount.getAttribute('aria-invalid')) !== 'true'));
    await amount.fill(invalid);
    check(`amount rejects ${invalid}`, await poll(async () => (await amount.getAttribute('aria-invalid')) === 'true'));
  }
  for (const valid of ['', '12.50']) {
    await amount.fill(valid);
    check(`amount clears its error for ${valid || 'empty input'}`, await poll(async () => (await amount.getAttribute('aria-invalid')) !== 'true'));
  }
  const password = demo.locator('input').nth(2);
  await password.fill('Keep this password');
  await demo.getByRole('button', { name: 'Show password' }).click();
  check('button switches the input type without losing its value', (await password.getAttribute('type')) === 'text' && (await password.inputValue()) === 'Keep this password');
  await demo.getByRole('button', { name: 'Hide password' }).click();
  check('password can be hidden again', (await password.getAttribute('type')) === 'password');
}
