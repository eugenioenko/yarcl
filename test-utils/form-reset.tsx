import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { useState } from 'react';
import { Input, NumberInput, Select } from '@yarcl/react';
import { page } from './page';

const options = [{ value: 'basic', label: 'Basic plan' }, { value: 'premium', label: 'Premium plan' }];

/** Verifies native reset cancellation and completion in both consumer configurations. */
export function testFormReset() {
  test.each(['form', 'ancestor'] as const)('honors reset cancellation on the %s', async (location) => {
    const changed = vi.fn();
    const cancel = (event: React.FormEvent) => event.preventDefault();
    await render(
      <div onReset={location === 'ancestor' ? cancel : undefined}>
        <form onReset={location === 'form' ? cancel : undefined}>
          <Input name="note" aria-label="Note" defaultValue="Original" />
          <Select name="plan" aria-label="Plan" defaultValue="basic" options={options} onValueChange={changed} />
          <NumberInput name="seats" aria-label="Seats" defaultValue={2} onValueChange={changed} />
          <button type="reset">Reset form</button>
        </form>
      </div>,
    );
    await page.getByRole('textbox', { name: 'Note' }).fill('Updated');
    await page.getByRole('combobox', { name: 'Plan', exact: true }).click();
    await page.getByRole('option', { name: 'Premium plan' }).click();
    await page.getByRole('button', { name: 'Increase' }).click();
    changed.mockClear();
    await page.getByRole('button', { name: 'Reset form' }).click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect((document.querySelector('[name="note"]') as HTMLInputElement).value).toBe('Updated');
    expect((document.querySelector('[name="plan"]') as HTMLInputElement).value).toBe('premium');
    expect((document.querySelector('[name="seats"]') as HTMLInputElement).value).toBe('3');
    expect(changed).not.toHaveBeenCalled();
  });

  test('preserves NumberInput draft text when a programmatic reset is canceled', async () => {
    const changed = vi.fn();
    await render(
      <form onReset={(event) => event.preventDefault()}>
        <NumberInput aria-label="Seats" defaultValue={2} onValueChange={changed} />
      </form>,
    );
    await page.getByRole('spinbutton', { name: 'Seats' }).fill('2.');
    document.querySelector('form')!.reset();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect((document.querySelector('input') as HTMLInputElement).value).toBe('2.');
    expect(changed).not.toHaveBeenCalled();
  });

  test('restores defaults and notifies once after an accepted reset', async () => {
    const planChanged = vi.fn();
    const seatsChanged = vi.fn();
    await render(
      <form>
        <Select name="plan" aria-label="Plan" defaultValue="basic" options={options} onValueChange={planChanged} />
        <NumberInput name="seats" aria-label="Seats" defaultValue={2} onValueChange={seatsChanged} />
        <button type="reset">Reset form</button>
      </form>,
    );
    await page.getByRole('combobox', { name: 'Plan', exact: true }).click();
    await page.getByRole('option', { name: 'Premium plan' }).click();
    await page.getByRole('spinbutton', { name: 'Seats' }).fill('9.');
    planChanged.mockClear();
    await page.getByRole('button', { name: 'Reset form' }).click();
    await expect.poll(() => (document.querySelector('[name="plan"]') as HTMLInputElement).value).toBe('basic');
    await expect.poll(() => (document.querySelector('[name="seats"]') as HTMLInputElement).value).toBe('2');
    expect(planChanged).toHaveBeenCalledExactlyOnceWith('basic');
    expect(seatsChanged).toHaveBeenLastCalledWith(2);
    expect(seatsChanged.mock.calls.filter(([value]) => value === 2)).toHaveLength(1);
  });

  test('leaves controlled values with the consumer after an accepted reset', async () => {
    const changed = vi.fn();
    await render(
      <form>
        <Select name="plan" value="premium" defaultValue="basic" options={options} onValueChange={changed} />
        <NumberInput name="seats" value={9} defaultValue={2} onValueChange={changed} />
        <button type="reset">Reset form</button>
      </form>,
    );
    await page.getByRole('button', { name: 'Reset form' }).click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect((document.querySelector('[name="plan"]') as HTMLInputElement).value).toBe('premium');
    expect((document.querySelector('[name="seats"]') as HTMLInputElement).value).toBe('9');
    expect(changed).not.toHaveBeenCalled();
  });

  test('cancels pending reset callbacks when a control unmounts', async () => {
    const changed = vi.fn();
    const screen = await render(
      <form>
        <Select defaultValue="basic" options={options} onValueChange={changed} />
      </form>,
    );
    document.querySelector('form')!.reset();
    await screen.unmount();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(changed).not.toHaveBeenCalled();
  });

  test('completes an accepted reset when the consumer rerenders during onReset', async () => {
    const changed = vi.fn();
    function Form() {
      const [count, setCount] = useState(0);
      return (
        <form onReset={() => setCount((value) => value + 1)}>
          <output>{count}</output>
          <Select name="plan" aria-label="Plan" defaultValue="basic" options={options} onValueChange={(value) => changed(value)} />
          <button type="reset">Reset form</button>
        </form>
      );
    }
    await render(<Form />);
    await page.getByRole('combobox', { name: 'Plan', exact: true }).click();
    await page.getByRole('option', { name: 'Premium plan' }).click();
    changed.mockClear();
    await page.getByRole('button', { name: 'Reset form' }).click();
    await expect.poll(() => (document.querySelector('[name="plan"]') as HTMLInputElement).value).toBe('basic');
    expect(changed).toHaveBeenCalledExactlyOnceWith('basic');
    expect(document.querySelector('output')!.textContent).toBe('1');
  });
}
