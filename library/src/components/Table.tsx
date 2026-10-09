import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  cloneElement,
  isValidElement,
  useRef,
  useState,
  Fragment,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  type ReactElement,
  type RefObject,
} from 'react';
import { cx, densityClass, radiusClass } from '../classes';
import { Checkbox } from './Checkbox';
import type { Density, Radius } from '../types';
import { useConfig, useDefaults } from '../runtime';
import { useMergeRefs } from '@floating-ui/react';

interface TableContextValue {
  wrapRef: RefObject<HTMLDivElement | null>;
  density: Density | undefined;
  stickyHeader: boolean;
}

const TableContext = createContext<TableContextValue | null>(null);

/** Props for {@link Table}. */
export interface TableProps extends ComponentProps<'table'> {
  /**
   * Cell padding and font size, from the `density` config.
   * @default config.defaults.density
   */
  density?: Density;
  /**
   * Corner radius of the table frame, from the `radii` config.
   * @default config.components.Table.radius ?? config.defaults.radius
   */
  radius?: Radius;
  /** Shades every other row. */
  striped?: boolean;
  /** Highlights the row under the pointer. Use when rows are clickable. */
  interactive?: boolean;
  /** Visible caption describing the table. Also its accessible name. */
  caption?: ReactNode;
  /** Enables a scrollable container with sticky header support. */
  stickyHeader?: boolean;
  /** Additional class name for the outer table wrapper. */
  wrapClassName?: string;
  /** Additional inline styles for the outer table wrapper. */
  wrapStyle?: CSSProperties;
}

/** Renders the table frame and shares its scroll container and density with compound parts. */
function TableRoot({
  density,
  radius,
  striped,
  interactive,
  caption,
  stickyHeader,
  wrapClassName,
  wrapStyle,
  className,
  children,
  ...props
}: TableProps) {
  const own = useDefaults('Table');
  const resolvedDensity = density ?? own.density;
  const wrapRef = useRef<HTMLDivElement>(null);

  return (
    <TableContext value={{ wrapRef, density: resolvedDensity, stickyHeader: !!stickyHeader }}>
      <div
        ref={wrapRef}
        tabIndex={stickyHeader ? 0 : undefined}
        className={cx(
          'yarcl-table-wrap',
          radiusClass(radius ?? own.radius),
          stickyHeader && 'yarcl-table-sticky-wrap',
          wrapClassName,
        )}
        style={wrapStyle}
      >
        <table
          className={cx(
            'yarcl-table',
            densityClass(resolvedDensity),
            striped && 'yarcl-table-striped',
            interactive && 'yarcl-table-interactive',
            className,
          )}
          {...props}
        >
          {caption != null && <caption className="yarcl-table-caption">{caption}</caption>}
          {children}
        </table>
      </div>
    </TableContext>
  );
}

/** Horizontal alignment of a cell's content. `end` also uses tabular numbers, for numeric columns. */
export type CellAlign = 'start' | 'center' | 'end';

/** Sort direction for a table column. */
export type SortDirection = 'ascending' | 'descending' | 'none';

