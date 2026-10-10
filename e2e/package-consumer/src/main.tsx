import { Button, Card, Grid, IconButton, Stack, TreeView, type IconButtonLinkProps, type Responsive, type Spacing } from '@yarcl/react';
import { createRoot } from 'react-dom/client';
import './layout.css';

const iconLink: IconButtonLinkProps = { href: 'https://example.com', 'aria-label': 'Open external site', target: '_blank', rel: 'noopener noreferrer' };
const gap = { base: 'sm', lg: 'lg' } as const satisfies Responsive<Spacing>;
const contract = <Stack gap={gap}><Grid columns={{ base: 1, md: 2 }}><Card padding={gap}>Responsive packed package</Card></Grid><TreeView aria-label="Packed files" items={[{ id: 'folder', label: 'Folder', children: [{ id: 'readme', label: 'Readme' }] }]} defaultExpanded={['folder']} defaultValue="readme" /><><Button color="packageAccent">Packed package</Button><IconButton {...iconLink}><svg aria-hidden="true" /></IconButton></></Stack>;

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
