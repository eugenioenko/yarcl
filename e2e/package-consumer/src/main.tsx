import { Button } from '@yarcl/react';
import { createRoot } from 'react-dom/client';
import './layout.css';

const contract = <Button color="packageAccent">Packed package</Button>;

// @ts-expect-error not defined by this consumer's config
const invalid = <Button color="missing">Invalid</Button>;

createRoot(document.getElementById('root')!).render(contract);

void invalid;
