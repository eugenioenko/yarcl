import { progressContrast } from './feedback.mjs';
import { resolveColor } from './command-palette.mjs';

/** @param {import('../run.mjs').SuiteContext} ctx */
export default async function ({ page, check }) {
  await page.evaluate(() => document.fonts.ready);
  check('web font from fontFaces loaded', await page.evaluate(() => document.fonts.check('500 44px Fraunces')));
  const h1 = page.getByRole('heading', { level: 1 });
  check('h1 uses the serif family', (await h1.evaluate((el) => getComputedStyle(el).fontFamily)).startsWith('Fraunces'));

  const trail = page.getByRole('navigation', { name: 'Breadcrumb' });
  check('component default: breadcrumb uses fine text (12px)', (await trail.evaluate((el) => getComputedStyle(el).fontSize)) === '12px');
  check('breadcrumb collapses to first and last two', (await trail.locator('> ol > li').count()) === 4 && (await trail.getByRole('link', { name: 'Women' }).count()) === 0);
  check('breadcrumb marks the current page', (await trail.locator('[aria-current="page"]').textContent()) === 'Linen overshirt');

  const add = page.getByRole('button', { name: 'Add to bag' });
  const save = page.getByRole('button', { name: 'Save' });
  check('talla-l buttons share height', (await add.boundingBox()).height === (await save.boundingBox()).height);
  check('component default: buttons square', (await add.evaluate((el) => getComputedStyle(el).borderRadius)) === '0px');
  const shade = page.getByRole('combobox', { name: 'Shade' });
  check('global default: other controls hairline', (await shade.evaluate((el) => getComputedStyle(el).borderRadius)) === '2px');

  const sleeve = page.getByRole('slider', { name: 'SLEEVE LENGTH Minimum' });
  check('slider: labelled by aria-labelledby plus thumb name', (await sleeve.count()) === 1);
  await sleeve.focus();
  await page.keyboard.press('ArrowRight');
  check('slider: step and formatValue', (await sleeve.getAttribute('aria-valuetext')) === '60 cm');
  check('slider: global default radius hairline', (await sleeve.evaluate((el) => getComputedStyle(el).borderRadius)) === '2px');
  const [fill, ink] = await page.evaluate(() => {
    const probe = document.createElement('div');
    probe.style.color = 'var(--yarcl-color-ink)';
    document.body.append(probe);
    const ink = getComputedStyle(probe).color;
    probe.remove();
    return [getComputedStyle(document.querySelector('.yarcl-slider-range')).backgroundColor, ink];
  });
  check('slider: default color ink', fill === ink, `${fill} vs ${ink}`);
  const delivery = page.getByRole('button', { name: 'Delivery date', includeHidden: true });
  check('date picker matches Select height', (await delivery.boundingBox()).height === (await shade.boundingBox()).height);
  check('component default: date picker square', (await delivery.evaluate((el) => getComputedStyle(el).borderRadius)) === '0px');
  const bgOf = (el) => getComputedStyle(el).backgroundColor;
  const addFill = await add.evaluate(bgOf);
  await delivery.click();
  const picked = page.getByRole('gridcell', { name: 'Monday, October 5th, 2026' });
  check("picked day uses the consumer's default variant and color", (await picked.evaluate(bgOf)) === addFill);
  check('month before min disabled', (await page.getByRole('button', { name: 'Previous month' }).getAttribute('aria-disabled')) === 'true');
  await page.keyboard.press('Escape');

  await add.click();
  check('size required before adding', await page.getByRole('alert').filter({ hasText: 'Choose a size first.' }).isVisible());
  const sizes = page.getByRole('group', { name: 'SIZE' });
  const sizeLabel = page.locator('label#size-label');
  const labelLook = await sizeLabel.evaluate((el) => {
    const s = getComputedStyle(el);
    const probe = document.createElement('span');
    probe.style.color = 'var(--yarcl-color-clay-text)';
    document.body.append(probe);
    const clay = getComputedStyle(probe).color;
    probe.remove();
    return { size: s.fontSize, spacing: s.letterSpacing, match: s.color === clay };
  });
  check('Label uses labelStyle (11px, 0.12em)', labelLook.size === '11px' && labelLook.spacing === '1.32px', JSON.stringify(labelLook));
  check('component default: Label color clay', labelLook.match);
  await sizes.getByRole('button', { name: 'M', exact: true }).click();
  check('size error clears', (await page.getByRole('alert').filter({ hasText: 'Choose a size first.' }).count()) === 0);
  await add.click();
  check('toast confirms', await page.getByRole('status').filter({ hasText: 'Added to bag' }).isVisible());

  const shipping = page.getByRole('progressbar', { name: '€ 15 away from free express shipping' });
  const progress = await shipping.evaluate((el) => {
    const probe = document.createElement('span');
    probe.style.color = 'var(--yarcl-color-moss)';
    el.append(probe);
    const moss = getComputedStyle(probe).color;
    probe.remove();
    const track = el.querySelector('.yarcl-progress-track');
    const bar = el.querySelector('.yarcl-progress-bar');
    return {
      moss,
      bar: getComputedStyle(bar).backgroundColor,
      radius: getComputedStyle(track).borderRadius,
      height: track.getBoundingClientRect().height,
      ratio: bar.getBoundingClientRect().width / track.getBoundingClientRect().width,
    };
  });
  check('component default: progress bar is moss', progress.bar === progress.moss, `${progress.bar} vs ${progress.moss}`);
  check('progress uses global radius (hairline)', progress.radius === '2px', progress.radius);
  check('progress track from talla-m icon size', Math.abs(progress.height - 8) < 0.5, String(progress.height));
  check('progress bar at 185 of 200', Math.abs(progress.ratio - 0.925) < 0.01, String(progress.ratio));
  await progressContrast({ check }, page.locator('body'));

  await page.getByRole('button', { name: 'Size guide' }).click();
  const guide = page.getByRole('dialog', { name: 'Size guide' });
  check('size guide dialog with table', await guide.getByRole('table', { name: 'Chest and length' }).isVisible());
  check("dialog uses the consumer's modal size (regular = 34rem)", Math.abs((await guide.boundingBox()).width - 34 * 16) < 2, String((await guide.boundingBox()).width));
  await page.keyboard.press('Escape');

  const reviews = page.getByRole('navigation', { name: 'Reviews' });
  const reviewPage = reviews.getByRole('button', { name: 'Page 4' });
  const reviewCurrent = reviews.getByRole('button', { name: 'Page 5' });
  const style = (locator) => locator.evaluate((el) => ({ h: el.getBoundingClientRect().height, r: getComputedStyle(el).borderRadius, bg: getComputedStyle(el).backgroundColor, border: getComputedStyle(el).borderTopColor }));
  const [other, active] = [await style(reviewPage), await style(reviewCurrent)];
  check('pagination: component default size (talla-s = 36px)', other.h === 36, String(other.h));
  check('pagination: component default radius square', other.r === '0px' && active.r === '0px', `${other.r} / ${active.r}`);
  check('pagination: component default variants (text, line)', other.bg === 'rgba(0, 0, 0, 0)' && other.border === 'rgba(0, 0, 0, 0)' && active.border !== 'rgba(0, 0, 0, 0)', JSON.stringify({ other, active }));
  check('pagination: current page marked', (await reviewCurrent.getAttribute('aria-current')) === 'page');
  await page.keyboard.press('Control+k');
  const palette = page.getByRole('dialog', { name: 'Command palette' });
  check('command palette opens with the shortcut', await palette.isVisible());
  const look = await palette.evaluate((el) => ({
    radius: getComputedStyle(el).borderTopLeftRadius,
    width: el.getBoundingClientRect().width,
    fontSize: getComputedStyle(el.querySelector('input')).fontSize,
    activeBg: getComputedStyle(el.querySelector('.yarcl-option[data-active]')).backgroundColor,
  }));
  check('component default: palette square', look.radius === '0px', look.radius);
  check('component default: palette uses clay', look.activeBg === (await resolveColor(page, 'var(--yarcl-color-clay)')), look.activeBg);
  check("palette uses the consumer's size scale (talla-m = 13px)", look.fontSize === '13px', look.fontSize);
  check("palette uses the consumer's modal size (regular = 34rem)", Math.abs(look.width - 34 * 16) < 2, String(look.width));
  await palette.getByRole('combobox').fill('wish');
  await page.keyboard.press('Enter');
  check('palette command runs', await page.getByRole('status').filter({ hasText: 'Saved to wishlist' }).last().isVisible());

  await page.getByRole('link', { name: 'Design reference' }).click();
  await page.waitForURL(/page=reference/);
  check('reference page renders from config', await page.getByRole('heading', { name: 'Maison Talla design system' }).isVisible());
  check('reference lists consumer sizes', await page.getByRole('rowheader', { name: 'talla-l' }).isVisible());
}
