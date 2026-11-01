import {
  arrow,
  flip,
  FloatingPortal,
  offset,
  shift,
  size,
  useMergeRefs,
  type Middleware,
  type Strategy,
} from '@floating-ui/react';
import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';

const LayerRootContext = createContext<HTMLElement | null | undefined>(undefined);

/**
 * Makes a modal `<dialog>` the portal root for floating panels inside it. The page outside an open
 * modal is inert, so a panel portaled to `document.body` could not be used.
 */
export const LayerRootProvider = LayerRootContext.Provider;

/** Reads the inherited portal root when forwarding content through another React portal. */
export function useLayerRoot() {
  return useContext(LayerRootContext);
}

/** Inside a modal, panels use fixed positioning so the dialog's `overflow: hidden` does not clip them. */
export function useLayerStrategy(): Strategy {
  return useLayerRoot() !== undefined ? 'fixed' : 'absolute';
}

/** Portals into the nearest modal, waiting for its element to mount, or uses the default page portal. */
export function LayerPortal({ children }: { children: ReactNode }) {
  const root = useLayerRoot();
  const [portal, setPortal] = useState({ root, generation: 0 });
  if (portal.root !== root) setPortal({ root, generation: portal.generation + 1 });
  return <FloatingPortal key={portal.generation} root={root}>{children}</FloatingPortal>;
}

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
