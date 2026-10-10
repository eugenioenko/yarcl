import { Stepper, type StepperItem } from '@yarcl/react';
import { SplitPane } from '@yarcl/react';
import { TreeView, type TreeViewItem } from '@yarcl/react';
import { createComponent } from '@yarcl/react';
import { tokens, defineConfig, defineRecipes, type RecipeStyle } from '@yarcl/react/define';
import { Accordion, AppLayout, Alert, AudioPlayer, Avatar, AvatarGroup, Badge, Breadcrumb, Button, Card, SplitButton, Combobox, CommandPalette, DatePicker, Dialog, EmptyState, FileDropzone, Grid, Heading, IconButton, Inline, Input, Label, Menu, NavItem, NavSection, NumberInput, Pagination, Progress, Slider, Stack, Table, Text, Tooltip, VisuallyHidden, toast, HoverCard, Popover, Toaster, type Responsive, type Spacing } from '@yarcl/react';
import config from './yarcl.config';
import type { YarclPluginOptions } from '@yarcl/react/vite';

// @ts-expect-error token emission accepts only booleans or filenames
const invalidTokenOutput: YarclPluginOptions = { emitTokens: { fileName: 'tokens.css' } };
void invalidTokenOutput;

type PageTextStyle = keyof typeof config.typography.styles;
const pageTextStyle: PageTextStyle = config.defaults.textStyle;
// @ts-expect-error page metrics must select a configured text style
const invalidPageStyle: PageTextStyle = 'missing';
void [pageTextStyle, invalidPageStyle];

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
      <Table.VirtualBody items={[{ id: 'order', value: 'Ready' }]} estimateRowHeight={48} getItemKey={(item) => item.id}>
        {(item, index) => <Table.Row><Table.Cell>{item.value} {index}</Table.Cell></Table.Row>}
      </Table.VirtualBody>
      {/* @ts-expect-error Measured rows require stable keys. */}
      <Table.VirtualBody items={[]} estimateRowHeight={48}>{() => <Table.Row />}</Table.VirtualBody>
      {/* @ts-expect-error Choose one height mode. */}
      <Table.VirtualBody items={[]} rowHeight={36} estimateRowHeight={48} getItemKey={() => 'key'}>{() => <Table.Row />}</Table.VirtualBody>
      {/* @ts-expect-error A positive height or estimate must be supplied. */}
      <Table.VirtualBody items={[]}>{() => <Table.Row />}</Table.VirtualBody>
      {/* @ts-expect-error Measured mode renders a row element, not text. */}
      <Table.VirtualBody items={[]} estimateRowHeight={48} getItemKey={() => 'key'}>{() => 'text'}</Table.VirtualBody>
      {/* @ts-expect-error Stable keys must be strings or numbers. */}
      <Table.VirtualBody items={[]} estimateRowHeight={48} getItemKey={() => ({})}>{() => <Table.Row />}</Table.VirtualBody>
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


