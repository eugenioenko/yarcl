import { contrast, parseHex, readableOn } from './color.ts';
import type { ColorPair, ColorToken, FontFaceToken, VariantToken, YarclShape } from './define.ts';

const MIN_CONTRAST = 4.5;

function ident(key: string): string {
  return key.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);
}

function pair({ light, dark }: ColorPair): string {
  return light === dark ? light : `light-dark(${light}, ${dark})`;
}

function foreground(name: string, token: ColorToken, warn: (message: string) => void): string {
  const modes = ['light', 'dark'] as const;
  const on = typeof token.on === 'string' ? { light: token.on, dark: token.on } : token.on;

  const resolved = modes.map((mode) => {
    const bg = parseHex(token[mode]);
    if (on) {
      const fg = parseHex(on[mode]);
      if (bg && fg && contrast(bg, fg) < MIN_CONTRAST) {
        warn(`colors.${name}: ${mode} foreground contrast ${contrast(bg, fg).toFixed(2)}:1 is below ${MIN_CONTRAST}:1`);
      }
      return on[mode];
    }
    if (!bg) {
      warn(`colors.${name}: cannot compute a ${mode} foreground from "${token[mode]}"; use a hex value or set \`on\``);
      return '#ffffff';
    }
    const fg = readableOn(bg);
    const ratio = contrast(bg, parseHex(fg)!);
    if (ratio < MIN_CONTRAST) {
      warn(`colors.${name}: best ${mode} foreground contrast is ${ratio.toFixed(2)}:1, below ${MIN_CONTRAST}:1`);
    }
    return fg;
  });

  return pair({ light: resolved[0], dark: resolved[1] });
}

const tint = (percent: number) => `color-mix(in oklab, var(--yarcl-c) ${percent}%, transparent)`;
const shade = (percent: number) => `color-mix(in oklab, var(--yarcl-c), var(--yarcl-c-on) ${percent}%)`;

const backgrounds: Record<VariantToken['background'], [string, string, string]> = {
  fill: ['var(--yarcl-c)', shade(12), shade(20)],
  tint: [tint(14), tint(22), tint(30)],
  none: ['transparent', tint(10), tint(18)],
};

const borders: Record<VariantToken['border'], string> = {
  color: 'var(--yarcl-c)',
  neutral: 'var(--yarcl-neutral-border)',
  none: 'transparent',
};

const texts: Record<VariantToken['text'], string> = {
  on: 'var(--yarcl-c-on)',
  color: 'var(--yarcl-c)',
  neutral: 'var(--yarcl-neutral-text)',
};

const formats: Record<string, string> = { woff2: 'woff2', woff: 'woff', ttf: 'truetype', otf: 'opentype' };