/** Displays the current column sort direction. */
function SortIcon({ direction }: { direction?: SortDirection | false | null }) {
  if (direction === 'ascending') {
    return (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 12V4M4 8l4-4 4 4" />
      </svg>
    );
  }
  if (direction === 'descending') {
    return (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 4v8M4 8l4 4 4-4" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 6l3-3 3 3M5 10l3 3 3-3" />
    </svg>
  );
}

/** Props for `Table.HeaderCell`. */
export interface TableHeaderCellProps extends Omit<ComponentProps<'th'>, 'align'> {
  /**
   * Content alignment.
   * @default 'start'
   */
  align?: CellAlign;
  /** Indicates whether the column is sortable. */
  sortable?: boolean;
  /** Current sort direction of the column. */
  sortDirection?: SortDirection | false | null;
  /** Callback invoked when the user activates the sort button. */
  onSort?: (direction: 'ascending' | 'descending') => void;
  /** Accessible label for the sort action. */
  sortLabel?: string;
}

/** Renders a header cell with an optional accessible sort trigger. */
function TableHeaderCell({
  align = 'start',
  scope = 'col',
  sortable,
  sortDirection,
  onSort,
  sortLabel,
  className,
  children,
  ...props
}: TableHeaderCellProps) {
  if (sortable) {
    const ariaSort =
      sortDirection === 'ascending' ? 'ascending' : sortDirection === 'descending' ? 'descending' : 'none';
    const nextDirection = sortDirection === 'ascending' ? 'descending' : 'ascending';

    return (
      <th
        scope={scope}
        aria-sort={ariaSort}
        className={cx(`yarcl-cell-${align}`, 'yarcl-table-sortable', className)}
        {...props}
      >
        <button
          type="button"
          className="yarcl-table-sort-button"
          onClick={() => onSort?.(nextDirection)}
          aria-label={sortLabel}
        >
          <span>{children}</span>
          <span className="yarcl-table-sort-icon" aria-hidden="true">
            <SortIcon direction={sortDirection} />
          </span>
        </button>
      </th>
    );
  }

  return (
    <th scope={scope} className={cx(`yarcl-cell-${align}`, className)} {...props}>
      {children}
    </th>
  );
}

/** Props for `Table.Row`. */
export interface TableRowProps extends ComponentProps<'tr'> {
  /** Indicates whether the row is currently selected. */
  selected?: boolean;
}

/** Renders a native row with its selection state. */
function TableRow({ selected, className, ...props }: TableRowProps) {
  return (
    <tr
      aria-selected={selected ? true : undefined}
      className={cx(selected && 'yarcl-table-row-selected', className)}
      {...props}
    />
  );
}

/** Props for `Table.Cell`. */
export interface TableCellProps extends Omit<ComponentProps<'td'>, 'align'> {
  /**
   * Content alignment.
   * @default 'start'
   */
  align?: CellAlign;
}

/** Aligns native cell content using the table density. */
function TableCell({ align = 'start', className, ...props }: TableCellProps) {
  return <td className={cx(`yarcl-cell-${align}`, className)} {...props} />;
}

/** Props for `Table.SelectAllCell`. */
export interface TableSelectAllCellProps extends Omit<ComponentProps<'th'>, 'children'> {
  /** Checked state when all rows are selected. */
  checked?: boolean;
  /** Indeterminate state when a subset of rows is selected. */
  indeterminate?: boolean;
  /** Change handler when the checkbox is toggled. */
  onCheckedChange?: (checked: boolean) => void;
  /** Accessible label for screen readers. @default 'Select all rows' */
  'aria-label'?: string;
  /** Disables the select all checkbox. */
  disabled?: boolean;
}

/** Renders the header selection checkbox, including partial selection state. */
function TableSelectAllCell({
  checked = false,
  indeterminate = false,
  onCheckedChange,
  disabled,
  'aria-label': ariaLabel = 'Select all rows',
  className,
  scope = 'col',
  ...props
}: TableSelectAllCellProps) {
  return (
    <th scope={scope} className={cx('yarcl-cell-center', 'yarcl-table-selection-cell', className)} {...props}>
      <Checkbox
        aria-label={ariaLabel}
        checked={checked}
        indeterminate={indeterminate}
        disabled={disabled}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
      />
    </th>
  );
}

/** Props for `Table.SelectionCell`. */
export interface TableSelectionCellProps extends Omit<ComponentProps<'td'>, 'children'> {
  /** Checked state of the row selection checkbox. */
  checked?: boolean;
  /** Change handler when the row checkbox is toggled. */
  onCheckedChange?: (checked: boolean) => void;
  /** Accessible label for the row checkbox. */
  'aria-label': string;
  /** Disables the row selection checkbox. */
  disabled?: boolean;
}

/** Renders a row selection checkbox without triggering row click handlers. */
function TableSelectionCell({
  checked = false,
  onCheckedChange,
  disabled,
  'aria-label': ariaLabel,
  className,
  ...props
}: TableSelectionCellProps) {
  return (
    <td className={cx('yarcl-cell-center', 'yarcl-table-selection-cell', className)} {...props}>
      <Checkbox
        aria-label={ariaLabel}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
      />
    </td>
  );
}

/** Shared props for `Table.VirtualBody`. */
export interface TableVirtualBodyBaseProps<T> extends Omit<ComponentProps<'tbody'>, 'children'> {
  /** Array of items to render. */
  items: T[];
  /** Number of buffer rows above and below the viewport. Must be a nonnegative integer. @default 5 */
  overscan?: number;
  /** Optional custom scroll container ref instead of the table wrapper. */
  scrollRef?: RefObject<HTMLElement | null>;
}

/** Props for `Table.VirtualBody` with an explicit fixed row height. */
export interface TableFixedBodyProps<T> extends TableVirtualBodyBaseProps<T> {
  /** Rendered height of every row in CSS pixels. Opts into fixed-height virtualization. */
  rowHeight: number;
  /** Only used in measured mode. */
  estimateRowHeight?: never;
  /** Render prop called for each visible item. */
  children: (item: T, index: number) => ReactNode;
  /** Key extractor. Fixed mode defaults to item.id or index. */
  getItemKey?: (item: T, index: number) => string | number;
}

/** Props for `Table.VirtualBody` with measured variable row heights. */
export interface TableMeasuredBodyProps<T> extends TableVirtualBodyBaseProps<T> {
  /** Only used in fixed mode. */
  rowHeight?: never;
  /** Initial estimate in CSS pixels. Actual row heights are measured with ResizeObserver. */
  estimateRowHeight: number;
  /** Render exactly one Table.Row or tr per item. Custom row components must spread their props onto a tr. */
  children: (item: T, index: number) => ReactElement<ComponentProps<'tr'>>;
  /** Stable, unique key for each item, independent of its position after sorting or filtering. */
  getItemKey: (item: T, index: number) => string | number;
}

/** Props for `Table.VirtualBody` with explicit fixed heights or measured variable heights. */
export type TableVirtualBodyProps<T> = TableFixedBodyProps<T> | TableMeasuredBodyProps<T>;

/** Finds the row containing an offset, or -1 for an empty body. */
function rowAtOffset(offsets: number[], offset: number) {
  let low = 0;
  let high = offsets.length - 1;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (offsets[mid] <= offset) low = mid;
    else high = mid - 1;
  }
  return Math.min(low, offsets.length - 2);
}

