import { Modal, type ModalProps } from './Modal.js';
import type { ModalSize, Radius } from '../types.js';
import { useDefaults } from '../runtime.js';


/** Props for {@link Dialog}. */
export interface DialogProps extends ModalProps {
  /**
   * Corner radius, from the `radii` config.
   * @default config.defaults.radius
   */
  radius?: Radius;
}

/**
 * A modal dialog built on the native `<dialog>` element: focus is trapped, the page behind is inert
 * and doesn't scroll, and Esc closes it.
 *
 * @example
 * ```tsx
 * <Dialog
 *   trigger={<Button color="danger">Delete</Button>}
 *   title="Delete project?"
 *   description="This can't be undone."
 *   footer={<Button color="danger" onClick={remove}>Delete</Button>}
 * />
 * ```
 */
export function Dialog(props: DialogProps) {
  const own = useDefaults('Dialog');
  return (
    <Modal
      {...props}
      size={props.size ?? (own.size as ModalSize | undefined)}
      radius={props.radius ?? (own.radius === 'size' ? undefined : own.radius)}
      className="yarcl-dialog"
    />
  );
}
