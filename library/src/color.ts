type Rgb = [number, number, number];

export function parseHex(value: string): Rgb | null {
  const hex = value.trim().replace(/^#/, '');
  if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return null;
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as Rgb;
}

function luminance([r, g, b]: Rgb): number {
  const [lr, lg, lb] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

export function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const WHITE: Rgb = [255, 255, 255];
const BLACK: Rgb = [0, 0, 0];

export function mix(a: Rgb, b: Rgb, amount: number): Rgb {
  return a.map((channel, i) => Math.round(channel + (b[i] - channel) * amount)) as Rgb;
}

export function toHex(rgb: Rgb): string {
  return `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * The color, mixed toward `toward` in small steps until it reaches `min` contrast
 * against every background. Returns the color unchanged when it already passes.
 */
export function readableText(color: Rgb, backgrounds: Rgb[], toward: Rgb, min: number): Rgb {
  for (let step = 0; step <= 20; step++) {
    const candidate = mix(color, toward, step / 20);
    if (backgrounds.every((bg) => contrast(candidate, bg) >= min)) return candidate;
  }
  return toward;
}

export function readableOn(background: Rgb): string {
  return contrast(background, WHITE) >= contrast(background, BLACK) ? '#ffffff' : '#000000';
}
