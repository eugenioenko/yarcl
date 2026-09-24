import { Accordion, Badge, Breadcrumb, Button, Combobox, CommandPalette, DatePicker, Dialog, Heading, Inline, Input, Label, NumberInput, Pagination, Progress, Slider, Stack, Table, Text } from '@yarcl/react';

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
    <Pagination count={8} size="talla-s" color="clay" radius="square" variant="text" selectedVariant="filled" />
    <DatePicker size="talla-s" color="clay" variant="wash" radius="hairline" />
    <CommandPalette commands={[]} size="talla-s" color="moss" radius="square" />
    <Breadcrumb textStyle="fine" color="clay" underline="always" maxItems={3} separator="/">
      <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
    </Breadcrumb>
    <Accordion type="multiple" size="talla-s" radius="hairline" color="moss" />
    <Combobox multiple options={[]} size="talla-s" color="clay" radius="square" maxSelected={2} onValueChange={(v: string[]) => v} />
    <NumberInput size="talla-s" color="moss" radius="square" min={1} />

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
    <NumberInput size="md" />
    {/* @ts-expect-error */}
    <NumberInput color="brand" />
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
    {/* @ts-expect-error */}
    <Pagination count={8} size="sm" />
    {/* @ts-expect-error */}
    <Pagination count={8} selectedVariant="solid" />
    {/* @ts-expect-error */}
    <DatePicker size="md" />
    {/* @ts-expect-error */}
    <DatePicker variant="solid" />
    {/* @ts-expect-error */}
    <DatePicker color="primary" />
    {/* @ts-expect-error */}
    <CommandPalette commands={[]} size="md" />
    {/* @ts-expect-error */}
    <CommandPalette commands={[]} color="brand" />
    {/* @ts-expect-error */}
    <Breadcrumb textStyle="caption" />
    {/* @ts-expect-error */}
    <Breadcrumb color="primary" />
    {/* @ts-expect-error */}
    <Accordion type="single" size="md" />
    {/* @ts-expect-error */}
    <Accordion type="single" color="primary" />
    {/* @ts-expect-error */}
    <Accordion type="single" radius="md" />
    {/* @ts-expect-error */}
    <Combobox multiple options={[]} size="md" />
    {/* @ts-expect-error */}
    <Combobox multiple options={[]} color="brand" />
    {/* @ts-expect-error */}
    <Combobox multiple options={[]} value="natural" />
  </>
);
