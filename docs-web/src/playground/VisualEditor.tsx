import { useId, useState } from 'react';
import { Button, Input, Text } from '@yarcl/react';
import { choiceIndex, fieldOptions, initialValue, isObject, label, themeSchema, type Schema, type Value } from './theme-config';

type FieldProps = {
  name: string;
  schema: Schema;
  value: Value | undefined;
  theme: Value;
  onChange: (value: Value | undefined) => void;
  removable?: boolean;
};

function AddEntry({ schema, value, theme, onAdd }: {
  schema: Schema; value: Record<string, Value>; theme: Value; onAdd: (key: string) => void;
}) {
  const [name, setName] = useState('');
  const id = useId();
  const available = fieldOptions(schema, theme).filter((key) => !Object.hasOwn(value, key));
  const valid = Boolean(name) && !/\s/.test(name) && !['__proto__', 'prototype', 'constructor', ...(schema.reserved ?? [])].includes(name)
    && !Object.hasOwn(value, name) && (!schema.ref || available.includes(name));
  return (
    <div className="pg-add-entry">
      <label htmlFor={id}>{schema.ref ? 'Size to override' : 'New token name'}</label>
      <div className="pg-editor-row">
        {schema.ref ? (
          <select id={id} className="yarcl-input" value={name} onChange={(event) => setName(event.target.value)}>
            <option value="">Choose a size</option>
            {available.map((key) => <option key={key} value={key}>{label(key)}</option>)}
          </select>
        ) : <Input id={id} value={name} onChange={(event) => setName(event.target.value)} />}
        <Button size="sm" variant="outline" disabled={!valid} onClick={() => { onAdd(name); setName(''); }}>Add</Button>
      </div>
    </div>
  );
}

function ThemeField({ name, schema, value, theme, onChange, removable }: FieldProps) {
  const id = useId();
  const title = label(name);
  const remove = removable || schema.optional;
  const removeButton = remove && (
    <Button size="sm" variant="ghost" color="neutral" aria-label={`Remove ${title}`} onClick={(event) => {
      event.preventDefault();
      onChange(undefined);
    }}>Remove</Button>
  );

  if (value === undefined) {
    return <Button size="sm" variant="outline" color="neutral" onClick={() => onChange(initialValue(schema, theme))}>Add {title}</Button>;
  }

  if (schema.kind === 'union') {
    const index = choiceIndex(schema, value);
    if (index < 0) return <Text color="danger">Correct {title} in the Code Editor.</Text>;
    return (
      <fieldset className="pg-editor-group">
        <legend>{title}</legend>
        <div className="pg-editor-row">
          <label htmlFor={id}>Value format</label>
          <select id={id} className="yarcl-input" value={index} onChange={(event) => onChange(initialValue(schema.choices![Number(event.target.value)], theme))}>
            {schema.labels!.map((text, i) => <option key={text} value={i}>{text}</option>)}
          </select>
          {removeButton}
        </div>
        <ThemeField name={name} schema={schema.choices![index]} value={value} theme={theme} onChange={onChange} />
      </fieldset>
    );
  }

  if (schema.kind === 'object' || schema.kind === 'map' || schema.kind === 'array') {
    const list = schema.kind === 'array';
    if (list ? !Array.isArray(value) : !isObject(value)) return <Text color="danger">Correct {title} in the Code Editor.</Text>;
    const entries: [string, Schema, Value | undefined][] = schema.kind === 'object'
      ? Object.entries(schema.fields!).map(([key, field]) => [key, field, (value as Record<string, Value>)[key]])
      : Object.entries(value).map(([key, entry]) => [key, schema.item!, entry]);
    function change(key: string, next: Value | undefined) {
      if (Array.isArray(value)) {
        onChange(next === undefined ? value.filter((_, i) => i !== Number(key)) : value.map((entry, i) => i === Number(key) ? next : entry));
      } else {
        const updated = { ...(value as Record<string, Value>) };
        if (next === undefined) delete updated[key];
        else updated[key] = next;
        onChange(updated);
      }
    }
    return (
      <details className="pg-editor-section">
        <summary><span>{title}</span></summary>
        <div className="pg-editor-fields">
          {removeButton}
          {entries.map(([key, field, entry]) => (
            <ThemeField key={key} name={list ? `${name === 'fontFaces' ? 'Font file' : name === 'allowedSizes' ? 'Allowed size' : 'Source'} ${Number(key) + 1}` : key} schema={field} value={entry} theme={theme}
              onChange={(next) => change(key, next)} removable={schema.kind !== 'object' && !schema.required?.includes(key)} />
          ))}
          {schema.kind === 'map' && (
            <AddEntry schema={schema} value={value as Record<string, Value>} theme={theme}
              onAdd={(key) => change(key, initialValue(schema.item!, theme))} />
          )}
          {list && <Button size="sm" variant="outline" onClick={() => onChange([...(value as Value[]), initialValue(schema.item!, theme)])}>Add item</Button>}
        </div>
      </details>
    );
  }

  const choices = fieldOptions(schema, theme);
  const isColor = name === 'light' || name === 'dark' || name === 'on' || name === 'text';
  return (
    <div className="pg-editor-field">
      <label htmlFor={id}>{title}</label>
      <div className="pg-editor-row">
        {schema.ref || schema.options ? (
          <select id={id} className="yarcl-input" value={String(value)} onChange={(event) => onChange(event.target.value)}>
            {!choices.includes(String(value)) && <option value={String(value)}>{label(String(value))} (unavailable)</option>}
            {choices.map((key) => <option key={key} value={key}>{key === 'size' && schema.ref === 'radii' ? 'Match control size' : label(key)}</option>)}
          </select>
        ) : (
          <>
            {isColor && typeof value === 'string' && /^#[\da-f]{6}$/i.test(value) && (
              <input type="color" aria-label={`${title} color picker`} value={value} onChange={(event) => onChange(event.target.value)} />
            )}
            <Input id={id} type={schema.kind === 'number' ? 'number' : 'text'} step={schema.kind === 'number' ? 'any' : undefined}
              value={String(value)} onChange={(event) => onChange(schema.kind === 'number' && event.target.value !== '' ? Number(event.target.value) : event.target.value)} />
          </>
        )}
        {removeButton}
      </div>
    </div>
  );
}

/** Forms for every supported design system setting, including optional settings. */
export function VisualEditor({ value, onChange }: { value: Value; onChange: (value: Value) => void }) {
  if (!isObject(value)) return <Text color="danger">The config must be an object. Correct it in the Code Editor.</Text>;
  return (
    <div className="pg-visual-editor">
      {Object.entries(themeSchema.fields!).map(([key, schema]) => (
        <ThemeField key={key} name={key} schema={schema} value={value[key]} theme={value} onChange={(next) => {
          const updated = { ...value };
          if (next === undefined) delete updated[key];
          else updated[key] = next;
          onChange(updated);
        }} />
      ))}
    </div>
  );
}
