import { translations } from '@yarcl/i18n';
import type { Locale, TranslationKey } from './i18n.types';

export function useTranslation(locale?: Locale) {
  const activeLocale: Locale = locale ?? (Object.keys(translations)[0] as Locale);

  function t(key: TranslationKey): string {
    return (translations[activeLocale] as Record<string, string>)[key as string];
  }

  return { t, locale: activeLocale };
}
