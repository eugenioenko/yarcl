import {
  arrow,
  flip,
  offset,
  shift,
  size,
  useMergeRefs,
  type Middleware,
} from '@floating-ui/react';
import { cloneElement, isValidElement, type HTMLAttributes, type ReactElement, type Ref, type RefObject } from 'react';

interface MiddlewareOptions {
  gap?: number;
  matchWidth?: boolean;
  arrowRef?: RefObject<SVGSVGElement | null>;
}

export function floatingMiddleware({ gap = 6, matchWidth = false, arrowRef }: MiddlewareOptions = {}): Middleware[] {
  return [
    offset(gap),
    flip({ padding: 8 }),
    shift({ padding: 8 }),
    size({
      padding: 8,
      apply({ rects, availableHeight, elements }) {
        elements.floating.style.maxHeight = `${Math.max(availableHeight, 120)}px`;
        if (matchWidth) elements.floating.style.minWidth = `${rects.reference.width}px`;
      },
    }),
    ...(arrowRef ? [arrow({ element: arrowRef })] : []),
  ];
}

type ElementWithRef = ReactElement<{ ref?: Ref<Element> }>;
type Handler = (...args: unknown[]) => void;

/** Props a wrapping trigger (e.g. a Tooltip around a Menu.Trigger) passes through to the child. */
export type TriggerPassthrough = HTMLAttributes<HTMLElement> & { ref?: Ref<Element> };

function mergeTriggerProps(outer: Record<string, unknown>, inner: Record<string, unknown>): Record<string, unknown> {
  const merged = { ...outer, ...inner };
  if (outer.className && inner.className) merged.className = `${outer.className} ${inner.className}`;
  if (outer.style && inner.style) merged.style = { ...outer.style as object, ...inner.style as object };
  for (const key of ['aria-describedby', 'aria-labelledby']) {
    if (outer[key] && inner[key]) merged[key] = [...new Set(`${outer[key]} ${inner[key]}`.split(/\s+/))].join(' ');
  }
  for (const key of Object.keys(outer)) {
    const a = inner[key];
    const b = outer[key];
    if (/^on[A-Z]/.test(key) && typeof a === 'function' && typeof b === 'function') {
      merged[key] = (...args: unknown[]) => {
        (a as Handler)(...args);
        (b as Handler)(...args);
      };
    }
  }
  return merged;
}

export function useTrigger(
  child: ReactElement,
  setReference: (node: Element | null) => void,
  getReferenceProps: (props?: Record<string, unknown>) => Record<string, unknown>,
  passthrough: TriggerPassthrough = {},
): ReactElement {
  if (!isValidElement(child)) throw new Error('yarcl: trigger must be a single React element');
  const element = child as ElementWithRef;
  const { ref: outerRef, ...outer } = passthrough;
  const ref = useMergeRefs([setReference, element.props.ref, outerRef]);
  return cloneElement(element, getReferenceProps({ ...mergeTriggerProps(outer, element.props as Record<string, unknown>), ref }));
}

export function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="m5 12 5 5 9-10" />
    </svg>
  );
}
