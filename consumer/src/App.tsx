import { Button, Input, config, type Color, type Radius, type Size } from 'yarcl';

const sizes = Object.keys(config.sizes) as Size[];
const radii = Object.keys(config.radii) as Radius[];
const colors = Object.keys(config.colors) as Color[];

export function App() {
  return (
    <main>
      <h1>yarcl</h1>

      <section>
        <h2>Sizes</h2>
        {sizes.map((size) => (
          <div className="row" key={size}>
            <code>{size}</code>
            <Input size={size} placeholder={`Input ${size}`} />
            <Button size={size}>Button {size}</Button>
          </div>
        ))}
      </section>

      <section>
        <h2>Colors</h2>
        {colors.map((color) => (
          <div className="row" key={color}>
            <code>{color}</code>
            <Input color={color} placeholder="Focus me" />
            <Button color={color}>{color}</Button>
            <Button color={color} disabled>
              disabled
            </Button>
          </div>
        ))}
      </section>

      <section>
        <h2>Radii</h2>
        {radii.map((radius) => (
          <div className="row" key={radius}>
            <code>{radius}</code>
            <Input radius={radius} placeholder={radius} />
            <Button radius={radius}>{radius}</Button>
          </div>
        ))}
      </section>
    </main>
  );
}
