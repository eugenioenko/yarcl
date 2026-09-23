import { useState } from 'react';
import { Badge, Stack, Table, Tabs, Text, ToggleGroup, config, type Density } from 'yarcl';

export function TabsDemo() {
  return (
    <Tabs defaultValue="overview" className="demo-wide">
      <Tabs.List aria-label="Project">
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        <Tabs.Trigger value="billing" disabled>
          Billing
        </Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="overview">
        <Text as="p">Overview panel. Use the arrow keys to move between tabs.</Text>
      </Tabs.Panel>
      <Tabs.Panel value="activity">
        <Text as="p">Activity panel.</Text>
      </Tabs.Panel>
      <Tabs.Panel value="settings">
        <Text as="p">Settings panel.</Text>
      </Tabs.Panel>
    </Tabs>
  );
}

const invoices = [
  { id: 'INV-1042', customer: 'Ada Lovelace', status: 'Paid', amount: 1200 },
  { id: 'INV-1043', customer: 'Grace Hopper', status: 'Pending', amount: 860.5 },
  { id: 'INV-1044', customer: 'Alan Turing', status: 'Overdue', amount: 45 },
  { id: 'INV-1045', customer: 'Katherine Johnson', status: 'Paid', amount: 13075.25 },
];

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const statusColor = { Paid: 'success', Pending: 'warning', Overdue: 'danger' } as const;

export function TableDemo() {
  const [density, setDensity] = useState<string | null>(config.defaults.density);
  return (
    <Stack className="demo-wide">
      <ToggleGroup type="single" required value={density} onValueChange={setDensity} size="sm" aria-label="Density">
        {Object.keys(config.density).map((key) => (
          <ToggleGroup.Item key={key} value={key}>
            {key}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>
      <Table density={(density ?? undefined) as Density | undefined} striped interactive caption="Invoices">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Invoice</Table.HeaderCell>
            <Table.HeaderCell>Customer</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell align="end">Amount</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {invoices.map((invoice) => (
            <Table.Row key={invoice.id}>
              <Table.Cell>
                <Text textStyle="code">{invoice.id}</Text>
              </Table.Cell>
              <Table.Cell>{invoice.customer}</Table.Cell>
              <Table.Cell>
                <Badge color={statusColor[invoice.status as keyof typeof statusColor]}>{invoice.status}</Badge>
              </Table.Cell>
              <Table.Cell align="end">{money.format(invoice.amount)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Stack>
  );
}
