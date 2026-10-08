import type { YarclShape } from './define';
import { compoundClass, recipeClass, type RecipeDefinition, type RecipeStyle } from './recipes';
import { tokenCss, type TokenReference } from './tokens';

const unitless = new Set([
  'animationIterationCount', 'aspectRatio', 'borderImageOutset', 'borderImageSlice', 'borderImageWidth',
  'boxFlex', 'boxFlexGroup', 'boxOrdinalGroup', 'columnCount', 'columns', 'fillOpacity', 'flex',
  'flexGrow', 'flexShrink', 'flexPositive', 'flexNegative', 'flexOrder', 'floodOpacity', 'fontSizeAdjust',
  'fontWeight', 'gridArea', 'gridColumn', 'gridColumnEnd', 'gridColumnSpan', 'gridColumnStart', 'gridRow',
  'gridRowEnd', 'gridRowSpan', 'gridRowStart', 'lineClamp', 'lineHeight', 'opacity', 'order', 'orphans',
  'scale', 'shapeImageThreshold', 'stopOpacity', 'strokeDasharray', 'strokeDashoffset', 'strokeMiterlimit',
  'strokeOpacity', 'strokeWidth', 'tabSize', 'widows', 'zIndex', 'zoom',
]);
for (const property of [...unitless]) {
  for (const prefix of ['Webkit', 'Moz', 'ms', 'O']) unitless.add(`${prefix}${property[0].toUpperCase()}${property.slice(1)}`);
}

function styleCss(selector: string, style: RecipeStyle, config: YarclShape): string {
  const declarations: string[] = [];
  const nested: string[] = [];
  for (const [property, value] of Object.entries(style)) {
    if (value == null) continue;
    if (property.startsWith('&')) {
      nested.push(styleCss(property.replaceAll('&', selector), value as RecipeStyle, config));
    } else if (property.startsWith('@media ') || property.startsWith('@supports ')) {
      nested.push(`${property} {\n${styleCss(selector, value as RecipeStyle, config)}\n}`);
    } else {
      const cssProperty = property.startsWith('--') ? property : property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).replace(/^ms-/, '-ms-');
      const cssValue = typeof value === 'object'
        ? tokenCss(value as TokenReference, config)
        : typeof value === 'number' && value !== 0 && !unitless.has(property) && !property.startsWith('--') ? `${value}px` : value;
      declarations.push(`  ${cssProperty}: ${cssValue};`);
    }
  }
  return [...(declarations.length ? [`${selector} {\n${declarations.join('\n')}\n}`] : []), ...nested].join('\n');
}

function validateRecipe(name: string, recipe: RecipeDefinition) {
  if (!recipe.slots || !Object.hasOwn(recipe.slots, 'root')) throw new Error(`yarcl: recipe ${name} requires a root slot`);
  const checkSlots = (slots: Record<string, RecipeStyle>) => {
    for (const slot of Object.keys(slots)) {
      if (!Object.hasOwn(recipe.slots, slot)) throw new Error(`yarcl: unknown ${name} slot "${slot}"`);
    }
  };
  const checkChoices = (choices: Readonly<Record<string, string>>) => {
    for (const [axis, choice] of Object.entries(choices)) {
      if (!Object.hasOwn(recipe.variants ?? {}, axis) || !Object.hasOwn(recipe.variants![axis], choice)) {
        throw new Error(`yarcl: unknown ${name}.${axis} variant "${choice}"`);
      }
    }
  };
  for (const [axis, variants] of Object.entries(recipe.variants ?? {})) {
    if (['children', 'className', 'style', 'ref', 'key'].includes(axis)) throw new Error(`yarcl: recipe ${name} reserves the prop "${axis}"`);
    for (const slots of Object.values(variants)) checkSlots(slots);
  }
  checkChoices(recipe.defaults ?? {});
  for (const compound of recipe.compounds ?? []) {
    checkSlots(compound.slots);
    checkChoices(compound.when);
  }
}

/** @internal Emits the validated recipe rules for the build-time or active theme config. */
export function generateRecipeCss(config: YarclShape): string[] {
  const rules: string[] = [];
  for (const [name, recipe] of Object.entries(config.recipes ?? {})) {
    validateRecipe(name, recipe);
    const emit = (slots: Readonly<Record<string, RecipeStyle>>, axis?: string, value?: string, compound?: number) => {
      for (const [slot, style] of Object.entries(slots)) {
        const selector = `.${compound === undefined ? recipeClass(name, slot, axis, value) : compoundClass(name, slot, compound)}`;
        const css = styleCss(selector.repeat(2), style, config);
        if (css) rules.push(css);
      }
    };
    emit(recipe.slots);
    for (const [axis, variants] of Object.entries(recipe.variants ?? {})) {
      for (const [value, slots] of Object.entries(variants)) emit(slots, axis, value);
    }
    for (const [index, compound] of (recipe.compounds ?? []).entries()) emit(compound.slots, undefined, undefined, index);
  }
  return rules;
}
