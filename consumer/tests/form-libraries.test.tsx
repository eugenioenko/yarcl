import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { useState } from 'react';
import { Controller, useForm as useRHF } from 'react-hook-form';
import { useForm as useTanStackForm } from '@tanstack/react-form';
import { Combobox, Field, Radio, RadioGroup, Select, Switch } from '@yarcl/react';
import { page } from '../../test-utils/page';

const selectOptions = [
  { value: 'free', label: 'Free Plan' },
  { value: 'pro', label: 'Pro Plan' },
  { value: 'enterprise', label: 'Enterprise Plan' },
];

const comboboxOptions = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'mx', label: 'Mexico' },
];

describe('Form Libraries Integration', () => {
  describe('React Hook Form', () => {
    it('supports controlled binding with Controller', async () => {
      let submittedData: Record<string, unknown> | null = null;

      function RHFControlledForm() {
        const { control, handleSubmit } = useRHF({
          defaultValues: {
            plan: 'pro',
            country: 'ca',
            frequency: 'monthly',
            notifications: true,
          },
        });

        return (
          <form onSubmit={handleSubmit((data) => { submittedData = data; })}>
            <Controller
              name="plan"
              control={control}
              render={({ field }) => (
                <Field label="Plan">
                  <Select
                    options={selectOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </Field>
              )}
            />

            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Field label="Country">
                  <Combobox
                    options={comboboxOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </Field>
              )}
            />

            <Controller
              name="frequency"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  label="Billing Frequency"
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <Radio value="monthly">Monthly</Radio>
                  <Radio value="annual">Annual</Radio>
                </RadioGroup>
              )}
            />

            <Controller
              name="notifications"
              control={control}
              render={({ field }) => (
                <Field label="Notifications">
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  >
                    Enable Notifications
                  </Switch>
                </Field>
              )}
            />

            <button type="submit">Submit</button>
          </form>
        );
      }

      const screen = await render(<RHFControlledForm />);
      const submitBtn = screen.getByRole('button', { name: 'Submit' });
      await submitBtn.click();

      expect(submittedData).toEqual({
        plan: 'pro',
        country: 'ca',
        frequency: 'monthly',
        notifications: true,
      });
    });

    it('supports uncontrolled binding with native FormData submit & hidden inputs', async () => {
      let submittedData: Record<string, unknown> | null = null;

      function RHFUncontrolledForm() {
        return (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              submittedData = Object.fromEntries(formData.entries());
            }}
          >
            <Field label="Plan">
              <Select
                name="plan"
                defaultValue="free"
                options={selectOptions}
              />
            </Field>

            <Field label="Country">
              <Combobox
                name="country"
                defaultValue="us"
                options={comboboxOptions}
              />
            </Field>

            <RadioGroup label="Frequency" name="frequency" defaultValue="annual">
              <Radio value="monthly">Monthly</Radio>
              <Radio value="annual">Annual</Radio>
            </RadioGroup>

            <Field label="Notifications">
              <Switch name="notifications" value="yes" defaultChecked>
                Enable Notifications
              </Switch>
            </Field>

            <button type="submit">Submit</button>
          </form>
        );
      }

      const screen = await render(<RHFUncontrolledForm />);
      const submitBtn = screen.getByRole('button', { name: 'Submit' });
      await submitBtn.click();

      expect(submittedData).toEqual({
        plan: 'free',
        country: 'us',
        frequency: 'annual',
        notifications: 'yes',
      });
    });

    it('maps validation errors to Field error and sets aria-invalid', async () => {
      function RHFValidationForm() {
        const { control, handleSubmit, setError } = useRHF({
          defaultValues: { plan: null, country: null, frequency: null, notifications: false },
        });

        return (
          <form onSubmit={handleSubmit(() => {
            setError('plan', { type: 'required', message: 'Plan is required' });
            setError('country', { type: 'required', message: 'Country is required' });
            setError('frequency', { type: 'required', message: 'Frequency is required' });
            setError('notifications', { type: 'required', message: 'Must accept terms' });
          })}>
            <Controller
              name="plan"
              control={control}
              render={({ field, fieldState }) => (
                <Field label="Plan" error={fieldState.error?.message}>
                  <Select
                    options={selectOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </Field>
              )}
            />

            <Controller
              name="country"
              control={control}
              render={({ field, fieldState }) => (
                <Field label="Country" error={fieldState.error?.message}>
                  <Combobox
                    options={comboboxOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </Field>
              )}
            />

            <Controller
              name="frequency"
              control={control}
              render={({ field, fieldState }) => (
                <RadioGroup
                  label="Frequency"
                  value={field.value}
                  onValueChange={field.onChange}
                  error={fieldState.error?.message}
                >
                  <Radio value="monthly">Monthly</Radio>
                </RadioGroup>
              )}
            />

            <Controller
              name="notifications"
              control={control}
              render={({ field, fieldState }) => (
                <Field label="Notifications" error={fieldState.error?.message}>
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                </Field>
              )}
            />

            <button type="submit">Validate</button>
          </form>
        );
      }

      const screen = await render(<RHFValidationForm />);
      await screen.getByRole('button', { name: 'Validate' }).click();

      expect(screen.getByText('Plan is required')).toBeTruthy();
      expect(screen.getByText('Country is required')).toBeTruthy();
      expect(screen.getByText('Frequency is required')).toBeTruthy();
      expect(screen.getByText('Must accept terms')).toBeTruthy();

      const selectBtn = document.querySelector('button.yarcl-select');
      expect(selectBtn?.getAttribute('aria-invalid')).toBe('true');

      const comboboxInput = document.querySelector('input.yarcl-combobox');
      expect(comboboxInput?.getAttribute('aria-invalid')).toBe('true');

      const switchInput = document.querySelector('input.yarcl-switch-input');
      expect(switchInput?.getAttribute('aria-invalid')).toBe('true');
    });
  });

  describe('TanStack Form', () => {
    it('supports controlled bindings and error mapping', async () => {
      let submittedValues: Record<string, unknown> | null = null;

      function TanStackFormWrapper() {
        const form = useTanStackForm({
          defaultValues: {
            plan: 'free',
            country: 'us',
            frequency: 'monthly',
            agree: false,
          },
          onSubmit: ({ value }) => {
            submittedValues = value;
          },
        });

        return (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.Field
              name="plan"
              validators={{
                onChange: ({ value }) => (!value ? 'Plan required' : undefined),
              }}
              children={(field) => (
                <Field label="Plan" error={field.state.meta.errors.join(', ')}>
                  <Select
                    name={field.name}
                    options={selectOptions}
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val ?? '')}
                  />
                </Field>
              )}
            />

            <form.Field
              name="country"
              children={(field) => (
                <Field label="Country">
                  <Combobox
                    name={field.name}
                    options={comboboxOptions}
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val ?? '')}
                  />
                </Field>
              )}
            />

            <form.Field
              name="frequency"
              children={(field) => (
                <RadioGroup
                  label="Frequency"
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(val) => field.handleChange(val)}
                >
                  <Radio value="monthly">Monthly</Radio>
                  <Radio value="annual">Annual</Radio>
                </RadioGroup>
              )}
            />

            <form.Field
              name="agree"
              children={(field) => (
                <Field label="Terms">
                  <Switch
                    name={field.name}
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                  >
                    Agree to terms
                  </Switch>
                </Field>
              )}
            />

            <button type="submit">Submit TanStack</button>
          </form>
        );
      }

      const screen = await render(<TanStackFormWrapper />);
      await screen.getByRole('button', { name: 'Submit TanStack' }).click();

      expect(submittedValues).toEqual({
        plan: 'free',
        country: 'us',
        frequency: 'monthly',
        agree: false,
      });
    });
  });
});
