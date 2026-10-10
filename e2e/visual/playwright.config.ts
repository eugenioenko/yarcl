import { defineConfig } from 'playwright/test';
import { themes } from '@yarcl/react/themes';

export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  outputDir: '../../.visual/results',
  snapshotPathTemplate: '{testDir}/baselines/{projectName}/{arg}{ext}',
  updateSnapshots: 'none',
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: true,
  workers: 2,
  retries: 0,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', scale: 'css', maxDiffPixels: 0 },
  },
  reporter: [['list'], ['html', { outputFolder: '../../.visual/report', open: 'never' }]],
  use: {
    browserName: 'chromium',
    locale: 'en-US',
    timezoneId: 'UTC',
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: Object.keys(themes).flatMap((theme) => (['light', 'dark'] as const).flatMap((scheme) => (
    [
      { name: 'desktop', viewport: { width: 1280, height: 900 } },
      { name: 'mobile', viewport: { width: 390, height: 844 } },
    ].map(({ name, viewport }) => ({
      name: `${theme}-${scheme}-${name}`,
      metadata: { theme, scheme },
      use: { colorScheme: scheme, viewport },
    }))
  ))),
  webServer: {
    command: 'node test-utils/visual-server.mjs',
    cwd: '../..',
    url: 'http://127.0.0.1:4250',
    reuseExistingServer: false,
    timeout: 10_000,
  },
});
