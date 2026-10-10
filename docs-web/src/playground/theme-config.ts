import JSON5 from 'json5';
import { componentSlots } from '@yarcl/react/define';
import type { ComponentName, ComponentTokenProps, YarclShape } from '@yarcl/react/define';
import { themes } from '@yarcl/react/themes';
import { generateCss } from '@yarcl/react/generate';
import defaults from '@yarcl/react/defaults';

/** Editable values in a design system config. */
export type Value = string | number | ((...args: never[]) => string) | Value[] | { [key: string]: Value };
/** Form and validation rules for a config setting. */
export type Schema = {
  kind: 'string' | 'number' | 'object' | 'map' | 'array' | 'union' | 'function';
  fields?: Record<string, Schema>;
  item?: Schema;
  choices?: Schema[];
  labels?: string[];
  options?: string[];
  ref?: string;
  required?: string[];
  optional?: boolean;
  reserved?: string[];
  seed?: Value;
};

const base: YarclShape = themes.yarcl;
const string: Schema = { kind: 'string' };
const number: Schema = { kind: 'number' };
const object = (fields: Record<string, Schema>): Schema => ({ kind: 'object', fields });
const optional = (schema: Schema): Schema => ({ ...schema, optional: true });
const options = (...values: string[]): Schema => ({ kind: 'string', options: values });
const ref = (path: string, extra: string[] = []): Schema => ({ kind: 'string', ref: path, options: extra });
const map = (item: Schema, required: string[] = []): Schema => ({ kind: 'map', item, required });
const array = (item: Schema): Schema => ({ kind: 'array', item });
const union = (choices: Schema[], labels: string[]): Schema => ({ kind: 'union', choices, labels });
const pair = object({ light: string, dark: string });
const color = union([string, pair], ['Shared color', 'Light and dark colors']);
const size = object({ height: string, paddingX: string, fontSize: string, iconSize: string });
const tokenRefs: Record<string, Schema> = {
  size: ref('sizes'), radius: ref('radii', ['size']), color: ref('colors'), variant: ref('variants'),
  selectedVariant: ref('variants'), gap: ref('spacing'), padding: ref('spacing'),
  shadow: ref('shadows'), density: ref('density'), textStyle: ref('typography.styles'),
};

const componentProps = {
  Button: ['size', 'radius', 'color', 'variant'],
  SplitButton: ['size', 'radius', 'color', 'variant'],
  IconButton: ['size', 'radius', 'color', 'variant'],
  ToggleGroup: ['size', 'radius', 'color', 'variant', 'selectedVariant'],
  Input: ['size', 'radius', 'color'],
  Textarea: ['size', 'radius', 'color'],
  NumberInput: ['size', 'radius', 'color'],
  Select: ['size', 'radius', 'color'],
  Combobox: ['size', 'radius', 'color'],
  DatePicker: ['size', 'radius', 'color', 'variant'],
  Checkbox: ['size', 'color'], Radio: ['size', 'color'], Switch: ['size', 'color'],
  Slider: ['size', 'radius', 'color'],
  Badge: ['size', 'radius', 'color', 'variant'], Avatar: ['size', 'radius', 'color', 'variant'],
  AvatarGroup: ['size', 'radius', 'color', 'variant'],
  Alert: ['radius', 'color', 'variant', 'gap', 'padding', 'textStyle'],
  Card: ['radius', 'padding', 'shadow'], Popover: ['radius', 'padding'], HoverCard: ['radius', 'padding'],
  Dialog: ['radius', 'size'], Drawer: ['size'], CommandPalette: ['size', 'radius', 'color'],
  Menu: ['size'], Listbox: [], Tabs: ['size', 'color'],
  Pagination: ['size', 'radius', 'color', 'variant', 'selectedVariant'],
  Accordion: ['size', 'radius', 'color'], Table: ['density', 'radius'],
  AppLayout: ['padding'], NavSection: ['gap', 'textStyle'], Stack: ['gap'], Grid: ['gap'], Inline: ['gap'], Text: ['textStyle', 'color'],
  Label: ['textStyle', 'color', 'variant', 'size', 'radius'], Link: ['color'],
  Breadcrumb: ['textStyle', 'color'], Spinner: ['size', 'color'], Skeleton: ['size', 'radius'],
  Progress: ['size', 'color', 'radius'], EmptyState: ['color', 'gap', 'padding', 'textStyle'],
  Tooltip: ['radius', 'padding', 'textStyle'], Toast: ['radius', 'color', 'gap', 'padding', 'textStyle'],
} satisfies { [C in ComponentName]: ComponentTokenProps[C][] };

