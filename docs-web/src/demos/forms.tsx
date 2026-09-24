import { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Combobox,
  Field,
  Inline,
  Input,
  Radio,
  RadioGroup,
  Select,
  Slider,
  Stack,
  Switch,
  Text,
  Textarea,
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

export function SliderDemo() {
  const [volume, setVolume] = useState(40);
  const [price, setPrice] = useState<[number, number]>([200, 800]);
  return (
    <Stack className="demo-form">
      <Field label="Volume" description={`${volume}%`}>
        <Slider value={volume} onValueChange={setVolume} formatValue={(v) => `${v}%`} />
      </Field>
      <Field label="Price" description={`$${price[0]} to $${price[1]}`}>
        <Slider value={price} onValueChange={setPrice} min={0} max={1000} step={50} formatValue={(v) => `$${v}`} />
      </Field>
      <Slider size="sm" color="success" radius="rounded" defaultValue={70} aria-label="Brightness" />
      <Slider size="lg" defaultValue={30} aria-label="Large" />
      <Slider disabled defaultValue={50} aria-label="Disabled" />
    </Stack>
  );
}
