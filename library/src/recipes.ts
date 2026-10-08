import type { CSSProperties } from 'react';
import type { TokenGroup, TokenReference } from './tokens';

type ColorProperty = 'color' | 'background' | 'fill' | 'stroke' | `${string}Color`;
type PropertyGroup<P> = P extends ColorProperty ? 'colors' | 'neutrals'
  : P extends 'fontFamily' ? 'families' | 'textStyles'
  : P extends 'boxShadow' ? 'shadows'
  : P extends 'zIndex' ? 'zIndex'
  : P extends `border${string}Radius` ? 'radii'
  : P extends 'transitionDuration' | 'animationDuration' | 'transitionTimingFunction' | 'animationTimingFunction' ? 'motion'
  : Exclude<TokenGroup, 'colors' | 'neutrals' | 'families' | 'shadows' | 'zIndex'>;

/** CSS declarations, typed token references, nested selectors and conditional rules. */
export type RecipeStyle = {
  readonly [P in keyof CSSProperties]?: CSSProperties[P] | TokenReference<PropertyGroup<P>>;
} & {
  readonly [P in `--${string}`]?: string | number | TokenReference;
} & {
  readonly [P in `&${string}` | `@media ${string}` | `@supports ${string}`]?: RecipeStyle;
};

/** Named element styles in a component recipe. Every recipe has a root slot. */
export type RecipeSlots = { readonly root: RecipeStyle } & Record<string, RecipeStyle>;

/** Styles selected by one or more visual variant axes. */
export interface RecipeDefinition {
  /** Base styles for each element, including root. */
  readonly slots: RecipeSlots;
  /** Each axis becomes a typed component prop. */
  readonly variants?: Readonly<Record<string, Readonly<Record<string, Readonly<Record<string, RecipeStyle>>>>>>;
  /** Variant choices used when props are omitted. */
  readonly defaults?: Readonly<Record<string, string>>;
  /** Additional slot styles when all of the variant choices match. */
  readonly compounds?: readonly { readonly when: Readonly<Record<string, string>>; readonly slots: Readonly<Record<string, RecipeStyle>> }[];
}

type Axes<R> = R extends { variants: infer V } ? V : Record<never, never>;
type Choices<R> = { readonly [A in keyof Axes<R>]?: keyof Axes<R>[A] & string };
type StyleCheck<S> = {
  [P in keyof S]: P extends `&${string}` | `@media ${string}` | `@supports ${string}` ? StyleCheck<S[P]>
    : P extends keyof RecipeStyle ? RecipeStyle[P] : never;
};
type SlotCheck<S, R extends RecipeDefinition> = { [K in keyof S]: K extends keyof R['slots'] ? StyleCheck<S[K]> : never };

/** Validates recipe slots, variant defaults and compound conditions without widening their keys. */
export type RecipeChecks<R extends Record<string, RecipeDefinition>> = {
  [N in keyof R]: {
    slots: { [S in keyof R[N]['slots']]: StyleCheck<R[N]['slots'][S]> };
    variants?: {
      [A in keyof Axes<R[N]>]: A extends 'children' | 'className' | 'style' | 'ref' | 'key'
        ? never : { [V in keyof Axes<R[N]>[A]]: SlotCheck<Axes<R[N]>[A][V], R[N]> };
    };
    defaults?: { [A in keyof R[N]['defaults']]: A extends keyof Axes<R[N]> ? keyof Axes<R[N]>[A] & string : never };
    compounds?: R[N] extends { compounds: infer C extends readonly { when: object; slots: object }[] }
      ? { [I in keyof C]: { when: { [A in keyof C[I]['when']]: A extends keyof Axes<R[N]> ? keyof Axes<R[N]>[A] & string : never }; slots: SlotCheck<C[I]['slots'], R[N]> } }
      : never;
  };
};

/** Defines config recipes with inferred slots and variant values, checking every cross-reference. */
export function defineRecipes<const R extends Record<string, RecipeDefinition>>(recipes: R & RecipeChecks<R>): R {
  return recipes;
}

/** Variant props inferred from a recipe definition. */
export type RecipeVariants<R extends RecipeDefinition> = Choices<R>;

/** @internal Builds collision-free class names for recipe slots and variants. */
export function recipeClass(name: string, slot: string, axis?: string, value?: string): string {
  const encode = (part: string) => Array.from(part).map((character) => character.codePointAt(0)!.toString(16)).join('_');
  return `yarcl-recipe-${[name, slot, ...(axis === undefined ? [] : [axis, value!])].map(encode).join('-')}`;
}

/** @internal Builds the class for one compound variant and slot. */
export function compoundClass(name: string, slot: string, index: number): string {
  return `${recipeClass(name, slot)}-compound-${index}`;
}

/** @internal Resolves base, variant and compound classes without computing CSS values. */
export function resolveRecipe(name: string, recipe: RecipeDefinition, props: Readonly<Record<string, unknown>>) {
  const slots = Object.fromEntries(Object.keys(recipe.slots).map((slot) => [slot, [recipeClass(name, slot)]]));
  const choices: Record<string, string | undefined> = {};
  for (const [axis, variants] of Object.entries(recipe.variants ?? {})) {
    const explicit = Object.hasOwn(props, axis) ? props[axis] : undefined;
    const choice = explicit ?? (recipe.defaults && Object.hasOwn(recipe.defaults, axis) ? recipe.defaults[axis] : undefined);
    if (choice !== undefined && (typeof choice !== 'string' || !Object.hasOwn(variants, choice))) {
      throw new Error(`yarcl: unknown ${name}.${axis} variant "${String(choice)}"`);
    }
    choices[axis] = choice as string | undefined;
    if (choice !== undefined) {
      for (const slot of Object.keys(variants[choice as string])) slots[slot].push(recipeClass(name, slot, axis, choice as string));
    }
  }
  for (const [index, compound] of (recipe.compounds ?? []).entries()) {
    if (Object.entries(compound.when).every(([axis, choice]) => choices[axis] === choice)) {
      for (const slot of Object.keys(compound.slots)) slots[slot].push(compoundClass(name, slot, index));
    }
  }
  return Object.fromEntries(Object.entries(slots).map(([slot, classes]) => [slot, classes.join(' ')]));
}
