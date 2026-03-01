import { useFlag } from 'yarcl';
import { flags } from '../flags.config';
import type { FlagKey } from 'yarcl';
import { label } from './shared';

const flagKeys = Object.keys(flags) as FlagKey[];

function FlagRow({ name }: { name: FlagKey }) {
  const value = useFlag(name);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: value ? 'var(--color-success)' : 'var(--color-border)' }} />
      <code>{name}</code>
      <span style={{ opacity: 0.5 }}>{String(value)}</span>
    </div>
  );
}

export function FlagsDemo() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <h2>Feature flags</h2>
      {label('Flags from config — invalid key is a TS error')}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {flagKeys.map((key) => <FlagRow key={key} name={key} />)}
      </div>
    </section>
  );
}
