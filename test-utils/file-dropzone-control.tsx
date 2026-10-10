import axe from 'axe-core';
import { createRef, useState } from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Button, FileDropzone } from '@yarcl/react';
import { page } from './page';

const first = () => new File(['first'], 'first.pdf', { type: 'application/pdf' });
const second = () => new File(['second'], 'second.png', { type: 'image/png' });

function select(input: HTMLInputElement, files: File[]) {
  const transfer = new DataTransfer();
  files.forEach((file) => transfer.items.add(file));
  input.files = transfer.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

/** Checks picker access, controlled upload flows and native refs in both consumer brands. */
export function testFileDropzoneControl() {
  test('opens the same input from the picker and an external keyboard control', async () => {
    const inputRef = createRef<HTMLInputElement>();
    const rootRef = createRef<HTMLDivElement>();
    const screen = await render(<><Button onClick={() => inputRef.current?.click()}>Replace attachment</Button><FileDropzone ref={rootRef} inputRef={inputRef} label="Attachments" multiple /></>);
    expect(inputRef.current).toBe(rootRef.current?.querySelector('input'));
    const click = vi.spyOn(inputRef.current!, 'click').mockImplementation(() => {});
    try {
      await page.getByRole('button', { name: 'Choose files', exact: true }).click();
      await page.getByRole('button', { name: 'Replace attachment', exact: true }).focus();
      await page.keyboard.press('Enter');
      expect(click).toHaveBeenCalledTimes(2);
    } finally {
      click.mockRestore();
    }
    expect((await axe.run(screen.container, { rules: { region: { enabled: false } } })).violations).toEqual([]);
  });

  test('cleans up callback refs when the picker unmounts', async () => {
    const cleanup = vi.fn();
    const ref = vi.fn(() => cleanup);
    const screen = await render(<FileDropzone label="Files" inputRef={ref} />);
    expect(ref).toHaveBeenCalledWith(screen.container.querySelector('input'));
    await screen.unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  test('keeps a controlled list unchanged until the parent accepts the next list', async () => {
    const initial = first();
    const next = second();
    const changes = vi.fn();
    const inputRef = createRef<HTMLInputElement>();
    const screen = await render(<FileDropzone label="Files" multiple files={[initial]} inputRef={inputRef} onFilesChange={changes} />);
    select(inputRef.current!, [next]);
    await expect.poll(() => changes.mock.calls.length).toBe(1);
    expect(changes).toHaveBeenLastCalledWith([next]);
    expect(screen.container.querySelector('li')?.textContent).toContain(initial.name);
    await page.getByRole('button', { name: 'Remove first.pdf', exact: true }).click();
    expect(changes).toHaveBeenLastCalledWith([]);
    expect(screen.container.querySelector('li')?.textContent).toContain(initial.name);
    await screen.rerender(<FileDropzone label="Files" multiple files={[next]} inputRef={inputRef} onFilesChange={changes} />);
    expect(screen.container.querySelector('li')?.textContent).toContain(next.name);
    await screen.rerender(<FileDropzone label="Files" multiple files={[]} inputRef={inputRef} />);
    expect(screen.container.querySelector('li')).toBeNull();
  });

  test('resets an upload-on-select list and permits the same file to be selected again', async () => {
    const uploads: File[][] = [];
    const inputRef = createRef<HTMLInputElement>();
    function Upload() {
      const [files, setFiles] = useState<readonly File[]>([]);
      return <FileDropzone label="Upload" multiple files={files} inputRef={inputRef} onFilesChange={(next) => { uploads.push(next); setFiles([]); }} />;
    }
    const screen = await render(<Upload />);
    const file = first();
    select(inputRef.current!, [file]);
    await expect.poll(() => uploads.length).toBe(1);
    expect(inputRef.current!.value).toBe('');
    select(inputRef.current!, [file]);
    await expect.poll(() => uploads.length).toBe(2);
    expect(uploads).toEqual([[file], [file]]);
    expect(screen.container.querySelector('li')).toBeNull();
  });

  test('uses initial files once and removes files without mutating the initial array', async () => {
    const initial = Object.freeze([first(), second()]);
    const changes = vi.fn();
    const inputRef = createRef<HTMLInputElement>();
    const screen = await render(<FileDropzone label="Files" multiple defaultFiles={initial} inputRef={inputRef} onFilesChange={changes} />);
    await page.getByRole('button', { name: 'Remove first.pdf', exact: true }).click();
    expect(changes).toHaveBeenLastCalledWith([initial[1]]);
    expect(screen.container.querySelectorAll('li')).toHaveLength(1);
    expect(initial).toHaveLength(2);
    await screen.rerender(<FileDropzone label="Files" multiple defaultFiles={[]} inputRef={inputRef} onFilesChange={changes} />);
    expect(screen.container.querySelectorAll('li')).toHaveLength(1);
    select(inputRef.current!, [initial[0]]);
    await expect.poll(() => screen.container.querySelector('li')?.textContent).toContain(initial[0].name);
  });

  test('filters picker and dropped files before notifying the controlled parent', async () => {
    const changes = vi.fn();
    const inputRef = createRef<HTMLInputElement>();
    const screen = await render(<FileDropzone label="Documents" multiple files={[]} accept=".pdf" inputRef={inputRef} onFilesChange={changes} />);
    const accepted = first();
    select(inputRef.current!, [second(), accepted]);
    await expect.poll(() => changes.mock.calls.length).toBe(1);
    expect(changes).toHaveBeenLastCalledWith([accepted]);
    const transfer = new DataTransfer();
    transfer.items.add(second());
    transfer.items.add(accepted);
    screen.container.querySelector('.yarcl-file-dropzone')!.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }));
    await expect.poll(() => changes.mock.calls.length).toBe(2);
    expect(changes).toHaveBeenLastCalledWith([accepted]);
    select(inputRef.current!, [second()]);
    expect(changes).toHaveBeenCalledTimes(2);
  });

  test('ignores disabled picking and dropping, including programmatic input changes', async () => {
    const changes = vi.fn();
    const inputRef = createRef<HTMLInputElement>();
    const screen = await render(<FileDropzone label="Files" multiple files={[first()]} inputRef={inputRef} onFilesChange={changes} disabled />);
    expect(inputRef.current!.disabled).toBe(true);
    expect([...screen.container.querySelectorAll('button')].every((button) => button.disabled)).toBe(true);
    select(inputRef.current!, [second()]);
    const transfer = new DataTransfer();
    transfer.items.add(second());
    screen.container.querySelector('.yarcl-file-dropzone')!.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }));
    expect(changes).not.toHaveBeenCalled();
    expect(screen.container.querySelector('li')?.textContent).toContain('first.pdf');
  });

  test('passes the controlled list and removal to a custom renderer', async () => {
    const changes = vi.fn();
    const initial = first();
    await render(<FileDropzone label="Files" multiple files={[initial]} onFilesChange={changes}>{(files, remove) => <Button onClick={() => remove(0)}>Delete {files[0]?.name}</Button>}</FileDropzone>);
    await page.getByRole('button', { name: 'Delete first.pdf', exact: true }).click();
    expect(changes).toHaveBeenLastCalledWith([]);
  });

  test('uses controlled files ahead of defaultFiles and retains custom copy', async () => {
    const screen = await render(<FileDropzone label="Files" multiple files={[]} defaultFiles={[first()]} labels={{ chooseFiles: 'Browse attachments', dropFiles: 'Drop attachments here' }} />);
    expect(screen.container.querySelector('li')).toBeNull();
    expect(screen.container.textContent).toContain('Browse attachments');
    expect(screen.container.textContent).toContain('Drop attachments here');
  });
}
