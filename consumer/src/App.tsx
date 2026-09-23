import { useState, type ReactNode } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Field,
  Heading,
  IconButton,
  Inline,
  Input,
  Link,
  Radio,
  Stack,
  Switch,
  Text,
  Textarea,
  Toaster,
  config,
  type Color,
  type Radius,
  type Shadow,
  type Size,
  type Spacing,
  type TextStyle,
  type Variant,
} from 'yarcl';
import { FloatingDemo } from './FloatingDemo';
import { OverlaysDemo } from './OverlaysDemo';
import { PlusIcon, SearchIcon } from './icons';

const keys = <T extends string>(o: object) => Object.keys(o) as T[];
const sizes = keys<Size>(config.sizes);
const radii = keys<Radius>(config.radii);
const colors = keys<Color>(config.colors);
const variants = keys<Variant>(config.variants);
const spacings = keys<Spacing>(config.spacing);
const shadows = keys<Shadow>(config.shadows);
const textStyles = keys<TextStyle>(config.typography.styles);

type Scheme = 'light dark' | 'light' | 'dark';

function initialScheme(): Scheme {
  const param = new URLSearchParams(location.search).get('scheme');
  return param === 'light' || param === 'dark' ? param : 'light dark';
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack as="section" gap="tight">
      <Heading level={2}>{title}</Heading>
      {children}
    </Stack>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Inline gap="tight">
      <Text as="code" textStyle="code" muted className="label">
        {label}
      </Text>
      {children}
    </Inline>
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
    <Stack as="main" gap="loose" className="page">
      <Inline as="header" justify="between">
        <Heading level={1} textStyle="display">
          yarcl
        </Heading>
        <Inline gap="tight">
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
        </Inline>
      </Inline>

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
        <Stack className="form">
          <Field label="Name" description="As it appears on your ID." required>
            <Input placeholder="Ada Lovelace" />
          </Field>
          <Field label="Email" error={email.includes('@') ? undefined : 'Enter a valid email address.'}>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Message" description="One row tall by default, same height as an input.">
            <Textarea rows={1} placeholder="Say hello" />
          </Field>
          <Field label="Terms" error="You must accept the terms.">
            <Checkbox>I accept the terms</Checkbox>
          </Field>
        </Stack>
      </Section>

      <Section title="Floating">
        <FloatingDemo />
      </Section>

      <Section title="Overlays, tabs, table">
        <OverlaysDemo />
      </Section>

      <Section title="Typography">
        {textStyles.map((style) => (
          <Row key={style} label={style}>
            <Text textStyle={style}>The quick brown fox</Text>
          </Row>
        ))}
        <Row label="color">
          {colors.map((color) => (
            <Text key={color} color={color}>
              {color}
            </Text>
          ))}
          <Text muted>muted</Text>
        </Row>
        <Row label="link">
          <Text>
            Read the <Link href="#">documentation</Link>, or visit <Link href="https://example.com" external>example.com</Link>.
          </Text>
          <Link href="#" underline="hover" color="neutral">
            Hover underline
          </Link>
        </Row>
        <Row label="truncate">
          <Text truncate className="narrow">
            A single line that is much too long for its box and gets an ellipsis
          </Text>
          <Text truncate={2} className="narrow">
            Two lines of text that keep going well past the second line, so the rest is clamped away with an ellipsis at the end.
          </Text>
        </Row>
      </Section>

      <Section title="Layout">
        {spacings.map((gap) => (
          <Row key={gap} label={`gap ${gap}`}>
            <Inline gap={gap}>
              {[1, 2, 3, 4].map((n) => (
                <span key={n} className="box" />
              ))}
            </Inline>
          </Row>
        ))}
        <Inline gap="normal" align="stretch">
          {shadows.map((shadow) => (
            <Card key={shadow} shadow={shadow} className="card">
              <Stack gap="tight">
                <Heading level={3} textStyle="body">
                  Card
                </Heading>
                <Text textStyle="caption" muted>
                  shadow="{shadow}"
                </Text>
              </Stack>
            </Card>
          ))}
          <Card radius="round" padding="loose" className="card">
            <Stack gap="tight">
              <Heading level={3} textStyle="body">
                Card
              </Heading>
              <Text textStyle="caption" muted>
                no shadow, padding="loose"
              </Text>
            </Stack>
          </Card>
        </Inline>
        <Card>
          <Stack>
            <Heading level={3}>Delete project</Heading>
            <Text as="p" muted>
              This removes the project and all of its data. It can't be undone.
            </Text>
            <Divider />
            <Inline justify="between">
              <Inline gap="tight">
                <Text textStyle="caption">3 members</Text>
                <Divider orientation="vertical" />
                <Text textStyle="caption">12 files</Text>
              </Inline>
              <Inline gap="tight">
                <Button variant="outline" color="neutral">
                  Cancel
                </Button>
                <Button color="danger">Delete</Button>
              </Inline>
            </Inline>
          </Stack>
        </Card>
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
      <Toaster />
    </Stack>
  );
}
