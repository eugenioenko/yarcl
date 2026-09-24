import { useState, type CSSProperties } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Field,
  Heading,
  Inline,
  Input,
  Select,
  Stack,
  Switch,
  Text,
  ToggleGroup,
  type Radius,
  type Size,
  type Spacing,
} from 'yarcl';

const palettes = {
  blue: { light: '#2d4bb8', dark: '#8aa2ff' },
  violet: { light: '#6d28d9', dark: '#c4b5fd' },
  emerald: { light: '#047857', dark: '#6ee7b7' },
  orange: { light: '#c2410c', dark: '#fdba74' },
  pink: { light: '#be185d', dark: '#f9a8d4' },
} as const;
type Palette = keyof typeof palettes;

const radii = ['square', 'sm', 'md', 'lg', 'xl'] as const;
const allSizes = ['sm', 'md', 'lg'] as const;
const spacings = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const usedSize = 'lg';

function readableOn(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const l = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return (1.05 / (l + 0.05) >= (l + 0.05) / 0.05) ? '#ffffff' : '#000000';
}

const plans = [
  { value: 'starter', label: 'Starter' },
  { value: 'team', label: 'Team' },
  { value: 'business', label: 'Business' },
];

function ControlLabel({ label, configKey }: { label: string; configKey?: string }) {
  return (
    <Inline gap="xs" align="baseline">
      <Text textStyle="label">{label}</Text>
      {configKey && <code className="playground-key">{configKey}</code>}
    </Inline>
  );
}

