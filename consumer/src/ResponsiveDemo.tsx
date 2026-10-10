import { Button, Card, Field, Grid, Heading, Inline, Input, Link, Stack, Text, config, type Spacing } from '@yarcl/react';

const spacing = Object.keys(config.spacing) as Spacing[];
const compact = spacing[0];
const comfortable = spacing[spacing.length - 1];

/** Demonstrates breakpoint maps using the consumer's spacing and breakpoint keys. */
export function ResponsiveDemo() {
  return <Stack as="main" className="page yarcl-root" gap={{ base: compact, lg: comfortable }}>
    <Inline justify={{ base: 'start', lg: 'between' }} wrap={{ base: true, lg: false }}>
      <Heading level={1}>Responsive workspace</Heading>
      <Link href="?">Component demo</Link>
    </Inline>
    <Text>Resize the browser to see the spacing, columns and action alignment change. Your draft stays in place.</Text>
    <Grid columns={{ base: 1, md: 2 }} gap={{ base: compact, lg: comfortable }}>
      <Card padding={{ base: compact, lg: comfortable }}>
        <Stack gap={{ base: compact, lg: comfortable }}>
          <Heading level={2}>Project draft</Heading>
          <Field label="Project name"><Input defaultValue="Customer portal" /></Field>
          <Field label="Owner"><Input defaultValue="Sam Rivera" /></Field>
          <Inline justify={{ base: 'start', lg: 'end' }} wrap={{ base: true, lg: false }}>
            <Button variant={config.defaults.softVariant}>Cancel</Button>
            <Button>Save project</Button>
          </Inline>
        </Stack>
      </Card>
      <Card padding={{ base: compact, lg: comfortable }}>
        <Stack>
          <Heading level={2}>Activity</Heading>
          <Text>Design review completed</Text>
          <Text>New feedback received</Text>
          <Text>Preview ready to share</Text>
        </Stack>
      </Card>
    </Grid>
  </Stack>;
}
