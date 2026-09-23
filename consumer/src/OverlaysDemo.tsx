import { useState } from 'react';
import {
  Button,
  Dialog,
  Drawer,
  Field,
  Inline,
  Input,
  Link,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  config,
  toast,
  type Color,
  type Density,
} from 'yarcl';

const colors = Object.keys(config.colors) as Color[];
const densities = (Object.keys(config.density) as Density[]).map((d) => ({ value: d, label: d }));

const invoices = [
  { id: 'INV-1042', customer: 'Ada Lovelace', status: 'Paid', amount: 1200 },
  { id: 'INV-1043', customer: 'Grace Hopper', status: 'Pending', amount: 860.5 },
  { id: 'INV-1044', customer: 'Alan Turing', status: 'Overdue', amount: 45 },
  { id: 'INV-1045', customer: 'Katherine Johnson', status: 'Paid', amount: 13075.25 },
];

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function OverlaysDemo() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [density, setDensity] = useState<Density>(config.defaults.density);

  return (
    <Stack gap="loose">
      <Inline>
        <Dialog
          trigger={<Button>Open dialog</Button>}
          title="Invite a teammate"
          description="They'll get an email with a link to join."
          footer={
            <>
              <Button variant="outline" color="neutral" onClick={() => toast({ title: 'From inside the dialog' })}>
                Toast from dialog
              </Button>
              <Button onClick={() => toast({ title: 'Invite sent', color: 'success' })}>Send invite</Button>
            </>
          }
        >
          <Stack>
            <Field label="Email">
              <Input type="email" placeholder="grace@example.com" />
            </Field>
            <Text textStyle="caption" muted>
              Press Esc or click outside to close.
            </Text>
          </Stack>
        </Dialog>

        <Button color="danger" variant="outline" onClick={() => setConfirmOpen(true)}>
          Controlled dialog
        </Button>
        <Dialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Delete project?"
          description="This removes the project and all of its data. It can't be undone."
          width="26rem"
          footer={
            <>
              <Button variant="outline" color="neutral" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                color="danger"
                onClick={() => {
                  setConfirmOpen(false);
                  toast({ title: 'Project deleted', color: 'danger', action: { label: 'Undo', onClick: () => toast({ title: 'Restored' }) } });
                }}
              >
                Delete
              </Button>
            </>
          }
        />

        <Drawer side="left" trigger={<Button variant="outline">Left drawer</Button>} title="Navigation">
          <Stack as="nav" gap="tight">
            {['Dashboard', 'Projects', 'Team', 'Settings'].map((item) => (
              <Link key={item} href="#" underline="hover" color="neutral">
                {item}
              </Link>
            ))}
          </Stack>
        </Drawer>
        <Drawer
          trigger={<Button variant="outline">Right drawer</Button>}
          title="Filters"
          description="Narrow down the list."
          footer={<Button>Apply</Button>}
        >
          <Stack>
            {Array.from({ length: 12 }, (_, i) => (
              <Field key={i} label={`Filter ${i + 1}`}>
                <Input />
              </Field>
            ))}
          </Stack>
        </Drawer>
      </Inline>

      <Inline gap="tight">
        {colors.map((color) => (
          <Button key={color} size="sm" variant="subtle" color={color} onClick={() => toast({ title: `${color} toast`, description: 'Dismisses in 5 seconds.', color })}>
            Toast {color}
          </Button>
        ))}
        <Button size="sm" variant="outline" color="neutral" onClick={() => toast({ title: 'Sticky', description: 'Stays until dismissed.', duration: 0 })}>
          Sticky toast
        </Button>
      </Inline>

      <Tabs defaultValue="overview">
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

      <Stack gap="tight">
        <Inline>
          <Field label="Density">
            <Select options={densities} value={density} onValueChange={(d) => d && setDensity(d)} size="sm" />
          </Field>
        </Inline>
        <Table density={density} striped interactive caption="Invoices">
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
                  <Text color={invoice.status === 'Paid' ? 'success' : invoice.status === 'Overdue' ? 'danger' : 'warning'}>
                    {invoice.status}
                  </Text>
                </Table.Cell>
                <Table.Cell align="end">{money.format(invoice.amount)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Stack>
    </Stack>
  );
}
