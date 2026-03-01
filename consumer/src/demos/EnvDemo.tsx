import { env } from 'yarcl';
import { envSchema } from '../env.config';
import type { EnvKey } from 'yarcl';
import { label } from './shared';

const envKeys = Object.keys(envSchema) as EnvKey[];

export function EnvDemo() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <h2>Environment variables</h2>
      {label('Schema from config — undeclared var is a TS error')}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {envKeys.map((key) => (
          <div key={key} style={{ display: 'flex', gap: '0.75rem' }}>
            <code style={{ opacity: 0.45, minWidth: '12rem' }}>{key}</code>
            <span>{env[key] || <em style={{ opacity: 0.4 }}>not set</em>}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
