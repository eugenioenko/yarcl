import { useEffect, useMemo, useState } from 'react';
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
  config as buildConfig,
} from '@yarcl/react';
import { applyTheme, resetTheme } from '@yarcl/react/css';
import type { YarclShape } from '@yarcl/react/define';
import { themeNames, themes } from '@yarcl/react/themes';

type ThemeId = keyof typeof themes;
const themeIds = Object.keys(themes) as ThemeId[];

const palettes = {
  blue: { light: '#2d4bb8', dark: '#8aa2ff' },
  violet: { light: '#6d28d9', dark: '#c4b5fd' },
  emerald: { light: '#047857', dark: '#6ee7b7' },
  orange: { light: '#c2410c', dark: '#fdba74' },
  pink: { light: '#be185d', dark: '#f9a8d4' },
} as const;
type Palette = keyof typeof palettes | 'theme';

const radii = ['square', 'sm', 'md', 'lg', 'xl'] as const;
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const spacings = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

const plans = [
  { value: 'starter', label: 'Starter' },
  { value: 'team', label: 'Team' },
  { value: 'business', label: 'Business' },
];

interface Overrides {
  radius: string | null;
  size: string | null;
  padding: string | null;
  gap: string | null;
}

const none: Overrides = { radius: null, size: null, padding: null, gap: null };

function baseOf(id: ThemeId): YarclShape {
  return (id === '@yarcl/react' ? buildConfig : themes[id]) as unknown as YarclShape;
}

function compose(base: YarclShape, palette: Palette, overrides: Overrides): YarclShape {
  const defaults = { ...base.defaults };
  for (const [key, value] of Object.entries(overrides)) if (value) (defaults as Record<string, string>)[key] = value;
  const components = Object.fromEntries(
    Object.entries(base.components ?? {}).map(([name, values]) => {
      if (!overrides.radius || !values) return [name, values];
      const { radius: _dropped, ...rest } = values as Record<string, string>;
      return [name, rest];
    }),
  );
  return {
    ...base,
    colors: palette === 'theme' ? base.colors : { ...base.colors, primary: palettes[palette] },
    components,
    defaults,
  } as YarclShape;
}

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <Stack gap="xs">
      <Text textStyle="label">{label}</Text>
      <ToggleGroup type="single" required value={value} onValueChange={(v) => v && onChange(v as T)} size="sm" aria-label={label}>
        {options.map((option) => (
          <ToggleGroup.Item key={option} value={option}>
            {option}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>
    </Stack>
  );
}

export function ConfigPlayground() {
  const [themeId, setThemeId] = useState<ThemeId>('@yarcl/react');
  const [palette, setPalette] = useState<Palette>('theme');
  const [overrides, setOverrides] = useState<Overrides>(none);
  const [scheme, setScheme] = useState('light');

  const base = baseOf(themeId);
  const composed = useMemo(() => compose(base, palette, overrides), [base, palette, overrides]);
  const untouched = themeId === '@yarcl/react' && palette === 'theme' && Object.values(overrides).every((v) => !v);

  useEffect(() => {
    if (untouched) resetTheme();
    else applyTheme(composed);
  }, [composed, untouched]);

  useEffect(() => resetTheme, []);

  function chooseTheme(id: ThemeId) {
    setThemeId(id);
    setPalette('theme');
    setOverrides(none);
  }

  const set = (key: keyof Overrides) => (value: string) => setOverrides((current) => ({ ...current, [key]: value }));
  const current = composed.defaults;

  const spread = themeId === '@yarcl/react' ? 'defaults' : themeId;
  const changed = (Object.entries(overrides) as [keyof Overrides, string | null][]).filter(([, value]) => value);
  const code = [
    themeId === '@yarcl/react' ? "import defaults from '@yarcl/react/defaults';" : `import { ${spread} } from '@yarcl/react/themes';`,
    '',
    'export default defineConfig({',
    `  ...${spread},`,
    ...(palette === 'theme'
      ? []
      : [
          '  colors: {',
          `    ...${spread}.colors,`,
          `    primary: { light: '${palettes[palette].light}', dark: '${palettes[palette].dark}' },`,
          '  },',
        ]),
    ...(changed.length
      ? ['  defaults: {', `    ...${spread}.defaults,`, ...changed.map(([key, value]) => `    ${key}: '${value}',`), '  },']
      : []),
    '});',
  ].join('\n');

  return (
    <div className="playground">
      <Stack gap="xs" className="playground-themes">
        <Text textStyle="label">Theme</Text>
        <ToggleGroup type="single" required value={themeId} onValueChange={(v) => v && chooseTheme(v as ThemeId)} attached={false} aria-label="Theme">
          {themeIds.map((id) => (
            <ToggleGroup.Item key={id} value={id}>
              {id === '@yarcl/react' ? '@yarcl/react' : themeNames[id]}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
      </Stack>

      <Stack className="playground-controls">
        <Stack gap="xs">
          <Text textStyle="label">Brand color</Text>
          <ToggleGroup type="single" required value={palette} onValueChange={(v) => v && setPalette(v as Palette)} size="sm" attached={false} aria-label="Brand color">
            <ToggleGroup.Item value="theme">Theme</ToggleGroup.Item>
            {(Object.keys(palettes) as (keyof typeof palettes)[]).map((key) => (
              <ToggleGroup.Item key={key} value={key} icon aria-label={key}>
                <span className="playground-dot" style={{ background: palettes[key].light }} />
              </ToggleGroup.Item>
            ))}
          </ToggleGroup>
        </Stack>
        <Choice label="Default radius" value={current.radius} options={radii} onChange={set('radius')} />
        <Choice label="Default size" value={current.size} options={sizes} onChange={set('size')} />
        <Choice label="Default padding" value={current.padding} options={spacings} onChange={set('padding')} />
        <Choice label="Default gap" value={current.gap} options={spacings} onChange={set('gap')} />
        <Choice label="Color scheme" value={scheme} options={['light', 'dark'] as const} onChange={setScheme} />
      </Stack>

      <div className="playground-preview" style={{ colorScheme: scheme }}>
        <Card shadow="md" className="playground-card">
          <Stack>
            <Inline justify="between">
              <Heading level={3}>Create workspace</Heading>
              <Badge>Beta</Badge>
            </Inline>
            <Field label="Workspace name">
              <Input placeholder="Acme Inc." />
            </Field>
            <Field label="Plan">
              <Select options={plans} defaultValue="team" />
            </Field>
            <Inline justify="between">
              <Checkbox defaultChecked>Invite my team</Checkbox>
              <Switch defaultChecked aria-label="Email updates" />
            </Inline>
            <Alert title="14-day trial">No card needed until the trial ends.</Alert>
            <Inline justify="end">
              <Button variant="outline" color="neutral">
                Cancel
              </Button>
              <Button>Submit</Button>
            </Inline>
          </Stack>
        </Card>
      </div>

      <div className="playground-code">
        <div className="playground-file">yarcl.config.ts</div>
        <pre>{code}</pre>
      </div>
    </div>
  );
}
