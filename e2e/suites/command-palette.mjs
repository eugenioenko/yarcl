/** Resolves a CSS color expression to the browser's computed rgb() string. */
export const resolveColor = (page, value) =>
  page.evaluate((value) => {
    const probe = document.createElement('div');
    probe.style.color = value;
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, value);

async function poll(fn, tries = 20) {
  let value;
  for (let i = 0; i < tries && !(value = await fn()); i++) await new Promise((r) => setTimeout(r, 50));
  return value;
}

/** @param {import('../run.mjs').SuiteContext} ctx */
export default async function ({ page, check, focused, htmlOverflow }) {
  const trigger = page.getByRole('button', { name: 'Command palette' });
  const palette = page.getByRole('dialog', { name: 'Command palette' });
  const input = palette.getByRole('combobox', { name: 'Command palette' });
  const options = palette.getByRole('option');
  const activeLabel = () =>
    input.evaluate((el) => {
      const id = el.getAttribute('aria-activedescendant');
      return id ? document.getElementById(id)?.querySelector('.yarcl-option-label')?.textContent : null;
    });

  await trigger.scrollIntoViewIfNeeded();
  check('trigger advertises the shortcut', (await trigger.getAttribute('aria-keyshortcuts')) === 'Control+K', String(await trigger.getAttribute('aria-keyshortcuts')));
  await trigger.focus();
  await page.keyboard.press('Control+k');
  check('Mod+K opens the palette', await poll(() => palette.isVisible()));
  check('search input is focused', await focused(input));
  check('page scroll locked', (await htmlOverflow()) === 'hidden');
  check('combobox expanded and controls the listbox', (await input.getAttribute('aria-expanded')) === 'true' && (await input.getAttribute('aria-controls')) === (await palette.getByRole('listbox').getAttribute('id')));
  check('first command is active', (await activeLabel()) === 'Go to dashboard', String(await activeLabel()));
  check('active option is aria-selected', (await palette.getByRole('option', { name: 'Go to dashboard' }).getAttribute('aria-selected')) === 'true');
  check('groups are labelled by their heading', (await palette.getByRole('group', { name: 'Navigation' }).getByRole('option').count()) === 3);
  check('shortcut hint exposed as aria-keyshortcuts', (await palette.getByRole('option', { name: 'New project' }).getAttribute('aria-keyshortcuts')) === 'Control+Shift+N');
  check('shortcut hint rendered as keys', (await palette.getByRole('option', { name: 'New project' }).locator('kbd').allTextContents()).join(' ') === 'Ctrl Shift N');

  await page.keyboard.press('ArrowDown');
  check('ArrowDown moves to next command', (await activeLabel()) === 'Go to projects');
  await page.keyboard.press('End');
  check('End jumps to the last command', (await activeLabel()) === 'Recent file 12');
  const scrolled = await palette.getByRole('option', { name: 'Recent file 12' }).evaluate((el) => {
    const list = el.closest('[role=listbox]').getBoundingClientRect();
    const box = el.getBoundingClientRect();
    return box.top >= list.top - 1 && box.bottom <= list.bottom + 1;
  });
  check('active command scrolled into view', scrolled);
  await page.keyboard.press('ArrowDown');
  check('ArrowDown wraps to first', (await activeLabel()) === 'Go to dashboard');
  await page.keyboard.press('ArrowUp');
  check('ArrowUp wraps to last', (await activeLabel()) === 'Recent file 12');
  await page.keyboard.press('Home');
  check('Home jumps to the first command', (await activeLabel()) === 'Go to dashboard');

  await input.fill('appearance');
  check('filters by keywords', (await options.count()) === 1 && (await activeLabel()) === 'Toggle dark mode');
  await input.fill('project');
  check('filters by label', (await options.allTextContents()).every((t) => /project/i.test(t)) && (await options.count()) === 3, String(await options.count()));
  await input.fill('actions archive');
  const archive = palette.getByRole('option', { name: 'Archive project' });
  check('disabled command shown with aria-disabled', (await archive.getAttribute('aria-disabled')) === 'true');
  check('disabled command is not active', (await input.getAttribute('aria-activedescendant')) === null);
  await page.keyboard.press('Enter');
  check('Enter on disabled-only results does nothing', await palette.isVisible());
  await input.fill('project');
  await page.keyboard.press('End');
  check('navigation skips disabled commands', (await activeLabel()) === 'New project', String(await activeLabel()));

  await input.fill('zzz');
  check('empty state shown', await palette.getByRole('status').filter({ hasText: 'No results' }).isVisible());
  check('listbox removed and combobox collapsed', (await palette.getByRole('listbox').count()) === 0 && (await input.getAttribute('aria-expanded')) === 'false');

  await page.keyboard.press('Escape');
  check('Esc closes', !(await palette.isVisible()));
  check('focus returns to the previously focused element', await poll(() => focused(trigger)));
  check('scroll unlocked', (await htmlOverflow()) !== 'hidden');

  await trigger.click();
  check('trigger opens the palette', await palette.isVisible());
  check('search resets on reopen', (await input.inputValue()) === '');
  await input.fill('invite');
  await page.keyboard.press('Enter');
  check('Enter runs the command and closes', !(await palette.isVisible()));
  const invite = page.getByRole('status').filter({ hasText: 'Invite sent' });
  check('command onSelect called', await poll(() => invite.isVisible()));

  await page.keyboard.press('Control+k');
  await palette.getByRole('option', { name: 'Go to projects' }).hover();
  check('hover highlights a command', (await activeLabel()) === 'Go to projects');
  await palette.getByRole('option', { name: 'Go to projects' }).click();
  check('click runs the command', !(await palette.isVisible()) && (await poll(() => page.getByRole('status').filter({ hasText: 'Opened projects' }).isVisible())));

  await page.keyboard.press('Control+k');
  await page.keyboard.press('Control+k');
  check('shortcut toggles the palette closed', !(await palette.isVisible()));

  await page.keyboard.press('Control+k');
  await page.mouse.click(5, 5);
  check('backdrop click closes', !(await palette.isVisible()));

  await page.keyboard.press('Control+k');
  const styles = await palette.evaluate((el) => {
    const option = el.querySelector('.yarcl-option[data-active]');
    const input = el.querySelector('input');
    return {
      radius: getComputedStyle(el).borderTopLeftRadius,
      fontSize: getComputedStyle(input).fontSize,
      optionHeight: option.getBoundingClientRect().height,
      activeBg: getComputedStyle(option).backgroundColor,
      width: el.getBoundingClientRect().width,
    };
  });
  check('font size from the size scale (md = 14px)', styles.fontSize === '14px', styles.fontSize);
  check('option height from the size scale (md)', Math.abs(styles.optionHeight - (40 - 8)) < 1, String(styles.optionHeight));
  check('radius from the config (md = 6px)', styles.radius === '6px', styles.radius);
  check('active command uses the default color', styles.activeBg === (await resolveColor(page, 'var(--yarcl-color-brand)')), styles.activeBg);
  check('width from defaults.modalSize (md = 32rem)', Math.abs(styles.width - 32 * 16) < 2, String(styles.width));
  await page.keyboard.press('Escape');
  await page.evaluate(() => document.querySelectorAll('.yarcl-toast-close').forEach((b) => b.click()));
}
