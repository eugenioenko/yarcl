import { useState } from 'react';
import { Heading, Stack, Table, Text, useTableColumns, type TableColumnDefinition } from '@yarcl/react';

const definitions = [
  { id: 'selection', label: 'Selection', width: 64, hideable: false },
  { id: 'customer', label: 'Customer', width: 220, resizable: true, minWidth: 120, maxWidth: 480 },
  { id: 'description', label: 'Description', width: 280, resizable: true, minWidth: 120, maxWidth: 600 },
  { id: 'total', label: 'Total', width: 140 },
] as const satisfies readonly TableColumnDefinition[];
const orders = Array.from({ length: 80 }, (_, index) => ({ id: index, customer: `Customer ${String(index + 1).padStart(2, '0')}`, description: index % 2 ? 'A custom order with delivery instructions and a note for the recipient.' : 'Standard delivery with a reusable gift package.', total: `$${(index + 1) * 12}` }));
const key = (order: (typeof orders)[number]) => order.id;

/** Resizable, selectable and sortable orders with visibility controls and measured virtual rows. */
export function TableColumnsDemo() {
  const columns = useTableColumns(definitions);
  const [sort, setSort] = useState<'ascending' | 'descending'>('ascending');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const items = sort === 'ascending' ? orders : [...orders].reverse();
  function select(id: number, checked: boolean) { setSelected((previous) => { const next = new Set(previous); if (checked) next.add(id); else next.delete(id); return next; }); }
  return <Stack as="section" style={{ width: '100%', minWidth: 0 }}>
    <Heading level={2}>Adjust your table</Heading>
    <Text>Drag a header divider or focus it and use arrow keys. Choose which columns to show.</Text>
    <Table.ColumnVisibility label="Visible columns" columns={columns.columns} onVisibilityChange={columns.setVisible} />
    <Table caption="Customer orders" stickyHeader striped interactive style={columns.tableStyle} wrapStyle={{ maxHeight: 320 }}>
      <Table.Columns columns={columns.visibleColumns} />
      <Table.Head><Table.Row>{columns.visibleColumns.map((column) => column.id === 'selection' ? <Table.SelectAllCell key={column.id} checked={selected.size === orders.length} indeterminate={selected.size > 0 && selected.size < orders.length} onCheckedChange={(checked) => setSelected(new Set(checked ? orders.map((order) => order.id) : []))} /> : <Table.HeaderCell key={column.id} sortable={column.id === 'customer'} sortDirection={column.id === 'customer' ? sort : undefined} onSort={setSort} align={column.id === 'total' ? 'end' : 'start'} resize={column.id === 'customer' || column.id === 'description' ? columns.getResizeProps(column.id) : undefined}>{column.label}</Table.HeaderCell>)}</Table.Row></Table.Head>
      <Table.VirtualBody items={items} estimateRowHeight={72} getItemKey={key}>{(order) => <Table.Row selected={selected.has(order.id)}>{columns.visibleColumns.map((column) => column.id === 'selection' ? <Table.SelectionCell key={column.id} aria-label={`Select ${order.customer}`} checked={selected.has(order.id)} onCheckedChange={(checked) => select(order.id, checked)} /> : <Table.Cell key={column.id} align={column.id === 'total' ? 'end' : 'start'}>{order[column.id]}</Table.Cell>)}</Table.Row>}</Table.VirtualBody>
    </Table>
    <Text role="status">{selected.size} orders selected</Text>
  </Stack>;
}
