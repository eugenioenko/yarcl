import { useState } from 'react';
import { Button, NavItem, NavSection, Stack } from '@yarcl/react';
import { SearchIcon, InfoIcon } from './icons';

/** Shows the same navigation group expanded or as an icon rail. */
export function NavSectionDemo() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Stack>
      <Button variant="outline" onClick={() => setCollapsed(!collapsed)} aria-pressed={collapsed}>Toggle icon rail</Button>
      <nav aria-label="Demo workspace">
        <NavSection title="Workspace" collapsed={collapsed} gap="xs">
          <NavItem href="#projects" active icon={<SearchIcon />}>Projects</NavItem>
          <NavItem href="#help" icon={<InfoIcon />}>Help</NavItem>
        </NavSection>
      </nav>
    </Stack>
  );
}
