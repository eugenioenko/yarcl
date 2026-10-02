import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { Badge, Button, config } from '@yarcl/react';

function pixels(value: string) {
  const probe = document.createElement('div');
  probe.style.width = value;
  document.body.append(probe);
  const width = getComputedStyle(probe).width;
  probe.remove();
  return width;
}

function sizeToken(element: Element) {
  const sizes = config.sizes as Record<string, { iconSize: string; paddingX: string }>;
  const key = Object.keys(sizes).find((name) => element.classList.contains(`yarcl-size-${name}`));
  expect(key).toBeDefined();
  return sizes[key!];
}

/** Checks token-sized icon slots in both consumer brands. */
export function testIconSlots() {
  test('Button and Badge place decorative icons with size-based spacing', async () => {
    const button = { current: null as HTMLButtonElement | null };
    const link = { current: null as HTMLAnchorElement | null };
    const badge = { current: null as HTMLSpanElement | null };
    const loaded = { current: null as HTMLButtonElement | null };
    const icon = <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="4" /></svg>;
    await render(<>
      <Button ref={button} startIcon={icon} endIcon={icon}>Continue</Button>
      <Button ref={link} href="/next" endIcon={icon}>Next</Button>
      <Badge ref={badge} startIcon={icon} endIcon={icon} onRemove={() => {}}>Complete</Badge>
      <Button ref={loaded} loading startIcon={icon} endIcon={icon}>Saving</Button>
    </>);

    const buttonIcons = button.current!.querySelectorAll('.yarcl-button-icon');
    expect(buttonIcons).toHaveLength(2);
    expect(button.current!.firstElementChild).toBe(buttonIcons[0]);
    expect(buttonIcons[0].getAttribute('aria-hidden')).toBe('true');
    expect(getComputedStyle(buttonIcons[0]).width).toBe(pixels(sizeToken(button.current!).iconSize));
    expect(getComputedStyle(button.current!).gap).toBe(pixels(`calc(${sizeToken(button.current!).paddingX} / 2)`));

    expect(link.current?.tagName).toBe('A');
    expect(link.current?.querySelectorAll('.yarcl-button-icon')).toHaveLength(1);

    const badgeIcons = badge.current!.querySelectorAll('.yarcl-badge-icon');
    expect(badgeIcons).toHaveLength(2);
    expect(badge.current!.firstElementChild).toBe(badgeIcons[0]);
    expect(badgeIcons[0].getAttribute('aria-hidden')).toBe('true');
    expect(getComputedStyle(badgeIcons[0]).width).toBe(pixels(sizeToken(badge.current!).iconSize));
    expect(getComputedStyle(badge.current!).gap).toBe(pixels(`calc(${sizeToken(badge.current!).paddingX} / 4)`));
    expect(badge.current!.lastElementChild?.tagName).toBe('BUTTON');

    expect(loaded.current?.querySelector('.yarcl-button-icon')).toBeNull();
    expect(loaded.current?.querySelector('.yarcl-spinner')).not.toBeNull();
  });
}