const components = Object.fromEntries(Object.entries(componentProps).map(([name, props]) => {
  const modal = name === 'Dialog' || name === 'Drawer';
  const fields: Record<string, Schema> = Object.fromEntries(props.map((prop) => [
    prop, optional(modal && prop === 'size' ? ref('modalSizes') : tokenRefs[prop]),
  ]));
  if (!modal && (props as string[]).includes('size')) {
    fields.allowedSizes = optional(array(ref('sizes')));
    fields.sizeOverrides = optional(map(object(Object.fromEntries(
      Object.entries(size.fields!).map(([key, field]) => [key, optional(field)]),
    ))));
    fields.sizeOverrides.ref = 'sizes';
  }
  if (Object.hasOwn(componentSlots, name)) {
    const parts = componentSlots[name as keyof typeof componentSlots] as Record<string, readonly string[]>;
    const slotRefs: Record<string, Schema> = {
      ...tokenRefs, radius: ref('radii'), borderWidth: ref('borders'),
      background: options('surface', 'tint', 'none'), border: options('solid', 'dashed', 'dotted', 'double', 'none'),
    };
    fields.slots = optional(object(Object.fromEntries(Object.entries(parts).map(([part, properties]) => [
      part, optional(object(Object.fromEntries(properties.map((property) => [property, optional(slotRefs[property])])))),
    ]))));
  }
  return [name, optional(object(fields))];
}));

/** All current config groups and optional settings supported by the playground. */
export const themeSchema = object({
  labels: object(Object.fromEntries(Object.entries(base.labels).map(([key, value]) => [
    key, typeof value === 'function' ? { kind: 'function', seed: value } : string,
  ]))),
  colors: map(object({ light: string, dark: string, on: optional(color), text: optional(color) }), Object.keys(base.colors)),
  neutrals: map(pair, Object.keys(base.neutrals)),
  sizes: map(size, Object.keys(base.sizes)),
  radii: { ...map(string, Object.keys(base.radii)), reserved: ['size'] },
  variants: map(object({
    background: options('fill', 'tint', 'none'), border: options('color', 'neutral', 'none'), text: options('on', 'color', 'neutral'),
  }), Object.keys(base.variants)),
  spacing: map(string, Object.keys(base.spacing)),
  shadows: map(string, Object.keys(base.shadows)),
  density: map(object({ paddingX: string, paddingY: string, fontSize: string }), Object.keys(base.density)),
  modalSizes: map(string, Object.keys(base.modalSizes)),
  widths: map(string, Object.keys(base.widths)),
  breakpoints: map(string, Object.keys(base.breakpoints)),
  typography: object({
    fontFaces: optional(array(object({
      family: string, src: union([string, array(string)], ['Single source', 'Multiple sources']),
      weight: optional(union([number, string], ['Single weight', 'Weight range'])),
      style: optional(options('normal', 'italic')), display: optional(options('auto', 'block', 'swap', 'fallback', 'optional')),
    }))),
    families: map(string),
    fonts: optional(object({ body: ref('typography.families'), heading: ref('typography.families'), mono: ref('typography.families') })),
    styles: map(object({
      family: ref('typography.families'), size: string,
      weight: { ...number, seed: base.typography.styles.body.weight },
      lineHeight: { ...number, seed: base.typography.styles.body.lineHeight }, letterSpacing: optional(string),
    }), Object.keys(base.typography.styles)),
    headings: object(Object.fromEntries(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((key) => [key, ref('typography.styles')]))),
    prose: optional(object({
      body: optional(ref('typography.styles')), code: optional(ref('typography.styles')),
      blockGap: optional(ref('spacing')), headingGap: optional(ref('spacing')), listIndent: optional(ref('spacing')),
    })),
  }),
  zIndex: map(number, Object.keys(base.zIndex)),
  motion: map(string, Object.keys(base.motion)),
  timing: map(number, Object.keys(base.timing)),
  borders: map(string, Object.keys(base.borders)),
  focusRing: object({ width: string, offset: string, color: ref('colors'), style: optional(options('solid', 'dashed', 'dotted', 'double')) }),
  defaults: object({
    size: tokenRefs.size, radius: tokenRefs.radius, color: tokenRefs.color, variant: tokenRefs.variant,
    textStyle: tokenRefs.textStyle, gap: tokenRefs.gap, padding: tokenRefs.padding, density: tokenRefs.density, errorColor: ref('colors'), labelStyle: ref('typography.styles'), helperStyle: ref('typography.styles'),
    floatingShadow: ref('shadows'), softVariant: ref('variants'), modalSize: ref('modalSizes'),
  }),
  components: optional(object(components)),
} satisfies { [K in keyof YarclShape]: Schema });

