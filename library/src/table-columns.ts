import { useControllable } from './hooks';
import type { CSSProperties } from 'react';
import type { TableColumnResizerProps } from './components/TableColumns';

/** Column metadata shared by layout, resizing and visibility controls. Widths are CSS pixels. */
export type TableColumnDefinition<Id extends string = string> = {
  /** Stable identifier used by typed column state and renderers. */
  id: Id;
  /** Human-readable header and visibility label. */
  label: string;
  /** Initial width in CSS pixels. Must be positive and finite. */
  width: number;
  /** Whether this column may be hidden. @default true */
  hideable?: boolean;
} & ({
  /** Enables pointer and keyboard resizing. */
  resizable: true;
  /** Smallest width in CSS pixels. Must be positive and finite. */
  minWidth: number;
  /** Largest width in CSS pixels. Must be finite and greater than minWidth. */
  maxWidth: number;
} | {
  /** Leaves the width fixed until changed through column state. @default false */
  resizable?: false;
  /** Only used by resizable columns. */
  minWidth?: never;
  /** Only used by resizable columns. */
  maxWidth?: never;
});

/** Per-column widths. Omitted identifiers use the definition's initial width. */
export type TableColumnWidths<Id extends string = string> = Partial<Record<Id, number>>;
/** Per-column visibility. Omitted identifiers are visible. */
export type TableColumnVisibility<Id extends string = string> = Partial<Record<Id, boolean>>;

/** Controlled or initial state for {@link useTableColumns}. */
export interface TableColumnOptions<Id extends string = string> {
  /** Controlled column widths in CSS pixels. */
  widths?: TableColumnWidths<Id>;
  /** Initial uncontrolled widths. @default column definitions */
  defaultWidths?: TableColumnWidths<Id>;
  /** Requests updated widths after pointer, keyboard or programmatic changes. */
  onWidthsChange?: (widths: TableColumnWidths<Id>) => void;
  /** Controlled visibility. Required columns stay visible, and at least one column remains visible. */
  visibility?: TableColumnVisibility<Id>;
  /** Initial uncontrolled visibility. @default all visible */
  defaultVisibility?: TableColumnVisibility<Id>;
  /** Requests updated visibility after checkbox or programmatic changes. */
  onVisibilityChange?: (visibility: TableColumnVisibility<Id>) => void;
}

/** Resolved column state consumed by a colgroup, headers, cells and visibility controls. */
export interface TableColumnState<Id extends string = string> {
  /** Stable column identifier. */
  id: Id;
  /** Human-readable column label. */
  label: string;
  /** Accepted width in CSS pixels. */
  width: number;
  /** Whether the header and cells should be rendered. */
  visible: boolean;
  /** Whether the column can currently be hidden, respecting required columns and the last visible column. */
  hideable: boolean;
}

/**
 * Coordinates typed column IDs, accepted widths and visibility without owning row data or sorting.
 * @example
 * ```tsx
 * const columns = useTableColumns([
 *   { id: 'customer', label: 'Customer', width: 220, resizable: true, minWidth: 100, maxWidth: 480 },
 *   { id: 'total', label: 'Total', width: 140 },
 * ]);
 * <Table style={columns.tableStyle}><Table.Columns columns={columns.visibleColumns} /></Table>
 * ```
 */
