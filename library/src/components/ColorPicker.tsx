import { useCallback, useContext, useEffect, useId, useRef, useState, type ComponentProps } from 'react';
import { useMergeRefs } from '@floating-ui/react';
import { colorClass, cx, radiusClass, sizeClass } from '../classes';
import { FieldContext, useFieldProps } from '../field-context';
import { useControllable, useFormReset } from '../hooks';
import { useDefaults, useLabels } from '../runtime';
import type { TokenProps } from '../types';

/** An opaque sRGB hex color. Three or six hex digits are validated at runtime and normalized to six lowercase digits. */
export type ColorPickerValue = `#${string}`;

/** A named color suggestion for {@link ColorPicker}. */
export interface ColorPickerPreset {
  /** Opaque hex color represented by this preset. */
  value: ColorPickerValue;
  /** Visible and accessible name, independent of the swatch's color. */
  label: string;
  /** Prevents choosing this preset. */
  disabled?: boolean;
}

/** Native input attributes and token props for {@link ColorPicker}. Refs target the hex input; className and style target the outer control. Name targets the submitted accepted color. */
export interface ColorPickerBaseProps extends Omit<ComponentProps<'input'>, 'color' | 'size' | 'type' | 'value' | 'defaultValue' | 'onChange' | 'children' | 'pattern' | 'maxLength' | 'alpha' | 'colorSpace'>, TokenProps<'ColorPicker'> {
  /** Controlled color. The preview waits for the parent to accept changes. */
  value?: ColorPickerValue;
  /** Initial uncontrolled color. Required when value is omitted. */
  defaultValue?: ColorPickerValue;
  /** Reports normalized colors chosen by the native picker, a preset, or hex text committed with Enter or blur. */
  onValueChange?: (value: ColorPickerValue) => void;
  /** Optional named suggestions. These are application data, independent of design tokens. */
  presets?: readonly ColorPickerPreset[];
  /** Accessible name of the native color chooser. @default config.labels.chooseColor */
  pickerLabel?: string;
  /** Accessible name of the preset group. @default config.labels.colorPresets */
  presetsLabel?: string;
}

/** Props for {@link ColorPicker}. Supply an initial or controlled color, and a Field label or native accessible name. */
export type ColorPickerProps = ColorPickerBaseProps & ({ value: ColorPickerValue } | { defaultValue: ColorPickerValue });

function parse(text: string): ColorPickerValue | undefined {
  const hex = text.trim().toLowerCase();
  if (/^#[\da-f]{6}$/.test(hex)) return hex as ColorPickerValue;
  if (/^#[\da-f]{3}$/.test(hex)) return `#${[...hex.slice(1)].map((digit) => digit + digit).join('')}`;
}

function normalize(value: ColorPickerValue | undefined): ColorPickerValue {
  const normalized = typeof value === 'string' ? parse(value) : undefined;
  if (!normalized) throw new Error('yarcl: ColorPicker requires an opaque hex color with three or six digits');
  return normalized;
}

/**
 * Edits an opaque hex color with a native chooser, keyboard text entry and optional named presets.
 * Enter or blur commits valid text; invalid text and Escape restore the accepted color.
 * The first Enter commits a draft without submitting a form. Native form reset restores uncontrolled defaults.
 * @example
 * ```tsx
 * <Field label="Highlight color"><ColorPicker defaultValue="#4f46e5" name="highlight" /></Field>
 * ```
 */
export function ColorPicker(props: ColorPickerProps) {
  const own = useDefaults('ColorPicker');
  const labels = useLabels();
  const field = useContext(FieldContext);
  const uid = useId();
  const { value: valueProp, defaultValue, onValueChange, presets, pickerLabel = labels.chooseColor, presetsLabel = labels.colorPresets, size, radius, color, className, style, hidden, dir, ref, id = uid, name, disabled, readOnly, onBlur, onKeyDown, 'aria-invalid': ariaInvalid, ...rest } = useFieldProps(props);
  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergeRefs([inputRef, ref]);
  const [value, setValue] = useControllable(valueProp === undefined ? undefined : normalize(valueProp), normalize(defaultValue ?? valueProp), onValueChange, inputRef);
  const [draft, setDraft] = useState<string | null>(null);
  const resetDraft = useCallback(() => setDraft(null), []);
  useFormReset(inputRef, resetDraft);
  const locked = disabled || readOnly;
  useEffect(() => { if (locked) resetDraft(); }, [locked, resetDraft]);
  const invalid = !locked && draft !== null && !parse(draft);
  const suggestions = presets?.map((preset) => ({ ...preset, value: normalize(preset.value) }));
  const labelledBy = rest['aria-labelledby'] ?? (rest['aria-label'] === undefined ? field?.labelId : undefined);

  function update(next: ColorPickerValue) {
    setDraft(null);
    if (!locked && next !== value) setValue(next);
  }

  function commit() {
    if (draft !== null) update(parse(draft) ?? value);
  }

  return <div className={cx('yarcl-color-picker', sizeClass(size ?? own.size, 'ColorPicker'), radiusClass(radius ?? own.radius, size ?? own.size), colorClass(color ?? own.color), className)} style={style} hidden={hidden} dir={dir} data-disabled={disabled || undefined} data-readonly={readOnly || undefined}>
    <div className="yarcl-color-picker-control">
      <span id={`${uid}-choose`} className="yarcl-visually-hidden">{pickerLabel}</span>
      <input type="color" className="yarcl-color-picker-native" value={value} disabled={locked} form={rest.form} aria-label={!labelledBy ? cx(rest['aria-label'], pickerLabel) : undefined} aria-labelledby={labelledBy ? `${labelledBy} ${uid}-choose` : undefined} aria-describedby={rest['aria-describedby']} aria-controls={id} onChange={(event) => update(normalize(event.currentTarget.value as ColorPickerValue))} />
      <input {...rest} id={id} ref={mergedRef} dir={dir} type="text" className="yarcl-input yarcl-color-picker-hex" value={locked ? value : draft ?? value} disabled={disabled} readOnly={readOnly} autoComplete={rest.autoComplete ?? 'off'} spellCheck={false} pattern="\s*#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\s*" aria-invalid={invalid || ariaInvalid || undefined}
        onChange={(event) => { if (!locked) setDraft(event.currentTarget.value); }}
        onBlur={(event) => { onBlur?.(event); if (!event.defaultPrevented) commit(); }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || locked || draft === null) return;
          if (event.key === 'Enter') { event.preventDefault(); commit(); }
          else if (event.key === 'Escape') { event.preventDefault(); setDraft(null); }
        }} />
    </div>
    {name != null && <input type="hidden" name={name} value={value} disabled={disabled} form={rest.form} />}
    {!!suggestions?.length && <div className="yarcl-color-picker-presets" role="group" aria-label={presetsLabel}>
      {suggestions.map((preset, index) => <button key={index} type="button" className="yarcl-color-picker-preset" disabled={locked || preset.disabled} aria-pressed={preset.value === value} aria-controls={id} onClick={() => update(preset.value)}><span className="yarcl-color-picker-swatch" style={{ backgroundColor: preset.value }} aria-hidden="true" /><span>{preset.label}</span></button>)}
    </div>}
  </div>;
}
