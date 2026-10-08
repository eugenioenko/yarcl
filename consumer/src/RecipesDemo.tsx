import { useState } from 'react';
import { Button, createComponent, Heading, Inline, Stack } from '@yarcl/react';

const Action = createComponent('Action', Button);
const OrderStatus = createComponent('OrderStatus', 'div', ({ rootProps, slots }) => (
  <div {...rootProps}>
    <span className={slots.icon} aria-hidden="true">✓</span>
    <span className={slots.label}>{rootProps.children}</span>
  </div>
));

/** Demonstrates a styled Button extension and a custom component using config recipes. */
export function RecipesDemo() {
  const [paid, setPaid] = useState(false);
  return (
    <Stack as="section" aria-label="Component extensions">
      <Heading level={2}>Component extensions</Heading>
      <Inline>
        <OrderStatus status={paid ? 'paid' : 'pending'} emphasis={paid ? 'strong' : 'subtle'} role="status">
          {paid ? 'Payment received' : 'Payment pending'}
        </OrderStatus>
        <Action emphasis="strong" onClick={() => setPaid(!paid)}>
          {paid ? 'Reset payment' : 'Mark as paid'}
        </Action>
      </Inline>
    </Stack>
  );
}
