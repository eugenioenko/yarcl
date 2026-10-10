import { useState } from 'react';
import { AppLayout, Button, Card, Heading, Input, NavItem, NavSection, Stack, Text } from '@yarcl/react';
import { SearchIcon, InfoIcon } from './icons';

/** An embedded workspace preview with retained draft state and a responsive menu. */
export function AppLayoutDemo() {
  const [collapsed, setCollapsed] = useState(false);
  const [page, setPage] = useState('Projects');
  return <AppLayout
    desktopBreakpoint="lg"
    sidebarWidth="sidebar"
    navigationLabel="Demo workspace"
    menuLabel="Open workspace navigation"
    skipLabel="Skip to workspace content"
    mainAs="section"
    padding="sm"
    style={{ height: '28rem', width: '100%' }}
    collapsed={collapsed}
    navbar={<><Text>Acme</Text><Button size="sm" onClick={() => setCollapsed(!collapsed)} aria-pressed={collapsed}>Compact menu</Button></>}
    footer={<Text textStyle="caption">Workspace support</Text>}
    navigation={<NavSection title="Workspace" gap="xs">
      <NavItem href="#projects" icon={<SearchIcon />} active={page === 'Projects'} onClick={(event) => { event.preventDefault(); setPage('Projects'); }}>Projects</NavItem>
      <NavItem href="#help" icon={<InfoIcon />} active={page === 'Help'} onClick={(event) => { event.preventDefault(); setPage('Help'); }}>Help</NavItem>
    </NavSection>}
  >
    <Stack>
      <Heading level={3}>{page}</Heading>
      <Input aria-label="Workspace draft" placeholder="Write a draft" />
      {Array.from({ length: 6 }, (_, index) => <Card key={index}><Text>Workspace item {index + 1}</Text></Card>)}
    </Stack>
  </AppLayout>;
}
