import type { DensityToken, SizeToken, TextStyleToken, YarclShape } from './define';

const prefixes = {
  colors: 'color', neutrals: 'neutral', radii: 'radius', spacing: 'space',
  shadows: 'shadow', modalSizes: 'modal', widths: 'width', zIndex: 'z',
  motion: 'motion', borders: 'border', sizes: 'size', density: 'density',
  families: 'font-family', textStyles: 'text',
} as const;

/** Config groups whose values can be referenced by a recipe. */
export type TokenGroup = keyof typeof prefixes;

/** A serializable CSS variable reference, rather than a concrete token value. */
export interface TokenReference<G extends TokenGroup = TokenGroup> {
  readonly __yarclToken: G;
  readonly key: string;
  readonly field?: string;
}

type References<T, G extends TokenGroup> = { readonly [K in keyof T]: TokenReference<G> };
type StructuredField<G> = G extends 'sizes' ? keyof SizeToken : G extends 'density' ? keyof DensityToken : keyof TextStyleToken;
type Fields<T, G extends TokenGroup> = {
  readonly [K in keyof T]: { readonly [F in StructuredField<G>]: TokenReference<G> };
};

/** Autocompleting references to the exact keys in a config. */
export type TokenAccessor<T extends YarclShape> = {
  readonly [G in Exclude<TokenGroup, 'sizes' | 'density' | 'families' | 'textStyles'>]: References<T[G], G>;
} & {
  readonly sizes: Fields<T['sizes'], 'sizes'>;
  readonly density: Fields<T['density'], 'density'>;
  readonly typography: {
    readonly families: References<T['typography']['families'], 'families'>;
    readonly styles: Fields<T['typography']['styles'], 'textStyles'>;
  };
};

const fields: Partial<Record<TokenGroup, Record<string, string>>> = {
  sizes: { height: 'height', paddingX: 'padding-x', fontSize: 'font-size', iconSize: 'icon-size' },
  density: { paddingX: 'padding-x', paddingY: 'padding-y', fontSize: 'font-size' },
  textStyles: { family: 'family', size: 'size', weight: 'weight', lineHeight: 'line-height', letterSpacing: 'letter-spacing' },
};

const escape = (key: string) => key.replace(/[^a-zA-Z0-9_-]/g, (character) => `\\${character}`);

/** Creates typed token references without importing the active runtime config. */
export function tokens<const T extends YarclShape>(config: T): TokenAccessor<T> {
  const references = (values: object, group: TokenGroup, nested = false) => Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, nested
      ? Object.fromEntries(Object.keys(fields[group]!).filter((field) => field in value || (group === 'textStyles' && field === 'letterSpacing')).map((field) => [field, { __yarclToken: group, key, field }]))
      : { __yarclToken: group, key }]),
  );
  return {
    ...Object.fromEntries(Object.keys(prefixes).filter((group) => group in config).map((group) => [group, references(config[group as keyof T] as object, group as TokenGroup, group === 'sizes' || group === 'density')])),
    typography: {
      families: references(config.typography.families, 'families'),
      styles: references(config.typography.styles, 'textStyles', true),
    },
  } as TokenAccessor<T>;
}

/** @internal Resolves and validates a token reference against the config being generated. */
export function tokenCss(reference: TokenReference, config: YarclShape): string {
  const { __yarclToken: group, key, field } = reference;
  const values = group === 'families' ? config.typography.families
    : group === 'textStyles' ? config.typography.styles : config[group];
  if (!values || !Object.hasOwn(values, key) || (fields[group] ? !field || !fields[group]?.[field] : field !== undefined)) {
    throw new Error(`yarcl: unknown token reference ${group}.${key}${field ? `.${field}` : ''}`);
  }
  return `var(--yarcl-${prefixes[group]}-${escape(key)}${field ? `-${fields[group]![field]}` : ''})`;
}
