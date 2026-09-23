import {
  Button,
  Card,
  Checkbox,
  Divider,
  Field,
  Heading,
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
    <Button size="xl" color="warning" radius="pill" variant="subtle" />
    <Input size="xs" color="danger" radius="square" />
    <IconButton aria-label="Add" variant="quiet" />
    <Textarea size="lg" radius="round" />
    <Checkbox size="sm" color="success" indeterminate />
    <Radio size="lg" color="neutral" />
    <Switch size="xl" color="brand" />
    <Field label="Name">
      <Input />
    </Field>
    <Text textStyle="caption" color="danger" truncate={2} />
    <Heading level={2} textStyle="display" />
    <Link color="neutral" underline="hover" external />
    <Stack gap="loose" align="center" as="ul" />
    <Inline gap="tight" justify="between" wrap={false} />
    <Card padding="tight" radius="pill" shadow="lg" as="article" />
    <Divider orientation="vertical" />

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
    <Heading textStyle="title" />
    {/* @ts-expect-error */}
    <Heading level={7} />
    {/* @ts-expect-error */}
    <Stack gap="md" />
    {/* @ts-expect-error */}
    <Card shadow="xl" />
    {/* @ts-expect-error */}
    <Card padding="lg" />
  </>
);
