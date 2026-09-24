import { Badge, Button, Dialog, Heading, Inline, Input, Label, Progress, Slider, Stack, Table, Text } from 'yarcl';

export const contract = (
  <>
    <Button size="talla-l" color="clay" variant="wash" radius="hairline" />
    <Stack gap="12" />
    <Text textStyle="price" />
    <Label htmlFor="size" textStyle="fine" color="clay" required disabled />
    <Heading level={1} />
    <Table density="cozy" />
    <Slider size="talla-s" color="moss" radius="hairline" defaultValue={[10, 90]} />
    <Progress value={1} max={2} label="L" showValue formatValue={(v) => String(v)} size="talla-s" color="moss" radius="hairline" />

    {/* consumer A's keys are not valid here */}
    {/* @ts-expect-error */}
    <Button size="md" />
    {/* @ts-expect-error */}
    <Button color="brand" />
    {/* @ts-expect-error */}
    <Button variant="solid" />
    {/* @ts-expect-error */}
    <Input radius="lg" />
    {/* @ts-expect-error */}
    <Inline gap="normal" />
    {/* @ts-expect-error */}
    <Text textStyle="body" />
    {/* @ts-expect-error */}
    <Label textStyle="label-md" />
    {/* @ts-expect-error */}
    <Label color="danger" />
    {/* @ts-expect-error */}
    <Badge variant="subtle" />
    {/* @ts-expect-error */}
    <Table density="regular" />
    {/* @ts-expect-error */}
    <Progress size="md" />
    {/* @ts-expect-error */}
    <Progress color="brand" />
    {/* @ts-expect-error */}
    <Progress radius="lg" />
    {/* @ts-expect-error */}
    <Dialog title="T" size="md" />
    {/* @ts-expect-error */}
    <Slider size="md" />
    {/* @ts-expect-error */}
    <Slider color="brand" />
  </>
);
