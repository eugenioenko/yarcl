import { Button, ColorPicker, Card, Grid, IconButton, Stack, Stepper, SplitPane, TreeView, type IconButtonLinkProps, type Responsive, type Spacing } from '@yarcl/react';
import { createRoot } from 'react-dom/client';
import './layout.css';

const iconLink: IconButtonLinkProps = { href: 'https://example.com', 'aria-label': 'Open external site', target: '_blank', rel: 'noopener noreferrer' };
const gap = { base: 'sm', lg: 'lg' } as const satisfies Responsive<Spacing>;
const contract = <Stack gap={gap}><Grid columns={{ base: 1, md: 2 }}><Card padding={gap}>Responsive packed package</Card><ColorPicker aria-label="Packed accent" defaultValue="#123456" /></Grid><TreeView aria-label="Packed files" items={[{ id: 'folder', label: 'Folder', children: [{ id: 'readme', label: 'Readme' }] }]} defaultExpanded={['folder']} defaultValue="readme" /><Stepper aria-label="Packed steps" items={[{ id: 'details', label: 'Details' }, { id: 'review', label: 'Review' }]} defaultValue="details" /><SplitPane primaryLabel="Packed files" primary="Files" secondary="Document" defaultValue={35} /><><Button color="packageAccent">Packed package</Button><IconButton {...iconLink}><svg aria-hidden="true" /></IconButton></></Stack>;

// @ts-expect-error icon links must have an accessible name
const unnamedLink = <IconButton href="https://example.com" />;

// @ts-expect-error icon links cannot use button-only attributes
const disabledLink = <IconButton {...iconLink} disabled />;

// @ts-expect-error not defined by this consumer's config
const invalid = <Button color="missing">Invalid</Button>;

createRoot(document.getElementById('root')!).render(contract);

void [invalid, unnamedLink, disabledLink];

// @ts-expect-error responsive spacing uses the installed config token keys
const invalidSpacing = <Stack gap={{ lg: 'missing' }} />;
// @ts-expect-error responsive maps require configured breakpoint names
const invalidBreakpoint = <Grid columns={{ desktop: 3 }} />;
void [invalidSpacing, invalidBreakpoint];

// @ts-expect-error identifier inference survives the installed declarations
const invalidTree = <TreeView aria-label="Files" items={[{ id: 'known', label: 'Known' }]} value="missing" />;
void invalidTree;

// @ts-expect-error Packed SplitPane types require a numeric percentage.
const invalidSplit = <SplitPane primaryLabel="Files" primary="Files" secondary="Document" value="30%" />;
void invalidSplit;

// @ts-expect-error Packed Stepper types infer its valid identifiers.
const invalidStep = <Stepper aria-label="Steps" items={[{ id: 'known', label: 'Known' }]} value="missing" />;
void invalidStep;

// @ts-expect-error Packed ColorPicker types require an initial or controlled color.
const invalidPicker = <ColorPicker aria-label="Accent" />;
void invalidPicker;
