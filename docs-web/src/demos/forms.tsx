import { useEffect, useId, useState } from 'react';
import {
  Button,
  Checkbox,
  Combobox,
  Field,
  Inline,
  Input,
  Label,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  ToggleGroup,
  type SelectOption,
} from 'yarcl';

export function FieldDemo() {
  const [email, setEmail] = useState('ada@');
  const invalid = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  return (
    <Stack className="demo-form">
      <Field label="Full name" description="As it appears on your ID." required>
        <Input placeholder="Ada Lovelace" />
      </Field>
      <Field label="Email" error={invalid ? 'Enter a valid email address.' : undefined}>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
    </Stack>
  );
}

export function LabelDemo() {
  const id = useId();
  return (
    <Stack className="demo-form">
      <Inline gap="sm" wrap={false}>
        <Label htmlFor={`${id}-city`} className="demo-label" required>
          City
        </Label>
        <Input id={`${id}-city`} placeholder="Zurich" required className="demo-grow" />
      </Inline>
      <Inline gap="sm" wrap={false}>
        <Label htmlFor={`${id}-nickname`} className="demo-label" disabled>
          Nickname
        </Label>
        <Input id={`${id}-nickname`} placeholder="Unavailable" disabled className="demo-grow" />
      </Inline>
    </Stack>
  );
}

export function LabelGroupDemo() {
  const id = useId();
  return (
    <Stack gap="sm" className="demo-form">
      <Label id={`${id}-birth`}>Date of birth</Label>
      <Inline role="group" aria-labelledby={`${id}-birth`} gap="sm" wrap={false}>
        <Input aria-label="Day" placeholder="DD" className="demo-part" inputMode="numeric" />
        <Input aria-label="Month" placeholder="MM" className="demo-part" inputMode="numeric" />
        <Input aria-label="Year" placeholder="YYYY" className="demo-part" inputMode="numeric" />
      </Inline>
    </Stack>
  );
}

export function LabelCustomDemo() {
  const id = useId();
  return (
    <Stack gap="sm">
      <Label id={`${id}-frequency`} color="primary">
        Digest frequency
      </Label>
      <ToggleGroup type="single" defaultValue="weekly" aria-labelledby={`${id}-frequency`}>
        <ToggleGroup.Item value="daily">Daily</ToggleGroup.Item>
        <ToggleGroup.Item value="weekly">Weekly</ToggleGroup.Item>
        <ToggleGroup.Item value="monthly">Monthly</ToggleGroup.Item>
      </ToggleGroup>
    </Stack>
  );
}

export function InputDemo() {
  return (
    <Stack className="demo-form">
      <Input placeholder="Default" aria-label="Default" />
      <Input size="sm" placeholder="Small" aria-label="Small" />
      <Input size="lg" placeholder="Large, success focus color" color="success" aria-label="Large" />
      <Input placeholder="Disabled" disabled aria-label="Disabled" />
      <Inline gap="sm">
        <Input placeholder="Search" aria-label="Search" className="demo-grow" />
        <Button>Search</Button>
      </Inline>
    </Stack>
  );
}

export function TextareaDemo() {
  return (
    <Stack className="demo-form">
      <Field label="One row" description="A one-row textarea is exactly as tall as an input.">
        <Textarea rows={1} placeholder="Say hello" />
      </Field>
      <Field label="Message">
        <Textarea rows={4} placeholder="Write a longer message" />
      </Field>
    </Stack>
  );
}

const plans: SelectOption<'free' | 'pro' | 'team' | 'enterprise'>[] = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
  { value: 'enterprise', label: 'Enterprise (contact sales)', disabled: true },
];

export function SelectDemo() {
  const [plan, setPlan] = useState<(typeof plans)[number]['value'] | null>('pro');
  return (
    <Stack className="demo-form">
      <Field label="Plan" description={`Value: ${plan ?? 'none'}`}>
        <Select options={plans} value={plan} onValueChange={setPlan} placeholder="Choose a plan" />
      </Field>
      <Field label="Uncontrolled, with placeholder">
        <Select options={plans} placeholder="Choose a plan" />
      </Field>
    </Stack>
  );
}

const countries: SelectOption[] = [
  'Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Chile', 'Denmark', 'Finland', 'France',
  'Germany', 'Ireland', 'Italy', 'Japan', 'Mexico', 'Netherlands', 'Norway', 'Portugal', 'Spain', 'Sweden',
  'Switzerland', 'United Kingdom', 'United States', 'Uruguay',
].map((name) => ({ value: name.toLowerCase().replace(/\s+/g, '-'), label: name }));

export function ComboboxSearchDemo() {
  const [country, setCountry] = useState<string | null>(null);
  return (
    <Field label="Country" description={`Value: ${country ?? 'none'}`} className="demo-form">
      <Combobox options={countries} value={country} onValueChange={setCountry} placeholder="Search countries" />
    </Field>
  );
}

const frameworks: SelectOption[] = ['React', 'Preact', 'Solid', 'Svelte', 'Vue', 'Angular'].map((name) => ({
  value: name,
  label: name,
}));

export function ComboboxFreeDemo() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Field label="Framework" description={`Value: ${value ?? 'none'}`} className="demo-form">
      <Combobox options={frameworks} allowCustomValue onValueChange={setValue} placeholder="Type anything" />
    </Field>
  );
}

export function ComboboxAsyncDemo() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!query.trim()) return setResults([]);
    setLoading(true);
    const timer = setTimeout(() => {
      setResults(countries.filter((c) => c.label.toLowerCase().startsWith(query.trim().toLowerCase())));
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);
  return (
    <Field label="Remote search" description="Results arrive after 500 ms." className="demo-form">
      <Combobox
        options={results}
        filter={false}
        loading={loading}
        onInputValueChange={setQuery}
        emptyMessage="No countries found"
        placeholder="Start typing"
      />
    </Field>
  );
}

export function CheckboxDemo() {
  return (
    <Stack gap="sm">
      <Checkbox defaultChecked>Email notifications</Checkbox>
      <Checkbox>SMS notifications</Checkbox>
      <Checkbox indeterminate>Select all</Checkbox>
      <Checkbox disabled>Disabled</Checkbox>
      <Checkbox color="success" size="lg" defaultChecked>
        Large, success
      </Checkbox>
    </Stack>
  );
}

export function RadioGroupDemo() {
  const [plan, setPlan] = useState<string | null>('pro');
  return (
    <Stack>
      <RadioGroup label="Plan" description={`Value: ${plan}`} value={plan} onValueChange={setPlan} orientation="horizontal">
        <Radio value="free">Free</Radio>
        <Radio value="pro">Pro</Radio>
        <Radio value="team">Team</Radio>
      </RadioGroup>
      <RadioGroup label="Billing" error="Choose how often to pay.">
        <Radio value="monthly">Monthly</Radio>
        <Radio value="yearly">Yearly</Radio>
      </RadioGroup>
    </Stack>
  );
}

export function SwitchDemo() {
  const [on, setOn] = useState(true);
  return (
    <Stack gap="sm">
      <Switch checked={on} onChange={(e) => setOn(e.target.checked)}>
        Notifications {on ? 'on' : 'off'}
      </Switch>
      <Switch color="success" size="lg" defaultChecked>
        Large, success
      </Switch>
      <Switch disabled>Disabled</Switch>
      <Text textStyle="caption" muted>
        A native checkbox with role="switch".
      </Text>
    </Stack>
  );
}
