import { Accordion, Alert, AudioPlayer, Avatar, AvatarGroup, Badge, Breadcrumb, Button, SplitButton, Combobox, CommandPalette, DatePicker, Dialog, EmptyState, FileDropzone, Grid, Heading, IconButton, Inline, Input, Label, Menu, NavItem, NumberInput, Pagination, Progress, Slider, Stack, Table, Text, Tooltip, VisuallyHidden, toast } from '@yarcl/react';
import config from './yarcl.config';
import type { YarclPluginOptions } from '@yarcl/react/vite';

// @ts-expect-error token emission accepts only booleans or filenames
const invalidTokenOutput: YarclPluginOptions = { emitTokens: { fileName: 'tokens.css' } };
void invalidTokenOutput;

type FontFamily = keyof typeof config.typography.families;
const headingFont: FontFamily = config.typography.fonts.heading;
// @ts-expect-error unknown font families cannot be assigned to a role
const invalidFont: FontFamily = 'missing';
void [headingFont, invalidFont];

// @ts-expect-error unknown prose text style
const invalidProseStyle: typeof config.typography.prose.body = 'missing';
// @ts-expect-error unknown prose spacing
const invalidProseGap: typeof config.typography.prose.blockGap = 'missing';
void [invalidProseStyle, invalidProseGap];

