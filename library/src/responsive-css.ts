import type { YarclShape } from './define';

const align = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch', baseline: 'baseline' };
const justify = { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between' };

function ident(key: string) {
  return key.replace(/[^a-zA-Z0-9_-]/g, (character) => `\\${character}`);
}

function rule(selector: string, property: string, value: string) {
  return `${selector} {\n  ${property}: ${value};\n}`;
}

/** @internal Generates mobile-first token and layout overrides in config breakpoint order. */
export function generateResponsiveCss(config: YarclShape) {
  const resets = Object.keys(config.breakpoints).map((key) => `  --yarcl-grid-columns-${key}: initial;`);
  const tokens = [`.yarcl-grid-responsive {\n  --yarcl-grid-columns: var(--yarcl-grid-columns-base);\n${resets.join('\n')}\n}`];
  const base: string[] = [];
  let columns = 'var(--yarcl-grid-columns-base)';
  for (const [breakpoint, width] of Object.entries(config.breakpoints)) {
    const tokenRules: string[] = [];
    const layoutRules: string[] = [];
    for (const key of Object.keys(config.spacing)) {
      for (const group of ['gap', 'padding']) {
        const selector = `.${ident(`yarcl-responsive-${group}-${key}@${breakpoint}`)}`;
        tokenRules.push(rule(selector, `--yarcl-component-${group}`, `var(--yarcl-space-${ident(key)})`));
      }
    }
    for (const [group, property, choices] of [['align', 'align-items', align], ['justify', 'justify-content', justify], ['wrap', 'flex-wrap', { true: 'wrap', false: 'nowrap' }]] as const) {
      for (const [choice, value] of Object.entries(choices)) {
        const selector = `.${ident(`yarcl-responsive-${group}-${choice}@${breakpoint}`)}`;
        layoutRules.push(rule(`${selector}${selector}`, property, value));
      }
    }
    columns = `var(--yarcl-grid-columns-${breakpoint}, ${columns})`;
    tokenRules.push(rule('.yarcl-grid-responsive', '--yarcl-grid-columns', columns));
    tokens.push(`@media (min-width: ${width}) {\n${tokenRules.join('\n\n')}\n}`);
    base.push(`@media (min-width: ${width}) {\n${layoutRules.join('\n\n')}\n}`);
  }
  return { tokens, base };
}
