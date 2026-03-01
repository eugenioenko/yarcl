import type { translations } from '@yarcl/i18n';

export type Locale = keyof typeof translations;

// Only keys that exist in every locale are valid — intersection via keyof union
export type TranslationKey = keyof typeof translations[Locale];
