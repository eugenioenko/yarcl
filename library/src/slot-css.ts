import type { YarclShape } from './define';
import { componentSlots, type SlotComponentName } from './slots';

const groups = { radius: 'radii', padding: 'spacing', shadow: 'shadows', density: 'density', textStyle: 'typography.styles', borderWidth: 'borders' } as const;
const backgrounds = {
  surface: 'var(--yarcl-neutral-surface)',
  tint: 'color-mix(in oklab, var(--yarcl-neutral-text) 3%, var(--yarcl-neutral-surface))',
  none: 'transparent',
};
const borderStyles = ['solid', 'dashed', 'dotted', 'double', 'none'];

function ident(key: string) {
  return key.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);
}

function declarations(property: string, key: string): [string, string][] {
  const k = ident(key);
  switch (property) {
    case 'radius': return [['border-radius', `var(--yarcl-radius-${k})`]];
    case 'padding': return [['padding', `var(--yarcl-space-${k})`]];
    case 'shadow': return [['box-shadow', `var(--yarcl-shadow-${k})`]];
    case 'background': return [['background', backgrounds[key as keyof typeof backgrounds]]];
    case 'border': return [['border', `var(--yarcl-border-width) ${key} var(--yarcl-neutral-border)`]];
    case 'borderWidth': return [['border-width', `var(--yarcl-border-${k})`]];
    case 'density': return [
      ['--yarcl-cell-py', `var(--yarcl-density-${k}-padding-y)`],
      ['--yarcl-cell-px', `var(--yarcl-density-${k}-padding-x)`],
      ['font-size', `var(--yarcl-density-${k}-font-size)`],
    ];
    case 'textStyle': return [
      ['font-family', `var(--yarcl-text-${k}-family)`],
      ['font-size', `var(--yarcl-text-${k}-size)`],
      ['font-weight', `var(--yarcl-text-${k}-weight)`],
      ['line-height', `var(--yarcl-text-${k}-line-height)`],
      ['letter-spacing', `var(--yarcl-text-${k}-letter-spacing)`],
    ];
    default: return [];
  }
}

/** Emits only configured part styles, with property order independent of object insertion order. */
export function generateSlotCss(config: YarclShape): string[] {
  const rules: string[] = [];
  for (const [component, own] of Object.entries(config.components ?? {})) {
    if (!('slots' in own) || !own.slots) continue;
    if (!Object.hasOwn(componentSlots, component)) throw new Error(`yarcl: ${component} has no configurable slots`);
    const parts = componentSlots[component as SlotComponentName] as Record<string, readonly string[]>;
    const slots = own.slots as Record<string, Record<string, string>>;
    for (const part of Object.keys(slots)) {
      if (!Object.hasOwn(parts, part)) throw new Error(`yarcl: unknown slot ${component}.${part}`);
    }
    const ordered = Object.keys(parts).sort((a, b) => Number(a === 'header') - Number(b === 'header'));
    for (const part of ordered) {
      const values = slots[part];
      if (!values) continue;
      for (const property of Object.keys(values)) {
        if (!parts[part].includes(property)) throw new Error(`yarcl: unknown slot property ${component}.${part}.${property}`);
      }
      const properties = ['density', 'padding', 'radius', 'shadow', 'textStyle', 'background', 'border', 'borderWidth'];
      for (const property of properties) {
        const key = values[property];
        if (key === undefined) continue;
        const group = groups[property as keyof typeof groups];
        const tokens = group === 'typography.styles' ? config.typography.styles : group ? config[group] : undefined;
        if (typeof key !== 'string' || (tokens ? !Object.hasOwn(tokens, key) : property === 'background' ? !Object.hasOwn(backgrounds, key) : !borderStyles.includes(key))) {
          throw new Error(`yarcl: invalid slot value ${component}.${part}.${property}: ${key}`);
        }
        let selector = `.yarcl-slot-${component}-${part}:not(.yarcl-slot-override-${property})`;
        if (property === 'background' && (part === 'item' || part === 'row' || part === 'cell')) {
          selector += ':where(:not([data-active]):not([aria-selected="true"]):not(.yarcl-table-row-selected):not(.yarcl-table-interactive tbody tr:hover):not(.yarcl-table-striped tbody tr:nth-child(even)):not(.yarcl-table tbody tr[aria-selected="true"] > *):not(.yarcl-table-interactive tbody tr:hover > *):not(.yarcl-table-striped tbody tr:nth-child(even) > *))';
        }
        if (component === 'Table' && part === 'cell' && property === 'padding') {
          rules.push(`${selector} {\n  --yarcl-table-cell-padding: var(--yarcl-space-${ident(key)});\n}`);
          selector = `${selector}:not(.yarcl-table-sortable):not(.yarcl-table-resizable), ${selector}.yarcl-table-sortable > .yarcl-table-sort-button`;
        }
        if (component === 'Table' && part === 'root' && property === 'background') selector += `, ${selector} > .yarcl-table`;
        if ((component === 'Dialog' || component === 'Drawer') && part === 'header' && property === 'textStyle') {
          selector += `, ${selector} > .yarcl-modal-heading > .yarcl-modal-title`;
        }
        rules.push(`${selector} {\n${declarations(property, key).map(([name, value]) => `  ${name}: ${value};`).join('\n')}\n}`);
      }
    }
  }
  return rules;
}
