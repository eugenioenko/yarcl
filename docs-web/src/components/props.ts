/** A TypeDoc declaration used to render public prop tables. */
export interface PropNode {
  id: number;
  name: string;
  kind?: number;
  flags: { isOptional?: boolean; isExternal?: boolean };
  comment?: { summary?: { kind: string; text: string }[]; blockTags?: { tag: string; content: { kind: string; text: string }[] }[] };
  children?: PropNode[];
  type?: Record<string, any>;
}

/** Collects interface and union/intersection alias properties without losing conditional optionality. */
export function publicProps(api: { children?: PropNode[] }, name: string): PropNode[] {
  const nodes = new Map<number, PropNode>();
  function walk(node: { children?: PropNode[] }) {
    for (const child of node.children ?? []) { nodes.set(child.id, child); walk(child); }
  }
  walk(api);
  const target = [...nodes.values()].find((node) => node.name === name);
  if (!target) throw new Error(`Props: no declaration named "${name}"`);

  function properties(type: Record<string, any> | undefined, seen: Set<number>): PropNode[] {
    if (!type) return [];
    if (type.type === 'reflection') return type.declaration?.children ?? [];
    if (type.type === 'reference' && typeof type.target === 'number') {
      if (seen.has(type.target)) return [];
      const node = nodes.get(type.target);
      return node?.children ?? properties(node?.type, new Set([...seen, type.target]));
    }
    if (type.type !== 'intersection' && type.type !== 'union') return [];
    const branches: PropNode[][] = type.types.map((entry: Record<string, any>) => properties(entry, seen));
    const names = new Set(branches.flatMap((branch) => branch.map((node) => node.name)));
    return [...names].flatMap((name) => {
      const matches = branches.map((branch) => branch.find((node) => node.name === name));
      const present = matches.filter((node): node is PropNode => !!node);
      const types = present.flatMap((node) => node.type?.type === 'union' ? node.type.types : node.type ? [node.type] : []).filter((entry) => entry.type !== 'intrinsic' || entry.name !== 'never');
      const unique = [...new Map(types.map((entry) => [JSON.stringify(entry), entry])).values()];
      if (!unique.length) return [];
      return [{
        ...present[0],
        comment: present.find((node) => node.comment)?.comment,
        flags: {
          isExternal: present.every((node) => node.flags.isExternal),
          isOptional: type.type === 'union' ? matches.some((node) => !node || node.flags.isOptional) : present.every((node) => node.flags.isOptional),
        },
        type: unique.length === 1 ? unique[0] : { type: 'union', types: unique },
      }];
    });
  }
  const result = target.children ?? properties(target.type, new Set([target.id]));
  if (!result.length) throw new Error(`Props: no declaration with properties named "${name}"`);
  return result;
}
