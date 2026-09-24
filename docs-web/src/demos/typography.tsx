import { Heading, Inline, Link, Stack, Text, config, type Color } from '@yarcl/react';

const colors = Object.keys(config.colors) as Color[];

export function TextDemo() {
  return (
    <Stack gap="sm">
      <Text textStyle="subheading">Subheading style</Text>
      <Text as="p">Body text is the default text style.</Text>
      <Text as="p" muted>
        Muted text for secondary information.
      </Text>
      <Inline gap="sm">
        {colors.map((color) => (
          <Text key={color} color={color}>
            {color}
          </Text>
        ))}
      </Inline>
      <Text textStyle="caption">Caption style</Text>
      <Text textStyle="code">const code = 'monospace';</Text>
    </Stack>
  );
}

export function TruncateDemo() {
  return (
    <Stack gap="sm" className="demo-narrow">
      <Text truncate>One line that is far too long for this narrow box and ends with an ellipsis.</Text>
      <Text truncate={2}>
        Two lines of text that keep going well past the second line, so everything after it is clamped away with an
        ellipsis at the end.
      </Text>
    </Stack>
  );
}

export function HeadingDemo() {
  return (
    <Stack gap="sm">
      {([1, 2, 3, 4, 5, 6] as const).map((level) => (
        <Heading key={level} level={level}>
          Heading level {level}
        </Heading>
      ))}
    </Stack>
  );
}

export function HeadingOverrideDemo() {
  return (
    <Stack gap="sm">
      <Heading level={2} textStyle="display">
        An h2 that looks like display
      </Heading>
      <Heading level={1} textStyle="subheading">
        An h1 that looks like subheading
      </Heading>
    </Stack>
  );
}

export function LinkDemo() {
  return (
    <Stack gap="sm">
      <Text as="p">
        Read the <Link href="#">documentation</Link>, or visit{' '}
        <Link href="https://example.com" external>
          example.com
        </Link>
        .
      </Text>
      <Inline>
        <Link href="#" underline="hover" color="neutral">
          Underline on hover
        </Link>
        <Link href="#" underline="none" color="danger">
          No underline
        </Link>
      </Inline>
    </Stack>
  );
}
