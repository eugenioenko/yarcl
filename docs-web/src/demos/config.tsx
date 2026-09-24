import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  IconButton,
  Inline,
  Input,
  Select,
  Stack,
  Switch,
  Text,
  ToggleGroup,
  config,
  type Color,
  type Size,
  type TextStyle,
  type Variant,
} from '@yarcl/react';
import { PlusIcon } from './icons';

const sizes = Object.keys(config.sizes) as Size[];
const colors = Object.keys(config.colors) as Color[];
const variants = Object.keys(config.variants) as Variant[];
const styles = Object.keys(config.typography.styles) as TextStyle[];

export function SizeScaleDemo() {
  return (
    <Stack>
      {sizes.map((size) => (
        <Inline key={size}>
          <Text textStyle="code" className="demo-label">
            {size}
          </Text>
          <Input size={size} placeholder="Input" aria-label={`Input ${size}`} />
          <Select size={size} aria-label={`Select ${size}`} options={[{ value: 'a', label: 'Select' }]} defaultValue="a" />
          <Button size={size}>Button</Button>
          <IconButton size={size} aria-label="Add">
            <PlusIcon />
          </IconButton>
          <Checkbox size={size} defaultChecked>
            Check
          </Checkbox>
          <Switch size={size} defaultChecked aria-label="Switch" />
        </Inline>
      ))}
    </Stack>
  );
}

export function VariantGridDemo() {
  return (
    <Stack>
      {variants.map((variant) => (
        <Inline key={variant}>
          <Text textStyle="code" className="demo-label">
            {variant}
          </Text>
          {colors.map((color) => (
            <Button key={color} variant={variant} color={color} size="sm">
              {color}
            </Button>
          ))}
          <Badge variant={variant}>badge</Badge>
        </Inline>
      ))}
    </Stack>
  );
}

export function ColorsDemo() {
  return (
    <Inline>
      {colors.map((color) => (
        <Stack key={color} gap="xs" align="center">
          <div className={`demo-swatch yarcl-color-${color}`}>Aa</div>
          <Text textStyle="caption">{color}</Text>
        </Stack>
      ))}
    </Inline>
  );
}

export function SchemeDemo() {
  const [scheme, setScheme] = useState<string | null>('dark');
  return (
    <Stack>
      <ToggleGroup type="single" required value={scheme} onValueChange={setScheme} aria-label="Color scheme of the card" size="sm">
        <ToggleGroup.Item value="light">light</ToggleGroup.Item>
        <ToggleGroup.Item value="dark">dark</ToggleGroup.Item>
      </ToggleGroup>
      <div style={{ colorScheme: scheme ?? 'normal' }}>
        <Card shadow="md">
          <Stack gap="sm">
            <Text textStyle="subheading">Only this card is {scheme}</Text>
            <Text as="p" muted>
              Every color is a <code>light-dark()</code> pair, so setting <code>color-scheme</code> on an element switches
              everything inside it.
            </Text>
            <Inline gap="sm">
              <Button size="sm">Primary</Button>
              <Button size="sm" variant="outline" color="neutral">
                Neutral
              </Button>
              <Badge color="success">Active</Badge>
            </Inline>
          </Stack>
        </Card>
      </div>
    </Stack>
  );
}

export function TextStylesDemo() {
  return (
    <Stack gap="sm">
      {styles.map((style) => (
        <Inline key={style}>
          <Text textStyle="code" className="demo-label">
            {style}
          </Text>
          <Text textStyle={style}>The quick brown fox</Text>
        </Inline>
      ))}
    </Stack>
  );
}
