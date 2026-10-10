import { useState } from 'react';
import { Heading, SplitPane, Stack, Text, TreeView } from '@yarcl/react';

/** A project explorer beside independently scrollable document content. */
export function SplitPaneDemo() {
  const [size, setSize] = useState(35);
  return <Stack as="section">
    <Heading level={2}>Resizable workspace</Heading>
    <Text>Drag the divider, or focus it and use the arrow keys.</Text>
    <SplitPane primaryLabel="Project files" secondaryLabel="Document preview" value={size} onValueChange={setSize}
      min={20} max={70} style={{ height: '18rem' }}
      primary={<TreeView aria-label="Project files" defaultExpanded={['project']} items={[
        { id: 'project', label: 'Website', children: [{ id: 'overview', label: 'Overview' }, { id: 'notes', label: 'Design notes' }] },
      ]} />}
      secondary={<Stack><Heading level={3}>Project overview</Heading><Text>Each pane scrolls independently. Resize the workspace to give your files or document more room.</Text>{Array.from({ length: 8 }, (_, index) => <Text key={index}>Section {index + 1}: Workspace content stays mounted as the divider moves.</Text>)}</Stack>} />
    <Text role="status">Files use {Math.round(size)} percent of the workspace.</Text>
  </Stack>;
}