/** Checks recipe props, inherited semantics, refs, slots and the consumer's token vocabulary. */
function recipeContract() {
  const yarcl = tokens(config);
  const color = yarcl.colors.moss;
  // @ts-expect-error another consumer's color must not autocomplete here
  void yarcl.colors.success;
  // @ts-expect-error unknown token key
  void yarcl.colors.missing;
  // @ts-expect-error unknown token group
  void yarcl.color.moss;
  // @ts-expect-error token references are not concrete color strings
  const literal: string = color;
  const Action = createComponent('Action', Button);
  const Status = createComponent('OrderStatus', 'div', ({ rootProps, slots }) => {
    // @ts-expect-error only configured slots exist
    void slots.missing;
    return <div {...rootProps}><span className={slots.icon} aria-hidden="true">✓</span><span className={slots.label}>{rootProps.children}</span></div>;
  });
  // @ts-expect-error only configured recipe names exist
  createComponent('Missing', 'div');
  // @ts-expect-error recipes are selected by name, not arbitrary CSS
  createComponent('OrderStatus', 'invalid-element');
  const valid = <><Action emphasis="strong" onClick={() => {}} ref={(element) => { element?.focus(); }}>Save</Action><Action href="/account" emphasis="subtle">Account</Action><Status status="paid" emphasis="strong" ref={(element) => { element?.focus(); }}>Paid</Status></>;
  // @ts-expect-error only configured variant values exist
  const invalidStatus = <Status status="refunded" />;
  // @ts-expect-error variants remain literal unions
  const invalidEmphasis = <Action emphasis="loud" />;
  // @ts-expect-error recipe props are not allowed on unrelated recipes
  const invalidAxis = <Action status="paid" />;
  // @ts-expect-error native attributes retain their types
  const invalidDisabled = <Action disabled="yes" />;
  // @ts-expect-error button link semantics are preserved
  const invalidLink = <Action href="/account" disabled />;
  // @ts-expect-error the root's ref type is preserved
  const invalidRef = <Status ref={(element: HTMLButtonElement | null) => { element?.focus(); }} />;
  // @ts-expect-error tokens must match the CSS property group
  const wrongGroup: RecipeStyle = { color: yarcl.spacing[config.defaults.gap] };
  // @ts-expect-error CSS values retain their value types
  const wrongCss: RecipeStyle = { display: true };
  // @ts-expect-error missing root slot
  defineRecipes({ Invalid: { slots: { label: {} } } });
  // @ts-expect-error variant styles must refer to declared slots
  defineRecipes({ Invalid: { slots: { root: {} }, variants: { appearance: { soft: { missing: {} } } } } });
  // @ts-expect-error defaults must select an existing variant value
  defineRecipes({ Invalid: { slots: { root: {} }, variants: { appearance: { soft: { root: {} } } }, defaults: { appearance: 'missing' } } });
  // @ts-expect-error defaults must select an existing axis
  defineRecipes({ Invalid: { slots: { root: {} }, defaults: { appearance: 'soft' } } });
  // @ts-expect-error reserved props cannot become variant axes
  defineRecipes({ Invalid: { slots: { root: {} }, variants: { ref: { soft: { root: {} } } } } });
  // @ts-expect-error compound conditions must use existing choices
  defineRecipes({ Invalid: { slots: { root: {} }, variants: { appearance: { soft: { root: {} } } }, compounds: [{ when: { appearance: 'missing' }, slots: { root: {} } }] } });
  const ConflictingBase = (_props: { status?: string; className?: string }) => null;
  // @ts-expect-error variant axes cannot consume inherited behavior props
  createComponent('OrderStatus', ConflictingBase);
  void [literal, valid, invalidStatus, invalidEmphasis, invalidAxis, invalidDisabled, invalidLink, invalidRef, wrongGroup, wrongCss];
}
void recipeContract;


/** Checks component variant isolation and shared fallbacks. */
export function checkComponentVariantValues() {
  return <>
    <Button variant="action" />
    <Badge variant="marker" />
    <Alert variant="filled" />
    {/* @ts-expect-error Badge-only variants do not belong to Button */}
    <Button variant="marker" />
    {/* @ts-expect-error Button-only variants do not belong to Badge */}
    <Badge variant="action" />
    {/* @ts-expect-error A local map replaces the shared group */}
    <Badge variant="filled" />
    {/* @ts-expect-error Component-only variants do not leak to shared fallbacks */}
    <Alert variant="action" />
  </>;
}


/** Checks translated catalog keys, formatter signatures and per-instance overrides. */
export function labelsContract() {
  defineConfig({ ...config, labels: { ...config.labels, close: 'Fermer', page: (page: number) => `Page ${page}` } });
  // @ts-expect-error Built-in catalog keys are fixed
  defineConfig({ ...config, labels: { ...config.labels, clsoe: 'Fermer' } });
  // @ts-expect-error Labels must be strings
  defineConfig({ ...config, labels: { ...config.labels, loading: 42 } });
  // @ts-expect-error Remove formatters receive a string and return a string
  defineConfig({ ...config, labels: { ...config.labels, removeItem: (name: number) => name } });
  // @ts-expect-error Pagination formatters receive numeric counts
  defineConfig({ ...config, labels: { ...config.labels, pageSummary: (page: string, count: string) => page + count } });
  return <>
    <Dialog title="Details" closeLabel="Close details" />
    <Alert dismissLabel="Dismiss warning" />
    <FileDropzone label="Photo" labels={{ chooseFile: 'Browse', removeItem: (name) => `Delete ${name}` }} />
    {/* @ts-expect-error Close labels are strings */}
    <Dialog title="Details" closeLabel={42} />
    {/* @ts-expect-error File picker copy has a fixed set of keys */}
    <FileDropzone label="Photo" labels={{ missing: 'Browse' }} />
    {/* @ts-expect-error Per-instance file formatters receive file names */}
    <FileDropzone label="Photo" labels={{ removeItem: (name: number) => String(name) }} />
  </>;
}