const labels: Record<string, string> = {
  bg: 'Background', sm: 'Small', md: 'Medium', lg: 'Large', xs: 'Extra small', xl: 'Extra large',
  sans: 'Sans serif', mono: 'Monospace', on: 'Foreground', text: 'Text color',
  radii: 'Corner radii', zIndex: 'Layer order', fontFaces: 'Font files', src: 'Sources',
  paddingX: 'Horizontal padding', paddingY: 'Vertical padding', fonts: 'Font roles', styles: 'Text styles',
  sizeOverrides: 'Size overrides', allowedSizes: 'Allowed sizes', prose: 'Rich text', components: 'Component settings',
  labels: 'Built-in text', slots: 'Part styles', borderWidth: 'Border width',
  h1: 'Heading level 1', h2: 'Heading level 2', h3: 'Heading level 3', h4: 'Heading level 4', h5: 'Heading level 5', h6: 'Heading level 6',
  fill: 'Filled', tint: 'Tinted', none: 'None', color: 'Semantic color', neutral: 'Neutral', size: 'Size',
};

/** Converts token names to human-readable form labels. */
export function label(key: string): string {
  return labels[key] ?? key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ').replace(/^./, (char) => char.toUpperCase());
}

/** Reads a nested config setting. */
export function at(value: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => isObject(current) ? current[key] : undefined, value);
}

/** Checks for a config object rather than an array or primitive. */
export function isObject(value: unknown): value is Record<string, Value> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Resolves enum values and token references for a field. */
export function fieldOptions(schema: Schema, theme: Value): string[] {
  const group = schema.ref ? at(theme, schema.ref) : undefined;
  return [...(isObject(group) ? Object.keys(group) : []), ...(schema.options ?? [])];
}

/** Creates a value when an optional setting or token is added. */
export function initialValue(schema: Schema, theme: Value): Value {
  if (schema.seed !== undefined) return typeof schema.seed === 'function' ? schema.seed : structuredClone(schema.seed);
  switch (schema.kind) {
    case 'string': return fieldOptions(schema, theme)[0] ?? '';
    case 'number': return 0;
    case 'function': throw new Error('A message formatter must have a configured default.');
    case 'array': return [];
    case 'map': return {};
    case 'union': return initialValue(schema.choices![0], theme);
    case 'object': return Object.fromEntries(Object.entries(schema.fields!).filter(([, field]) => !field.optional)
      .map(([key, field]) => [key, initialValue(field, theme)]));
  }
}

/** Finds the active format for a setting with multiple value types. */
export function choiceIndex(schema: Schema, value: Value): number {
  return schema.choices!.findIndex((choice) => choice.kind === 'object' ? isObject(value)
    : choice.kind === 'array' ? Array.isArray(value) : typeof value === choice.kind);
}

/** Exports a complete, standalone yarcl config file. */
export function serializeConfig(theme: unknown): string {
  if (isObject(theme) && isObject(theme.labels)) {
    const text: Record<string, Value> = {};
    for (const [key, value] of Object.entries(theme.labels)) {
      if (typeof value !== 'function') text[key] = value;
      else if (value !== defaults.labels[key as keyof typeof defaults.labels]) {
        throw new Error('Customize message formatters in your project config. The playground exports default formatters.');
      }
    }
    return `import { defineConfig } from '@yarcl/react/define';\nimport defaults from '@yarcl/react/defaults';\n\nconst values = ${JSON.stringify({ ...theme, labels: text }, null, 2)} as const;\n\nexport default defineConfig({\n  ...values,\n  labels: { ...defaults.labels, ...values.labels },\n});\n`;
  }
  return `import { defineConfig } from '@yarcl/react/define';\n\nexport default defineConfig(${JSON.stringify(theme, null, 2)});\n`;
}

