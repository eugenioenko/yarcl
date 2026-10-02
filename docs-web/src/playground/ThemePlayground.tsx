import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Drawer, Inline, Select, Stack, Tabs, Text, Textarea, Toaster, ToggleGroup, toast } from '@yarcl/react';
import { applyTheme } from '@yarcl/react/css';
import type { YarclShape } from '@yarcl/react/define';
import { themeNames, themes } from '@yarcl/react/themes';
import { Dashboard } from './Dashboard';
import { VisualEditor } from './VisualEditor';
import { checkTheme, parseConfig, serializeConfig, type Value } from './theme-config';

type ThemeId = keyof typeof themes;
const ids = Object.keys(themes) as ThemeId[];
function initial() {
  const params = new URLSearchParams(location.search);
  const theme = params.get('theme');
  const scheme = params.get('scheme');
  return {
    theme: (ids.includes(theme as ThemeId) ? theme : 'yarcl') as ThemeId,
    scheme: scheme === 'dark' || scheme === 'light' ? scheme : 'light',
  };
}

/** Interactive dashboard with synchronized visual and code theme editors. */
export function ThemePlayground() {
  const start = useMemo(initial, []);
  const [themeId, setThemeId] = useState<ThemeId>(start.theme);
  const [scheme, setScheme] = useState<string>(start.scheme);
  const [custom, setCustom] = useState<YarclShape | null>(null);
  const [source, setSource] = useState(() => serializeConfig(themes[start.theme]));
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [tab, setTab] = useState('visual');
  const draft = useMemo(() => {
    try { return { value: parseConfig(source), error: null }; }
    catch (error) { return { value: undefined, error: `Couldn't read the config: ${(error as Error).message}` }; }
  }, [source]);

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
    setSource(serializeConfig(themes[id]));
  }

  function edit(text: string) {
    setSource(text);
    setErrors([]);
  }

  function validatedDraft(): YarclShape | null {
    const problems = draft.error ? [draft.error] : checkTheme(draft.value);
    setErrors(problems);
    if (problems.length) {
      setEditorOpen(true);
      return null;
    }
    return draft.value as YarclShape;
  }

  function apply() {
    const theme = validatedDraft();
    if (theme) {
      setCustom(theme);
      toast({ title: 'Custom theme applied', color: 'success' });
    }
  }

  async function copy() {
    const theme = validatedDraft();
    if (!theme) return;
    try {
      await navigator.clipboard.writeText(serializeConfig(theme));
      toast({ title: 'Config copied', description: 'Paste it into src/yarcl.config.ts.' });
    } catch {
      toast({ title: 'Could not copy config', description: 'Download the config instead.', color: 'danger' });
    }
  }

  function download() {
    const theme = validatedDraft();
    if (!theme) return;
    const url = URL.createObjectURL(new Blob([serializeConfig(theme)], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'yarcl.config.ts';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
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
          <Button size="sm" variant="outline" color="neutral" onClick={download}>
            Download config
          </Button>
        </Inline>
      </div>

      <Dashboard />

      <Drawer
        open={editorOpen}
        onOpenChange={setEditorOpen}
        size="lg"
        title="Edit theme"
        description="Change any design system value, then apply to preview. Both editors share the same config."
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
              {errors.length > 8 && <Text>{errors.length - 8} more settings need a correction.</Text>}
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
          <Tabs value={tab} onValueChange={setTab}>
            <Tabs.List aria-label="Theme editor">
              <Tabs.Trigger value="visual">Visual Editor</Tabs.Trigger>
              <Tabs.Trigger value="code">Code Editor</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Panel value="visual">
              {draft.error ? (
                <Alert color="danger" title="The config needs a correction" live="polite">
                  <Text>{draft.error}</Text>
                  <Button size="sm" variant="outline" onClick={() => setTab('code')}>Open Code Editor</Button>
                </Alert>
              ) : <VisualEditor value={draft.value as Value} onChange={(value) => edit(serializeConfig(value))} />}
            </Tabs.Panel>
            <Tabs.Panel value="code">
              <Stack gap="sm">
                <Text textStyle="caption">Edit the config values below. Comments, single quotes and trailing commas are supported.</Text>
                <Textarea
                  aria-label="Theme source"
                  className="pg-editor"
                  rows={28}
                  spellCheck={false}
                  value={source}
                  onChange={(event) => edit(event.target.value)}
                  aria-invalid={Boolean(draft.error)}
                  aria-describedby={draft.error ? 'pg-source-error' : undefined}
                />
                {draft.error && <Text id="pg-source-error" color="danger" role="status">{draft.error}</Text>}
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Drawer>

      <Toaster placement="bottom-right" />
    </>
  );
}
