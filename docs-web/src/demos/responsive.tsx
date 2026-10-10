import { Button, Card, Field, Grid, Heading, Inline, Input, Stack, Text } from '@yarcl/react';

/** Shows CSS-driven responsive spacing and columns without replacing form elements. */
export function ResponsiveDemo() {
  return <Stack gap={{ base: 'sm', lg: 'lg' }} style={{ width: '100%' }}>
    <Text muted>Resize your browser. The cards stack on small screens, and your draft stays in place.</Text>
    <Grid columns={{ base: 1, md: 2 }} gap={{ base: 'sm', lg: 'lg' }}>
      <Card padding={{ base: 'sm', lg: 'lg' }}>
        <Stack gap={{ base: 'sm', lg: 'md' }}>
          <Heading level={3}>Project draft</Heading>
          <Field label="Project name"><Input defaultValue="Customer portal" /></Field>
          <Inline justify={{ base: 'start', lg: 'end' }} wrap={{ base: true, lg: false }}>
            <Button variant="outline">Cancel</Button><Button>Save</Button>
          </Inline>
        </Stack>
      </Card>
      <Card padding={{ base: 'sm', lg: 'lg' }}>
        <Stack><Heading level={3}>Activity</Heading><Text>Design review completed</Text><Text>Preview ready to share</Text></Stack>
      </Card>
    </Grid>
  </Stack>;
}
