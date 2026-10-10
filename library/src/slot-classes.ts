import type { YarclShape } from './define';
import { useConfig } from './runtime';
import { componentSlots, type ComponentSlotProps, type SlotComponentName } from './slots';

/** Keeps build-time slot rules inactive when a runtime theme omits a part or property. */
export function useSlotClass<C extends SlotComponentName>(
  component: C,
  part: keyof ComponentSlotProps[C] & string,
  overrides: Record<string, unknown> = {},
) {
  const config = useConfig() as YarclShape;
  const own = config.components?.[component] as { slots?: Record<string, Record<string, unknown>> } | undefined;
  const values = own?.slots?.[part];
  if (!values) return undefined;
  const parts = componentSlots[component] as Record<string, readonly string[]>;
  return [
    `yarcl-slot-${component}-${part}`,
    ...parts[part].filter((property) => values[property] === undefined || (overrides[property] !== undefined && overrides[property] !== null))
      .map((property) => `yarcl-slot-override-${property}`),
  ].join(' ');
}