export function ConfigPlayground() {
  const [palette, setPalette] = useState<Palette>('blue');
  const [radius, setRadius] = useState<(typeof radii)[number]>('md');
  const [sizes, setSizes] = useState<string[]>([...allSizes]);
  const [defaultSize, setDefaultSize] = useState<string>('md');
  const [scheme, setScheme] = useState<string>('light');
  const [padding, setPadding] = useState<Spacing>('lg');
  const [gap, setGap] = useState<Spacing>('md');

  const color = palettes[palette];
  const errors: string[] = [];
  const union = sizes.map((s) => `"${s}"`).join(' | ') || 'never';
  if (!sizes.includes(defaultSize)) errors.push(`yarcl.config.ts: Type '"${defaultSize}"' is not assignable to type '${union}'.`);
  if (!sizes.includes(usedSize)) errors.push(`App.tsx: Type '"${usedSize}"' is not assignable to type '${union}'.`);

  const size = (sizes.includes(defaultSize) ? defaultSize : (sizes[0] ?? 'md')) as Size;
  const r = radius as Radius;

  const preview = {
    colorScheme: scheme,
    '--yarcl-color-primary': `light-dark(${color.light}, ${color.dark})`,
    '--yarcl-color-primary-on': `light-dark(${readableOn(color.light)}, ${readableOn(color.dark)})`,
    '--yarcl-focus-color': `light-dark(${color.light}, ${color.dark})`,
  } as CSSProperties;

  const config = `export default defineConfig({
  ...defaults,
  colors: {
    ...defaults.colors,
    primary: { light: '${color.light}', dark: '${color.dark}' },
  },
  sizes: {
${sizes.map((s) => `    ${s}: { … },`).join('\n') || '    // no sizes'}
  },
  defaults: {
    ...defaults.defaults,
    size: '${defaultSize}',
    radius: '${radius}',
    padding: '${padding}',
    gap: '${gap}',
  },
});`;

  return (
    <div className="playground">
      <Stack className="playground-controls">
        <Stack gap="xs">
          <ControlLabel label="Brand color" configKey="colors.primary" />
          <ToggleGroup type="single" required value={palette} onValueChange={(v) => v && setPalette(v as Palette)} size="sm" attached={false} aria-label="Brand color">
            {(Object.keys(palettes) as Palette[]).map((key) => (
              <ToggleGroup.Item key={key} value={key} icon aria-label={key}>
                <span className="playground-dot" style={{ background: palettes[key].light }} />
              </ToggleGroup.Item>
            ))}
          </ToggleGroup>
        </Stack>
        <Stack gap="xs">
          <ControlLabel label="Default radius" configKey="defaults.radius" />
          <ToggleGroup type="single" required value={radius} onValueChange={(v) => v && setRadius(v as typeof radius)} size="sm" aria-label="Default radius">
            {radii.map((key) => (
              <ToggleGroup.Item key={key} value={key}>
                {key}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup>
        </Stack>
        <Stack gap="xs">
          <ControlLabel label="Available sizes" configKey="sizes" />
          <Inline gap="md">
            {allSizes.map((key) => (
              <Checkbox
                key={key}
                checked={sizes.includes(key)}
                onChange={(e) => setSizes(e.target.checked ? allSizes.filter((s) => s === key || sizes.includes(s)) : sizes.filter((s) => s !== key))}
              >
                {key}
              </Checkbox>
            ))}
          </Inline>
        </Stack>
        <Stack gap="xs">
          <ControlLabel label="Default size" configKey="defaults.size" />
          <ToggleGroup type="single" required value={defaultSize} onValueChange={(v) => v && setDefaultSize(v)} size="sm" aria-label="Default size">
            {allSizes.map((key) => (
              <ToggleGroup.Item key={key} value={key}>
                {key}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup>
        </Stack>
        <Stack gap="xs">
          <ControlLabel label="Default padding" configKey="defaults.padding" />
          <ToggleGroup type="single" required value={padding} onValueChange={(v) => v && setPadding(v as Spacing)} size="sm" aria-label="Default padding">
            {spacings.map((key) => (
              <ToggleGroup.Item key={key} value={key}>
                {key}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup>
        </Stack>
        <Stack gap="xs">
          <ControlLabel label="Default gap" configKey="defaults.gap" />
          <ToggleGroup type="single" required value={gap} onValueChange={(v) => v && setGap(v as Spacing)} size="sm" aria-label="Default gap">
            {spacings.map((key) => (
              <ToggleGroup.Item key={key} value={key}>
                {key}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup>
        </Stack>
        <Stack gap="xs">
          <ControlLabel label="Color scheme" />
          <ToggleGroup type="single" required value={scheme} onValueChange={(v) => v && setScheme(v)} size="sm" aria-label="Preview color scheme">
            <ToggleGroup.Item value="light">light</ToggleGroup.Item>
            <ToggleGroup.Item value="dark">dark</ToggleGroup.Item>
          </ToggleGroup>
        </Stack>
      </Stack>

      <div className="playground-preview" style={preview}>
        <Card radius={r} padding={padding} shadow="md" className="playground-card">
          <Stack gap={gap}>
            <Inline justify="between" gap={gap}>
              <Heading level={3}>Create workspace</Heading>
              <Badge radius={r} size={size}>
                Beta
              </Badge>
            </Inline>
            <Field label="Workspace name">
              <Input size={size} radius={r} placeholder="Acme Inc." />
            </Field>
            <Field label="Plan">
              <Select size={size} radius={r} options={plans} defaultValue="team" />
            </Field>
            <Inline justify="between" gap={gap}>
              <Checkbox size={size} defaultChecked>
                Invite my team
              </Checkbox>
              <Switch size={size} defaultChecked aria-label="Email updates" />
            </Inline>
            <Alert radius={r} title="14-day trial">
              No card needed until the trial ends.
            </Alert>
            <Inline justify="end" gap={gap}>
              <Button size={size} radius={r} variant="outline" color="neutral">
                Cancel
              </Button>
              <Button size={size} radius={r}>
                Submit
              </Button>
            </Inline>
          </Stack>
        </Card>
      </div>

      <div className="playground-code">
        <div className="playground-file">yarcl.config.ts</div>
        <pre>{config}</pre>
        <div className="playground-file">App.tsx</div>
        <pre>{`<Button size="${usedSize}">Continue</Button>`}</pre>
        <div className={`playground-diagnostics ${errors.length ? 'has-errors' : ''}`} role="status">
          {errors.length ? (
            errors.map((error) => (
              <div key={error}>
                <Badge color="danger" variant="solid" size="sm">
                  error
                </Badge>{' '}
                {error}
              </div>
            ))
          ) : (
            <div>
              <Badge color="success" variant="solid" size="sm">
                tsc
              </Badge>{' '}
              No errors. Uncheck <code>lg</code> under Available sizes to see what the compiler says.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
