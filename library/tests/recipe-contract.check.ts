import { defineConfig, defineRecipes, tokens, type RecipeStyle } from '../src/define';
import defaults from '../src/yarcl.config';

const base = defineConfig({ ...defaults, colors: { ...defaults.colors, custom: { light: '#123456', dark: '#abcdef' } } });
const config = defineConfig(base, (yarcl) => ({
  recipes: {
    Example: {
      slots: { root: { color: yarcl.colors.custom }, label: { fontWeight: 500 } },
      variants: { appearance: { quiet: { label: { opacity: 0.8 } }, loud: { label: { fontWeight: 700 } } } },
      defaults: { appearance: 'quiet' },
    },
  },
}));
const appearance: keyof typeof config.recipes.Example.variants.appearance = 'loud';
// @ts-expect-error callback recipes preserve literal variant keys
const invalidAppearance: typeof appearance = 'missing';
const yarcl = tokens(base);
const logicalColors: RecipeStyle = { background: yarcl.colors.custom, borderInlineStartColor: yarcl.neutrals.border };
const letterSpacing = yarcl.typography.styles.body.letterSpacing;
const extended = tokens({ ...base, sizes: { ...base.sizes, md: { ...base.sizes.md, extra: 'unused' } } });
// @ts-expect-error structured fields only expose variables emitted by the generator
const invalidExtraField = extended.sizes.md.extra;
// @ts-expect-error field access preserves structured token keys
const invalidField = yarcl.sizes.md.width;
// @ts-expect-error missing typography styles
const invalidTextStyle = yarcl.typography.styles.missing;
// @ts-expect-error color references cannot become spacing
const invalidProperty: RecipeStyle = { gap: yarcl.colors.custom };
// @ts-expect-error callback defaults are validated without defineRecipes
const invalidCallback = defineConfig(base, (yarcl) => ({ recipes: { Invalid: { slots: { root: { color: yarcl.colors.custom } }, variants: { appearance: { quiet: { root: {} } } }, defaults: { appearance: 'missing' } } } }));
// @ts-expect-error direct recipe defaults are validated
const invalidDirect = defineConfig({ ...base, recipes: { Invalid: { slots: { root: {} }, variants: { appearance: { quiet: { root: {} } } }, defaults: { appearance: 'missing' } } } });
// @ts-expect-error compound slots must exist
const invalidCompound = defineRecipes({ Invalid: { slots: { root: {} }, compounds: [{ when: {}, slots: { missing: {} } }] } });
// @ts-expect-error unknown CSS properties should not pass through generic recipe definitions
const invalidCssKey = defineRecipes({ Invalid: { slots: { root: { display: 'grid', diaplay: 'flex' } } } });
// @ts-expect-error unknown CSS properties in nested selectors are rejected
const invalidNestedCssKey = defineRecipes({ Invalid: { slots: { root: { '&:hover': { color: 'red', colour: 'blue' } } } } });
void [logicalColors, invalidCssKey, invalidNestedCssKey, config, appearance, letterSpacing, invalidExtraField, invalidAppearance, invalidField, invalidTextStyle, invalidProperty, invalidCallback, invalidDirect, invalidCompound];
