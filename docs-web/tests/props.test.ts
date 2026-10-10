import { expect, test } from 'vitest';
import { publicProps, type PropNode } from '../src/components/props';

const field = (id: number, name: string, isOptional = false, isExternal = false): PropNode => ({ id, name, flags: { isOptional, isExternal }, type: { type: 'intrinsic', name: 'string' } });

test('resolves referenced base interfaces and conditionally present union fields', () => {
  const base = { id: 1, name: 'Base', flags: {}, children: [field(2, 'items'), field(3, 'title', true, true)] };
  const alias = { id: 4, name: 'Props', flags: {}, type: { type: 'intersection', types: [
    { type: 'reference', target: 1 },
    { type: 'union', types: [
      { type: 'reflection', declaration: { children: [field(5, 'value'), field(6, 'selectionMode', true)] } },
      { type: 'reflection', declaration: { children: [field(7, 'selectionMode')] } },
    ] },
  ] } };
  const props = publicProps({ children: [base, alias] }, 'Props');
  expect(props.find((node) => node.name === 'items')?.flags.isOptional).toBe(false);
  expect(props.find((node) => node.name === 'value')?.flags.isOptional).toBe(true);
  expect(props.find((node) => node.name === 'selectionMode')?.flags.isOptional).toBe(true);
  expect(props.find((node) => node.name === 'title')?.flags.isExternal).toBe(true);
  expect(props.filter((node) => node.name === 'selectionMode')).toHaveLength(1);
});

test('intersection overrides preserve required public fields and skip never branches', () => {
  const alias = { id: 1, name: 'Props', flags: {}, type: { type: 'intersection', types: [
    { type: 'reflection', declaration: { children: [field(2, 'value', true, true)] } },
    { type: 'reflection', declaration: { children: [field(3, 'value'), { ...field(4, 'ignored', true), type: { type: 'intrinsic', name: 'never' } }] } },
  ] } };
  const props = publicProps({ children: [alias] }, 'Props');
  expect(props.find((node) => node.name === 'value')?.flags).toEqual({ isOptional: false, isExternal: false });
  expect(props.find((node) => node.name === 'value')?.type).toEqual({ type: 'intrinsic', name: 'string' });
});

test('missing and cyclic declarations fail with a useful diagnostic', () => {
  expect(() => publicProps({ children: [] }, 'Unknown')).toThrow('no declaration named "Unknown"');
  const cyclic = { id: 1, name: 'Cyclic', flags: {}, type: { type: 'reference', target: 1 } };
  expect(() => publicProps({ children: [cyclic] }, 'Cyclic')).toThrow('no declaration with properties');
});
