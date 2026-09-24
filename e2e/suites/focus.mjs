function luminance(rgb) {
  const [r, g, b] = rgb.map((c) => c / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const snapshot = (page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    el.dataset.focusProbe ??= String(Math.random()).slice(2);
    const s = getComputedStyle(el);
    return {
      id: el.dataset.focusProbe,
      label: `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 20)}"`,
      look: [s.outlineStyle, s.outlineWidth, s.outlineColor, s.boxShadow, s.borderColor, s.backgroundColor].join('|'),
      ring: s.outlineStyle === 'none' ? null : `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`,
    };
  });

const lookOf = (page, id) =>
  page.evaluate((id) => {
    const s = getComputedStyle(document.querySelector(`[data-focus-probe="${id}"]`));
    return [s.outlineStyle, s.outlineWidth, s.outlineColor, s.boxShadow, s.borderColor, s.backgroundColor].join('|');
  }, id);

/** Tabs through the whole page: every stop must look different while focused, and all rings must match. */
export async function tabThrough({ page, check }) {
  const invisible = [];
  const rings = new Set();
  const seen = new Set();
  let previous = null;
  for (let i = 0; i < 300; i++) {
    await page.keyboard.press('Tab');
    const current = await snapshot(page);
    if (previous && !seen.has(previous.id)) {
      seen.add(previous.id);
      if ((await lookOf(page, previous.id)) === previous.look) invisible.push(previous.label);
      if (previous.ring) rings.add(previous.ring);
    }
    if (!current || (seen.has(current.id) && i > 5)) break;
    previous = current;
  }
  check(`every focus stop is visible (${seen.size} stops)`, seen.size > 0 && invisible.length === 0, invisible.join(', ') || 'no focus stops found');
  check('focus rings are cohesive', rings.size === 1, [...rings].join(' / '));
}

/** Opens a list with the keyboard and checks the highlighted option stands out from the panel. */
export async function highlightContrast({ page, check }, name, open) {
  await open();
  await page.waitForTimeout(150);
  const colors = await page.evaluate(() => {
    const active = document.querySelector('.yarcl-option[data-active]');
    const panel = active?.closest('.yarcl-panel');
    if (!active || !panel) return null;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const paint = (...layers) => {
      ctx.clearRect(0, 0, 1, 1);
      for (const color of layers) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
      }
      return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
    };
    const panelBg = getComputedStyle(panel).backgroundColor;
    return { panel: paint(panelBg), active: paint(panelBg, getComputedStyle(active).backgroundColor) };
  });
  const ratio = colors ? contrast(colors.panel, colors.active) : 0;
  check(`${name}: highlighted option stands out (≥ 3:1)`, ratio >= 3, colors ? `${ratio.toFixed(2)}:1` : 'no highlighted option');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
}

/** @param {import('../run.mjs').SuiteContext} ctx */
export default async function (ctx) {
  const { page } = ctx;
  await tabThrough(ctx);
  await highlightContrast(ctx, 'Menu', async () => {
    await page.getByRole('button', { name: 'Actions' }).focus();
    await page.keyboard.press('Enter');
  });
  await highlightContrast(ctx, 'Select', async () => {
    await page.getByRole('combobox', { name: 'Plan' }).focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowDown');
  });
  await highlightContrast(ctx, 'Combobox', async () => {
    const country = page.getByRole('combobox', { name: 'Country' });
    await country.focus();
    await country.fill('s');
    await page.keyboard.press('ArrowDown');
  });
}
