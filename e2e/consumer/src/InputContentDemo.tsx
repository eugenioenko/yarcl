import { useState } from 'react';
import { Button, Field, Input, Stack } from '@yarcl/react';

function SearchIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
  </svg>;
}

export function InputContentDemo() {
  const [search, setSearch] = useState('Linen');
  const [amount, setAmount] = useState('12.50');
  const [visible, setVisible] = useState(false);
  return (
    <Stack data-testid="input-content-demo">
      <Field label="Search catalog">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          startContent={<span className="input-content-inset"><SearchIcon /></span>}
          endContent={<Button variant="filled" disabled={!search} onClick={() => setSearch('')}>Clear</Button>}
        />
      </Field>
      <Field label="Amount" description="Amount in US dollars." error={amount !== '' && (!Number.isFinite(Number(amount)) || Number(amount) <= 0) ? 'Enter an amount greater than zero.' : undefined}>
        <Input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} startContent={<span className="input-content-inset">$</span>} endContent={<span className="input-content-inset">USD</span>} />
      </Field>
      <Field label="Password">
        <Input
          type={visible ? 'text' : 'password'}
          defaultValue="example-password"
          endContent={<Button variant="text" aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? 'Hide password' : 'Show password'}</Button>}
        />
      </Field>
    </Stack>
  );
}
