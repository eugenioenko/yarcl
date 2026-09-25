import { playwright } from '@vitest/browser-playwright';
import type { BrowserCommand } from 'vitest/node';
import type { ViteUserConfig } from 'vitest/config';

type Point = { x: number; y: number };

declare module 'vitest' {
  export interface ProvidedContext {
    scheme: 'light' | 'dark';
  }
}

async function toPage(context: Parameters<BrowserCommand>[0], { x, y }: Point): Promise<Point> {
  const frame = await context.frame();
  const box = await (await frame.frameElement()).boundingBox();
  const width = await frame.evaluate(() => innerWidth);
  const scale = box ? box.width / width : 1;
  return { x: (box?.x ?? 0) + x * scale, y: (box?.y ?? 0) + y * scale };
}

const commands: Record<string, BrowserCommand<never[]>> = {
  pressKey: (async (context, key: string) => context.page.keyboard.press(key)) as BrowserCommand<never[]>,
  typeText: (async (context, text: string) => context.page.keyboard.type(text)) as BrowserCommand<never[]>,
  mouseMove: (async (context, point: Point) => {
    const { x, y } = await toPage(context, point);
    await context.page.mouse.move(x, y);
  }) as BrowserCommand<never[]>,
  mouseClick: (async (context, point: Point) => {
    const { x, y } = await toPage(context, point);
    await context.page.mouse.click(x, y);
  }) as BrowserCommand<never[]>,
  mouseDown: (async (context) => context.page.mouse.down()) as BrowserCommand<never[]>,
  mouseUp: (async (context) => context.page.mouse.up()) as BrowserCommand<never[]>,
  throttleCpu: (async (context) => {
    const rate = Number(process.env.TEST_CPU_THROTTLE);
    if (!rate) return;
    const session = await context.context.newCDPSession(context.page);
    await session.send('Emulation.setCPUThrottlingRate', { rate });
  }) as BrowserCommand<never[]>,
  emulateMedia: (async (context, options: Parameters<typeof context.page.emulateMedia>[0]) =>
    context.page.emulateMedia(options)) as BrowserCommand<never[]>,
};

/** Browser-mode test settings shared by the demo apps: headless system Chrome, reduced motion, fixed viewport. */
export function browserTests(name: string): ViteUserConfig {
  const executablePath = process.env.CHROME_PATH;
  return {
    optimizeDeps: {
      include: ['vitest-browser-react', 'axe-core', 'react', 'react/jsx-dev-runtime', 'react-dom/client'],
    },
    test: {
      name,
      include: ['tests/**/*.test.{ts,tsx}'],
      testTimeout: 120_000,
      browser: {
        enabled: true,
        headless: true,
        provider: playwright({
          launchOptions: executablePath ? { executablePath } : { channel: 'chrome' },
          contextOptions: { reducedMotion: 'reduce' },
        }),
        instances: (['light', 'dark'] as const).map((scheme) => ({
          browser: 'chromium' as const,
          name: `${name} ${scheme}`,
          provide: { scheme },
        })),
        viewport: { width: 1100, height: 800 },
        commands,
      },
    },
  };
}
