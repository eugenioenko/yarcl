import { Modal, type ModalProps } from './Modal';

/** Props for {@link Drawer}. */
export interface DrawerProps extends ModalProps {
  /**
   * Edge the drawer is attached to.
   * @default 'right'
   */
  side?: 'left' | 'right';
}

/**
 * A modal panel that slides in from the left or right edge. Same behavior as {@link Dialog}:
 * focus is trapped, the page behind is inert, Esc closes it.
 *
 * @example
 * ```tsx
 * <Drawer side="left" trigger={<Button>Menu</Button>} title="Navigation">
 *   <Stack as="nav">…</Stack>
 * </Drawer>
 * ```
 */
export function Drawer({ side = 'right', ...props }: DrawerProps) {
  return <Modal {...props} className={`yarcl-drawer yarcl-drawer-${side}`} />;
}