/** Parses a config file or object literal without executing code. */
export function parseConfig(source: string): unknown {
  const catalog = source.trim().match(/^import\s*\{\s*defineConfig\s*\}\s*from\s*(['"])@yarcl\/react\/define\1\s*;?\s*import\s+defaults\s+from\s*(['"])@yarcl\/react\/defaults\2\s*;?\s*const\s+values\s*=\s*([\s\S]*?)\s*(?:as\s+const\s*)?;\s*export\s+default\s+defineConfig\s*\(\s*\{\s*\.\.\.values\s*,\s*labels\s*:\s*\{\s*\.\.\.defaults\.labels\s*,\s*\.\.\.values\.labels\s*,?\s*\}\s*,?\s*\}\s*\)\s*;?$/);
  if (catalog) {
    const values: unknown = JSON5.parse(catalog[3]);
    return isObject(values) && isObject(values.labels)
      ? { ...values, labels: { ...defaults.labels, ...values.labels } }
      : values;
  }
  const file = source.trim().match(/^import\s*\{\s*defineConfig\s*\}\s*from\s*(['"])@yarcl\/react\/define\1\s*;?\s*export\s+default\s+defineConfig\s*\(([\s\S]*)\)\s*;?$/);
  return JSON5.parse(file ? file[2] : source);
}

/** Validates the full schema, token references and keys required by the preview. */
export function checkTheme(value: unknown): string[] {
  const errors: string[] = [];
  function check(schema: Schema, current: unknown, path: string) {
    if (current === undefined && schema.optional) return;
    const name = path || 'Theme';
    if (schema.kind === 'union') {
      const index = choiceIndex(schema, current as Value);
      if (index < 0) errors.push(`${name} has an unsupported value.`);
      else check(schema.choices![index], current, path);
    } else if (schema.kind === 'object' || schema.kind === 'map') {
      if (!isObject(current)) { errors.push(`${name} must be an object.`); return; }
      if (schema.kind === 'object') {
        for (const [key, field] of Object.entries(schema.fields!)) check(field, current[key], path ? `${path}.${key}` : key);
        for (const key of Object.keys(current)) if (!Object.hasOwn(schema.fields!, key)) errors.push(`${name}.${key} is not a supported setting.`);
      } else {
        for (const key of schema.required ?? []) if (!Object.hasOwn(current, key)) errors.push(`${name}.${key} is required by the preview.`);
        for (const [key, entry] of Object.entries(current)) {
          if (!key || /\s/.test(key) || ['__proto__', 'prototype', 'constructor'].includes(key)) errors.push(`${name} has an invalid name.`);
          if (schema.reserved?.includes(key)) errors.push(`${name}.${key} is reserved.`);
          if (path === 'breakpoints' && !/^[a-zA-Z][\w-]*$/.test(key)) errors.push(`breakpoints.${key} must start with a letter and contain only letters, numbers, hyphens or underscores.`);
          if (schema.ref && !Object.hasOwn(at(value, schema.ref) ?? {}, key)) errors.push(`${name}.${key} must reference ${schema.ref}.`);
          check(schema.item!, entry, `${path}.${key}`);
        }
      }
    } else if (schema.kind === 'array') {
      if (!Array.isArray(current)) errors.push(`${name} must be a list.`);
      else current.forEach((entry, index) => check(schema.item!, entry, `${path}.${index}`));
    } else if (typeof current !== schema.kind || (typeof current === 'number' && !Number.isFinite(current))) {
      errors.push(`${name} must be a ${schema.kind}.`);
    } else if (schema.ref || schema.options) {
      if (!fieldOptions(schema, value as Value).includes(current as string)) errors.push(`${name} must reference an available option.`);
    }
  }
  check(themeSchema, value, '');
  if (errors.length) return errors;
  const theme = value as YarclShape;
  for (const [name, component] of Object.entries(theme.components ?? {})) {
    const sizing = component as { size?: string; allowedSizes?: string[]; sizeOverrides?: Record<string, unknown> };
    if (sizing.allowedSizes) {
      if (!sizing.allowedSizes.length) errors.push(`components.${name}.allowedSizes must contain at least one size.`);
      if (!sizing.allowedSizes.includes(sizing.size ?? theme.defaults.size)) errors.push(`components.${name}.size must be one of its allowed sizes.`);
      for (const key of Object.keys(sizing.sizeOverrides ?? {})) {
        if (!sizing.allowedSizes.includes(key)) errors.push(`components.${name}.sizeOverrides.${key} is not an allowed size.`);
      }
    }
  }
  if (!errors.length) {
    try { generateCss(theme); }
    catch (error) { errors.push((error as Error).message); }
  }
  return errors;
}
