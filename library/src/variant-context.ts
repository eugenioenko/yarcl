import { createContext, useContext } from 'react';
import { variantClass } from './classes';

/** @internal Shares a composite recipe only with the intended child component family. */
export const VariantContext = createContext<{ button?: string; avatar?: string } | null>(null);

/** @internal Explicit child variants override a group's recipe; component defaults follow it. */
export function useVariantClass(variant: string | undefined, component: 'Button' | 'IconButton' | 'Avatar', soft = false) {
  const inherited = useContext(VariantContext)?.[component === 'Avatar' ? 'avatar' : 'button'];
  return variant !== undefined || inherited === undefined ? variantClass(variant, component, soft) : inherited;
}
