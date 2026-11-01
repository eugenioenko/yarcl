import axe from 'axe-core';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { Button, Combobox, Field, Inline, Input, Link, Select, Stack } from '@yarcl/react';
import { page } from './page';

/** Checks field actions outside accessible names and phrasing layout elements in both brands. */
export function testFieldLabelEnd() {
  for (const kind of ['input', 'select', 'combobox'] as const) {
    test(`label end stays separate from the ${kind} accessible name`, async () => {
      const options = [{ value: 'ada', label: 'Ada' }];
      const screen = await render(<main className="yarcl-root"><Field label="Client name" labelEnd={<Link href="#help">More information</Link>} required description="Choose a client">
        {kind === 'input' ? <Input /> : kind === 'select' ? <Select options={options} /> : <Combobox options={options} />}
      </Field></main>);
      const control = page.getByRole(kind === 'input' ? 'textbox' : 'combobox', { name: 'Client name', exact: true });
      expect(await control.count()).toBe(1);
      const link = screen.container.querySelector('a')!;
      expect(link.closest('label')).toBeNull();
      expect(link.parentElement?.className).toBe('yarcl-field-label-row');
      await page.getByRole('link', { name: 'More information', exact: true }).click();
      expect(document.activeElement).toBe(link);
      const results = await axe.run(screen.container, { rules: { region: { enabled: false } } });
      expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });
  }

  test('fields without label end keep their direct label child', async () => {
    const screen = await render(<Field label="Name"><Input /></Field>);
    expect(screen.container.querySelector('.yarcl-field > label')).not.toBeNull();
    expect(screen.container.querySelector('.yarcl-field-label-row')).toBeNull();
  });

  test('phrasing layout elements render inside buttons without block elements', async () => {
    const screen = await render(<Button><Stack as="span"><Inline as="span">Save changes</Inline></Stack></Button>);
    expect(screen.container.querySelector('button > span.yarcl-stack > span.yarcl-inline')).not.toBeNull();
    expect(screen.container.querySelector('button div')).toBeNull();
  });
}