const partSettings = defineConfig({
  ...config,
  components: {
    Table: { slots: { root: { radius: 'square', border: 'double', borderWidth: 'width' }, header: { textStyle: 'fine', background: 'tint' }, cell: { density: 'compact' } } },
    Card: { slots: { body: { padding: '2' } } },
    Dialog: { slots: { header: { textStyle: 'fine' }, body: { padding: '2' }, footer: { background: 'surface' } } },
    Drawer: { slots: { root: { radius: 'square' }, footer: { border: 'dotted' } } },
    Tabs: { slots: { list: { padding: '2' }, trigger: { textStyle: 'fine' } } },
    Menu: { slots: { panel: { border: 'dashed' }, item: { padding: '2' } } },
    Listbox: { slots: { panel: { background: 'surface' }, item: { textStyle: 'fine' } } },
  },
});
void partSettings;
const cardParts = <Card><Card.Header ref={() => {}}>Heading</Card.Header><Card.Body>Content</Card.Body><Card.Footer>Actions</Card.Footer></Card>;
void cardParts;
// @ts-expect-error unknown slot name
defineConfig({ ...config, components: { Table: { slots: { missing: { padding: '2' } } } } });
// @ts-expect-error slot properties are specific to each part
defineConfig({ ...config, components: { Table: { slots: { row: { radius: 'square' } } } } });
// @ts-expect-error slots are supported only on declared components
defineConfig({ ...config, components: { Button: { slots: { root: { radius: 'square' } } } } });
// @ts-expect-error unknown radius token
defineConfig({ ...config, components: { Card: { slots: { root: { radius: 'missing' } } } } });
// @ts-expect-error unknown spacing token
defineConfig({ ...config, components: { Dialog: { slots: { body: { padding: 'missing' } } } } });
// @ts-expect-error unknown text style token
defineConfig({ ...config, components: { Table: { slots: { header: { textStyle: 'missing' } } } } });
// @ts-expect-error unknown density token
defineConfig({ ...config, components: { Table: { slots: { cell: { density: 'missing' } } } } });
// @ts-expect-error unknown shadow token
defineConfig({ ...config, components: { Menu: { slots: { panel: { shadow: 'missing' } } } } });
// @ts-expect-error backgrounds cannot contain raw CSS
defineConfig({ ...config, components: { Drawer: { slots: { footer: { background: '#fff' } } } } });
// @ts-expect-error borders cannot contain raw CSS
defineConfig({ ...config, components: { Card: { slots: { root: { border: '1px solid red' } } } } });
// @ts-expect-error border widths reference the borders group
defineConfig({ ...config, components: { Table: { slots: { root: { borderWidth: 'missing' } } } } });
// @ts-expect-error size matching is a control prop, not a slot radius token
defineConfig({ ...config, components: { Menu: { slots: { panel: { radius: 'size' } } } } });
const invalidPartsFromVariable = { Card: { slots: { body: { padding: '2', rawCss: 'color: red' } } } } as const;
// @ts-expect-error unknown properties are rejected even through variables
defineConfig({ ...config, components: invalidPartsFromVariable });

const optionalInvalidSlot: { Card: { slots?: { body?: { padding: 'missing' } } } } = { Card: { slots: { body: { padding: 'missing' } } } };
// @ts-expect-error optional settings passed through variables still validate token references
defineConfig({ ...config, components: optionalInvalidSlot });

