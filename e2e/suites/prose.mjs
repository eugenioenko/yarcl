import { config } from '@yarcl/react';

/** @param {import('../../test-utils/suite.ts').SuiteContext} ctx */
export default async function ({ page, check }) {
  const result = await page.evaluate(({ headingStyle, bodyStyle, codeStyle }) => {
    const prose = document.createElement('section');
    prose.className = 'yarcl-prose';
    prose.innerHTML = '<p>Intro</p><h2>Title</h2><p>Body <code>sample</code> <a href="#next">link</a></p><ul><li>One</li></ul><blockquote>Quote</blockquote><pre><code>block</code></pre><table><tr><th>Head</th><td>Cell</td></tr></table><img alt="Example"><hr>';
    const reference = document.createElement('div');
    reference.innerHTML = `<span class="yarcl-type-${headingStyle}">Title</span><span class="yarcl-type-${bodyStyle}">Body</span><span class="yarcl-type-${codeStyle}">Code</span>`;
    document.body.append(prose, reference);
    try {
      const [headingReference, bodyReference, codeReference] = reference.children;
      const heading = getComputedStyle(prose.querySelector('h2'));
      const body = getComputedStyle(prose.querySelector('p'));
      const code = getComputedStyle(prose.querySelector('p code'));
      return {
        heading: heading.fontSize === getComputedStyle(headingReference).fontSize
          && heading.fontFamily === getComputedStyle(headingReference).fontFamily
          && heading.letterSpacing === getComputedStyle(headingReference).letterSpacing,
        body: body.fontSize === getComputedStyle(bodyReference).fontSize
          && body.lineHeight === getComputedStyle(bodyReference).lineHeight,
        code: code.fontSize === getComputedStyle(codeReference).fontSize
          && code.fontFamily === getComputedStyle(codeReference).fontFamily,
        headingGap: parseFloat(heading.marginBlockStart) > 0,
        list: getComputedStyle(prose.querySelector('ul')).listStyleType === 'disc',
        quote: getComputedStyle(prose.querySelector('blockquote')).borderInlineStartStyle === 'solid',
        pre: getComputedStyle(prose.querySelector('pre')).overflowX === 'auto',
        link: getComputedStyle(prose.querySelector('a')).textDecorationLine.includes('underline'),
        table: getComputedStyle(prose.querySelector('table')).borderCollapse === 'collapse',
        image: getComputedStyle(prose.querySelector('img')).maxWidth === '100%',
        rule: getComputedStyle(prose.querySelector('hr')).borderBlockStartStyle === 'solid',
      };
    } finally {
      prose.remove();
      reference.remove();
    }
  }, {
    headingStyle: config.typography.headings.h2,
    bodyStyle: config.typography.prose.body,
    codeStyle: config.typography.prose.code,
  });

  for (const [part, styled] of Object.entries(result)) check(`prose styles ${part}`, styled);
}
