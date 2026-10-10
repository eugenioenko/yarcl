import { useState } from 'react';
import { AppLayout, Button, Card, Heading, Input, Link, NavItem, NavSection, Stack, Text } from '@yarcl/react';
import { SearchIcon, PlusIcon } from './icons';

/** Demonstrates a persistent workspace menu, responsive drawer and scrolling content. */
export function AppLayoutDemo() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState('projects');
  return <AppLayout
    desktopBreakpoint="lg"
    sidebarWidth="sidebar"
    navigationLabel="Workspace"
    menuLabel="Open navigation"
    skipLabel="Skip to main content"
    collapsed={collapsed}
    navbar={<><Text>Acme workspace</Text><Button className="app-demo-collapse" aria-pressed={collapsed} onClick={() => setCollapsed(!collapsed)}>Compact navigation</Button></>}
    footer={<Link href="?">Component demo</Link>}
    navigation={<NavSection title="Workspace">
      <NavItem href="#projects" icon={<SearchIcon />} active={active === 'projects'} onClick={(event) => { event.preventDefault(); setActive('projects'); }}>Projects</NavItem>
      <NavItem href="#activity" icon={<PlusIcon />} active={active === 'activity'} onClick={(event) => { event.preventDefault(); setActive('activity'); }}>Activity</NavItem>
    </NavSection>}
  >
    <Stack>
      <Heading level={1}>{active === 'projects' ? 'Projects' : 'Activity'}</Heading>
      <Input aria-label="Workspace draft" placeholder="Write a draft, then resize the window" />
      {Array.from({ length: 12 }, (_, index) => <Card key={index}><Heading level={2}>Project {index + 1}</Heading><Text as="p">The workspace content scrolls while its navigation, navbar and footer stay in place.</Text></Card>)}
    </Stack>
  </AppLayout>;
}
