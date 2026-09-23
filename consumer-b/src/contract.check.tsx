import { Badge, Button, Heading, Inline, Input, Stack, Table, Text } from 'yarcl';

export const contract = (
  <>
    <Button size="talla-l" color="clay" variant="wash" radius="hairline" />
    <Stack gap="12" />
    <Text textStyle="price" />
    <Heading level={1} />
    <Table density="cozy" />

    {/* consumer A's keys are not valid here */}
    {/* @ts-expect-error */}
    <Button size="md" />
    {/* @ts-expect-error */}
    <Button color="brand" />
    {/* @ts-expect-error */}
    <Button variant="solid" />
    {/* @ts-expect-error */}
    <Input radius="soft" />
    {/* @ts-expect-error */}
    <Inline gap="normal" />
    {/* @ts-expect-error */}
    <Text textStyle="body" />
    {/* @ts-expect-error */}
    <Badge variant="subtle" />
    {/* @ts-expect-error */}
    <Table density="regular" />
  </>
);
