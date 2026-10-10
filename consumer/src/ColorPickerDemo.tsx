import { useState } from 'react';
import { Button, ColorPicker, Field, Heading, Inline, Stack, Switch, Text, type ColorPickerPreset, type ColorPickerValue } from '@yarcl/react';

const presets = [
  { value: '#4f46e5', label: 'Violet' },
  { value: '#15803d', label: 'Forest' },
  { value: '#b45309', label: 'Amber' },
] as const satisfies readonly ColorPickerPreset[];

/** A controlled highlight color with keyboard editing, named suggestions and native form submission. */
export function ColorPickerDemo() {
  const [value, setValue] = useState<ColorPickerValue>('#4f46e5');
  const [readOnly, setReadOnly] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  return <Stack as="section">
    <Heading level={2}>Highlight color</Heading>
    <Text>Choose a suggestion, use the color chooser, or enter a hex color and press Enter.</Text>
    <Switch checked={readOnly} onChange={(event) => setReadOnly(event.currentTarget.checked)}>Read-only color</Switch>
    <form onSubmit={(event) => { event.preventDefault(); setSubmitted(String(new FormData(event.currentTarget).get('highlight'))); }}><Stack>
      <Field label="Highlight" description="Use three or six hex digits, starting with #.">
        <ColorPicker name="highlight" value={value} onValueChange={setValue} presets={presets} readOnly={readOnly} />
      </Field>
      <Inline><Button type="submit">Save highlight</Button><Button onClick={() => { setValue('#4f46e5'); setSubmitted(null); }}>Restore original</Button></Inline>
      <Text role="status">{submitted === null ? `Selected color: ${value}` : `Saved color: ${submitted}`}</Text>
    </Stack></form>
  </Stack>;
}
