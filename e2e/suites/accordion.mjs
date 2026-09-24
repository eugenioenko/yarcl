const expanded = async (trigger) => (await trigger.getAttribute('aria-expanded')) === 'true';

/** Seconds of a CSS time value, so `200ms` and `0.2s` compare equal. */
const seconds = (value) => (value.trim().endsWith('ms') ? parseFloat(value) / 1000 : parseFloat(value));

/** Resolves `color: var(...)` inside `el` to a computed color. */
export const resolveColor = (locator, value) =>
  locator.evaluate((el, value) => {
    const probe = document.createElement('span');
    probe.style.color = value;
    el.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, value);

/** @param {import('../../test-utils/suite.ts').SuiteContext} ctx */
export default async function ({ page, check, focused }) {
  const faq = page.getByTestId('faq');
  await faq.scrollIntoViewIfNeeded();
  const shipping = faq.getByRole('button', { name: 'Shipping' });
  const returns = faq.getByRole('button', { name: 'Returns' });
  const giftCards = faq.getByRole('button', { name: 'Gift cards' });
  const warranty = faq.getByRole('button', { name: 'Warranty' });

  check('trigger is a button inside a heading', (await shipping.evaluate((el) => el.parentElement.tagName)) === 'H3');
  check('default item expanded', await expanded(shipping));
  const region = faq.getByRole('region', { name: 'Shipping' });
  check('open content is a region labelled by its trigger', await region.isVisible());
  check('aria-controls points at the region', (await shipping.getAttribute('aria-controls')) === (await region.getAttribute('id')));
  check('closed content is hidden from assistive tech', (await faq.getByRole('region').count()) === 1);

  await returns.click();
  check('single: click opens another item', await expanded(returns));
  check('single: previous item closes', !(await expanded(shipping)) && (await faq.getByRole('region').count()) === 1);
  await returns.click();
  check('single: collapsible closes the open item', !(await expanded(returns)) && (await faq.getByRole('region').count()) === 0);

  check('disabled item is disabled', await giftCards.isDisabled());

  await shipping.focus();
  await page.keyboard.press('Enter');
  check('Enter toggles', await expanded(shipping));
  await page.keyboard.press('Space');
  check('Space toggles', !(await expanded(shipping)));
  await page.keyboard.press('ArrowDown');
  check('ArrowDown moves to next trigger', await focused(returns));
  await page.keyboard.press('ArrowDown');
  check('ArrowDown skips disabled', await focused(warranty));
  await page.keyboard.press('ArrowDown');
  check('ArrowDown wraps to first', await focused(shipping));
  await page.keyboard.press('ArrowUp');
  check('ArrowUp wraps to last', await focused(warranty));
  await page.keyboard.press('Home');
  check('Home jumps to first', await focused(shipping));
  await page.keyboard.press('End');
  check('End jumps to last', await focused(warranty));
  check('arrows do not change state', !(await expanded(returns)) && !(await expanded(warranty)));

  const settings = page.getByTestId('settings');
  const account = settings.getByRole('button', { name: 'Account' });
  const notifications = settings.getByRole('button', { name: 'Notifications' });
  await notifications.click();
  check('multiple: several items open', (await expanded(account)) && (await expanded(notifications)));
  await account.click();
  check('multiple: items close independently', !(await expanded(account)) && (await expanded(notifications)));

  const h = await page.evaluate(() => {
    const probe = document.createElement('div');
    probe.className = 'yarcl-size-sm';
    probe.style.height = 'var(--yarcl-h)';
    document.body.append(probe);
    const height = probe.getBoundingClientRect().height;
    probe.remove();
    return height;
  });
  check('trigger height from the size scale', (await notifications.boundingBox()).height === h, `${(await notifications.boundingBox()).height} vs ${h}`);
  const radius = await faq.evaluate((el) => getComputedStyle(el).borderRadius);
  const expectedRadius = await faq.evaluate((el) => {
    const probe = document.createElement('div');
    probe.style.borderRadius = 'var(--yarcl-radius-md)';
    el.append(probe);
    const r = getComputedStyle(probe).borderRadius;
    probe.remove();
    return r;
  });
  check('frame radius from the config default', radius === expectedRadius && radius !== '0px', `${radius} vs ${expectedRadius}`);
  const chevron = notifications.locator('svg');
  check(
    'open indicator uses the color prop',
    (await chevron.evaluate((el) => getComputedStyle(el).color)) === (await resolveColor(settings, 'var(--yarcl-color-success)')),
  );

  const content = faq.locator('.yarcl-accordion-content').first();
  check('reduced motion: no transition', seconds(await content.evaluate((el) => getComputedStyle(el).transitionDuration.split(',')[0])) === 0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const base = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--yarcl-motion-base'));
  const duration = await content.evaluate((el) => getComputedStyle(el).transitionDuration.split(',')[0]);
  check('animates with the motion tokens', seconds(duration) === seconds(base) && seconds(base) > 0, `${duration} vs ${base}`);
  await warranty.click();
  await page.waitForFunction(() => {
    const el = [...document.querySelectorAll('[data-testid="faq"] [role="region"]')].pop();
    return el && el.getBoundingClientRect().height > 0 && getComputedStyle(el).gridTemplateRows !== '0px';
  });
  check('animated item ends open', await faq.getByRole('region', { name: 'Warranty' }).isVisible());
  await page.emulateMedia({ reducedMotion: 'reduce' });
}