<FileDropzone label="Uploads" multiple files={[]} defaultFiles={[]} inputRef={(input) => { input?.click(); }} onFilesChange={(files) => files.length} />;
// @ts-expect-error files must be File objects
<FileDropzone label="Uploads" multiple files={['document.pdf']} />;
// @ts-expect-error defaultFiles must be File objects
<FileDropzone label="Uploads" multiple defaultFiles={[42]} />;
// @ts-expect-error inputRef exposes a native file input
<FileDropzone label="Uploads" inputRef={(input: HTMLTextAreaElement | null) => { input?.focus(); }} />;

<NavSection title="Workspace" collapsed gap="2" textStyle="label" ref={(group) => { group?.focus(); }}><NavItem href="/projects" collapsed icon={<span>P</span>}>Projects</NavItem></NavSection>;
// @ts-expect-error collapse is boolean
<NavItem href="/projects" collapsed="yes">Projects</NavItem>;
// @ts-expect-error heading is required
<NavSection />;
// @ts-expect-error unknown spacing token
<NavSection title="Workspace" gap="missing" />;
// @ts-expect-error unknown typography token
<NavSection title="Workspace" textStyle="missing" />;
// @ts-expect-error collapse is boolean
<NavSection title="Workspace" collapsed="yes" />;

<AppLayout desktopBreakpoint="lg" sidebarWidth="sidebar" navigationLabel="Workspace" navigation={<NavSection title="Work"><NavItem href="/projects">Projects</NavItem></NavSection>} navbar={<Text>Acme</Text>} footer={<Text>Help</Text>} padding="4" collapsed menuLabel="Open navigation" closeLabel="Close navigation" skipLabel="Skip to content" navigationOpen={false} defaultNavigationOpen={false} onNavigationOpenChange={(open) => open} mainAs="section" mainProps={{ ref: (element) => { element?.focus(); }, id: 'workspace-content' }}>Content</AppLayout>;
// @ts-expect-error unknown breakpoint key
<AppLayout desktopBreakpoint="missing" sidebarWidth="sidebar" navigationLabel="Workspace" navigation={null} />;
// @ts-expect-error unknown width key
<AppLayout desktopBreakpoint="lg" sidebarWidth="missing" navigationLabel="Workspace" navigation={null} />;
// @ts-expect-error unknown padding token
<AppLayout desktopBreakpoint="lg" sidebarWidth="sidebar" navigationLabel="Workspace" navigation={null} padding="missing" />;
// @ts-expect-error navigation requires an accessible name
<AppLayout desktopBreakpoint="lg" sidebarWidth="sidebar" navigation={null} />;
// @ts-expect-error mainAs preserves content semantics
<AppLayout desktopBreakpoint="lg" sidebarWidth="sidebar" navigationLabel="Workspace" navigation={null} mainAs="button" />;
// @ts-expect-error open state is boolean
<AppLayout desktopBreakpoint="lg" sidebarWidth="sidebar" navigationLabel="Workspace" navigation={null} navigationOpen="yes" />;
// @ts-expect-error component padding defaults reference spacing tokens
defineConfig({ ...config, components: { AppLayout: { padding: 'missing' } } });

const responsiveSpacing: Responsive<Spacing> = { base: '2', md: '8' } as const;
// @ts-expect-error only configured breakpoint names are accepted
const invalidBreakpoint: Responsive<Spacing> = { desktop: '2' };
// @ts-expect-error responsive values must be configured spacing tokens
const invalidResponsiveToken: Responsive<Spacing> = { lg: 'missing' };
void [invalidBreakpoint, invalidResponsiveToken];

