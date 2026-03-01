import { Button } from 'yarcl';
import { yarcl } from '../yarcl.config';
import type { ButtonProps } from 'yarcl';
import { label, Row } from './shared';

const sizes = Object.keys(yarcl.button.sizes) as ButtonProps['size'][];
const radii = Object.keys(yarcl.button.radii) as ButtonProps['radius'][];
const colors = Object.keys(yarcl.colors) as ButtonProps['color'][];

export function ButtonDemo() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2>Design system — Button</h2>

      {label('Sizes')}
      <Row>{sizes.map((size) => <Button key={size} size={size}>{size}</Button>)}</Row>

      {label('Radii')}
      <Row>{radii.map((radius) => <Button key={radius} radius={radius}>{radius}</Button>)}</Row>

      {label('Colors')}
      <Row>{colors.map((color) => <Button key={color} color={color}>{color}</Button>)}</Row>
    </section>
  );
}
