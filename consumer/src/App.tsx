import { useState, type ReactNode } from 'react';
import {
  Button,
  Checkbox,
  Field,
  IconButton,
  Input,
  Radio,
  Switch,
  Textarea,
  config,
  type Color,
  type Radius,
  type Size,
  type TextStyle,
  type Variant,
} from 'yarcl';
import { PlusIcon, SearchIcon } from './icons';

const sizes = Object.keys(config.sizes) as Size[];
const radii = Object.keys(config.radii) as Radius[];
const colors = Object.keys(config.colors) as Color[];
const variants = Object.keys(config.variants) as Variant[];
const textStyles = Object.keys(config.typography.styles) as TextStyle[];

type Scheme = 'light dark' | 'light' | 'dark';

function initialScheme(): Scheme {
  const param = new URLSearchParams(location.search).get('scheme');
  return param === 'light' || param === 'dark' ? param : 'light dark';
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="yarcl-type-title">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="row">
      <code className="label">{label}</code>
      {children}
    </div>
  );
}

export function App() {
  const [scheme, setScheme] = useState<Scheme>(() => {
    const s = initialScheme();
    document.documentElement.style.colorScheme = s;
    return s;
  });
  const [email, setEmail] = useState('not-an-email');

  function applyScheme(next: Scheme) {
    document.documentElement.style.colorScheme = next;
    setScheme(next);
  }

  return (
    <main>
      <header className="row">
        <h1 className="yarcl-type-display">yarcl</h1>
        <div className="row">
          {(['light dark', 'light', 'dark'] as Scheme[]).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={scheme === s ? 'solid' : 'outline'}
              color="neutral"
              onClick={() => applyScheme(s)}
            >
              {s === 'light dark' ? 'system' : s}
            </Button>
          ))}
        </div>
      </header>

      <Section title="Sizes">
        {sizes.map((size) => (
          <Row key={size} label={size}>
            <Input size={size} placeholder={`Input ${size}`} />
            <Button size={size}>
              <PlusIcon /> Button
            </Button>
            <IconButton size={size} aria-label="Search" variant="outline">
              <SearchIcon />
            </IconButton>
            <Checkbox size={size} defaultChecked>
              Check
            </Checkbox>
            <Switch size={size} defaultChecked>
              Switch
            </Switch>
          </Row>
        ))}
      </Section>

      <Section title="Variants × colors">
        {colors.map((color) => (
          <Row key={color} label={color}>
            {variants.map((variant) => (
              <Button key={variant} color={color} variant={variant}>
                {variant}
              </Button>
            ))}
            <Button color={color} disabled>
              disabled
            </Button>
          </Row>
        ))}
      </Section>

      <Section title="Selection controls">
        {colors.map((color) => (
          <Row key={color} label={color}>
            <Checkbox color={color} defaultChecked>
              Checked
            </Checkbox>
            <Checkbox color={color} indeterminate>
              Mixed
            </Checkbox>
            <Radio color={color} name={`radio-${color}`} defaultChecked>
              One
            </Radio>
            <Radio color={color} name={`radio-${color}`}>
              Two
            </Radio>
            <Switch color={color} defaultChecked>
              On
            </Switch>
          </Row>
        ))}
        <Row label="disabled">
          <Checkbox disabled>Checkbox</Checkbox>
          <Radio disabled>Radio</Radio>
          <Switch disabled defaultChecked>
            Switch
          </Switch>
        </Row>
      </Section>

      <Section title="Fields">
        <div className="form">
          <Field label="Name" description="As it appears on your ID." required>
            <Input placeholder="Ada Lovelace" />
          </Field>
          <Field label="Email" error={email.includes('@') ? undefined : 'Enter a valid email address.'}>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Message" description="One row tall by default, same height as an input.">
            <Textarea rows={1} placeholder="Say hello" />
          </Field>
          <Field label="Notes">
            <Textarea rows={4} />
          </Field>
          <Field label="Terms" error="You must accept the terms.">
            <Checkbox>I accept the terms</Checkbox>
          </Field>
        </div>
      </Section>

      <Section title="Radii">
        {radii.map((radius) => (
          <Row key={radius} label={radius}>
            <Input radius={radius} placeholder={radius} />
            <Button radius={radius}>{radius}</Button>
            <IconButton radius={radius} aria-label="Add" variant="subtle">
              <PlusIcon />
            </IconButton>
          </Row>
        ))}
      </Section>

      <Section title="Text styles">
        {textStyles.map((style) => (
          <Row key={style} label={style}>
            <span className={`yarcl-type-${style}`}>The quick brown fox</span>
          </Row>
        ))}
      </Section>
    </main>
  );
}
