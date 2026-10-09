import { describe, expect, it } from 'vitest';
import { themes } from '@yarcl/react/themes';
import type { YarclShape } from '@yarcl/react/define';
import { resolve } from 'node:path';
import ts from 'typescript';
import { checkTheme, parseConfig, serializeConfig, themeSchema } from '../src/playground/theme-config';

const fresh = (): YarclShape => parseConfig(serializeConfig(themes.yarcl)) as YarclShape;

describe('playground config', () => {
  it.each(Object.entries(themes))('round trips the %s theme as a complete config file', (_, theme) => {
    const parsed = parseConfig(serializeConfig(theme));
    expect(parsed).toEqual(theme);
    expect(checkTheme(parsed)).toEqual([]);
  });

  it('accepts object literals, comments, single quotes and trailing commas', () => {
    expect(parseConfig("{ name: 'Custom', /* description */ list: ['one',], }")).toEqual({ name: 'Custom', list: ['one'] });
    expect(parseConfig(serializeConfig({ value: ')});' }))).toEqual({ value: ')});' });
  });

  it('rejects executable expressions without evaluating them', () => {
    expect(() => parseConfig('{ value: (() => { throw new Error("executed"); })() }')).toThrow(/JSON5/);
    expect(() => parseConfig('null; throw new Error("executed")')).toThrow(/JSON5/);
    const source = serializeConfig(themes.yarcl).replace('"Close"', '(() => { throw new Error("executed"); })()');
    expect(() => parseConfig(source)).toThrow(/JSON5/);
  });

  it('round trips translated copy and preserves the default message formatters', () => {
    const theme = fresh();
    theme.labels.close = 'Fermer';
    theme.labels.loading = 'Chargement';
    const source = serializeConfig(theme);
    expect(source).toContain('...defaults.labels');
    expect(source).not.toContain('=>');
    const parsed = parseConfig(source) as YarclShape;
    expect(parsed).toEqual(theme);
    expect(parsed.labels.pageSummary(2, 5)).toBe('Page 2 of 5');
    expect(checkTheme(parsed)).toEqual([]);
  });

  it('exports a config accepted by defineConfig without widening token references', () => {
    const file = resolve(import.meta.dirname, 'generated-config.ts');
    const options: ts.CompilerOptions = {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      types: [],
      paths: { '@yarcl/config': [resolve(import.meta.dirname, '../src/yarcl.config.ts')] },
    };
    const host = ts.createCompilerHost(options);
    const read = host.getSourceFile.bind(host);
    host.getSourceFile = (name, version, onError, shouldCreate) => name === file
      ? ts.createSourceFile(name, serializeConfig(themes.yarcl), version, true)
      : read(name, version, onError, shouldCreate);
    const diagnostics = ts.getPreEmitDiagnostics(ts.createProgram([file], options, host));
    expect(diagnostics.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))).toEqual([]);
  });

  it('rejects invalid or unknown catalog entries and custom formatter exports', () => {
    const theme = fresh();
    expect(checkTheme({ ...theme, labels: { ...theme.labels, close: 12, page: 'Page', extra: 'Extra' } }).join('\n'))
      .toMatch(/labels.close[\s\S]*labels.page[\s\S]*labels.extra/);
    expect(() => serializeConfig({ ...theme, labels: { ...theme.labels, page: () => 'Custom page' } }))
      .toThrow('Customize message formatters in your project config');
  });

  it('exposes every required top-level setting in the visual schema', () => {
    expect(Object.keys(themeSchema.fields!)).toEqual(expect.arrayContaining(Object.keys(fresh())));
    expect(checkTheme({ ...fresh(), timing: undefined, widths: undefined, breakpoints: undefined })).toEqual([
      'widths must be an object.', 'breakpoints must be an object.', 'timing must be an object.',
    ]);
  });

  it('supports optional colors, font files, prose, focus style and component sizing', () => {
    const theme = fresh();
    theme.colors.primary.on = { light: '#ffffff', dark: '#000000' };
    theme.colors.primary.text = '#123456';
    theme.typography.fontFaces = [{ family: 'Example', src: ['/fonts/example.woff2', 'local(Example)'], weight: '100 900', style: 'italic', display: 'optional' }];
    theme.typography.prose = { body: 'body', code: 'code', blockGap: 'sm', headingGap: 'md', listIndent: 'lg' };
    theme.focusRing.style = 'dashed';
    theme.components = { Button: { allowedSizes: ['sm', 'md'], size: 'sm', sizeOverrides: { sm: { height: '2rem' } } } };
    expect(checkTheme(parseConfig(serializeConfig(theme)))).toEqual([]);
  });

  it.each([
    ['defaults.radius', (theme: YarclShape) => { theme.defaults.radius = 'missing'; }],
    ['defaults.labelStyle', (theme: YarclShape) => { theme.defaults.labelStyle = 'missing'; }],
    ['typography.headings.h2', (theme: YarclShape) => { theme.typography.headings.h2 = 'missing'; }],
    ['typography.styles.body.family', (theme: YarclShape) => { theme.typography.styles.body.family = 'missing'; }],
    ['components.Drawer.size', (theme: YarclShape) => { theme.components = { Drawer: { size: 'missing' } }; }],
    ['components.Button.allowedSizes', (theme: YarclShape) => { theme.components = { Button: { allowedSizes: [] } }; }],
    ['components.Button.size', (theme: YarclShape) => { theme.components = { Button: { allowedSizes: ['sm'] } }; }],
    ['components.Button.sizeOverrides.lg', (theme: YarclShape) => { theme.components = { Button: { size: 'sm', allowedSizes: ['sm'], sizeOverrides: { lg: { height: '3rem' } } } }; }],
  ])('validates %s', (path, change) => {
    const theme = fresh();
    change(theme);
    expect(checkTheme(theme).join('\n')).toContain(path);
  });

  it('validates malformed values, reserved keys and unsupported component settings', () => {
    for (const value of [null, [], 5, { colors: null }, { ...fresh(), colors: { primary: null } }]) expect(checkTheme(value).length).toBeGreaterThan(0);
    const theme = fresh();
    theme.radii.size = '1rem';
    theme.breakpoints['1-invalid'] = '30rem';
    theme.timing.toastDuration = Number.NaN;
    theme.components = { Button: { padding: 'sm' } } as unknown as YarclShape['components'];
    expect(checkTheme(theme).join('\n')).toMatch(/radii.size[\s\S]*breakpoints.1-invalid[\s\S]*timing.toastDuration[\s\S]*components.Button.padding/);
  });

  it('keeps preview tokens while allowing additional tokens and optional groups', () => {
    const theme = fresh();
    theme.spacing.extra = '3rem';
    theme.defaults.radius = 'size';
    delete theme.typography.fonts;
    delete theme.components;
    expect(checkTheme(theme)).toEqual([]);
    delete theme.sizes.sm;
    expect(checkTheme(theme)).toContain('sizes.sm is required by the preview.');
  });
});
