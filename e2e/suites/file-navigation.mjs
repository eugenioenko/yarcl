/** @param {import('../../test-utils/suite.ts').SuiteContext} ctx */
export default async function ({ page, check }) {
  const nav = page.getByTestId('feedback-nav');
  const current = nav.getByRole('link', { name: 'Overview' });
  check('active navigation item marks the current page', (await current.getAttribute('aria-current')) === 'page');
  check('other navigation item stays a link', (await nav.getByRole('link', { name: 'Settings' }).getAttribute('href')) === '#settings');

  const zone = page.getByTestId('feedback-files');
  check('file picker has a visible label and button', await zone.getByRole('button', { name: 'Choose files' }).isVisible());
  await zone.locator('input[type="file"]').evaluate((input) => {
    const transfer = new DataTransfer();
    transfer.items.add(new File(['image'], 'sample.png', { type: 'image/png' }));
    transfer.items.add(new File(['text'], 'notes.txt', { type: 'text/plain' }));
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  check('picker keeps accepted files', await zone.getByText('sample.png').isVisible());
  check('picker rejects other file types', (await zone.getByText('notes.txt').count()) === 0);

  await zone.getByRole('button', { name: 'Remove sample.png' }).click();
  check('file can be removed', (await zone.getByText('sample.png').count()) === 0);

  await zone.evaluate((element) => {
    const transfer = new DataTransfer();
    transfer.items.add(new File(['pdf'], 'report.pdf', { type: 'application/pdf' }));
    element.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: transfer }));
  });
  check('drop accepts a matching extension', await zone.getByText('report.pdf').isVisible());
}
