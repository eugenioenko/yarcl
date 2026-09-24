import { vi } from 'vitest';
import { commands, page as browserPage, userEvent } from 'vitest/browser';

type Step = (elements: Element[]) => Element[];
type TextMatch = string | RegExp;
type RoleOptions = { name?: TextMatch; exact?: boolean; includeHidden?: boolean; checked?: boolean; level?: number };
type FilterOptions = { hasText?: TextMatch; hasNotText?: TextMatch; has?: Locator; hasNot?: Locator };
type ClickOptions = { timeout?: number; force?: boolean; position?: { x: number; y: number } };

const TIMEOUT = 5000;
const realSetTimeout = globalThis.setTimeout.bind(globalThis);
const sleep = (ms: number) => new Promise((resolve) => realSetTimeout(resolve, ms));
const unique = (elements: Element[]) => [...new Set(elements)];
const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();

function matchesText(element: Element, match: TextMatch) {
  const text = normalize(element.textContent ?? '');
  return typeof match === 'string' ? text.toLowerCase().includes(normalize(match).toLowerCase()) : match.test(text);
}

function scoped(element: Element) {
  return element === document.documentElement ? browserPage : browserPage.elementLocator(element);
}

function visible(element: Element) {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && getComputedStyle(element).visibility !== 'hidden';
}

/**
 * A Playwright-style locator over the test document, so suites read like Playwright tests while
 * running inside Vitest browser mode. Resolves lazily; actions and reads wait for exactly one match.
 */
export class Locator {
  constructor(private readonly steps: Step[] = []) {}

  resolve(roots: Element[] = [document.documentElement]): Element[] {
    return this.steps.reduce((elements, step) => unique(step(elements)), roots);
  }

  private with(step: Step) {
    return new Locator([...this.steps, step]);
  }

  getByRole(role: string, options: RoleOptions = {}) {
    return this.with((elements) =>
      elements.flatMap((element) =>
        scoped(element)
          .getByRole(role as never, options)
          .elements(),
      ),
    );
  }

  getByText(text: TextMatch, { exact = false }: { exact?: boolean } = {}) {
    const matches = (element: Element) => {
      const content = normalize(element.textContent ?? '');
      if (typeof text !== 'string') return text.test(content);
      return exact ? content === normalize(text) : content.toLowerCase().includes(normalize(text).toLowerCase());
    };
    return this.with((elements) =>
      elements.flatMap((scope) =>
        [...scope.querySelectorAll('*')].filter(
          (element) =>
            !['SCRIPT', 'STYLE'].includes(element.tagName) &&
            matches(element) &&
            ![...element.children].some((child) => matches(child)),
        ),
      ),
    );
  }

  locator(selector: string, options: FilterOptions = {}) {
    const query = (element: Element): Element[] => {
      if (selector === 'xpath=..') return element.parentElement ? [element.parentElement] : [];
      return [...element.querySelectorAll(selector.startsWith('>') ? `:scope ${selector}` : selector)];
    };
    return this.with((elements) => elements.flatMap(query)).filter(options);
  }

  getByTestId(id: string) {
    return this.locator(`[data-testid="${id}"]`);
  }

  filter({ hasText, hasNotText, has, hasNot }: FilterOptions) {
    return this.with((elements) =>
      elements.filter(
        (element) =>
          (hasText === undefined || matchesText(element, hasText)) &&
          (hasNotText === undefined || !matchesText(element, hasNotText)) &&
          (has === undefined || has.resolve([element]).length > 0) &&
          (hasNot === undefined || hasNot.resolve([element]).length === 0),
      ),
    );
  }

  nth(index: number) {
    return this.with((elements) => (elements.at(index) ? [elements.at(index)!] : []));
  }

  first() {
    return this.nth(0);
  }

  last() {
    return this.nth(-1);
  }

  async all() {
    return this.resolve().map((element) => new Locator([() => [element]]));
  }

  async element(timeout = TIMEOUT): Promise<HTMLElement> {
    const deadline = Date.now() + timeout;
    for (;;) {
      const elements = this.resolve();
      if (elements.length > 1)
        throw new Error(`strict mode violation: locator resolved to ${elements.length} elements`);
      if (elements.length === 1) return elements[0] as HTMLElement;
      if (Date.now() > deadline) throw new Error('locator resolved to no elements');
      await sleep(50);
    }
  }

  async allTextContents() {
    return this.resolve().map((element) => element.textContent ?? '');
  }

  async allInnerTexts() {
    return this.resolve().map((element) => (element as HTMLElement).innerText);
  }

  async blur() {
    (await this.element()).blur();
  }

  async count() {
    return this.resolve().length;
  }

  async isVisible() {
    const elements = this.resolve();
    if (elements.length > 1) throw new Error(`strict mode violation: locator resolved to ${elements.length} elements`);
    return elements.length === 1 && visible(elements[0]);
  }

