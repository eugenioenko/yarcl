import { Button, Checkbox, Field, IconButton, Input, Radio, Switch, Textarea } from 'yarcl';

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
  </>
);
