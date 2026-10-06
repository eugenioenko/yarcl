import { useState } from 'react';
import { Button, Field, Input, Stack } from '@yarcl/react';
import { SearchIcon } from './icons';

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
          startContent={<SearchIcon />}
          endContent={<Button variant="quiet" disabled={!search} onClick={() => setSearch('')}>Clear</Button>}
        />
      </Field>
      <Field label="Amount" description="Amount in US dollars." error={amount !== '' && Number(amount) <= 0 ? 'Enter an amount greater than zero.' : undefined}>
        <Input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} startContent="$" endContent="USD" />
      </Field>
      <Field label="Password">
        <Input
          type={visible ? 'text' : 'password'}
          defaultValue="example-password"
          endContent={<Button variant="quiet" aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? 'Hide password' : 'Show password'}</Button>}
        />
      </Field>
    </Stack>
  );
}
