import { createElement, type ComponentProps, type ElementType, type ReactNode } from 'react';
import type config from '@yarcl/config';
import { useConfig } from './runtime';
import { resolveRecipe, type RecipeDefinition, type RecipeVariants } from './recipes';

type Recipes = typeof config extends { recipes: infer R } ? R : Record<never, never>;

/** The component recipe names in the consumer's config. */
export type RecipeName = keyof Recipes & string;
type Definition<N extends RecipeName> = Extract<Recipes[N], RecipeDefinition>;
type NativeProps<B extends ElementType> = ComponentProps<B>;

/** Inherited element props combined with the configured recipe's visual variants. */
export type ExtendedComponentProps<N extends RecipeName, B extends ElementType> = NativeProps<B> & RecipeVariants<Definition<N>>;

/** Slot classes and inherited props supplied to custom component markup. */
export interface RecipeRenderContext<N extends RecipeName, B extends ElementType> {
  /** Inherited props with recipe props removed and the root class merged. Includes ref. */
  rootProps: NativeProps<B>;
  /** Classes for the exact slots defined in this recipe. */
  slots: { [S in keyof Definition<N>['slots']]: string };
}

/** Applies a configured recipe to custom markup while retaining extra behavior and native props. */
export function useRecipe<N extends RecipeName, P extends object>(name: N, props: P & RecipeVariants<Definition<N>>) {
  const active = useConfig();
  const recipe = (active as unknown as { recipes?: Record<string, RecipeDefinition> }).recipes?.[name];
  if (!recipe) throw new Error(`yarcl: active config has no recipe "${name}"`);
  const slots = resolveRecipe(name, recipe, props as Record<string, unknown>);
  const rootProps = Object.fromEntries(Object.entries(props).filter(([prop]) => !Object.hasOwn(recipe.variants ?? {}, prop)));
  rootProps.className = [slots.root, rootProps.className].filter(Boolean).join(' ');
  return {
    rootProps: rootProps as Omit<P, keyof RecipeVariants<Definition<N>>> & { className: string },
    slots: slots as RecipeRenderContext<N, 'div'>['slots'],
  };
}

/**
 * Extends an existing component or native element with a config recipe.
 * Preserves inherited attributes, refs and behavior. Visual variant props are consumed rather
 * than passed to the base component. A render callback can apply named slots to custom markup.
 * Recipe axes must not collide with inherited props.
 *
 * @example
 * ```tsx
 * const Action = createComponent('Action', Button);
 * const Status = createComponent('Status', 'div', ({ rootProps, slots }) => (
 *   <div {...rootProps}><span className={slots.label}>{rootProps.children}</span></div>
 * ));
 * ```
 */
export function createComponent<N extends RecipeName, B extends ElementType>(
  name: N,
  base: B & (Extract<keyof RecipeVariants<Definition<N>>, keyof NativeProps<B>> extends never ? unknown : { error: 'Recipe variants must not replace inherited props' }),
  render?: (context: RecipeRenderContext<N, B>) => ReactNode,
): (props: ExtendedComponentProps<N, B>) => ReactNode {
  function ExtendedComponent(props: ExtendedComponentProps<N, B>) {
    const { rootProps, slots } = useRecipe(name, props);
    if (render) return render({ rootProps, slots } as RecipeRenderContext<N, B>);
    return createElement(base, rootProps);
  }
  ExtendedComponent.displayName = name;
  return ExtendedComponent;
}
