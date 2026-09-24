import {
  Button,
  Card,
  Checkbox,
  Divider,
  Field,
  Label,
  Alert,
  Badge,
  ButtonGroup,
  RadioGroup,
  ToggleGroup,
  Combobox,
  Skeleton,
  Spinner,
  Dialog,
  Drawer,
  Table,
  Tabs,
  toast,
  Heading,
  HoverCard,
  Menu,
  Popover,
  Select,
  Tooltip,
  IconButton,
  Inline,
  Input,
  Link,
  Radio,
  Stack,
  Switch,
  Text,
  Textarea,
} from 'yarcl';

export const contract = (
  <>
    <Button size="xl" color="warning" radius="rounded" variant="subtle" />
    <Input size="xs" color="danger" radius="square" />
    <IconButton aria-label="Add" variant="quiet" />
    <Textarea size="lg" radius="size" />
    <Checkbox size="sm" color="success" indeterminate />
    <Radio size="lg" color="neutral" />
    <Switch size="xl" color="brand" />
    <Field label="Name">
      <Input />
    </Field>
    <Text textStyle="caption" color="danger" truncate={2} />
    <Label htmlFor="name" textStyle="caption" color="neutral" required disabled>
      Name
    </Label>
    <Heading level={2} textStyle="display" />
    <Link color="neutral" underline="hover" external />
    <Stack gap="loose" align="center" as="ul" />
    <Inline gap="tight" justify="between" wrap={false} />
    <Card padding="tight" radius="rounded" shadow="lg" as="article" />
    <Divider orientation="vertical" />
    <Tooltip content="Hi">
      <Button />
    </Tooltip>
    <HoverCard content="Hi" padding="tight" radius="xl">
      <Link />
    </HoverCard>
    <Popover placement="top" modal>
      <Popover.Trigger>
        <Button />
      </Popover.Trigger>
      <Popover.Content padding="loose" />
    </Popover>
    <Menu size="sm">
      <Menu.Content>
        <Menu.Item color="danger" />
      </Menu.Content>
    </Menu>
    <Select options={[{ value: 'a', label: 'A' }]} size="lg" radius="rounded" color="success" />
    <Combobox options={[]} filter={false} allowCustomValue size="xs" />
    <Dialog title="T" radius="xl" size="lg" />
    <Drawer title="T" side="left" />
    <Tabs defaultValue="a" size="sm" color="success" />
    <Tabs value="a" onValueChange={() => {}} />
    <Table density="dense" striped interactive />
    <Badge color="success" variant="outline" size="sm" radius="rounded" onRemove={() => {}} />
    <Alert color="warning" variant="solid" radius="md" live="polite" onDismiss={() => {}} />
    <Spinner size="xl" color="danger" />
    <Skeleton shape="control" size="lg" radius="lg" />
    <Skeleton textStyle="display" lines={3} />
    <Button loading />
    <Heading level={3} />
    <RadioGroup label="L" size="sm" color="success" orientation="horizontal" defaultValue="a">
      <Radio value="a" />
    </RadioGroup>
    <ButtonGroup size="lg" variant="outline" color="neutral" radius="rounded" attached={false} orientation="vertical" />
    <ToggleGroup type="single" defaultValue="a" required variant="quiet" selectedVariant="solid" />
    <ToggleGroup type="multiple" defaultValue={['a']} onValueChange={(v: string[]) => v} />

    {/* @ts-expect-error */}
    <Button size="gigantic" />
    {/* @ts-expect-error */}
    <Button color="primary" />
    {/* @ts-expect-error */}
    <Input radius="full" />
    {/* @ts-expect-error */}
    <Button variant="ghost" />
    {/* @ts-expect-error */}
    <IconButton />
    {/* @ts-expect-error */}
    <Switch size="huge" />
    {/* @ts-expect-error */}
    <Checkbox color="primary" />
    {/* @ts-expect-error */}
    <Field>
      <Input />
    </Field>
    {/* @ts-expect-error */}
    <Text textStyle="heading" />
    {/* @ts-expect-error */}
    <Label textStyle="heading" />
    {/* @ts-expect-error */}
    <Label color="primary" />
    {/* @ts-expect-error */}
    <Heading textStyle="title" />
    {/* @ts-expect-error */}
    <Heading level={7} />
    {/* @ts-expect-error */}
    <Stack gap="md" />
    {/* @ts-expect-error */}
    <Card shadow="xl" />
    {/* @ts-expect-error */}
    <Card padding="lg" />
    {/* @ts-expect-error */}
    <Tooltip>
      <Button />
    </Tooltip>
    {/* @ts-expect-error */}
    <Menu.Item color="primary" />
    {/* @ts-expect-error */}
    <Select options={[]} size="huge" />
    {/* @ts-expect-error */}
    <Combobox options={[]} radius="full" />
    {/* @ts-expect-error */}
    <Card radius="size" />
    {/* @ts-expect-error */}
    <Popover.Content padding="md" />
    {/* @ts-expect-error */}
    <Select options={[{ value: 'a' }]} />
    {/* @ts-expect-error */}
    <Dialog />
    {/* @ts-expect-error */}
    <Drawer title="T" side="top" />
    {/* @ts-expect-error */}
    <Dialog title="T" size="huge" />
    {/* @ts-expect-error */}
    <Dialog title="T" width="40rem" />
    {/* @ts-expect-error */}
    <Tabs />
    {/* @ts-expect-error */}
    <Tabs value="a" defaultValue="b" />
    {/* @ts-expect-error */}
    <Table density="comfortable" />
    {/* @ts-expect-error */}
    <Badge variant="soft" />
    {/* @ts-expect-error */}
    <Alert live="rude" />
    {/* @ts-expect-error */}
    <Spinner size="huge" />
    {/* @ts-expect-error */}
    <Skeleton shape="triangle" />
    {/* @ts-expect-error */}
    <Skeleton textStyle="heading" />
    {/* @ts-expect-error */}
    <RadioGroup>
      <Radio value="a" />
    </RadioGroup>
    {/* @ts-expect-error */}
    <ButtonGroup variant="soft" />
    {/* @ts-expect-error */}
    <ToggleGroup defaultValue="a" />
    {/* @ts-expect-error */}
    <ToggleGroup type="multiple" defaultValue="a" />
    {/* @ts-expect-error */}
    <ToggleGroup type="multiple" required />
    {/* @ts-expect-error */}
    <ToggleGroup type="single" selectedVariant="filled" />
  </>
);

toast({ title: 'ok', color: 'success' });
// @ts-expect-error
toast({ title: 'bad', color: 'primary' });
