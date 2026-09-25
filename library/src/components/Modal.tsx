import {
  cloneElement,
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { cx, radiusClass, typeClass } from '../classes.js';
import { useControllable } from '../hooks.js';
import type { ModalSize, Radius } from '../types.js';
import { useConfig } from '../runtime.js';

/** Props shared by {@link Dialog} and {@link Drawer}. */
export interface ModalProps {
  /** Heading of the dialog. Also its accessible name. */
  title: ReactNode;
  /** Supporting text below the title. Also its accessible description. */
  description?: ReactNode;
  /** Body content. Scrolls when it doesn't fit. */
  children?: ReactNode;
  /** Actions shown at the bottom, e.g. Cancel and Confirm buttons. */
  footer?: ReactNode;
  /** An element that opens the dialog when clicked, e.g. a {@link Button}. Optional when controlled. */
  trigger?: ReactElement<{ onClick?: (event: MouseEvent) => void }>;
  /** Controlled open state. */
  open?: boolean;
  /**
   * Initial open state when uncontrolled.
   * @default false
   */
  defaultOpen?: boolean;
  /** Called when the dialog opens or closes, including by Esc, the close button or a backdrop click. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Closes when the backdrop is clicked.
   * @default true
   */
  closeOnBackdrop?: boolean;
  /**
   * Width, from the `modalSizes` config. Height follows the content, up to the viewport.
   * @default config.defaults.modalSize (Drawer: its component default, `sm` in the library defaults)
   */
  size?: ModalSize;
}

const openModals: HTMLDialogElement[] = [];

function syncBackdrops() {
  openModals.forEach((dialog, i) => dialog.toggleAttribute('data-yarcl-covered', i < openModals.length - 1));
}

function removeOpenModal(dialog: HTMLDialogElement) {
  const index = openModals.indexOf(dialog);
  if (index === -1) return;
  openModals.splice(index, 1);
  dialog.removeAttribute('data-yarcl-covered');
  syncBackdrops();
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function useModalDialog(open: boolean, setOpen: (open: boolean) => void, closeOnBackdrop = true) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      openModals.push(dialog);
      syncBackdrops();
    } else if (!open) {
      if (dialog.open) dialog.close();
      removeOpenModal(dialog);
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    return () => {
      if (dialog) removeOpenModal(dialog);
    };
  }, []);

  return {
    ref,
    onClose(event: SyntheticEvent<HTMLDialogElement>) {
      if (event.target === event.currentTarget && open) setOpen(false);
    },
    onClick(event: MouseEvent<HTMLDialogElement>) {
      if (closeOnBackdrop && event.target === event.currentTarget) setOpen(false);
    },
  };
}

export function Modal({
  title,
  description,
  children,
  footer,
  trigger,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  closeOnBackdrop = true,
  size,
  className,
  radius,
}: ModalProps & { className: string; radius?: Radius }) {
  const config = useConfig();
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const dialogProps = useModalDialog(open, setOpen, closeOnBackdrop);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <>
      {trigger &&
        cloneElement(trigger, {
          onClick(event: MouseEvent) {
            trigger.props.onClick?.(event);
            setOpen(true);
          },
        })}
      <dialog
        {...dialogProps}
        className={cx('yarcl-modal', `yarcl-modal-size-${size ?? config.defaults.modalSize}`, radiusClass(radius), className)}
        aria-labelledby={titleId}
        aria-describedby={description != null ? descriptionId : undefined}
      >
        {open && (
          <div className="yarcl-modal-content">
            <div className="yarcl-modal-header">
              <div className="yarcl-modal-heading">
                <h2 id={titleId} className={cx('yarcl-modal-title', typeClass(config.typography.headings.h2))}>
                  {title}
                </h2>
                {description != null && (
                  <p id={descriptionId} className="yarcl-modal-description">
                    {description}
                  </p>
                )}
              </div>
              <button type="button" className="yarcl-modal-close" aria-label="Close" onClick={() => setOpen(false)}>
                <CloseIcon />
              </button>
            </div>
            {children != null && <div className="yarcl-modal-body">{children}</div>}
            {footer != null && <div className="yarcl-modal-footer">{footer}</div>}
          </div>
        )}
      </dialog>
    </>
  );
}
