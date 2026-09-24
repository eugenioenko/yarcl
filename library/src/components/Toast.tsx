import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { colorClass, cx } from '../classes';
import type { Color } from '../types';
import { useDefaults } from '../runtime';


/** Options for {@link toast}. */
export interface ToastOptions {
  /** Main message. */
  title: ReactNode;
  /** Supporting text. */
  description?: ReactNode;
  /**
   * Accent color, from the `colors` config.
   * @default config.defaults.color
   */
  color?: Color;
  /**
   * Time before it dismisses itself, in ms. Paused while hovered or focused. `0` keeps it until dismissed.
   * @default 5000
   */
  duration?: number;
  /** A single action, e.g. Undo. Choosing it dismisses the toast. */
  action?: { label: string; onClick: () => void };
  /** Announces immediately (`role="alert"`) instead of politely. Use for errors that need attention. */
  urgent?: boolean;
}

interface ToastEntry extends ToastOptions {
  id: string;
}

let entries: ToastEntry[] = [];
let counter = 0;
const listeners = new Set<() => void>();

function emit(next: ToastEntry[]) {
  entries = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Shows a toast notification. Requires one {@link Toaster} rendered in the app.
 * Returns the toast's id, for {@link toast.dismiss}.
 *
 * @example
 * ```ts
 * toast({ title: 'Saved', color: 'success' });
 * toast({ title: 'Message deleted', action: { label: 'Undo', onClick: restore } });
 * ```
 */
export function toast(options: ToastOptions): string {
  const id = `yarcl-toast-${++counter}`;
  emit([...entries, { id, ...options }]);
  return id;
}

/** Dismisses a toast by id, or all toasts when called without one. */
toast.dismiss = (id?: string) => emit(id ? entries.filter((entry) => entry.id !== id) : []);

/** Props for {@link Toaster}. */
export interface ToasterProps {
  /**
   * Screen corner or edge where toasts appear.
   * @default 'bottom-right'
   */
  placement?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  /**
   * Maximum toasts shown at once. When exceeded, the oldest are dismissed.
   * @default 4
   */
  limit?: number;
  /**
   * Accessible name of the notifications region.
   * @default 'Notifications'
   */
  label?: string;
}

function useModalHost() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const update = () => {
      const modals = [...document.querySelectorAll('dialog')].filter((dialog) => dialog.matches(':modal'));
      setHost(modals.at(-1) ?? null);
    };
    const observer = new MutationObserver(update);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['open'] });
    update();
    return () => observer.disconnect();
  }, []);
  return host;
}

/**
 * Renders toasts created with {@link toast}. Render once, near the app root.
 * Lives in the browser's top layer, so toasts show above everything. While a modal
 * {@link Dialog} or {@link Drawer} is open, toasts render inside it so they stay interactive.
 *
 * @example
 * ```tsx
 * <App />
 * <Toaster placement="top-right" />
 * ```
 */
export function Toaster({ placement = 'bottom-right', limit = 4, label = 'Notifications' }: ToasterProps) {
  const all = useSyncExternalStore(subscribe, () => entries, () => entries);
  const visible = all.slice(-limit);
  const ref = useRef<HTMLElement>(null);
  const host = useModalHost();

  useEffect(() => {
    if (all.length > limit) emit(all.slice(-limit));
  }, [all, limit]);

  useEffect(() => {
    const region = ref.current;
    if (!region?.showPopover) return;
    if (region.matches(':popover-open')) region.hidePopover();
    if (visible.length > 0) region.showPopover();
  }, [visible.length, all, host]);

  const region = (
    <section
      ref={ref}
      popover="manual"
      aria-label={label}
      className={cx('yarcl-toaster', `yarcl-toaster-${placement}`)}
    >
      {(placement.startsWith('top') ? [...visible].reverse() : visible).map((entry) => (
        <ToastItem key={entry.id} entry={entry} />
      ))}
    </section>
  );

  return host ? createPortal(region, host) : region;
}

function ToastItem({ entry }: { entry: ToastEntry }) {
  const own = useDefaults('Toast');
  const { id, title, description, color, duration = 5000, action, urgent } = entry;
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || duration <= 0) return;
    const timer = setTimeout(() => toast.dismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, paused]);

  return (
    <div
      role={urgent ? 'alert' : 'status'}
      className={cx('yarcl-toast', colorClass(color ?? own.color))}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="yarcl-toast-text">
        <div className="yarcl-toast-title">{title}</div>
        {description != null && <div className="yarcl-toast-description">{description}</div>}
      </div>
      {action && (
        <button
          type="button"
          className="yarcl-toast-action"
          onClick={() => {
            action.onClick();
            toast.dismiss(id);
          }}
        >
          {action.label}
        </button>
      )}
      <button type="button" className="yarcl-toast-close" aria-label="Dismiss" onClick={() => toast.dismiss(id)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}
