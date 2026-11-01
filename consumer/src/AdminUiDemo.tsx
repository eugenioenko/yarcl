import { useId } from 'react';
import { AppLayout, Button, Field, Inline, Input, Link, NavItem, Select, Stack, Tabs, Text } from '@yarcl/react';

/** Shows sidebar branding, separate field actions and compact admin controls. */
export function AdminUiDemo() {
  const passwordHelp = useId();
  return <AppLayout desktopBreakpoint="lg" sidebarWidth="sidebar" mainAs="section" navigationLabel="Admin navigation"
    sidebarHeader={<Text>Acme workspace</Text>} navbar={<Text>Account settings</Text>}
    navigation={<NavItem href="#settings" active>Settings</NavItem>} style={{ height: '32rem' }}>
    <Stack>
      <Tabs defaultValue="profile">
        <Tabs.List aria-label="Account settings">
          <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
          <Tabs.Trigger value="security">Security</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="profile">
          <Field label="Password" labelEnd={<Link href={`#${passwordHelp}`}>Forgot password?</Link>} description={<span id={passwordHelp}>Contact your workspace administrator to reset your password.</span>}>
            <Input type="password" />
          </Field>
        </Tabs.Panel>
        <Tabs.Panel value="security">Security settings</Tabs.Panel>
      </Tabs>
      <Inline>
        <Select aria-label="Rows per page" options={[{ value: '20', label: '20 / page' }]} defaultValue="20" />
        <Button><Inline as="span">Save changes</Inline></Button>
      </Inline>
    </Stack>
  </AppLayout>;
}
