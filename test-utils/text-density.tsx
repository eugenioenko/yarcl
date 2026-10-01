import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { config, Table, Text } from '@yarcl/react';

/** Checks text size inheritance with each consumer's table density. */
export function testTextDensity() {
  test('default Text follows table density while explicit styles retain their size', async () => {
    const plain = { current: null as HTMLTableCellElement | null };
    const automatic = { current: null as HTMLSpanElement | null };
    const explicit = { current: null as HTMLSpanElement | null };
    const inherited = { current: null as HTMLSpanElement | null };
    await render(<>
      <Table density={config.defaults.density}>
        <Table.Body><Table.Row>
          <Table.Cell ref={plain}>Plain</Table.Cell>
          <Table.Cell><Text muted truncate ref={automatic}>None</Text></Table.Cell>
          <Table.Cell><Text textStyle={config.defaults.textStyle} ref={explicit}>Styled</Text></Table.Cell>
        </Table.Row></Table.Body>
      </Table>
      <div style={{ fontSize: '21px' }}><Text inherit muted ref={inherited}>Inherited</Text></div>
    </>);

    expect(getComputedStyle(automatic.current!).fontSize).toBe(getComputedStyle(plain.current!).fontSize);
    expect(getComputedStyle(explicit.current!).fontSize).not.toBe(getComputedStyle(plain.current!).fontSize);
    expect(automatic.current?.classList.contains('yarcl-text-muted')).toBe(true);
    expect(getComputedStyle(automatic.current!).textOverflow).toBe('ellipsis');
    expect(getComputedStyle(inherited.current!).fontSize).toBe('21px');
    expect(inherited.current?.className).not.toContain('yarcl-type-');
  });
}
