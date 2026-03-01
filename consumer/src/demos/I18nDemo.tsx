import { useState } from 'react';
import { Button, useTranslation } from 'yarcl';
import { translations } from '../i18n.config';
import type { Locale, TranslationKey } from 'yarcl';
import { label, Row } from './shared';

const locales = Object.keys(translations) as Locale[];
const translationKeys = Object.keys(translations.en) as TranslationKey[];

export function I18nDemo() {
  const [locale, setLocale] = useState<Locale>(locales[0]);
  const { t } = useTranslation(locale);


  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <h2>Translations</h2>
      {label('Keys from config — missing key is a TS error')}

      <Row>
        {locales.map((l) => (
          <Button key={l} size="sm" onClick={() => setLocale(l)}>
            {l}
          </Button>
        ))}
      </Row>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {translationKeys.map((key) => (
          <div key={key} style={{ display: 'flex', gap: '0.75rem' }}>
            <code style={{ opacity: 0.45, minWidth: '12rem' }}>{key}</code>
            <span>{t(key)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
