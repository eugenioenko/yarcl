import { useState } from 'react';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { FileDropzone } from '@yarcl/react';

/** Checks the controlled single-file picker and image preview in both consumer brands. */
export function testSingleFileDropzone() {
  test('replaces and removes one image with a thumbnail', async () => {
    const changes: Array<File | null> = [];
    function CoverPicker() {
      const [file, setFile] = useState<File | null>(null);
      return <FileDropzone
        label="Course cover"
        accept="image/*"
        value={file}
        onChange={(next) => { changes.push(next); setFile(next); }}
        preview
        previewUrl="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"
        previewName="cover.svg"
      />;
    }

    const screen = await render(<CoverPicker />);
    const zone = screen.container.querySelector('.yarcl-file-dropzone')!;
    const input = zone.querySelector('input[type="file"]') as HTMLInputElement;
    expect(zone.querySelector('img')?.getAttribute('alt')).toBe('Preview of cover.svg');
    expect(zone.querySelector('button.yarcl-button')?.textContent).toBe('Replace file');

    (zone.querySelector('[aria-label="Remove cover.svg"]') as HTMLButtonElement).click();
    await expect.poll(() => zone.querySelector('button.yarcl-button')?.textContent).toBe('Choose file');
    expect(changes).toEqual([null]);

    for (const name of ['first.png', 'replacement.png']) {
      const transfer = new DataTransfer();
      transfer.items.add(new File(['image'], name, { type: 'image/png' }));
      input.files = transfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await expect.poll(() => zone.querySelector('.yarcl-file-dropzone-current span')?.textContent).toBe(name);
      await expect.poll(() => zone.querySelector('img')?.getAttribute('src')?.startsWith('blob:')).toBe(true);
      expect(zone.querySelector('button.yarcl-button')?.textContent).toBe('Replace file');
    }

    expect(changes[1]?.name).toBe('first.png');
    expect(changes[2]?.name).toBe('replacement.png');
    (zone.querySelector('[aria-label="Remove replacement.png"]') as HTMLButtonElement).click();
    await expect.poll(() => zone.querySelector('img')).toBeNull();
    expect(changes[3]).toBeNull();
  });

  test('uses an uncontrolled initial file without the multi-file list', async () => {
    const file = new File(['cover'], 'cover.png', { type: 'image/png' });
    const screen = await render(<FileDropzone label="Cover" defaultValue={file} />);
    const zone = screen.container.querySelector('.yarcl-file-dropzone')!;
    expect(zone.querySelector('.yarcl-file-dropzone-current')?.textContent).toContain('cover.png');
    expect(zone.querySelector('ul')).toBeNull();
    (zone.querySelector('[aria-label="Remove cover.png"]') as HTMLButtonElement).click();
    await expect.poll(() => zone.querySelector('.yarcl-file-dropzone-current')).toBeNull();
  });
}
