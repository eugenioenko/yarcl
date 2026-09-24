import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Drawer, Inline, Link, Select, Stack, Text, Textarea, Toaster, ToggleGroup, toast } from '@yarcl/react';
import { applyTheme } from '@yarcl/react/css';
import type { YarclShape } from '@yarcl/react/define';
import { themeNames, themes } from '@yarcl/react/themes';
import { Dashboard } from './Dashboard';

type ThemeId = keyof typeof themes;
const ids = Object.keys(themes) as ThemeId[];
const base = themes.yarcl as unknown as YarclShape;

const groups = ['colors', 'sizes', 'radii', 'variants', 'spacing', 'shadows', 'density', 'modalSizes'] as const;
const required = ['neutrals', 'zIndex', 'motion', 'borders', 'focusRing', 'defaults', 'typography'] as const;

function checkTheme(theme: YarclShape): string[] {
  const errors: string[] = [];
  for (const group of required) if (!theme[group]) errors.push(`Missing group "${group}".`);
  for (const group of groups) {
    const keys = Object.keys(theme[group] ?? {});
    for (const key of Object.keys(base[group])) if (!keys.includes(key)) errors.push(`${group}.${key} is missing, but the app uses it.`);
  }
  for (const key of Object.keys(base.typography.styles)) {
    if (!theme.typography?.styles?.[key]) errors.push(`typography.styles.${key} is missing, but the app uses it.`);
  }
  for (const [key, color] of Object.entries(theme.colors ?? {})) {
    if (typeof color?.light !== 'string' || typeof color?.dark !== 'string') errors.push(`colors.${key} needs a light and a dark value.`);
  }
  const refs: [string, string | undefined, object | undefined][] = [
    ['defaults.size', theme.defaults?.size, theme.sizes],
    ['defaults.color', theme.defaults?.color, theme.colors],
    ['defaults.variant', theme.defaults?.variant, theme.variants],
    ['focusRing.color', theme.focusRing?.color, theme.colors],
  ];
  for (const [path, value, group] of refs) if (value && group && !(value in group)) errors.push(`${path} is "${value}", which isn't a key of its group.`);
  return errors;
}

function initial() {
  const params = new URLSearchParams(location.search);
  const theme = params.get('theme');
  const scheme = params.get('scheme');
  return {
    theme: (ids.includes(theme as ThemeId) ? theme : '@yarcl/react') as ThemeId,
    scheme: scheme === 'dark' || scheme === 'light' ? scheme : 'light',
  };
}

export function ThemePlayground() {
  const start = useMemo(initial, []);
  const [themeId, setThemeId] = useState<ThemeId>(start.theme);
  const [scheme, setScheme] = useState<string>(start.scheme);
  const [custom, setCustom] = useState<YarclShape | null>(null);
  const [source, setSource] = useState(() => JSON.stringify(themes[start.theme], null, 2));
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);

  const active = custom ?? (themes[themeId] as unknown as YarclShape);

  useEffect(() => {
    const found: string[] = [];
    applyTheme(active, { onWarning: (message) => found.push(message) });
    setWarnings(found);
  }, [active]);

  useEffect(() => {
    document.documentElement.style.colorScheme = scheme;
    const params = new URLSearchParams(location.search);
    params.set('scheme', scheme);
    if (custom) params.delete('theme');
    else params.set('theme', themeId);
    history.replaceState(null, '', `?${params}`);
  }, [scheme, themeId, custom]);

  function choose(id: ThemeId) {
    setThemeId(id);
    setCustom(null);
    setErrors([]);
    setSource(JSON.stringify(themes[id], null, 2));
  }

  function apply() {
    let theme: YarclShape;
    try {
      theme = new Function(`"use strict"; return (${source});`)() as YarclShape;
    } catch (error) {
      setErrors([`Couldn't read the theme: ${(error as Error).message}`]);
      return;
    }
    const problems = theme && typeof theme === 'object' ? checkTheme(theme) : ['The theme must be an object.'];
    setErrors(problems);
    if (problems.length === 0) {
      setCustom(theme);
      toast({ title: 'Custom theme applied', color: 'success' });
    }
  }

  async function copy() {
    const text = custom
      ? `import { defineConfig } from '@yarcl/react/define';\n\nexport default defineConfig(${JSON.stringify(custom, null, 2)});\n`
      : themeId === '@yarcl/react'
        ? `export { default } from '@yarcl/react/defaults';\n`
        : `export { ${themeId} as default } from '@yarcl/react/themes';\n`;
    await navigator.clipboard.writeText(text);
    toast({ title: 'Config copied', description: 'Paste it into src/yarcl.config.ts.' });
  }

  const options = [
    ...ids.map((id) => ({ value: id as string, label: themeNames[id] })),
    ...(custom ? [{ value: 'custom', label: 'Custom' }] : []),
  ];

  return (
    <>
      <div className="pg-themebar" role="region" aria-label="Theme controls">
        <Inline gap="sm">
          <Text textStyle="label">Theme</Text>
          <Select
            size="sm"
            aria-label="Theme"
            options={options}
            value={custom ? 'custom' : themeId}
            onValueChange={(value) => value && value !== 'custom' && choose(value as ThemeId)}
            className="pg-theme-select"
          />
          <ToggleGroup type="single" required value={scheme} onValueChange={(v) => v && setScheme(v)} size="sm" aria-label="Color scheme">
            <ToggleGroup.Item value="light">Light</ToggleGroup.Item>
            <ToggleGroup.Item value="dark">Dark</ToggleGroup.Item>
          </ToggleGroup>
        </Inline>
        <Inline gap="sm">
          <Button size="sm" variant="outline" color="neutral" onClick={() => setEditorOpen(true)}>
            Edit theme
          </Button>
          <Button size="sm" variant="outline" color="neutral" onClick={copy}>
            Copy config
          </Button>
          <Link href="/theming/playground/" target="_top" underline="hover" color="neutral">
            Back to docs
          </Link>
        </Inline>
      </div>

      <Dashboard />

      <Drawer
        open={editorOpen}
        onOpenChange={setEditorOpen}
        size="lg"
        title="Edit theme"
        description="The whole theme as a config object. Change any value, or start from another theme, then apply."
        footer={
          <>
            <Button variant="outline" color="neutral" onClick={() => choose(themeId)}>
              Reset to {themeNames[themeId]}
            </Button>
            <Button onClick={apply}>Apply</Button>
          </>
        }
      >
        <Stack>
          {errors.length > 0 && (
            <Alert color="danger" title="The theme can't be applied" live="polite">
              <ul className="pg-list">
                {errors.slice(0, 8).map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}
          {warnings.length > 0 && (
            <Alert color="warning" title="Contrast warnings">
              <ul className="pg-list">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </Alert>
          )}
          <Textarea
            aria-label="Theme source"
            className="pg-editor"
            rows={28}
            spellCheck={false}
            value={source}
            onChange={(event) => setSource(event.target.value)}
          />
        </Stack>
      </Drawer>

      <Toaster placement="bottom-right" />
    </>
  );
}
