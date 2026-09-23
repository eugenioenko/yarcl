import { createContext, useContext } from 'react';
import { cx } from './classes';

export interface FieldContextValue {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean | undefined;
}

export const FieldContext = createContext<FieldContextValue | null>(null);

interface FieldControlProps {
  id?: string;
  required?: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling';
}

export function useFieldProps<T extends FieldControlProps>(props: T): T {
  const field = useContext(FieldContext);
  if (!field) return props;
  return {
    ...props,
    id: props.id ?? field.id,
    required: props.required ?? field.required,
    'aria-describedby': cx(field.describedBy, props['aria-describedby']) || undefined,
    'aria-invalid': props['aria-invalid'] ?? (field.invalid || undefined),
  };
}