export const responsiveContract = <>
  <Stack gap={{ base: '2', studio: '8' }} />
  <Stack gap={responsiveSpacing} align={{ base: 'stretch', lg: 'start' }} justify={{ md: 'between' }} />
  <Inline gap={{ base: '2', md: '8' }} align={{ lg: 'end' }} wrap={{ base: false, lg: true }} />
  <Grid columns={{ base: 1, md: 2, lg: '12rem 1fr' }} gap={responsiveSpacing} />
  <Card padding={responsiveSpacing} />
  <Alert gap={responsiveSpacing} padding={responsiveSpacing}>Saved</Alert>
  <EmptyState title="No results" gap={responsiveSpacing} padding={responsiveSpacing} />
  <NavSection title="Work" gap={responsiveSpacing}><NavItem href="/">Home</NavItem></NavSection>
  <AppLayout navigation={<NavItem href="/">Home</NavItem>} navigationLabel="Work" sidebarWidth="sidebar" desktopBreakpoint="lg" padding={responsiveSpacing}>Content</AppLayout>
  <Tooltip content="Hint" padding={responsiveSpacing}><Button>Help</Button></Tooltip>
  <HoverCard content="Details" padding={responsiveSpacing}><Button>Details</Button></HoverCard>
  <Popover><Popover.Trigger><Button>Open</Button></Popover.Trigger><Popover.Content padding={responsiveSpacing}>Details</Popover.Content></Popover>
  <Toaster />
  {/* @ts-expect-error unknown responsive breakpoint */}
  <Stack gap={{ desktop: '2' }} />
  {/* @ts-expect-error unknown spacing token */}
  <Card padding={{ base: 'missing' }} />
  {/* @ts-expect-error invalid responsive alignment */}
  <Inline align={{ lg: 'middle' }} />
  {/* @ts-expect-error invalid responsive distribution */}
  <Stack justify={{ md: 'around' }} />
  {/* @ts-expect-error wrapping accepts booleans */}
  <Inline wrap={{ lg: 'yes' }} />
  {/* @ts-expect-error column counts accept numbers or CSS track strings */}
  <Grid columns={{ lg: false }} />
  {/* @ts-expect-error unknown responsive breakpoint */}
  <Grid columns={{ desktop: 3 }} />
</>;

toast({ title: 'Saved', gap: responsiveSpacing, padding: responsiveSpacing });

const treeItems = [{ id: 'work', label: 'Work', icon: <svg />, children: [{ id: 'draft', label: 'Draft', textValue: 'Draft project', disabled: false }] }, { id: 'archive', label: 'Archive', selectable: false }] as const satisfies readonly TreeViewItem[];
export const treeContract = <>
  <TreeView items={treeItems} aria-label="Workspace" size='talla-s' color='clay' radius='hairline' expanded={['work']} defaultExpanded={['work']} value="draft" defaultValue="draft" onValueChange={(value: 'work' | 'draft' | 'archive' | null) => value} onExpandedChange={(values: ('work' | 'draft' | 'archive')[]) => values} disabled={false} ref={() => {}} className="files" data-owner="Sam" />
  <TreeView items={treeItems} aria-labelledby="workspace-heading" selectionMode="multiple" value={['draft']} defaultValue={['work']} onValueChange={(values: ('work' | 'draft' | 'archive')[]) => values} />
  <TreeView items={treeItems} aria-label="Workspace" selectionMode="none" />
  {/* @ts-expect-error trees require an accessible name */}
  <TreeView items={treeItems} />
  {/* @ts-expect-error unknown tree item identifiers */}
  <TreeView items={treeItems} aria-label="Workspace" value="missing" />
  {/* @ts-expect-error unknown expanded identifiers */}
  <TreeView items={treeItems} aria-label="Workspace" expanded={['missing']} />
  {/* @ts-expect-error single selection uses a scalar */}
  <TreeView items={treeItems} aria-label="Workspace" value={['draft']} />
  {/* @ts-expect-error multiple selection uses an array */}
  <TreeView items={treeItems} aria-label="Workspace" selectionMode="multiple" value="draft" />
  {/* @ts-expect-error navigation-only trees have no selection */}
  <TreeView items={treeItems} aria-label="Workspace" selectionMode="none" value="draft" />
  {/* @ts-expect-error size keys come from the consumer config */}
  <TreeView items={treeItems} aria-label="Workspace" size="missing" />
  {/* @ts-expect-error color keys come from the consumer config */}
  <TreeView items={treeItems} aria-label="Workspace" color="missing" />
  {/* @ts-expect-error radius keys come from the consumer config */}
  <TreeView items={treeItems} aria-label="Workspace" radius="missing" />