/** Windows table rows using explicit fixed heights or cached measurements, preserving focus and scroll anchors. */
function TableVirtualBody<T>({
  items,
  rowHeight,
  estimateRowHeight,
  overscan = 5,
  children,
  getItemKey,
  scrollRef,
  className,
  ref,
  style,
  onFocusCapture,
  ...props
}: TableVirtualBodyProps<T>) {
  const context = useContext(TableContext);
  const config = useConfig();
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const mergedRef = useMergeRefs([bodyRef, ref]);
  const heights = useRef(new Map<string | number, number>());
  const pendingAnchor = useRef<{ key: string | number; within: number; revision: number } | null>(null);
  const [revision, setRevision] = useState(0);
  const generation = useRef(0);
  const stickToBottom = useRef(false);
  const bottomIntent = useRef(false);
  const columnWidths = useRef<string | undefined>(undefined);
  const rowObserver = useRef<ResizeObserver | null>(null);
  const observedRows = useRef(new Set<HTMLTableRowElement>());
  const measureRows = useRef<(rows: HTMLTableRowElement[]) => void>(() => {});
  const [viewport, setViewport] = useState({ top: 0, height: 600 });
  const [focusedKey, setFocusedKey] = useState<string | number | null>(null);
  const [columnCount, setColumnCount] = useState(1);
  const measured = rowHeight === undefined;
  const estimate = rowHeight ?? estimateRowHeight;
  if (rowHeight !== undefined && estimateRowHeight !== undefined) {
    throw new Error('yarcl: Table.VirtualBody accepts either rowHeight or estimateRowHeight');
  }
  if (estimate === undefined || !Number.isFinite(estimate) || estimate <= 0) {
    throw new Error('yarcl: Table.VirtualBody requires a positive rowHeight or estimateRowHeight');
  }
  if (!Number.isInteger(overscan) || overscan < 0) {
    throw new Error('yarcl: Table.VirtualBody overscan must be a nonnegative integer');
  }
  if (measured && !getItemKey) throw new Error('yarcl: measured Table.VirtualBody requires getItemKey');
  const keys = useMemo(
    () =>
      items.map((item, index) =>
        getItemKey ? getItemKey(item, index) : ((item as { id?: string | number })?.id ?? index),
      ),
    [items, getItemKey],
  );
  const uniqueKeys = useMemo(() => new Set(keys).size === keys.length, [keys]);
  if (!uniqueKeys) throw new Error('yarcl: Table.VirtualBody keys must be unique');
  const offsets = useMemo(() => {
    const result = [0];
    for (const key of keys)
      result.push(result[result.length - 1] + (measured ? (heights.current.get(key) ?? estimate) : estimate));
    return result;
  }, [keys, measured, estimate, revision]);
  const layout = useRef({ keys, offsets, viewport });
  useLayoutEffect(() => {
    layout.current = { keys, offsets, viewport };
  });
  const count = items.length;
  const start = Math.max(0, rowAtOffset(offsets, viewport.top) - overscan);
  const end = Math.min(count - 1, rowAtOffset(offsets, viewport.top + viewport.height) + overscan);
  const indices = new Set<number>();
  for (let i = start; i <= end; i++) indices.add(i);
  const focusedIndex = focusedKey === null ? -1 : keys.indexOf(focusedKey);
  if (measured && focusedIndex >= 0) {
    for (let i = Math.max(0, focusedIndex - 1); i <= Math.min(count - 1, focusedIndex + 1); i++) indices.add(i);
  }
  const renderedIndices = [...indices].sort((a, b) => a - b);
  const scrollElement = () => scrollRef?.current ?? context?.wrapRef.current;

  /** Uses the final header row or a rendered body row to determine logical columns. */
  function columnCells() {
    const body = bodyRef.current;
    const head = body?.closest('table')?.tHead;
    return (
      head?.rows[head.rows.length - 1]?.cells ??
      [...(body?.rows ?? [])].find((row) => !row.classList.contains('yarcl-table-virtual-spacer'))?.cells
    );
  }

  /** Includes column widths so wrapping changes invalidate offscreen measurements. */
  function widthSignature() {
    const width = bodyRef.current?.closest('table')?.getBoundingClientRect().width;
    return [width, ...[...(columnCells() ?? [])].map((cell) => cell.getBoundingClientRect().width)].join(',');
  }

  /** Converts container geometry to body offsets, excluding the sticky header. */
  function readViewport() {
    const el = scrollElement();
    const body = bodyRef.current;
    if (!el || !body) return null;
    const origin = body.getBoundingClientRect().top - el.getBoundingClientRect().top - el.clientTop;
    const header = context?.stickyHeader ? (body.closest('table')?.tHead?.getBoundingClientRect().height ?? 0) : 0;
    const top = Math.max(0, header - origin);
    return { top, height: Math.max(0, el.clientHeight - origin - top) };
  }

  /** Publishes the viewport and spacer column counts when their values change. */
  function updateViewport() {
    const next = readViewport();
    if (!next) return;
    setViewport((previous) => (previous.top === next.top && previous.height === next.height ? previous : next));
    const cells = columnCells();
    if (cells) setColumnCount([...cells].reduce((sum, cell) => sum + cell.colSpan, 0));
  }

  /** Discards heights after layout changes while retaining the first visible item as an anchor. */
  function invalidateHeights() {
    if (!measured || !heights.current.size) return;
    const current = layout.current;
    const index = rowAtOffset(current.offsets, current.viewport.top);
    if (index >= 0)
      pendingAnchor.current = {
        key: current.keys[index],
        within: current.viewport.top - current.offsets[index],
        revision: generation.current + 1,
      };
    heights.current.clear();
    setRevision(++generation.current);
  }

  useLayoutEffect(invalidateHeights, [config, context?.density, measured, estimate]);
  useLayoutEffect(() => {
    const widths = widthSignature();
    if (columnWidths.current !== undefined && columnWidths.current !== widths) invalidateHeights();
    columnWidths.current = widths;
  });

  useEffect(() => {
    const el = scrollElement();
    const body = bodyRef.current;
    if (!el || !body) return;
    const table = body.closest('table');
    const update = () => {
      const widths = widthSignature();
      if (columnWidths.current !== widths) {
        columnWidths.current = widths;
        invalidateHeights();
      }
      updateViewport();
    };
    const blur = () => {
      if (!body.contains(document.activeElement)) setFocusedKey(null);
    };
    const scroll = () => {
      bottomIntent.current = el.scrollTop > 0 && el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      update();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (!measured || event.target !== el || event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey)
        return;
      if (event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault();
      bottomIntent.current = event.key === 'End';
      stickToBottom.current = bottomIntent.current;
      el.scrollTop = bottomIntent.current ? el.scrollHeight : 0;
      update();
    };
    el.addEventListener('scroll', scroll, { passive: true });
    el.addEventListener('keydown', keyboard);
    document.addEventListener('focusin', blur);
    const observer = new ResizeObserver(update);
    observer.observe(el);
    if (table) {
      observer.observe(table);
      for (const cell of table.tHead?.rows[table.tHead.rows.length - 1]?.cells ?? []) observer.observe(cell);
    }
    update();
    return () => {
      el.removeEventListener('scroll', scroll);
      el.removeEventListener('keydown', keyboard);
      document.removeEventListener('focusin', blur);
      observer.disconnect();
    };
  }, [scrollRef, context?.wrapRef, context?.stickyHeader, measured]);

  useLayoutEffect(() => {
    if (!measured) return;
    const observer = new ResizeObserver((entries) => {
      measureRows.current(entries.map((entry) => entry.target as HTMLTableRowElement));
    });
    rowObserver.current = observer;
    const observed = observedRows.current;
    return () => {
      observer.disconnect();
      observed.clear();
      rowObserver.current = null;
    };
  }, [measured, scrollRef, context?.wrapRef]);

  useLayoutEffect(() => {
    const el = scrollElement();
    const body = bodyRef.current;
    if (!body || !el) return;
    if (pendingAnchor.current && pendingAnchor.current.revision !== revision) return;
    if (pendingAnchor.current) {
      const anchor = pendingAnchor.current;
      const index = keys.indexOf(anchor.key);
      if (index >= 0) {
        el.scrollTop += offsets[index] + anchor.within - (readViewport()?.top ?? 0);
      }
      pendingAnchor.current = null;
    }
    if (stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
      stickToBottom.current = false;
    }
    updateViewport();
    if (!measured) return;
    const rows = [...body.rows].filter((row) => !row.classList.contains('yarcl-table-virtual-spacer'));
    measureRows.current = (changedRows) => {
      const current = layout.current;
      const anchor = rowAtOffset(current.offsets, readViewport()?.top ?? 0);
      const atBottom = bottomIntent.current;
      let adjustment = 0;
      let changed = false;
      for (const row of changedRows) {
        if (!observedRows.current.has(row)) continue;
        const index = Number(row.dataset.yarclRowIndex);
        const key = keys[index];
        const height = row.getBoundingClientRect().height;
        if (height <= 0 || key === undefined) continue;
        const previous = heights.current.get(key) ?? estimate;
        heights.current.set(key, height);
        if (height !== previous) {
          if (index < anchor) adjustment += height - previous;
          changed = true;
        }
      }
      if (changed) {
        el.scrollTop += adjustment;
        stickToBottom.current = atBottom;
        setRevision(++generation.current);
      }
    };
    const nextRows = new Set(rows);
    const newlyObserved: HTMLTableRowElement[] = [];
    for (const row of observedRows.current) {
      if (!nextRows.has(row)) {
        rowObserver.current?.unobserve(row);
        observedRows.current.delete(row);
      }
    }
    for (const row of rows) {
      if (!observedRows.current.has(row)) {
        rowObserver.current?.observe(row);
        observedRows.current.add(row);
        newlyObserved.push(row);
      } else if (!heights.current.has(keys[Number(row.dataset.yarclRowIndex)])) newlyObserved.push(row);
    }
    measureRows.current(newlyObserved);
  });

  useEffect(() => {
    const activeKeys = new Set(keys);
    for (const key of heights.current.keys()) if (!activeKeys.has(key)) heights.current.delete(key);
  }, [keys]);

  const content: ReactNode[] = [];
  let previousEnd = 0;
  /** Fills gaps between rendered rows, including gaps around a focused row outside the viewport. */
  function spacer(from: number, to: number) {
    const height = offsets[to] - offsets[from];
    if (height > 0)
      content.push(
        <tr key={`spacer-${from}`} aria-hidden="true" className="yarcl-table-virtual-spacer" style={{ height }}>
          <td colSpan={columnCount} style={{ height, padding: 0, border: 0 }} />
        </tr>,
      );
  }
  for (const index of renderedIndices) {
    spacer(previousEnd, index);
    const row = children(items[index], index);
    if (measured) {
      if (
        !isValidElement<ComponentProps<'tr'>>(row) ||
        row.type === Fragment ||
        (typeof row.type === 'string' && row.type !== 'tr')
      ) {
        throw new Error('yarcl: measured Table.VirtualBody must render one Table.Row or tr per item');
      }
      content.push(
        <Fragment key={`row-${typeof keys[index]}-${keys[index]}`}>
          {cloneElement(row, { 'data-yarcl-row-index': index } as ComponentProps<'tr'>)}
        </Fragment>,
      );
    } else content.push(<Fragment key={`row-${typeof keys[index]}-${keys[index]}`}>{row}</Fragment>);
    previousEnd = index + 1;
  }
  spacer(previousEnd, count);
  return (
    <tbody
      {...props}
      ref={mergedRef}
      className={cx('yarcl-table-virtual-body', className)}
      style={{ ...style, overflowAnchor: 'none' }}
      onFocusCapture={(event) => {
        onFocusCapture?.(event);
        const row = [...(bodyRef.current?.rows ?? [])].find((row) => row.contains(event.target as Node));
        if (measured && row?.dataset.yarclRowIndex !== undefined)
          setFocusedKey(keys[Number(row.dataset.yarclRowIndex)]);
      }}
    >
      {content}
    </tbody>
  );
}

/**
 * A data table with density from the config, sortable columns, row selection and row virtualization.
 *
 * @example
 * ```tsx
 * <Table density="compact" striped caption="Invoices">
 *   <Table.Head>
 *     <Table.Row>
 *       <Table.SelectAllCell checked={allSelected} onCheckedChange={toggleAll} />
 *       <Table.HeaderCell sortable sortDirection={sortDir} onSort={setSortDir}>Customer</Table.HeaderCell>
 *       <Table.HeaderCell align="end">Amount</Table.HeaderCell>
 *     </Table.Row>
 *   </Table.Head>
 *   <Table.VirtualBody items={invoices} estimateRowHeight={48} getItemKey={(invoice) => invoice.id}>
 *     {(invoice) => (
 *       <Table.Row key={invoice.id} selected={selected.has(invoice.id)}>
 *         <Table.SelectionCell aria-label={`Select ${invoice.customer}`} checked={selected.has(invoice.id)} onCheckedChange={() => toggle(invoice.id)} />
 *         <Table.Cell>{invoice.customer}</Table.Cell>
 *         <Table.Cell align="end">{invoice.amount}</Table.Cell>
 *       </Table.Row>
 *     )}
 *   </Table.VirtualBody>
 * </Table>
 * ```
 */
export const Table = Object.assign(TableRoot, {
  Head: (props: ComponentProps<'thead'>) => <thead {...props} />,
  Body: (props: ComponentProps<'tbody'>) => <tbody {...props} />,
  VirtualBody: TableVirtualBody,
  Row: TableRow,
  HeaderCell: TableHeaderCell,
  Cell: TableCell,
  SelectAllCell: TableSelectAllCell,
  SelectionCell: TableSelectionCell,
});
