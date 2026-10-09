import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

/** Runs a control's reset callback after propagation if the form reset was not canceled. */
export function useFormReset(elementRef: RefObject<HTMLElement | null> | undefined, onReset: (() => void) | undefined) {
  const callbackRef = useRef(onReset);
  const enabled = onReset !== undefined;
  useEffect(() => {
    callbackRef.current = onReset;
  }, [onReset]);
  useEffect(() => {
    const form = elementRef?.current?.closest('form');
    if (!form || !enabled) return;
    const pending = new Set<ReturnType<typeof setTimeout>>();
    const handleReset = (event: Event) => {
      const timer = setTimeout(() => {
        pending.delete(timer);
        if (!event.defaultPrevented) callbackRef.current?.();
      }, 0);
      pending.add(timer);
    };
    form.addEventListener('reset', handleReset);
    return () => {
      form.removeEventListener('reset', handleReset);
      pending.forEach(clearTimeout);
    };
  }, [elementRef, enabled]);
}

export function useControllable<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
  elementRef?: RefObject<HTMLElement | null>,
): [T, (next: T) => void] {
  const [internal, setInternal] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : internal;

  const reset = useCallback(() => {
    setInternal(defaultValue);
    onChange?.(defaultValue);
  }, [defaultValue, onChange]);
  useFormReset(elementRef, controlled ? undefined : reset);

  const set = useCallback(
    (next: T) => {
      if (!controlled) setInternal(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );
  return [current, set];
}
