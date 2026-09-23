import { Button, Input } from 'yarcl';

export const contract = (
  <>
    <Button size="xl" color="warning" radius="pill" />
    <Input size="xs" color="danger" radius="square" />
    {/* @ts-expect-error */}
    <Button size="gigantic" />
    {/* @ts-expect-error */}
    <Button color="primary" />
    {/* @ts-expect-error */}
    <Input radius="full" />
  </>
);
