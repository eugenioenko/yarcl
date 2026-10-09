import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { Combobox, DatePicker, NumberInput, Radio, RadioGroup, Select, Slider, Switch, ToggleGroup } from '@yarcl/react';
import { page } from './page';

const plans = [{ value: 'basic', label: 'Basic plan' }, { value: 'premium', label: 'Premium plan' }];
const countries = [{ value: 'ca', label: 'Canada' }, { value: 'us', label: 'United States' }];
const teams = [{ value: 'design', label: 'Design' }, { value: 'engineering', label: 'Engineering' }];
const initialDate = new Date(2026, 8, 15);
const initialTeams = ['design'];
const initialBudget: [number, number] = [20, 80];
const initialFormatting = ['bold'];

/** Mutates every native form control and verifies reset state and submitted values in both brands. */
export function testNativeFormReset() {
  test.each(['button', 'programmatic'] as const)('restores changed uncontrolled controls after a %s reset', async (trigger) => {
    const formRef = { current: null as HTMLFormElement | null };
    let submitted: Record<string, FormDataEntryValue[]> = {};
    await render(
      <form ref={formRef} onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        submitted = Object.fromEntries([...new Set(data.keys())].map((name) => [name, data.getAll(name)]));
      }}>
        <Select aria-label="Plan" name="plan" defaultValue="basic" options={plans} />
        <Combobox aria-label="Country" name="country" defaultValue="ca" options={countries} />
        <Combobox multiple aria-label="Teams" name="teams" defaultValue={initialTeams} options={teams} />
        <RadioGroup label="Billing" name="billing" defaultValue="annual">
          <Radio value="monthly">Monthly</Radio>
          <Radio value="annual">Annual</Radio>
        </RadioGroup>
        <NumberInput aria-label="Seats" name="seats" defaultValue={2} min={1} max={20} />
        <Slider aria-label="Volume" name="volume" defaultValue={40} min={0} max={100} step={5} />
        <Slider aria-label="Budget" name="budget" defaultValue={initialBudget} min={0} max={100} step={5} thumbLabels={['Minimum', 'Maximum']} />
        <Switch name="notifications" defaultChecked>Notifications</Switch>
        <DatePicker aria-label="Appointment" name="appointment" defaultValue={initialDate} />
        <ToggleGroup type="single" aria-label="Alignment" defaultValue="left">
          <ToggleGroup.Item value="left">Align left</ToggleGroup.Item>
          <ToggleGroup.Item value="right">Align right</ToggleGroup.Item>
        </ToggleGroup>
        <ToggleGroup type="multiple" aria-label="Formatting" defaultValue={initialFormatting}>
          <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
          <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>
        </ToggleGroup>
        <button type="submit">Submit form</button>
        <button type="reset">Reset form</button>
      </form>,
    );
    const initial = {
      plan: ['basic'], country: ['ca'], teams: ['design'], billing: ['annual'], seats: ['2'],
      volume: ['40'], budget: ['20', '80'], notifications: ['on'], appointment: ['2026-09-15'],
    };
    await page.getByRole('button', { name: 'Submit form' }).click();
    expect(submitted).toEqual(initial);

    await page.getByRole('combobox', { name: 'Plan', exact: true }).click();
    await page.getByRole('option', { name: 'Premium plan' }).click();
    await page.getByRole('combobox', { name: 'Country', exact: true }).fill('United');
    await page.getByRole('option', { name: 'United States' }).click();
    await page.getByRole('combobox', { name: 'Teams', exact: true }).fill('Engineering');
    await page.getByRole('option', { name: 'Engineering' }).click();
    await page.getByRole('button', { name: 'Remove Design' }).click();
    await page.keyboard.press('Escape');
    await page.getByRole('radio', { name: 'Monthly' }).click();
    await page.getByRole('button', { name: 'Increase' }).click();
    await page.getByRole('slider', { name: 'Volume', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await page.getByRole('slider', { name: 'Budget Minimum' }).focus();
    await page.keyboard.press('ArrowRight');
    await page.getByRole('slider', { name: 'Budget Maximum' }).focus();
    await page.keyboard.press('ArrowLeft');
    await page.getByRole('switch', { name: 'Notifications' }).click();
    await page.getByRole('button', { name: 'Appointment', exact: true }).click();
    await page.getByRole('gridcell', { name: 'Monday, September 21st, 2026' }).click();
    await page.getByRole('button', { name: 'Align right' }).click();
    await page.getByRole('button', { name: 'Bold', exact: true }).click();
    await page.getByRole('button', { name: 'Italic', exact: true }).click();

    expect((formRef.current!.querySelector('.yarcl-combobox') as HTMLInputElement).value).toBe('United States');
    expect(await page.getByRole('button', { name: 'Align left' }).getAttribute('aria-pressed')).toBe('false');
    expect(await page.getByRole('button', { name: 'Align right' }).getAttribute('aria-pressed')).toBe('true');
    expect(await page.getByRole('button', { name: 'Bold', exact: true }).getAttribute('aria-pressed')).toBe('false');
    expect(await page.getByRole('button', { name: 'Italic', exact: true }).getAttribute('aria-pressed')).toBe('true');
    await page.getByRole('button', { name: 'Submit form' }).click();
    expect(submitted).toEqual({
      plan: ['premium'], country: ['us'], teams: ['engineering'], billing: ['monthly'], seats: ['3'],
      volume: ['45'], budget: ['25', '75'], appointment: ['2026-09-21'],
    });

    if (trigger === 'button') await page.getByRole('button', { name: 'Reset form' }).click();
    else formRef.current!.reset();
    await expect.poll(() => Object.fromEntries(new FormData(formRef.current!))).toEqual({
      plan: 'basic', country: 'ca', teams: 'design', billing: 'annual', seats: '2',
      volume: '40', budget: '80', notifications: 'on', appointment: '2026-09-15',
    });
    await expect.poll(() => (formRef.current!.querySelector('.yarcl-combobox') as HTMLInputElement).value).toBe('Canada');
    expect(formRef.current!.querySelector('.yarcl-select-value')!.textContent).toBe('Basic plan');
    expect((formRef.current!.querySelector('[value="annual"]') as HTMLInputElement).checked).toBe(true);
    expect((formRef.current!.querySelector('[name="seats"]') as HTMLInputElement).value).toBe('2');
    expect(await page.getByRole('slider', { name: 'Volume', exact: true }).getAttribute('aria-valuenow')).toBe('40');
    expect(await page.getByRole('slider', { name: 'Budget Minimum' }).getAttribute('aria-valuenow')).toBe('20');
    expect(await page.getByRole('slider', { name: 'Budget Maximum' }).getAttribute('aria-valuenow')).toBe('80');
    expect((formRef.current!.querySelector('[name="notifications"]') as HTMLInputElement).checked).toBe(true);
    expect(await page.getByRole('button', { name: 'Remove Design' }).count()).toBe(1);
    expect(await page.getByRole('button', { name: 'Remove Engineering' }).count()).toBe(0);
    expect((formRef.current!.querySelector('.yarcl-date-picker') as HTMLButtonElement).textContent).toContain('Sep 15, 2026');
    await expect.poll(() => page.getByRole('button', { name: 'Align left' }).getAttribute('aria-pressed')).toBe('true');
    expect(await page.getByRole('button', { name: 'Align right' }).getAttribute('aria-pressed')).toBe('false');
    await expect.poll(() => page.getByRole('button', { name: 'Bold', exact: true }).getAttribute('aria-pressed')).toBe('true');
    expect(await page.getByRole('button', { name: 'Italic', exact: true }).getAttribute('aria-pressed')).toBe('false');
    await page.getByRole('button', { name: 'Submit form' }).click();
    expect(submitted).toEqual(initial);
  });
}