</>;

<SplitPane primaryLabel="Navigation" secondaryLabel="Content" primary={<button>Files</button>} secondary={<input aria-label="Document" />}
  size="talla-s" color="clay" radius="hairline" orientation="vertical" value={30} defaultValue={40}
  onValueChange={(value: number) => void value} onValueCommit={(value: number) => void value} min={0} max={100}
  step={0.5} largeStep={15} disabled formatValue={(value) => `${value} percent`} ref={(element: HTMLDivElement | null) => { element?.focus(); }} data-test="split" />;
// @ts-expect-error A separator needs its primary pane's name.
<SplitPane primary="Files" secondary="Document" />;
// @ts-expect-error Sizes come from this consumer's config.
<SplitPane primaryLabel="Files" primary="Files" secondary="Document" size="unknown-size" />;
// @ts-expect-error Colors come from this consumer's config.
<SplitPane primaryLabel="Files" primary="Files" secondary="Document" color="unknown-color" />;
// @ts-expect-error Radii come from this consumer's config.
<SplitPane primaryLabel="Files" primary="Files" secondary="Document" radius="unknown-radius" />;
// @ts-expect-error Layout orientation is horizontal or vertical.
<SplitPane primaryLabel="Files" primary="Files" secondary="Document" orientation="diagonal" />;
// @ts-expect-error Pane size is a percentage number.
<SplitPane primaryLabel="Files" primary="Files" secondary="Document" value="30%" />;

const stepperItems = [{ id: 'details', label: 'Details', completed: true }, { id: 'payment', label: 'Payment', description: 'Your card' }, { id: 'review', label: 'Review', disabled: true }] as const satisfies readonly StepperItem[];
<Stepper aria-label="Checkout" items={stepperItems} value="payment" defaultValue="details" onValueChange={(id: 'details' | 'payment' | 'review') => void id}
  orientation="vertical" size="talla-s" color="clay" radius="hairline" gap={{ base: '4', lg: '4' }} readOnly disabled
  ref={(element: HTMLOListElement | null) => { element?.focus(); }} data-test="stepper" />;
<Stepper aria-label="Complete checkout" items={stepperItems} value={null} />;
// @ts-expect-error A stepper needs an accessible name.
<Stepper items={stepperItems} />;
// @ts-expect-error Current identifiers are inferred from the items.
<Stepper aria-label="Checkout" items={stepperItems} value="unknown-stage" />;
// @ts-expect-error Initial identifiers are inferred from the items.
<Stepper aria-label="Checkout" items={stepperItems} defaultValue="unknown-stage" />;
// @ts-expect-error Size keys come from this consumer's config.
<Stepper aria-label="Checkout" items={stepperItems} size="unknown-size" />;
// @ts-expect-error Color keys come from this consumer's config.
<Stepper aria-label="Checkout" items={stepperItems} color="unknown-color" />;
// @ts-expect-error Radius keys come from this consumer's config.
<Stepper aria-label="Checkout" items={stepperItems} radius="unknown-radius" />;
// @ts-expect-error Spacing keys come from this consumer's config.
<Stepper aria-label="Checkout" items={stepperItems} gap={{ lg: 'unknown-gap' }} />;
// @ts-expect-error Breakpoints come from this consumer's config.
<Stepper aria-label="Checkout" items={stepperItems} gap={{ desktop: '4' }} />;
// @ts-expect-error Step markers always follow the item order.
<Stepper aria-label="Checkout" items={stepperItems} start={2} />;

const circularSteps = <Stepper aria-label="Circular progress" items={[{ id: 'start', label: 'Start' }]} radius="circle" orientation="horizontal" />;
const roundedSteps = <Stepper aria-label="Rounded progress" items={[{ id: 'start', label: 'Start' }]} radius="hairline" orientation="vertical" />;
// @ts-expect-error Circle token names come from this consumer config.
const invalidCircle = <Stepper aria-label="Progress" items={[{ id: 'start', label: 'Start' }]} radius="rounded" />;
void circularSteps; void roundedSteps; void invalidCircle;
