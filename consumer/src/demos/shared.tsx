export function label(text: string) {
  return <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase' }}>{text}</p>;
}

export function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>{children}</div>;
}

export const divider = (
  <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />
);
