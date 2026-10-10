import { expect, test, type Page, type TestInfo } from 'playwright/test';

const pageErrors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const errors: string[] = [];
  pageErrors.set(page, errors);
  page.on('pageerror', (error) => errors.push(error.message));
});
test.afterEach(({ page }) => expect(pageErrors.get(page)).toEqual([]));

async function open(page: Page, info: TestInfo, app: 'demo' | 'playground') {
  await page.clock.setFixedTime(new Date('2026-09-15T12:00:00Z'));
  const { theme, scheme } = info.project.metadata;
  const url = app === 'demo'
    ? `http://127.0.0.1:4250/?page=themes&theme=${theme}&scheme=${scheme}`
    : `http://127.0.0.1:4251/theme-playground/?theme=${theme}&scheme=${scheme}`;
  const response = await page.goto(url);
  expect(response?.status()).toBe(200);
  await expect(page.locator('#yarcl-theme')).toBeAttached();
  if (app === 'demo') await expect(page.getByRole('heading', { name: 'Component showcase', exact: true })).toBeVisible();
  else await expect(page.getByRole('button', { name: 'Edit theme', exact: true })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(0, 0);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
}

async function centered(page: Page, name: string) {
  const dialog = page.getByRole('dialog', { name, exact: true });
  await expect(dialog).toBeVisible();
  await expect.poll(async () => {
    const box = await dialog.boundingBox();
    const viewport = page.viewportSize()!;
    return box ? Math.max(
      Math.abs(box.x + box.width / 2 - viewport.width / 2),
      Math.abs(box.y + box.height / 2 - viewport.height / 2),
    ) : Infinity;
  }).toBeLessThan(2);
}

test('component demo', async ({ page }, info) => {
  await open(page, info, 'demo');
  await expect(page).toHaveScreenshot('demo.png', { fullPage: true });
});

test('stepper shapes and orientations', async ({ page }, info) => {
  const { theme, scheme } = info.project.metadata;
  const response = await page.goto(`http://127.0.0.1:4250/?page=themes&example=stepper&theme=${theme}&scheme=${scheme}`);
  expect(response?.status()).toBe(200);
  await expect(page.locator('#yarcl-theme')).toBeAttached();
  await page.evaluate(() => document.fonts.ready);
  const stepper = page.getByRole('list', { name: 'Checkout', exact: true });
  await page.getByRole('button', { name: 'Complete and continue', exact: true }).click();
  for (const vertical of [false, true]) {
    await page.getByRole('switch', { name: 'Vertical layout', exact: true }).setChecked(vertical);
    for (const circular of [true, false]) {
      await page.getByRole('switch', { name: 'Circular stages', exact: true }).setChecked(circular);
      await page.mouse.move(0, 0);
      await expect(stepper).toHaveScreenshot(`stepper-${vertical ? 'vertical' : 'horizontal'}-${circular ? 'circle' : 'rounded'}.png`);
      await expect.poll(() => stepper.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
    }
  }
});

test('color picker editing and read-only state', async ({ page }, info) => {
  const { theme, scheme } = info.project.metadata;
  const response = await page.goto(`http://127.0.0.1:4250/?page=themes&example=color-picker&theme=${theme}&scheme=${scheme}`);
  expect(response?.status()).toBe(200);
  await expect(page.locator('#yarcl-theme')).toBeAttached();
  await page.evaluate(() => document.fonts.ready);
  const picker = page.locator('.yarcl-color-picker');
  await page.getByRole('button', { name: 'Forest', exact: true }).click();
  await page.mouse.move(0, 0);
  await expect(picker).toHaveScreenshot('color-picker-editable.png');
  await page.getByRole('switch', { name: 'Read-only color', exact: true }).setChecked(true);
  await page.mouse.move(0, 0);
  await expect(picker).toHaveScreenshot('color-picker-readonly.png');
  await expect.poll(() => picker.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
});

test('demo dialog', async ({ page }, info) => {
  await open(page, info, 'demo');
  await page.getByRole('button', { name: 'Dialog', exact: true }).click();
  await centered(page, 'Dialog');
  await expect(page).toHaveScreenshot('demo-dialog.png');
});

test('demo drawer', async ({ page }, info) => {
  await open(page, info, 'demo');
  await page.getByRole('button', { name: 'Drawer', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Drawer', exact: true })).toBeVisible();
  await expect(page).toHaveScreenshot('demo-drawer.png');
});

test('theme playground', async ({ page }, info) => {
  await open(page, info, 'playground');
  await expect(page).toHaveScreenshot('playground.png', { fullPage: true });
  const footer = page.locator('.yarcl-app-layout > footer');
  const position = await footer.boundingBox();
  await page.locator('.yarcl-app-layout-main').evaluate((element) => { element.scrollTop = 500; });
  expect(await footer.boundingBox()).toEqual(position);
});

test('playground mobile navigation', async ({ page }, info) => {
  test.skip(info.project.name.endsWith('-desktop'), 'Mobile drawer is only available below the desktop breakpoint');
  await open(page, info, 'playground');
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Acme navigation', exact: true });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Dashboard', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page).toHaveScreenshot('playground-navigation.png');
  await drawer.getByRole('link', { name: 'Settings', exact: true }).click();
  await expect(drawer).toBeHidden();
  await expect(page.getByRole('button', { name: 'Open navigation', exact: true })).toBeFocused();
});

test('playground dialog under its CSS reset', async ({ page }, info) => {
  await open(page, info, 'playground');
  await page.getByRole('button', { name: 'New invoice', exact: true }).click();
  await centered(page, 'New invoice');
  await expect(page).toHaveScreenshot('playground-dialog.png');
});

test('playground theme editor', async ({ page }, info) => {
  await open(page, info, 'playground');
  await page.getByRole('button', { name: 'Edit theme', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Edit theme', exact: true })).toBeVisible();
  await expect(page).toHaveScreenshot('playground-editor.png');
});

test('table column resizing and visibility', async ({ page }, info) => {
  const { theme, scheme } = info.project.metadata;
  const response = await page.goto(`http://127.0.0.1:4250/?page=themes&example=table-columns&theme=${theme}&scheme=${scheme}`);
  expect(response?.status()).toBe(200);
  await expect(page.locator('#yarcl-theme')).toBeAttached();
  await page.evaluate(() => document.fonts.ready);
  const table = page.locator('.yarcl-table-wrap');
  await page.mouse.move(0, 0);
  await expect(table).toHaveScreenshot('table-columns-visible.png');
  await page.getByRole('separator', { name: 'Customer', exact: true }).focus();
  await page.keyboard.press('End');
  await page.getByRole('checkbox', { name: 'Description', exact: true }).setChecked(false);
  await page.getByRole('button', { name: 'Customer', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Select Customer 80', exact: true }).setChecked(true);
  await table.evaluate((element) => { element.scrollLeft = 0; });
  await page.mouse.move(0, 0);
  await expect(table).toHaveScreenshot('table-columns-resized-hidden.png');
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});
