import { describe, expect, it } from 'vitest';
import defaults from '../src/yarcl.config';
import { defineConfig, defineRecipes, tokens, type RecipeDefinition, type YarclShape } from '../src/define';
import { generateCss, generateTokensCss } from '../src/css';
import { compoundClass, recipeClass, resolveRecipe } from '../src/recipes';

const config = defineConfig(defaults, (yarcl) => ({
  recipes: defineRecipes({
    Status: {
      slots: {
        root: {
          display: 'inline-flex', color: yarcl.colors.success, gap: yarcl.spacing.sm,
          borderRadius: yarcl.radii.md, width: 'var(--external-width, auto)',
          '--custom-gap': yarcl.spacing.md,
          '&:hover': { color: yarcl.colors.warning },
          '@media (min-width: 40rem)': { gap: yarcl.spacing.lg, '&:focus-visible': { opacity: 0.8 } },
          '@supports (display: grid)': { display: 'grid' },
        },
        label: { fontWeight: 500 },
      },
      variants: {
        status: { pending: { label: { opacity: 0.5 } }, paid: { label: { opacity: 1 } } },
        emphasis: { subtle: { root: { borderWidth: 0 } }, strong: { label: { fontWeight: 700 } } },
      },
      defaults: { status: 'pending', emphasis: 'subtle' },
      compounds: [{ when: { status: 'paid', emphasis: 'strong' }, slots: { label: { textDecoration: 'underline' } } }],
    },
  }),
}));

describe('typed token references', () => {
  it('keeps references serializable and separate from concrete values', () => {
    const yarcl = tokens(defaults);
    expect(yarcl.colors.success).toEqual({ __yarclToken: 'colors', key: 'success' });
    expect(JSON.parse(JSON.stringify(yarcl.colors.success))).toEqual(yarcl.colors.success);
    expect(defaults.colors.success.light).not.toEqual(yarcl.colors.success);
  });

  it('provides exact config keys including numeric and unusual keys', () => {
    const yarcl = tokens({ ...defaults, spacing: { '2': '0.5rem' }, radii: { 'round/panel': '1rem' } });
    expect(Object.keys(yarcl.spacing)).toEqual(['2']);
    expect(Object.keys(yarcl.radii)).toEqual(['round/panel']);
    const css = generateCss({ ...defaults, spacing: { '2': '0.5rem' }, radii: { 'round/panel': '1rem' }, recipes: { Odd: { slots: { root: { gap: yarcl.spacing['2'], borderRadius: yarcl.radii['round/panel'] } } } } });
    expect(css).toContain('gap: var(--yarcl-space-2);');
    expect(css).toContain('border-radius: var(--yarcl-radius-round\\/panel);');
  });

  it('maps every supported group and structured field to emitted variables', () => {
    const yarcl = tokens(defaults);
    const css = generateCss({ ...defaults, recipes: { All: { slots: { root: {
      color: yarcl.neutrals.text, backgroundColor: yarcl.colors.success,
      padding: yarcl.sizes.md.paddingX, height: yarcl.sizes.md.height,
      borderRadius: yarcl.radii.md, gap: yarcl.spacing.sm, boxShadow: yarcl.shadows.md,
      maxWidth: yarcl.modalSizes.md, width: yarcl.widths.page, zIndex: yarcl.zIndex.dialog,
      transitionDuration: yarcl.motion.fast, borderWidth: yarcl.borders.width,
      paddingBlock: yarcl.density.comfortable.paddingY,
      fontFamily: yarcl.typography.families.sans, fontSize: yarcl.typography.styles.body.size,
      lineHeight: yarcl.typography.styles.body.lineHeight,
      letterSpacing: yarcl.typography.styles.body.letterSpacing,
    } } } } });
    const variables = [...css.matchAll(/(?:color|padding|height|radius|gap|shadow|width|index|duration|family|size|line-height): var\((--yarcl-[^)]+)\);/g)].map((match) => match[1]);
    for (const variable of variables) expect(css).toContain(`${variable}:`);
    expect(css).toContain('padding-block: var(--yarcl-density-comfortable-padding-y);');
    expect(css).toContain('font-family: var(--yarcl-font-family-sans);');
    expect(css).toContain('letter-spacing: var(--yarcl-text-body-letter-spacing);');
    expect(css).toContain('--yarcl-text-body-letter-spacing: normal;');
  });

  it('rejects references missing from the final config instead of emitting broken variables', () => {
    const { success: _removed, ...colors } = defaults.colors;
    expect(() => generateCss({ ...config, colors })).toThrow('unknown token reference colors.success');
  });

  it('rejects invalid structured token fields and missing fields', () => {
    for (const reference of [{ __yarclToken: 'sizes', key: 'md', field: 'missing' }, { __yarclToken: 'sizes', key: 'md' }]) {
      const invalid = { ...defaults, recipes: { Invalid: { slots: { root: { width: reference } } } } } as unknown as YarclShape;
      expect(() => generateCss(invalid)).toThrow('unknown token reference sizes.md');
    }
  });
});

