import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { Button, IconButton } from '@yarcl/react';

/** Checks the anchor and action forms of both button components in a consumer app. */
export function testButtonLinks() {
  test('button links keep native link behavior and button styles', async () => {
    const buttonRef = { current: null as HTMLAnchorElement | null };
    const iconRef = { current: null as HTMLAnchorElement | null };
    let clicks = 0;
    const screen = await render(<>
      <Button href="/lessons/next" target="_blank" rel="noopener noreferrer" ref={buttonRef} onClick={(event) => {
        event.preventDefault();
        clicks += 1;
      }}>Next lesson</Button>
      <IconButton href="/settings" aria-label="Settings" ref={iconRef}><svg aria-hidden="true" /></IconButton>
      <Button>Save</Button>
      <IconButton aria-label="Add" disabled><svg aria-hidden="true" /></IconButton>
    </>);

    expect(buttonRef.current?.tagName).toBe('A');
    expect(buttonRef.current?.getAttribute('href')).toBe('/lessons/next');
    expect(buttonRef.current?.target).toBe('_blank');
    expect(buttonRef.current?.classList.contains('yarcl-button')).toBe(true);
    expect(getComputedStyle(buttonRef.current!).textDecorationLine).toBe('none');
    buttonRef.current!.click();
    expect(clicks).toBe(1);

    expect(iconRef.current?.tagName).toBe('A');
    expect(iconRef.current?.getAttribute('href')).toBe('/settings');
    expect(iconRef.current?.getAttribute('aria-label')).toBe('Settings');
    expect(iconRef.current?.classList.contains('yarcl-icon-button')).toBe(true);

    const buttons = screen.container.querySelectorAll('button.yarcl-button');
    expect(buttons[0].getAttribute('type')).toBe('button');
    expect((buttons[1] as HTMLButtonElement).disabled).toBe(true);
  });
}