function fontFace(face: FontFaceToken): string {
  const sources = (Array.isArray(face.src) ? face.src : [face.src]).map((src) => {
    if (src.startsWith('local(')) return src;
    const format = formats[src.split(/[?#]/)[0].split('.').pop()?.toLowerCase() ?? ''];
    return `url(${JSON.stringify(src)})${format ? ` format("${format}")` : ''}`;
  });
  return rule('@font-face', [
    ['font-family', JSON.stringify(face.family)],
    ['src', sources.join(', ')],
    ...(face.weight != null ? [['font-weight', face.weight] as [string, string | number]] : []),
    ...(face.style ? [['font-style', face.style] as [string, string]] : []),
    ['font-display', face.display ?? 'swap'],
  ]);
}

function rule(selector: string, declarations: [string, string | number][]): string {
  return `${selector} {\n${declarations.map(([p, v]) => `  ${p}: ${v};`).join('\n')}\n}`;
}

export function generateCss(config: YarclShape, warn: (message: string) => void = () => {}): string {
  const root: [string, string | number][] = [['color-scheme', 'light dark']];
  const rules: string[] = [];

  for (const [key, token] of Object.entries(config.colors)) {
    const k = ident(key);
    root.push([`--yarcl-color-${k}`, pair(token)], [`--yarcl-color-${k}-on`, foreground(key, token, warn)]);
    rules.push(
      rule(`.yarcl-color-${k}`, [
        ['--yarcl-c', `var(--yarcl-color-${k})`],
        ['--yarcl-c-on', `var(--yarcl-color-${k}-on)`],
      ]),
    );
  }

  for (const [key, value] of Object.entries(config.neutrals)) root.push([`--yarcl-neutral-${ident(key)}`, pair(value)]);

  for (const [key, size] of Object.entries(config.sizes)) {
    const k = ident(key);
    root.push(
      [`--yarcl-size-${k}-height`, size.height],
      [`--yarcl-size-${k}-padding-x`, size.paddingX],
      [`--yarcl-size-${k}-font-size`, size.fontSize],
      [`--yarcl-size-${k}-icon-size`, size.iconSize],
    );
    rules.push(
      rule(`.yarcl-size-${k}`, [
        ['--yarcl-h', `var(--yarcl-size-${k}-height)`],
        ['--yarcl-px', `var(--yarcl-size-${k}-padding-x)`],
        ['--yarcl-fs', `var(--yarcl-size-${k}-font-size)`],
        ['--yarcl-icon', `var(--yarcl-size-${k}-icon-size)`],
      ]),
    );
  }

  for (const [key, value] of Object.entries(config.radii)) {
    const k = ident(key);
    root.push([`--yarcl-radius-${k}`, value]);
    rules.push(rule(`.yarcl-radius-${k}`, [['--yarcl-r', `var(--yarcl-radius-${k})`]]));
  }

  for (const [key, variant] of Object.entries(config.variants)) {
    const [bg, hover, active] = backgrounds[variant.background];
    rules.push(
      rule(`.yarcl-variant-${ident(key)}`, [
        ['--yarcl-v-bg', bg],
        ['--yarcl-v-bg-hover', hover],
        ['--yarcl-v-bg-active', active],
        ['--yarcl-v-border', borders[variant.border]],
        ['--yarcl-v-fg', texts[variant.text]],
      ]),
    );
  }

  for (const [key, value] of Object.entries(config.spacing)) {
    const k = ident(key);
    root.push([`--yarcl-space-${k}`, value]);
    rules.push(
      rule(`.yarcl-gap-${k}`, [['gap', `var(--yarcl-space-${k})`]]),
      rule(`.yarcl-padding-${k}`, [['padding', `var(--yarcl-space-${k})`]]),
    );
  }

  for (const [key, value] of Object.entries(config.shadows)) {
    const k = ident(key);
    root.push([`--yarcl-shadow-${k}`, value]);
    rules.push(rule(`.yarcl-shadow-${k}`, [['box-shadow', `var(--yarcl-shadow-${k})`]]));
  }
  for (const [key, density] of Object.entries(config.density)) {
    rules.push(
      rule(`.yarcl-density-${ident(key)}`, [
        ['--yarcl-cell-px', density.paddingX],
        ['--yarcl-cell-py', density.paddingY],
        ['--yarcl-cell-fs', density.fontSize],
      ]),
    );
  }

  for (const [key, value] of Object.entries(config.typography.families)) root.push([`--yarcl-font-${ident(key)}`, value]);

  for (const [key, style] of Object.entries(config.typography.styles)) {
    rules.push(
      rule(`.yarcl-type-${ident(key)}`, [
        ['font-family', `var(--yarcl-font-${ident(style.family)})`],
        ['font-size', style.size],
        ['font-weight', style.weight],
        ['line-height', style.lineHeight],
        ...(style.letterSpacing ? [['letter-spacing', style.letterSpacing] as [string, string]] : []),
      ]),
    );
  }

  for (const [key, value] of Object.entries(config.zIndex)) root.push([`--yarcl-z-${ident(key)}`, value]);
  for (const [key, value] of Object.entries(config.motion)) root.push([`--yarcl-motion-${ident(key)}`, value]);
  for (const [key, value] of Object.entries(config.borders)) root.push([`--yarcl-border-${ident(key)}`, value]);

  root.push(
    ['--yarcl-focus-width', config.focusRing.width],
    ['--yarcl-focus-offset', config.focusRing.offset],
    ['--yarcl-focus-color', `var(--yarcl-color-${ident(config.focusRing.color)})`],
    ['--yarcl-error', `var(--yarcl-color-${ident(config.defaults.errorColor)})`],
    ['--yarcl-floating-shadow', `var(--yarcl-shadow-${ident(config.defaults.floatingShadow)})`],
    ['--yarcl-padding', `var(--yarcl-space-${ident(config.defaults.padding)})`],
    ['--yarcl-gap', `var(--yarcl-space-${ident(config.defaults.gap)})`],
  );

  const faces = (config.typography.fontFaces ?? []).map(fontFace);
  return [...faces, rule(':root', root), ...rules].join('\n\n') + '\n';
}
