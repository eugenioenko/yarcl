import { chromium } from 'playwright-core';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import a11yBrandB from './suites/a11y-brand-b.mjs';
import a11y from './suites/a11y.mjs';
import brandB from './suites/brand-b.mjs';
import datePicker from './suites/date-picker.mjs';
import commandPalette from './suites/command-palette.mjs';
import feedback from './suites/feedback.mjs';
import floating from './suites/floating.mjs';
import focusBrandB from './suites/focus-brand-b.mjs';
import focus from './suites/focus.mjs';
import groups from './suites/groups.mjs';
import label from './suites/label.mjs';
import overlays from './suites/overlays.mjs';
import slider from './suites/slider.mjs';

/**
 * @typedef {object} SuiteContext
 * @property {import('playwright-core').Page} page
 * @property {(name: string, ok: boolean, detail?: string) => void} check
 * @property {(locator: import('playwright-core').Locator) => Promise<boolean>} focused
 * @property {() => Promise<string>} htmlOverflow
 */

const root = resolve(fileURLToPath(import.meta.url), '../..');
const apps = { consumer: 'consumer', fixture: 'e2e/consumer' };
const suites = [
  ['consumer', 'floating', floating],
  ['consumer', 'overlays', overlays],
  ['consumer', 'command-palette', commandPalette],
  ['consumer', 'feedback', feedback],
  ['consumer', 'groups', groups],
  ['consumer', 'slider', slider],
  ['consumer', 'label', label],
  ['consumer', 'date-picker', datePicker],
  ['fixture', 'brand-b', brandB],
  ['consumer', 'a11y', a11y],
  ['fixture', 'a11y-brand-b', a11yBrandB],
  ['consumer', 'focus', focus],
  ['fixture', 'focus-brand-b', focusBrandB],
];
const only = process.argv[2];

const servers = {};
for (const [name, dir] of Object.entries(apps)) {
  const server = await createServer({ root: resolve(root, dir), server: { port: 0 }, logLevel: 'error' });
  await server.listen();
  servers[name] = server;
}

const executablePath = process.env.CHROME_PATH;
const browser = await chromium.launch(executablePath ? { executablePath } : { channel: 'chrome' });
let failures = 0;

for (const [app, name, suite] of suites) {
  if (only && only !== name) continue;
  for (const scheme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width: 1100, height: 800 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    const lines = [];
    const check = (label, ok, detail = '') => {
      if (!ok) failures++;
      lines.push(`  ${ok ? '✓' : '✗'} ${label}${!ok && detail ? `: ${detail}` : ''}`);
    };
    const focused = (locator) => locator.evaluate((el) => el === document.activeElement || el.contains(document.activeElement));
    const htmlOverflow = () => page.evaluate(() => getComputedStyle(document.documentElement).overflow);
    try {
      await page.goto(`${servers[app].resolvedUrls.local[0]}?scheme=${scheme}`);
      await page.locator('#root > *').first().waitFor();
      await suite({ page, check, focused, htmlOverflow });
    } catch (error) {
      check('suite completed', false, error.message.split('\n')[0]);
    }
    check('no console errors', errors.length === 0, errors.join(' | '));
    console.log(`${name} (${scheme})\n${lines.join('\n')}`);
    await context.close();
  }
}

await browser.close();
await Promise.all(Object.values(servers).map((server) => server.close()));
console.log(failures ? `\n${failures} failed` : '\nall passed');
process.exit(failures ? 1 : 0);
