import { useState } from 'react';
import { Heading, Stack, Text, TreeView, type TreeViewItem } from '@yarcl/react';

const items: TreeViewItem[] = [
  { id: 'projects', label: 'Projects', children: [
    { id: 'website', label: 'Website', children: [{ id: 'design', label: 'Design notes' }, { id: 'roadmap', label: 'Roadmap' }] },
    { id: 'mobile', label: 'Mobile app' },
  ] },
  { id: 'archive', label: 'Archive', disabled: true },
  { id: 'settings', label: 'Workspace settings' },
];
const labels: Record<string, string> = { projects: 'Projects', website: 'Website', design: 'Design notes', roadmap: 'Roadmap', mobile: 'Mobile app', settings: 'Workspace settings' };

/** Demonstrates a named hierarchy with controlled selection and independent expansion. */
export function TreeViewDemo() {
  const [value, setValue] = useState<string | null>('roadmap');
  return <Stack as="section">
    <Heading level={2}>Project explorer</Heading>
    <Text muted>Arrow keys explore the folders. Enter or Space selects an item. Typing finds its name.</Text>
    <TreeView aria-label="Project explorer" items={items} defaultExpanded={['projects', 'website']} value={value} onValueChange={setValue} />
    <Text role="status">{value ? `Selected: ${labels[value]}` : 'Choose a project'}</Text>
  </Stack>;
}