export const contract = (
  <>
    <Input size="talla-l" color="clay" radius="hairline" startContent={<svg aria-hidden="true" />} endContent={<Button onClick={() => {}}>Clear</Button>} name="search" defaultValue="Query" ref={() => {}} style={{ width: '100%' }} className="search-field" />
    <Input startContent="$" endContent="USD" />
    {/* @ts-expect-error unknown input size with content */}
    <Input size="missing" startContent="$" />
    {/* @ts-expect-error unknown input color with content */}
    <Input color="missing" endContent="USD" />
    {/* @ts-expect-error unknown input radius with content */}
    <Input radius="missing" startContent="$" />
    {/* @ts-expect-error slot content must be renderable */}
    <Input startContent={() => 'Search'} />
    {/* @ts-expect-error slot content must be renderable */}
    <Input endContent={{ text: 'USD' }} />
    {/* @ts-expect-error input content belongs in slots */}
    <Input>Search</Input>
    <SplitButton<'draft' | 'publish'>
      options={[{ value: 'draft', label: 'Save draft', icon: <span>✓</span> }, { value: 'publish', label: 'Publish', disabled: true }]}
      value="draft" defaultValue="draft" onValueChange={(value: 'draft' | 'publish') => value} onAction={(value: 'draft' | 'publish') => value}
      size="talla-l" color="clay" variant="wash" radius="hairline" loading disabled dropdownLabel="Save options" placeholder="Choose"
      ref={() => {}} className="save-actions" style={{ width: '100%' }} aria-label="Save actions"
    />
    {/* @ts-expect-error unknown split button size */}
    <SplitButton options={[]} size="missing" />
    {/* @ts-expect-error split button sizes respect allowedSizes */}
    <SplitButton options={[]} size="talla-m" />
    {/* @ts-expect-error unknown split button color */}
    <SplitButton options={[]} color="missing" />
    {/* @ts-expect-error unknown split button radius */}
    <SplitButton options={[]} radius="missing" />
    {/* @ts-expect-error unknown split button variant */}
    <SplitButton options={[]} variant="missing" />
    {/* @ts-expect-error values must match the options */}
    <SplitButton options={[{ value: 'draft', label: 'Save draft' }]} value="missing" />
    {/* @ts-expect-error options require a label */}
    <SplitButton options={[{ value: 'draft' }]} />
    {/* @ts-expect-error loading must be boolean */}
    <SplitButton options={[]} loading="yes" />
    <Button autoHeight size="talla-s"><span>Account</span></Button>
    <Button href="/account" autoHeight size="talla-s">Account</Button>
    {/* @ts-expect-error autoHeight must be boolean */}
    <Button autoHeight="yes" />
    {/* @ts-expect-error auto height still uses config sizes */}
    <Button autoHeight size="missing" />
    <Badge wrap size="talla-s">A long credential title</Badge>
    {/* @ts-expect-error wrap must be boolean */}
    <Badge wrap="yes" />
    <Menu>
      <Menu.Content>
        <Menu.RadioGroup value="light" onValueChange={(value: string) => value} aria-label="Color scheme">
          <Menu.RadioItem value="light" color="clay" textValue="Light" onSelect={() => {}}>Light</Menu.RadioItem>
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu>
    {/* @ts-expect-error radio items still use config colors */}
    <Menu.RadioItem value="light" color="missing" />
    {/* @ts-expect-error radio item values are required */}
    <Menu.RadioItem />
    {/* @ts-expect-error radio groups require a controlled value */}
    <Menu.RadioGroup />
    {/* @ts-expect-error radio checked state comes from the group */}
    <Menu.RadioItem value="light" aria-checked />
    <Grid as="section" columns={3} gap="4" ref={() => {}} style={{ width: '100%' }} />
    <Grid columns="16rem minmax(0, 1fr)" />
    <Grid minItemWidth="16rem" />
    {/* @ts-expect-error unknown spacing */}
    <Grid gap="normal" />
    <Button size="talla-l" color="clay" variant="wash" radius="hairline" />
    <Button size="talla-l" startIcon={<span>✓</span>} endIcon={<span>→</span>}>Continuar</Button>
    <Button href="/lecciones/siguiente" endIcon={<span>→</span>}>Siguiente lección</Button>
    <Badge size="talla-s" startIcon={<span>✓</span>} endIcon={<span>✓</span>}>Listo</Badge>
    {/* @ts-expect-error unknown badge size */}
    <Badge size="missing" startIcon={<span>✓</span>}>Listo</Badge>
    <Text inherit muted whiteSpace="pre-line" wrap="anywhere">Hereda la tipografía</Text>
    {/* @ts-expect-error inherit must be boolean */}
    <Text inherit="yes">Inválido</Text>
    {/* @ts-expect-error unknown whitespace */}
    <Text whiteSpace="preserve" />
    {/* @ts-expect-error unknown wrapping */}
    <Text wrap="break-word" />
    <Button href="/lecciones/siguiente" size="talla-l">Siguiente lección</Button>
    <IconButton href="/lecciones/siguiente" aria-label="Siguiente lección"><span>→</span></IconButton>
    {/* @ts-expect-error links cannot use native button types */}
    <Button href="/lecciones/siguiente" type="submit">Siguiente lección</Button>
    {/* @ts-expect-error icon links need an accessible name */}
    <IconButton href="/lecciones/siguiente"><span>→</span></IconButton>
    <NavItem href="/inicio" active size="talla-s" radius="hairline">Inicio</NavItem>
    <FileDropzone label="Archivos" accept="image/*" />
    <FileDropzone label="Portada" accept="image/*" value={null} onChange={(file) => file?.name} preview />
    {/* @ts-expect-error single-file value must be a File or null */}
    <FileDropzone label="Portada" value="cover.png" />
    {/* @ts-expect-error unknown size */}
    <NavItem href="/inicio" size="sm">Inicio</NavItem>
    {/* @ts-expect-error label is required */}
    <FileDropzone />
    {/* @ts-expect-error Button excludes the global talla-m size */}
    <Button size="talla-m" />
    <Stack gap="12" />
    <VisuallyHidden lang="es">Descripción adicional</VisuallyHidden>
    <Text textStyle="price" />
    <Label htmlFor="size" textStyle="fine" color="clay" required disabled />
    <Heading level={1} />
    <Label htmlFor="x" required variant="wash" color="clay" size="talla-s" radius="hairline" textStyle="label" />
    <Tooltip content="Ayuda" radius="hairline" padding="2" textStyle="fine"><Button /></Tooltip>
    <Alert gap="2" padding="4" textStyle="copy" />
    <Table density="cozy" radius="hairline" striped stickyHeader>
      <Table.Head>
        <Table.Row>
          <Table.SelectAllCell checked onCheckedChange={() => {}} />
          <Table.HeaderCell sortable sortDirection="descending" onSort={() => {}}>Size</Table.HeaderCell>
          <Table.HeaderCell align="end">Chest</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.VirtualBody items={[{ s: 'XS', c: 96 }]} rowHeight={34}>
        {(item) => (
          <Table.Row key={item.s} selected>
            <Table.SelectionCell aria-label={`Select size ${item.s}`} checked />
            <Table.Cell>{item.s}</Table.Cell>
            <Table.Cell align="end">{item.c}</Table.Cell>
          </Table.Row>
        )}
      </Table.VirtualBody>
    </Table>
    <Slider size="talla-s" color="moss" radius="hairline" defaultValue={[10, 90]} marks={[{ value: 20, label: 'Low' }]} segments={[{ from: 0, to: 50, color: 'clay', label: 'First' }]} />
    <Slider.Range aria-label="Price" size="talla-s" color="clay" radius="hairline" defaultValue={[10, 90]} />
    <AudioPlayer src="/grabacion.wav" level={0.5} />
    <Progress value={1} max={2} label="L" showValue formatValue={(v) => String(v)} size="talla-s" color="moss" radius="hairline" />
    <Pagination count={8} size="talla-s" color="clay" radius="square" variant="text" selectedVariant="filled" />
    <Pagination count={20} layout="compact" defaultPage={3} summaryLabel={(page, count) => `${page} / ${count}`} size="talla-s" color="clay" radius="square" variant="text" attached />
    <Pagination count={8} layout="numbered" />
    {/* @ts-expect-error unknown pagination layout */}
    <Pagination count={20} layout="simple" />
    {/* @ts-expect-error summary labels return text */}
    <Pagination count={20} layout="compact" summaryLabel={() => 3} />
    {/* @ts-expect-error compact pagination still uses configured sizes */}
    <Pagination count={20} layout="compact" size="sm" />
    <DatePicker size="talla-s" color="clay" variant="wash" radius="hairline" />
    <CommandPalette commands={[]} size="talla-s" color="moss" radius="square" />
    <Breadcrumb textStyle="fine" color="clay" underline="always" maxItems={3} separator="/">
      <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
    </Breadcrumb>
    <Accordion type="multiple" size="talla-s" radius="hairline" color="moss">
      <Accordion.Item value="uno">
        <Accordion.Header end={<button type="button">Acciones</button>}><Accordion.Trigger>Uno</Accordion.Trigger></Accordion.Header>
      </Accordion.Item>
    </Accordion>
    <Combobox multiple options={[]} size="talla-s" color="clay" radius="square" maxSelected={2} onValueChange={(v: string[]) => v} />
    <NumberInput size="talla-s" color="moss" radius="square" min={1} />
    <Avatar name="Ada Lovelace" size="talla-l" radius="hairline" color="moss" variant="text" />
    <AvatarGroup max={2} total={3} size="talla-s" radius="square" color="clay" variant="wash">
      <Avatar name="Ada Lovelace" />
    </AvatarGroup>
    <EmptyState title="No reviews" description="Be the first." icon={<span />} actions={<Button>Review</Button>} headingLevel={2} color="moss" gap="2" padding="6" textStyle="fine" />

    {/* consumer A's keys are not valid here */}
    {/* @ts-expect-error */}
    <Button size="md" />
    {/* @ts-expect-error */}
    <Button color="brand" />
    {/* @ts-expect-error */}
    <Button variant="solid" />
    {/* @ts-expect-error */}
    <Input radius="lg" />
    {/* @ts-expect-error */}
    <NumberInput size="md" />
    {/* @ts-expect-error */}
    <NumberInput color="brand" />
    {/* @ts-expect-error */}
    <Inline gap="normal" />
    {/* @ts-expect-error */}
    <Text textStyle="body" />
    {/* @ts-expect-error */}
    <Label textStyle="label-md" />
    {/* @ts-expect-error */}
    <Label color="danger" />
    {/* @ts-expect-error */}
    <Label size="md" />
    {/* @ts-expect-error */}
    <Label variant="solid" />
    {/* @ts-expect-error */}
    <Label color="brand" />
    {/* @ts-expect-error */}
    <Label textStyle="body" />
    {/* @ts-expect-error */}
    <Badge variant="subtle" />
    {/* @ts-expect-error */}
    <Avatar size="md" />
    {/* @ts-expect-error */}
    <Avatar color="brand" />
    {/* @ts-expect-error */}
    <AvatarGroup radius="md" />
    {/* @ts-expect-error */}
    <AvatarGroup variant="solid" />
    {/* @ts-expect-error */}
    <EmptyState title="Empty" color="brand" />
    {/* @ts-expect-error */}
    <EmptyState title="Empty" gap="normal" />
    {/* @ts-expect-error */}
    <EmptyState title="Empty" padding="loose" />
    {/* @ts-expect-error */}
    <EmptyState title="Empty" textStyle="body" />
    {/* @ts-expect-error */}
    <Table density="regular" />
    {/* @ts-expect-error */}
    <Table radius="md" />
    {/* @ts-expect-error */}
    <Tooltip content="Ayuda" padding="normal"><Button /></Tooltip>
    {/* @ts-expect-error */}
    <Alert textStyle="body" />
    {/* @ts-expect-error */}
    <Table.HeaderCell sortDirection="invalid" />
    {/* @ts-expect-error */}
    <Table.SelectionCell />
    {/* @ts-expect-error */}
    <Progress size="md" />
    {/* @ts-expect-error */}
    <Progress color="brand" />
    {/* @ts-expect-error */}
    <Progress radius="lg" />
    {/* @ts-expect-error */}
    <Dialog title="T" size="md" />
    {/* @ts-expect-error */}
    <Slider size="md" />
    {/* @ts-expect-error */}
    <Slider color="brand" />
    {/* @ts-expect-error */}
    <Slider segments={[{ from: 0, to: 10, color: 'brand' }]} />
    {/* @ts-expect-error */}
    <Slider.Range aria-label="Price" size="md" defaultValue={[10, 90]} />
    {/* @ts-expect-error level is numeric */}
    <AudioPlayer src="/grabacion.wav" level="high" />
    {/* @ts-expect-error */}
    <Pagination count={8} size="sm" />
    {/* @ts-expect-error */}
    <Pagination count={8} selectedVariant="solid" />
    {/* @ts-expect-error */}
    <DatePicker size="md" />
    {/* @ts-expect-error */}
    <DatePicker variant="solid" />
    {/* @ts-expect-error */}
    <DatePicker color="primary" />
    {/* @ts-expect-error */}
    <CommandPalette commands={[]} size="md" />
    {/* @ts-expect-error */}
    <CommandPalette commands={[]} color="brand" />
    {/* @ts-expect-error */}
    <Breadcrumb textStyle="caption" />
    {/* @ts-expect-error */}
    <Breadcrumb color="primary" />
    {/* @ts-expect-error */}
    <Accordion type="single" size="md" />
    {/* @ts-expect-error */}
    <Accordion type="single" color="primary" />
    {/* @ts-expect-error */}
    <Accordion type="single" radius="md" />
    {/* @ts-expect-error */}
    <Combobox multiple options={[]} size="md" />
    {/* @ts-expect-error */}
    <Combobox multiple options={[]} color="brand" />
    {/* @ts-expect-error */}
    <Combobox multiple options={[]} value="natural" />
  </>
);

toast({ title: 'Guardado', radius: 'hairline', gap: '2', padding: '4', textStyle: 'fine' });
// @ts-expect-error
toast({ title: 'Guardado', gap: 'normal' });
