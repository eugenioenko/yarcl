import type { yarcl } from '@yarcl/config';

// Types are derived directly from the consumer's config via keyof typeof.
// When @yarcl/config is aliased to the consumer's yarcl.config.ts,
// these types automatically reflect whatever keys they defined.
export type ButtonSize   = keyof typeof yarcl.button.sizes;
export type ButtonRadius = keyof typeof yarcl.button.radii;
export type ButtonColor  = keyof typeof yarcl.colors;
