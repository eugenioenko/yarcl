import { useState } from 'react';
import {
  Button,
  Checkbox,
  CommandPalette,
  Dialog,
  Drawer,
  Field,
  HoverCard,
  IconButton,
  Inline,
  Input,
  Link,
  Menu,
  Popover,
  Stack,
  Text,
  Toaster,
  Tooltip,
  toast,
  config,
  type Color,
  type CommandPaletteCommand,
  type ModalSize,
} from '@yarcl/react';
import { InfoIcon, PlusIcon, SearchIcon, TrashIcon } from './icons';

export function DialogDemo() {
  return (
    <Dialog
      trigger={<Button>Invite teammate</Button>}
      title="Invite a teammate"
      description="They'll get an email with a link to join."
      footer={<Button>Send invite</Button>}
    >
      <Field label="Email">
        <Input type="email" placeholder="grace@example.com" />
      </Field>
    </Dialog>
  );
}

export function DialogControlledDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button color="danger" variant="outline" onClick={() => setOpen(true)}>
        Delete project
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Delete project?"
        description="This removes the project and all of its data. It can't be undone."
        size="sm"
        footer={
          <>
            <Button variant="outline" color="neutral" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button color="danger" onClick={() => setOpen(false)}>
              Delete
            </Button>
          </>
        }
      />
    </>
  );
}

const modalSizes = Object.keys(config.modalSizes) as ModalSize[];

export function DialogSizesDemo() {
  return (
    <>
      {modalSizes.map((size) => (
        <Dialog
          key={size}
          size={size}
          trigger={
            <Button variant="outline" color="neutral">
              {size}
            </Button>
          }
          title={`size="${size}"`}
          description={`${config.modalSizes[size]} wide, from modalSizes in the config.`}
          footer={<Button>Done</Button>}
        >
          <Text as="p">The height follows the content, up to the height of the screen.</Text>
        </Dialog>
      ))}
    </>
  );
}

export function DrawerDemo() {
  return (
    <>
      <Drawer side="left" trigger={<Button variant="outline">Left drawer</Button>} title="Navigation">
        <Stack as="nav" gap="sm">
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
          {['Status', 'Owner', 'Label', 'Milestone', 'Created after', 'Created before'].map((label) => (
            <Field key={label} label={label}>
              <Input />
            </Field>
          ))}
        </Stack>
      </Drawer>
    </>
  );
}

export function PopoverDemo() {
  return (
    <Popover>
      <Popover.Trigger>
        <Button variant="outline" color="neutral">
          Filters
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <Stack gap="sm">
          <Text textStyle="label">Show</Text>
          <Checkbox defaultChecked>Open</Checkbox>
          <Checkbox>Archived</Checkbox>
        </Stack>
      </Popover.Content>
    </Popover>
  );
}

export function TooltipDemo() {
  return (
    <>
      <Tooltip content="Search">
        <IconButton aria-label="Search" variant="outline">
          <SearchIcon />
        </IconButton>
      </Tooltip>
      <Tooltip content="Add item" placement="right">
        <IconButton aria-label="Add item" variant="soft">
          <PlusIcon />
        </IconButton>
      </Tooltip>
      <Tooltip content="Deleting can't be undone" placement="bottom">
        <Button variant="outline" color="danger">
          <TrashIcon /> Delete
        </Button>
      </Tooltip>
    </>
  );
}

export function HoverCardDemo() {
  return (
    <Text>
      Written by{' '}
      <HoverCard
        content={
          <Stack gap="xs">
            <Text textStyle="subheading">Ada Lovelace</Text>
            <Text textStyle="caption" muted>
              Wrote the first published algorithm. <Link href="#">View profile</Link>
            </Text>
          </Stack>
        }
      >
        <Link href="#">@ada</Link>
      </HoverCard>
    </Text>
  );
}

export function MenuDemo() {
  const [last, setLast] = useState('nothing yet');
  return (
    <Stack gap="sm">
      <Menu>
        <Menu.Trigger>
          <Button variant="outline" color="neutral">
            Actions
          </Button>
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Item onSelect={() => setLast('Rename')}>Rename</Menu.Item>
          <Menu.Item onSelect={() => setLast('Duplicate')}>Duplicate</Menu.Item>
          <Menu.Item disabled>Move</Menu.Item>
          <Menu.Separator />
          <Menu.Item color="danger" onSelect={() => setLast('Delete')}>
            Delete
          </Menu.Item>
        </Menu.Content>
      </Menu>
      <Text textStyle="caption" muted>
        Last action: {last}
      </Text>
    </Stack>
  );
}

const colors = Object.keys(config.colors) as Color[];

export function ToastDemo() {
  return (
    <>
      <Inline gap="sm">
        {colors.map((color) => (
          <Button key={color} size="sm" variant="soft" color={color} onClick={() => toast({ title: `${color} toast`, description: 'Dismisses in 5 seconds.', color })}>
            {color}
          </Button>
        ))}
        <Button
          size="sm"
          variant="outline"
          color="neutral"
          onClick={() =>
            toast({
              title: 'Message deleted',
              action: { label: 'Undo', onClick: () => toast({ title: 'Restored', color: 'success' }) },
            })
          }
        >
          With action
        </Button>
        <Button size="sm" variant="outline" color="neutral" onClick={() => toast({ title: 'Stays until dismissed', duration: 0 })}>
          Sticky
        </Button>
      </Inline>
      <Toaster />
    </>
  );
}

function paletteCommands(run: (label: string) => void): CommandPaletteCommand[] {
  const command = (id: string, label: string, extra: Partial<CommandPaletteCommand> = {}) => ({
    id,
    label,
    onSelect: () => run(label),
    ...extra,
  });
  return [
    command('new', 'New document', { group: 'Create', icon: <PlusIcon />, shortcut: 'Mod+Alt+N' }),
    command('invite', 'Invite teammate', { group: 'Create', keywords: ['member', 'user', 'share'] }),
    command('search', 'Search files', { group: 'Navigate', icon: <SearchIcon />, shortcut: 'Mod+P' }),
    command('help', 'Open help center', { group: 'Navigate', icon: <InfoIcon />, keywords: ['docs', 'support'] }),
    command('dashboard', 'Go to dashboard', { group: 'Navigate', shortcut: 'G D' }),
    command('theme', 'Toggle dark mode', { group: 'Preferences', keywords: ['theme', 'appearance'] }),
    command('archive', 'Archive workspace', { group: 'Danger zone', disabled: true }),
    command('delete', 'Delete workspace', { group: 'Danger zone', icon: <TrashIcon /> }),
  ];
}

export function CommandPaletteDemo() {
  const [last, setLast] = useState('nothing yet');
  return (
    <Stack gap="sm" align="start">
      <CommandPalette
        shortcut="Mod+J"
        commands={paletteCommands(setLast)}
        trigger={
          <Button variant="outline" color="neutral">
            <SearchIcon /> Open command palette
          </Button>
        }
      />
      <Text textStyle="caption" muted>
        Last command: {last}
      </Text>
    </Stack>
  );
}

export function CommandPaletteControlledDemo() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState('nothing yet');
  return (
    <Stack gap="sm" align="start">
      <Button onClick={() => setOpen(true)}>Run a command</Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        shortcut={false}
        placeholder="What do you want to do?"
        emptyMessage="No matching commands. Try another word."
        commands={paletteCommands(() => {})}
        onSelect={(command) => setLast(command.label)}
      />
      <Text textStyle="caption" muted>
        Palette is {open ? 'open' : 'closed'}. Last command: {last}
      </Text>
    </Stack>
  );
}
