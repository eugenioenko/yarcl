import { useState } from 'react';
import { Button, Input, config, type Color, type Radius, type Size, type TextStyle } from 'yarcl';

const sizes = Object.keys(config.sizes) as Size[];
const radii = Object.keys(config.radii) as Radius[];
const colors = Object.keys(config.colors) as Color[];
const textStyles = Object.keys(config.typography.styles) as TextStyle[];

type Scheme = 'light dark' | 'light' | 'dark';

function initialScheme(): Scheme {
  const param = new URLSearchParams(location.search).get('scheme');
  return param === 'light' || param === 'dark' ? param : 'light dark';
}

export function App() {
  const [scheme, setScheme] = useState<Scheme>(() => {
    const s = initialScheme();
    document.documentElement.style.colorScheme = s;
    return s;
  });

  function applyScheme(next: Scheme) {
    document.documentElement.style.colorScheme = next;
    setScheme(next);
  }

  return (
    <main>
      <header className="row">
        <h1 className="yarcl-type-display">yarcl</h1>
        <div className="row">
          {(['light dark', 'light', 'dark'] as Scheme[]).map((s) => (
            <Button key={s} size="sm" color={scheme === s ? 'brand' : 'neutral'} onClick={() => applyScheme(s)}>
              {s === 'light dark' ? 'system' : s}
            </Button>
          ))}
        </div>
      </header>

      <section>
        <h2 className="yarcl-type-title">Sizes</h2>
        {sizes.map((size) => (
          <div className="row" key={size}>
            <code className="label">{size}</code>
            <Input size={size} placeholder={`Input ${size}`} />
            <Button size={size}>Button {size}</Button>
          </div>
        ))}
      </section>

      <section>
        <h2 className="yarcl-type-title">Colors</h2>
        {colors.map((color) => (
          <div className="row" key={color}>
            <code className="label">{color}</code>
            <Input color={color} placeholder="Focus me" />
            <Button color={color}>{color}</Button>
            <Button color={color} disabled>
              disabled
            </Button>
          </div>
        ))}
      </section>

      <section>
        <h2 className="yarcl-type-title">Radii</h2>
        {radii.map((radius) => (
          <div className="row" key={radius}>
            <code className="label">{radius}</code>
            <Input radius={radius} placeholder={radius} />
            <Button radius={radius}>{radius}</Button>
          </div>
        ))}
      </section>

      <section>
        <h2 className="yarcl-type-title">Text styles</h2>
        {textStyles.map((style) => (
          <div className="row" key={style}>
            <code className="label">{style}</code>
            <span className={`yarcl-type-${style}`}>The quick brown fox</span>
          </div>
        ))}
      </section>
    </main>
  );
}
