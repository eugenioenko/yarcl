import { useId, useRef, useState, type ComponentProps, type DragEvent, type ReactNode } from 'react';
import { cx } from '../classes';
import { Button } from './Button';

/** Props for {@link FileDropzone}. */
export interface FileDropzoneProps extends Omit<ComponentProps<'div'>, 'children' | 'onDrop' | 'onChange'> {
  /** Visible label for the picker and drop area. */
  label: string;
  /** Optional helper text below the label. */
  description?: string;
  /** Accepted extensions or MIME types, as on a native file input. */
  accept?: string;
  /** Allows more than one file. */
  multiple?: boolean;
  /** Disables picking and dropping files. */
  disabled?: boolean;
  /** Called whenever the selected file list changes. */
  onFilesChange?: (files: File[]) => void;
  /** Custom file list renderer. Receives the files and a remove function. */
  children?: (files: readonly File[], removeFile: (index: number) => void) => ReactNode;
}

function accepts(file: File, accept?: string): boolean {
  if (!accept) return true;
  return accept.split(',').some((part) => {
    const pattern = part.trim().toLowerCase();
    if (!pattern) return false;
    if (pattern.startsWith('.')) return file.name.toLowerCase().endsWith(pattern);
    if (pattern.endsWith('/*')) return file.type.toLowerCase().startsWith(pattern.slice(0, -1));
    return file.type.toLowerCase() === pattern;
  });
}

/** Accessible file picker and drop area with an optional custom file list. */
export function FileDropzone({
  label,
  description,
  accept,
  multiple = false,
  disabled = false,
  onFilesChange,
  children,
  className,
  onDragEnter,
  onDragLeave,
  onDragOver,
  ...props
}: FileDropzoneProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);

  function update(next: File[]) {
    setFiles(next);
    onFilesChange?.(next);
  }

  function select(incoming: FileList | File[]) {
    const selected = Array.from(incoming).filter((file) => accepts(file, accept));
    if (!selected.length) return;
    update(multiple ? selected : selected.slice(0, 1));
  }

  function removeFile(index: number) {
    update(files.filter((_, i) => i !== index));
    if (input.current) input.current.value = '';
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (!disabled) select(event.dataTransfer.files);
  }

  return (
    <div
      role="group"
      aria-labelledby={id}
      className={cx('yarcl-file-dropzone', dragging && 'yarcl-file-dropzone-dragging', disabled && 'yarcl-file-dropzone-disabled', className)}
      onDragEnter={(event) => {
        onDragEnter?.(event);
        if (!disabled && event.dataTransfer.types.includes('Files')) setDragging(true);
      }}
      onDragLeave={(event) => {
        onDragLeave?.(event);
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
      }}
      onDragOver={(event) => {
        onDragOver?.(event);
        if (!disabled && event.dataTransfer.types.includes('Files')) event.preventDefault();
      }}
      onDrop={handleDrop}
      {...props}
    >
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        hidden
        tabIndex={-1}
        onChange={(event) => {
          select(event.currentTarget.files ?? []);
          event.currentTarget.value = '';
        }}
      />
      <strong id={id}>{label}</strong>
      {description && <span className="yarcl-file-dropzone-description">{description}</span>}
      <Button disabled={disabled} onClick={() => input.current?.click()}>Choose files</Button>
      <span className="yarcl-file-dropzone-hint">or drop files here</span>
      <div aria-live="polite" className="yarcl-file-dropzone-files">
        {children ? children(files, removeFile) : files.length > 0 && (
          <ul>
            {files.map((file, index) => (
              <li key={`${file.name}-${file.lastModified}-${index}`}>
                <span>{file.name}</span>
                <button type="button" onClick={() => removeFile(index)} aria-label={`Remove ${file.name}`}>Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
