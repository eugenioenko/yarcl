import {
  arrow,
  flip,
  offset,
  shift,
  size,
  useMergeRefs,
  type Middleware,
} from '@floating-ui/react';
import { cloneElement, isValidElement, type ReactElement, type Ref, type RefObject } from 'react';

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

export function useTrigger(
  child: ReactElement,
  setReference: (node: Element | null) => void,
  getReferenceProps: (props?: Record<string, unknown>) => Record<string, unknown>,
): ReactElement {
  if (!isValidElement(child)) throw new Error('yarcl: trigger must be a single React element');
  const element = child as ElementWithRef;
  const ref = useMergeRefs([setReference, element.props.ref]);
  return cloneElement(element, getReferenceProps({ ...(element.props as Record<string, unknown>), ref }));
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
