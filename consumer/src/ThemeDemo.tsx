import { useEffect, useState } from 'react';
import { Field, Inline, Link, Select } from '@yarcl/react';
import { DemoYarcl } from '@yarcl/react/demo';
import { applyTheme, resetTheme } from '@yarcl/react/css';
import { themeNames, themes } from '@yarcl/react/themes';
import { StepperDemo } from './StepperDemo';
import { ColorPickerDemo } from './ColorPickerDemo';
import { TableColumnsDemo } from './TableColumnsDemo';

type Theme = keyof typeof themes;
type Scheme = 'light dark' | 'light' | 'dark';
const themeOptions = Object.keys(themes).map((value) => ({
  value: value as Theme, label: themeNames[value as Theme],
}));
const schemeOptions = [
  { value: 'light dark' as const, label: 'System' },
  { value: 'light' as const, label: 'Light' },
  { value: 'dark' as const, label: 'Dark' },
];

/** Previews the complete package using interchangeable bundled theme keys. */
export function ThemeDemo() {
  const [theme, setTheme] = useState<Theme>(() => {
    const value = new URLSearchParams(location.search).get('theme');
    return value && Object.hasOwn(themes, value) ? value as Theme : 'yarcl';
  });
  const [scheme, setScheme] = useState<Scheme>(() => {
    const value = new URLSearchParams(location.search).get('scheme');
    return value === 'light' || value === 'dark' ? value : 'light dark';
  });

  useEffect(() => {
    applyTheme(themes[theme]);
    return resetTheme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.colorScheme = scheme;
    const url = new URL(location.href);
    url.searchParams.set('theme', theme);
    url.searchParams.set('scheme', scheme);
    history.replaceState(null, '', url);
  }, [theme, scheme]);

  return (
    <main className="theme-demo yarcl-root" data-theme={theme}>
      <Inline className="theme-demo-header" justify="between">
        <Link href="?">Consumer component demo</Link>
        <Inline>
          <Field label="Theme">
            <Select options={themeOptions} value={theme} onValueChange={(next) => next && setTheme(next)} />
          </Field>
          <Field label="Color scheme">
            <Select options={schemeOptions} value={scheme} onValueChange={(next) => next && setScheme(next)} />
          </Field>
        </Inline>
      </Inline>
      {new URLSearchParams(location.search).get('example') === 'table-columns' ? <TableColumnsDemo /> : new URLSearchParams(location.search).get('example') === 'stepper' ? <StepperDemo /> : new URLSearchParams(location.search).get('example') === 'color-picker' ? <ColorPickerDemo /> : <DemoYarcl title="Component showcase" />}
    </main>
  );
}