describe('recipe CSS generation', () => {
  it('emits base, variants and compounds with enough specificity to extend component styles', () => {
    const css = generateCss(config);
    const base = `.${recipeClass('Status', 'label')}`;
    const variant = `.${recipeClass('Status', 'label', 'emphasis', 'strong')}`;
    const compound = `.${compoundClass('Status', 'label', 0)}`;
    expect(css).toContain(`${base}${base} {\n  font-weight: 500;`);
    expect(css).toContain(`${variant}${variant} {\n  font-weight: 700;`);
    expect(css).toContain(`${compound}${compound} {\n  text-decoration: underline;`);
    expect(css.indexOf(base + base)).toBeLessThan(css.indexOf(variant + variant));
    expect(css.indexOf(variant + variant)).toBeLessThan(css.indexOf(compound + compound));
  });

  it('preserves raw CSS, variables, pseudo selectors and nested conditional rules', () => {
    const css = generateCss(config);
    const selector = `.${recipeClass('Status', 'root')}`.repeat(2);
    expect(css).toContain('width: var(--external-width, auto);');
    expect(css).toContain('--custom-gap: var(--yarcl-space-md);');
    expect(css).toContain(`${selector}:hover {\n  color: var(--yarcl-color-warning);`);
    expect(css).toContain('@media (min-width: 40rem) {');
    expect(css).toContain(`${selector}:focus-visible {\n  opacity: 0.8;`);
    expect(css).toContain('@supports (display: grid) {');
  });

  it('converts dimensional numbers to px and preserves unitless and custom-property numbers', () => {
    const css = generateCss({ ...defaults, recipes: { Numeric: { slots: { root: { padding: 8, borderWidth: 0, fontWeight: 700, lineHeight: 1.5, opacity: 0.8, zIndex: 10, WebkitLineClamp: 3, WebkitFlexGrow: 1, borderImageSlice: 1, fontSizeAdjust: 0.5, '--count': 2 } } } } });
    for (const declaration of ['padding: 8px;', 'border-width: 0;', 'font-weight: 700;', 'line-height: 1.5;', 'opacity: 0.8;', 'z-index: 10;', '-webkit-line-clamp: 3;', '-webkit-flex-grow: 1;', 'border-image-slice: 1;', 'font-size-adjust: 0.5;', '--count: 2;']) expect(css).toContain(declaration);
  });

  it('does not include recipes in the tokens-only export', () => {
    const css = generateTokensCss(config);
    expect(css).not.toContain('yarcl-recipe-');
    expect(css).toContain('--yarcl-color-success:');
  });

  it('avoids class collisions between names, slots, axes, values and compound indices', () => {
    expect(recipeClass('a-b', 'c')).not.toBe(recipeClass('a', 'b-c'));
    expect(recipeClass('a', 'b', 'c-d', 'e')).not.toBe(recipeClass('a', 'b', 'c', 'd-e'));
    expect(compoundClass('a', 'b', 0)).not.toBe(recipeClass('a', 'b', 'compound', '0'));
    expect(recipeClass('状态', 'root')).toMatch(/^yarcl-recipe-[a-z0-9_-]+$/);
  });

  it.each([
    [{ slots: { label: {} } }, 'requires a root slot'],
    [{ slots: { root: {} }, variants: { appearance: { soft: { missing: {} } } } }, 'unknown Invalid slot'],
    [{ slots: { root: {} }, defaults: { appearance: 'soft' } }, 'unknown Invalid.appearance'],
    [{ slots: { root: {} }, variants: { appearance: { soft: { root: {} } } }, defaults: { appearance: 'missing' } }, 'unknown Invalid.appearance'],
    [{ slots: { root: {} }, variants: { ref: { soft: { root: {} } } } }, 'reserves the prop'],
    [{ slots: { root: {} }, compounds: [{ when: { appearance: 'soft' }, slots: { root: {} } }] }, 'unknown Invalid.appearance'],
    [{ slots: { root: {} }, compounds: [{ when: {}, slots: { missing: {} } }] }, 'unknown Invalid slot'],
  ])('rejects invalid JavaScript recipes at build time: %s', (recipe, message) => {
    expect(() => generateCss({ ...defaults, recipes: { Invalid: recipe as RecipeDefinition } })).toThrow(message);
  });
});

describe('recipe class resolution', () => {
  const recipe = config.recipes.Status;
  it('uses defaults and combines explicit independent axes and compound matches', () => {
    const initial = resolveRecipe('Status', recipe, {});
    expect(initial.label).toContain(recipeClass('Status', 'label', 'status', 'pending'));
    expect(initial.label).not.toContain(compoundClass('Status', 'label', 0));
    const paid = resolveRecipe('Status', recipe, { status: 'paid', emphasis: 'strong' });
    expect(paid.label).toContain(recipeClass('Status', 'label', 'status', 'paid'));
    expect(paid.label).toContain(recipeClass('Status', 'label', 'emphasis', 'strong'));
    expect(paid.label).toContain(compoundClass('Status', 'label', 0));
    expect(paid.root).toBe(recipeClass('Status', 'root'));
  });

  it('treats undefined choices as omitted and never changes the recipe or input props', () => {
    const props = { status: undefined, id: 'external' };
    const snapshot = JSON.stringify(recipe);
    expect(resolveRecipe('Status', recipe, props)).toEqual(resolveRecipe('Status', recipe, {}));
    expect(props).toEqual({ status: undefined, id: 'external' });
    expect(JSON.stringify(recipe)).toBe(snapshot);
  });

  it.each(['unknown', 3, true])('rejects invalid variant values %s', (status) => {
    expect(() => resolveRecipe('Status', recipe, { status })).toThrow('unknown Status.status variant');
  });

  it('keeps recipes without variants usable and ignores inherited properties', () => {
    expect(resolveRecipe('Plain', { slots: { root: {}, label: {} } }, {})).toEqual({ root: recipeClass('Plain', 'root'), label: recipeClass('Plain', 'label') });
    const own = { slots: { root: {} }, variants: { constructor: { small: { root: {} } } } };
    expect(resolveRecipe('Own', own, {})).toEqual({ root: recipeClass('Own', 'root') });
  });
});
