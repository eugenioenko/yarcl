import { useEffect, useId, useRef, useState, type ComponentProps, type DragEvent, type ReactNode } from 'react';
import { cx } from '../classes';
import { Button } from './Button';
import { useLabels } from '../runtime';
import type { FileDropzoneLabels } from '../labels';

/** Props for {@link FileDropzone}. */
export interface FileDropzoneProps extends Omit<ComponentProps<'div'>, 'children' | 'onDrop' | 'onChange' | 'defaultValue'> {
  /** Visible label for the picker and drop area. */
  label: string;
  /** Optional helper text below the label. */
  description?: string;
  /** Overrides the active catalog for this picker. Unspecified entries keep config labels. */
  labels?: Partial<FileDropzoneLabels>;
  /** Accepted extensions or MIME types, as on a native file input. */
  accept?: string;
  /** Allows more than one file. */
  multiple?: boolean;
  /** Selected file in single-file mode. Use `null` for no file. */
  value?: File | null;
  /** Initial file in uncontrolled single-file mode. */
  defaultValue?: File | null;
  /** Called with the selected file or `null` when it is removed in single-file mode. */
  onChange?: (file: File | null) => void;
  /** Shows a thumbnail when the selected file is an image. */
  preview?: boolean;
  /** Image URL for an existing remote file in single-file mode. */
  previewUrl?: string;
  /** Name shown for a remote file supplied through `previewUrl`. */
  previewName?: string;
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
  labels,
  accept,
  multiple = false,
  value,
  defaultValue,
  onChange,
  preview = false,
  previewUrl,
  previewName,
  disabled = false,
  onFilesChange,
  children,
  className,
  onDragEnter,
  onDragLeave,
  onDragOver,
  ...props
}: FileDropzoneProps) {
  const catalog = useLabels();
  const {
    chooseFile = catalog.chooseFile,
    chooseFiles = catalog.chooseFiles,
    replaceFile = catalog.replaceFile,
    dropFile = catalog.dropFile,
    dropFiles = catalog.dropFiles,
    dropReplacement = catalog.dropReplacement,
    currentImage = catalog.currentImage,
    currentImageName = catalog.currentImageName,
    selectedImage = catalog.selectedImage,
    previewImage = catalog.previewImage,
    remove = catalog.remove,
    removeItem = catalog.removeItem,
  } = labels ?? {};
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [internalValue, setInternalValue] = useState<File | null>(defaultValue ?? null);
  const [localPreview, setLocalPreview] = useState<{ file: File; url: string } | null>(null);
  const [dismissedPreviewUrl, setDismissedPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const currentFile = value !== undefined ? value : internalValue;
  const currentFiles = multiple ? files : currentFile ? [currentFile] : [];
  const remotePreviewUrl = previewUrl === dismissedPreviewUrl ? undefined : previewUrl;
  const hasCurrent = !multiple && (currentFile != null || remotePreviewUrl != null);
  const imageUrl = currentFile
    ? preview && currentFile.type.startsWith('image/') && localPreview?.file === currentFile ? localPreview.url : undefined
    : remotePreviewUrl;

  useEffect(() => {
    if (!preview || !currentFile || !currentFile.type.startsWith('image/')) return;
    const url = URL.createObjectURL(currentFile);
    setLocalPreview({ file: currentFile, url });
    return () => URL.revokeObjectURL(url);
  }, [currentFile, preview]);

  useEffect(() => {
    if (previewUrl === undefined) setDismissedPreviewUrl(null);
  }, [previewUrl]);

  function update(next: File[]) {
    if (multiple) {
      setFiles(next);
    } else {
      if (value === undefined) setInternalValue(next[0] ?? null);
      onChange?.(next[0] ?? null);
    }
    onFilesChange?.(next);
  }

  function select(incoming: FileList | File[]) {
    const selected = Array.from(incoming).filter((file) => accepts(file, accept));
    if (!selected.length) return;
    update(multiple ? selected : selected.slice(0, 1));
  }

  function removeFile(index: number) {
    update(currentFiles.filter((_, i) => i !== index));
    if (input.current) input.current.value = '';
  }

  function removeCurrent() {
    if (previewUrl) setDismissedPreviewUrl(previewUrl);
    update([]);
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
      <Button disabled={disabled} onClick={() => input.current?.click()}>{multiple ? chooseFiles : hasCurrent ? replaceFile : chooseFile}</Button>
      <span className="yarcl-file-dropzone-hint">{multiple ? dropFiles : hasCurrent ? dropReplacement : dropFile}</span>
      <div aria-live="polite" className="yarcl-file-dropzone-files">
        {children ? children(currentFiles, removeFile) : hasCurrent ? (
          <div className="yarcl-file-dropzone-current">
            {imageUrl && <img src={imageUrl} alt={previewImage(currentFile?.name ?? previewName ?? selectedImage)} />}
            <span>{currentFile?.name ?? previewName ?? currentImage}</span>
            <button type="button" disabled={disabled} onClick={removeCurrent} aria-label={removeItem(currentFile?.name ?? previewName ?? currentImageName)}>{remove}</button>
          </div>
        ) : files.length > 0 && (
          <ul>
            {files.map((file, index) => (
              <li key={`${file.name}-${file.lastModified}-${index}`}>
                <span>{file.name}</span>
                <button type="button" disabled={disabled} onClick={() => removeFile(index)} aria-label={removeItem(file.name)}>{remove}</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