  async waitFor({
    state = 'visible',
    timeout = TIMEOUT,
  }: { state?: 'visible' | 'hidden' | 'attached' | 'detached'; timeout?: number } = {}) {
    const deadline = Date.now() + timeout;
    for (;;) {
      const [element] = this.resolve();
      const done =
        state === 'attached'
          ? !!element
          : state === 'detached'
            ? !element
            : state === 'visible'
              ? !!element && visible(element)
              : !element || !visible(element);
      if (done) return;
      if (Date.now() > deadline) throw new Error(`waitFor ${state} timed out`);
      await sleep(50);
    }
  }

  async click(options: ClickOptions = {}) {
    const { timeout, ...rest } = options;
    await userEvent.click(await this.element(timeout), rest);
  }

  async hover() {
    await userEvent.hover(await this.element());
  }

  async fill(text: string) {
    await userEvent.fill(await this.element(), text);
  }

  async check() {
    const element = (await this.element()) as HTMLInputElement;
    if (!element.checked) await userEvent.click(element);
  }

  async focus() {
    (await this.element()).focus();
  }

  async scrollIntoViewIfNeeded() {
    (await this.element()).scrollIntoView({ block: 'nearest' });
  }

  async getAttribute(name: string) {
    return (await this.element()).getAttribute(name);
  }

  async innerText() {
    return (await this.element()).innerText;
  }

  async textContent() {
    return (await this.element()).textContent;
  }

  async inputValue() {
    return ((await this.element()) as HTMLInputElement).value;
  }

  async isEnabled() {
    return !((await this.element()) as HTMLButtonElement).disabled;
  }

  async isDisabled() {
    return ((await this.element()) as HTMLButtonElement).disabled;
  }

  async isChecked() {
    return ((await this.element()) as HTMLInputElement).checked;
  }

  async boundingBox() {
    const element = await this.element();
    if (!visible(element)) return null;
    const { x, y, width, height } = element.getBoundingClientRect();
    return { x, y, width, height };
  }

  async evaluate<T, A>(fn: (element: HTMLElement, arg: A) => T | Promise<T>, arg?: A) {
    return fn(await this.element(), arg as A);
  }

  async evaluateAll<T, A>(fn: (elements: HTMLElement[], arg: A) => T | Promise<T>, arg?: A) {
    return fn(this.resolve() as HTMLElement[], arg as A);
  }
}

const root = new Locator();
let navigate: (search: string) => Promise<void> = async () => {
  throw new Error('page.goto is only available inside runSuite');
};

/** Lets the suite runner remount the app when a suite changes the URL. */
export function onNavigate(handler: (search: string) => Promise<void>) {
  navigate = handler;
}
const added: Element[] = [];

/** Removes what a suite added outside the rendered app, so the next test starts clean. */
export function resetPage() {
  vi.useRealTimers();
  added.splice(0).forEach((element) => element.remove());
  scrollTo(0, 0);
}
const typed = commands as unknown as Record<string, (...args: unknown[]) => Promise<void>>;

/** The Playwright-style page object suites receive. */
export const page = {
  getByRole: (role: string, options?: RoleOptions) => root.getByRole(role, options),
  getByText: (text: TextMatch, options?: { exact?: boolean }) => root.getByText(text, options),
  locator: (selector: string, options?: FilterOptions) => root.locator(selector, options),
  getByTestId: (id: string) => root.getByTestId(id),
  keyboard: {
    press: (key: string) => typed.pressKey(key),
    type: (text: string) => typed.typeText(text),
  },
  mouse: {
    move: (x: number, y: number) => typed.mouseMove({ x, y }),
    click: (x: number, y: number) => typed.mouseClick({ x, y }),
    down: () => typed.mouseDown(),
    up: () => typed.mouseUp(),
  },
  emulateMedia: (options: Record<string, unknown>) => typed.emulateMedia(options),
  throttleCpu: () => typed.throttleCpu(),
  waitForTimeout: (ms: number) => sleep(ms),
  goto: (search: string) => navigate(search),
  clock: {
    install: async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
    },
    runFor: async (ms: number) => {
      await vi.advanceTimersByTimeAsync(ms);
    },
    uninstall: async () => {
      vi.useRealTimers();
    },
  },
  waitForFunction: async <A>(fn: (arg: A) => unknown, arg?: A, { timeout = TIMEOUT }: { timeout?: number } = {}) => {
    const deadline = Date.now() + timeout;
    while (!(await fn(arg as A))) {
      if (Date.now() > deadline) throw new Error('waitForFunction timed out');
      await sleep(50);
    }
  },
  addStyleTag: async ({ content }: { content: string }) => {
    const style = document.createElement('style');
    style.textContent = content;
    document.head.append(style);
    added.push(style);
  },
  viewportSize: () => ({ width: innerWidth, height: innerHeight }),
  evaluate: async <T, A>(fn: (arg: A) => T | Promise<T>, arg?: A) => fn(arg as A),
};

export type Page = typeof page;
