import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { AudioPlayer } from '@yarcl/react';
import { page } from './page';

function sampleAudio(): string {
  const samples = 16000;
  const buffer = new ArrayBuffer(44 + samples);
  const view = new DataView(buffer);
  const text = (offset: number, value: string) => [...value].forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
  text(0, 'RIFF');
  view.setUint32(4, 36 + samples, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 8000, true);
  view.setUint32(28, 8000, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  text(36, 'data');
  view.setUint32(40, samples, true);
  for (let index = 0; index < samples; index++) view.setUint8(44 + index, 128);
  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
}

/** Checks media controls and the optional input meter in both consumer brands. */
export function testAudioPlayer() {
  test('loads, plays, pauses and seeks a recording', async () => {
    const src = sampleAudio();
    try {
      const screen = await render(<AudioPlayer src={src} level={0.4} />);
      const audio = screen.container.querySelector('audio')!;
      const seek = page.getByRole('slider', { name: 'Seek audio' });
      await expect.poll(() => audio.duration).toBe(2);
      expect(await seek.getAttribute('aria-disabled')).toBeNull();
      expect(screen.container.querySelector('.yarcl-audio-player-time')?.textContent).toBe('0:00 / 0:02');
      expect(await page.getByRole('progressbar', { name: 'Input level' }).getAttribute('aria-valuenow')).toBe('40');

      await page.getByRole('button', { name: 'Play audio' }).click();
      await expect.poll(() => audio.paused).toBe(false);
      await page.getByRole('button', { name: 'Pause audio' }).click();
      await expect.poll(() => audio.paused).toBe(true);

      await seek.focus();
      await page.keyboard.press('End');
      await expect.poll(() => audio.currentTime).toBe(2);
      expect(await seek.getAttribute('aria-valuetext')).toBe('0:02');
    } finally {
      URL.revokeObjectURL(src);
    }
  });
}