export function useTableColumns<const Columns extends readonly TableColumnDefinition[]>(definitions: Columns, options: TableColumnOptions<Columns[number]['id']> = {}) {
  type Id = Columns[number]['id'];
  type ResizeId = Extract<Columns[number], { resizable: true }>['id'];
  if (!definitions.length || new Set(definitions.map((column) => column.id)).size !== definitions.length) throw new Error('yarcl: table columns require nonempty, unique identifiers');
  for (const column of definitions) {
    if (!column.id || !Number.isFinite(column.width) || column.width <= 0) throw new Error('yarcl: table column widths must be positive and finite');
    if (column.resizable && (!Number.isFinite(column.minWidth) || !Number.isFinite(column.maxWidth) || column.minWidth <= 0 || column.minWidth >= column.maxWidth || column.width < column.minWidth || column.width > column.maxWidth)) throw new Error('yarcl: resizable table columns require 0 < minWidth <= width <= maxWidth and minWidth < maxWidth');
  }
  for (const state of [options.widths, options.defaultWidths, options.visibility, options.defaultVisibility]) {
    for (const id of Object.keys(state ?? {})) if (!definitions.some((column) => column.id === id)) throw new Error(`yarcl: unknown table column ${id}`);
  }
  for (const state of [options.widths, options.defaultWidths]) {
    for (const width of Object.values(state ?? {})) if (width !== undefined && (typeof width !== 'number' || !Number.isFinite(width) || width <= 0)) throw new Error('yarcl: table column widths must be positive and finite');
  }
  for (const state of [options.visibility, options.defaultVisibility]) {
    for (const visible of Object.values(state ?? {})) if (visible !== undefined && typeof visible !== 'boolean') throw new Error('yarcl: table column visibility must be boolean');
  }
  const [rawWidths, changeWidths] = useControllable<TableColumnWidths<Id>>(options.widths, options.defaultWidths ?? {}, options.onWidthsChange);
  const [rawVisibility, changeVisibility] = useControllable<TableColumnVisibility<Id>>(options.visibility, options.defaultVisibility ?? {}, options.onVisibilityChange);
  const widths = Object.fromEntries(definitions.map((column) => {
    const width = (Object.hasOwn(rawWidths, column.id) ? rawWidths[column.id as Id] : undefined) ?? column.width;
    return [column.id, column.resizable ? Math.min(column.maxWidth, Math.max(column.minWidth, width)) : width];
  })) as Record<Id, number>;
  const visibility = Object.fromEntries(definitions.map((column) => [column.id, column.hideable === false || rawVisibility[column.id as Id] !== false])) as Record<Id, boolean>;
  if (!Object.values(visibility).some(Boolean)) visibility[definitions[0].id as Id] = true;
  const count = Object.values(visibility).filter(Boolean).length;
  const columns: TableColumnState<Id>[] = definitions.map((column) => ({ id: column.id as Id, label: column.label, width: widths[column.id as Id], visible: visibility[column.id as Id], hideable: column.hideable !== false && (!visibility[column.id as Id] || count > 1) }));
  const visibleColumns = columns.filter((column) => column.visible);
  function find(id: Id) {
    const column = definitions.find((column) => column.id === id);
    if (!column) throw new Error(`yarcl: unknown table column ${id}`);
    return column;
  }
  function setWidth(id: Id, width: number) {
    const column = find(id);
    if (!Number.isFinite(width) || width <= 0) throw new Error('yarcl: table column widths must be positive and finite');
    const next = column.resizable ? Math.min(column.maxWidth, Math.max(column.minWidth, width)) : width;
    if (next !== widths[id]) changeWidths({ ...widths, [id]: next });
  }
  function setVisible(id: Id, visible: boolean) {
    find(id);
    if (visibility[id] === visible || (!visible && !columns.find((column) => column.id === id)!.hideable)) return;
    changeVisibility({ ...visibility, [id]: visible });
  }
  function getResizeProps(id: ResizeId): TableColumnResizerProps {
    const column = find(id);
    if (!column.resizable) throw new Error(`yarcl: table column ${id} is not resizable`);
    return { 'aria-label': column.label, value: widths[id], min: column.minWidth, max: column.maxWidth, onValueChange: (width) => setWidth(id, width) };
  }
  const tableStyle: CSSProperties = { tableLayout: 'fixed', width: visibleColumns.reduce((sum, column) => sum + column.width, 0) };
  return { columns, visibleColumns, widths, visibility, tableStyle, setWidth, setVisible, getResizeProps };
}
