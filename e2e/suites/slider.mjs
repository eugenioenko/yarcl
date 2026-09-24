const now = async (slider) => Number(await slider.getAttribute('aria-valuenow'));

async function press(page, slider, key) {
  await slider.focus();
  await page.keyboard.press(key);
  return now(slider);
}

/** @param {import('../run.mjs').SuiteContext} ctx */
export default async function ({ page, check, focused }) {
  const volume = page.getByRole('slider', { name: 'Volume', exact: true });
  await volume.scrollIntoViewIfNeeded();
  check('field: labelled by the field label', (await volume.count()) === 1);
  check('field: described by helper text', (await volume.getAttribute('aria-describedby')) !== null);
  check(
    'aria values',
    (await volume.getAttribute('aria-valuemin')) === '0' && (await volume.getAttribute('aria-valuemax')) === '100' && (await now(volume)) === 40,
  );

  const steps = [];
  for (const key of ['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'PageUp', 'PageDown', 'End', 'Home']) {
    steps.push(await press(page, volume, key));
  }
  check('keyboard: arrows, PageUp/PageDown, Home/End', JSON.stringify(steps) === JSON.stringify([41, 42, 41, 40, 50, 40, 100, 0]), JSON.stringify(steps));
  const hidden = page.locator('input[type="hidden"][name="volume"]');
  check('form value follows the thumb', (await hidden.inputValue()) === '0');

  const low = page.getByRole('slider', { name: 'Price range Minimum' });
  const high = page.getByRole('slider', { name: 'Price range Maximum' });
  check('range: two named thumbs', (await low.count()) === 1 && (await high.count()) === 1);
  check('range: thumbs bound each other', (await low.getAttribute('aria-valuemax')) === '90' && (await high.getAttribute('aria-valuemin')) === '10');
  check('range: step applies', (await press(page, high, 'ArrowRight')) === 100);
  check('range: End stops at the other thumb', (await press(page, low, 'End')) === 100);
  check('range: Home stops at the other thumb', (await press(page, high, 'Home')) === 100);
  await press(page, low, 'Home');
  check('range: invalid inside an errored field', (await low.getAttribute('aria-invalid')) === 'true' && (await high.getAttribute('aria-invalid')) === 'true');
  const [fill, error] = await Promise.all([
    page.locator('.yarcl-slider', { has: low }).locator('.yarcl-slider-range').evaluate((el) => getComputedStyle(el).backgroundColor),
    page.locator('.yarcl-field-error', { hasText: 'Pick a narrower range.' }).evaluate((el) => getComputedStyle(el).color),
  ]);
  check('range: error color', fill === error, `${fill} vs ${error}`);

  const sliders = page.getByTestId('sliders');
  await sliders.scrollIntoViewIfNeeded();
  const brightness = sliders.getByRole('slider', { name: 'Brightness' });
  const track = sliders.locator('.yarcl-slider', { has: page.getByRole('slider', { name: 'Brightness' }) }).locator('.yarcl-slider-track');
  const box = await track.boundingBox();
  await page.mouse.click(box.x + box.width * 0.25, box.y + box.height / 2);
  check('pointer: click on the track moves the thumb', (await now(brightness)) === 25, String(await now(brightness)));
  check('pointer: click focuses the thumb', await focused(brightness));

  const price = sliders.getByRole('slider', { name: 'Price Maximum' });
  const priceTrack = await sliders.locator('.yarcl-slider', { has: page.getByRole('slider', { name: 'Price Maximum' }) }).locator('.yarcl-slider-track').boundingBox();
  const thumb = await price.boundingBox();
  await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2);
  await page.mouse.down();
  await page.mouse.move(priceTrack.x + priceTrack.width * 0.5, priceTrack.y, { steps: 5 });
  await page.mouse.move(priceTrack.x + priceTrack.width * 0.1, priceTrack.y, { steps: 5 });
  await page.mouse.up();
  check('pointer: drag stops at the other thumb', (await now(price)) === 20, String(await now(price)));
  check('valuetext from formatValue', (await price.getAttribute('aria-valuetext')) === '$20');

  const disabled = sliders.getByRole('slider', { name: 'Disabled volume' });
  check('disabled: out of tab order', (await disabled.getAttribute('tabindex')) === null && (await disabled.getAttribute('aria-disabled')) === 'true');
  const disabledBox = await sliders.locator('.yarcl-slider', { has: page.getByRole('slider', { name: 'Disabled volume' }) }).boundingBox();
  await page.mouse.click(disabledBox.x + disabledBox.width - 2, disabledBox.y + disabledBox.height / 2);
  check('disabled: ignores pointer', (await now(disabled)) === 30);

  const width = (locator) => locator.evaluate((el) => el.getBoundingClientRect().width);
  const thumbs = sliders.locator('.yarcl-slider-thumb');
  const [xs, xl] = [await width(thumbs.first()), await width(sliders.getByRole('slider', { name: 'Volume xl' }))];
  check('size scale: thumb from icon size (xs 15px, xl 30px)', xs === 15 && xl === 30, `${xs} / ${xl}`);
  const radius = (locator) => locator.evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius));
  check('radius: default md', (await radius(thumbs.first())) === 6, String(await radius(thumbs.first())));
  check('radius prop: rounded', (await radius(brightness)) > 100);
}
