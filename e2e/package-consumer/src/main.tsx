import { Button, IconButton, type IconButtonLinkProps } from '@yarcl/react';
import { createRoot } from 'react-dom/client';
import './layout.css';

const iconLink: IconButtonLinkProps = { href: 'https://example.com', 'aria-label': 'Open external site', target: '_blank', rel: 'noopener noreferrer' };
const contract = <><Button color="packageAccent">Packed package</Button><IconButton {...iconLink}><svg aria-hidden="true" /></IconButton></>;

// @ts-expect-error icon links must have an accessible name
const unnamedLink = <IconButton href="https://example.com" />;

// @ts-expect-error icon links cannot use button-only attributes
const disabledLink = <IconButton {...iconLink} disabled />;

// @ts-expect-error not defined by this consumer's config
const invalid = <Button color="missing">Invalid</Button>;

createRoot(document.getElementById('root')!).render(contract);

void [invalid, unnamedLink, disabledLink];
