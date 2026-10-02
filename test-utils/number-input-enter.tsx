import { useState } from 'react';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { NumberInput } from '@yarcl/react';
import { page } from './page';

/** Checks Enter commit and native form submission in both consumer brands. */
export function testNumberInputEnter() {
  test('commits on the first Enter and submits on the second', async () => {
    function ScoreForm() {
      const [score, setScore] = useState<number | null>(null);
      const [submissions, setSubmissions] = useState(0);
      return <form onSubmit={(event) => { event.preventDefault(); setSubmissions((count) => count + 1); }}>
        <NumberInput aria-label="Score" value={score} onValueChange={setScore} />
        <button type="submit">Save</button>
        <output aria-label="Committed score">{score ?? 'none'}</output>
        <output aria-label="Submissions">{submissions}</output>
      </form>;
    }

    const screen = await render(<ScoreForm />);
    const input = page.getByRole('spinbutton', { name: 'Score' });
    await input.fill('7');
    await page.keyboard.press('Enter');
    await expect.poll(() => screen.container.querySelector('[aria-label="Committed score"]')?.textContent).toBe('7');
    expect(screen.container.querySelector('[aria-label="Submissions"]')?.textContent).toBe('0');

    await page.keyboard.press('Enter');
    await expect.poll(() => screen.container.querySelector('[aria-label="Submissions"]')?.textContent).toBe('1');
  });
}
