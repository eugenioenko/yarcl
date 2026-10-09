import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  DatePicker,
  FileDropzone,
  Inline,
  Label,
  Pagination,
  Select,
  Spinner,
  Stack,
  config,
  useConfig,
} from '@yarcl/react';
import { applyTheme, resetTheme } from '@yarcl/react/css';
import { enUS, es } from 'date-fns/locale';

const spanish = {
  ...config.labels,
  close: 'Cerrar',
  dismiss: 'Descartar',
  remove: 'Quitar',
  loading: 'Cargando',
  removeItem: (name: string) => `Quitar ${name}`,
  pagination: 'Páginas',
  previousPage: 'Página anterior',
  nextPage: 'Página siguiente',
  page: (page: number) => `Página ${page}`,
  pageSummary: (page: number, count: number) => `Página ${page} de ${count}`,
  chooseDate: 'Elegir fecha',
  previousMonth: 'Mes anterior',
  nextMonth: 'Mes siguiente',
  chooseFile: 'Elegir archivo',
  chooseFiles: 'Elegir archivos',
  replaceFile: 'Reemplazar archivo',
  dropFile: 'o arrastra un archivo aquí',
  dropFiles: 'o arrastra archivos aquí',
  dropReplacement: 'o arrastra un reemplazo aquí',
};

/** Shows live catalog changes, application copy and the separate calendar locale. */
export function LabelsDemo() {
  const current = useConfig();
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [showTag, setShowTag] = useState(true);
  const [showNotice, setShowNotice] = useState(true);
  useEffect(() => () => resetTheme(), []);
  const translated = language === 'es';
  return (
    <Stack>
      <Inline>
        <Label htmlFor="copy-language">Language</Label>
        <Select
          id="copy-language"
          value={language}
          options={[
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Español' },
          ]}
          onValueChange={(next) => {
            if (!next) return;
            setLanguage(next);
            applyTheme({ ...current, labels: next === 'es' ? spanish : config.labels });
          }}
        />
        <Spinner />
        {showTag && (
          <Badge onRemove={() => setShowTag(false)}>{translated ? 'Etiqueta' : 'Tag'}</Badge>
        )}
      </Inline>
      {showNotice && (
        <Alert
          title={translated ? 'Cambios guardados' : 'Changes saved'}
          onDismiss={() => setShowNotice(false)}
        />
      )}
      <Pagination count={5} layout="compact" />
      <DatePicker
        aria-label={translated ? 'Fecha' : 'Date'}
        locale={translated ? es : enUS}
        placeholder={translated ? 'Elegir una fecha' : 'Choose a date'}
      />
      <FileDropzone label={translated ? 'Documento' : 'Document'} />
    </Stack>
  );
}
