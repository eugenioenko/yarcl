import { useState } from 'react';
import { Button, ButtonGroup, IconButton, ToggleGroup, Tooltip } from 'yarcl';
import { PlusIcon, SearchIcon, TrashIcon } from './icons';

export function ButtonVariants() {
  return (
    <>
      <Button>Solid</Button>
      <Button variant="soft">Soft</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </>
  );
}

export function ButtonColors() {
  return (
    <>
      <Button color="primary">Primary</Button>
      <Button color="neutral">Neutral</Button>
      <Button color="success">Success</Button>
      <Button color="warning">Warning</Button>
      <Button color="danger">Danger</Button>
    </>
  );
}

export function ButtonSizes() {
  return (
    <>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </>
  );
}

export function ButtonRadii() {
  return (
    <>
      <Button radius="square">square</Button>
      <Button radius="sm">sm</Button>
      <Button radius="md">md</Button>
      <Button radius="lg">lg</Button>
      <Button radius="rounded">rounded</Button>
    </>
  );
}

export function ButtonIcons() {
  return (
    <>
      <Button>
        <PlusIcon /> New project
      </Button>
      <Button variant="outline" color="danger">
        <TrashIcon /> Delete
      </Button>
    </>
  );
}

export function ButtonLoading() {
  const [saving, setSaving] = useState(false);
  return (
    <Button
      loading={saving}
      onClick={() => {
        setSaving(true);
        setTimeout(() => setSaving(false), 1500);
      }}
    >
      {saving ? 'Saving…' : 'Save changes'}
    </Button>
  );
}

export function IconButtonDemo() {
  return (
    <>
      <Tooltip content="Search">
        <IconButton aria-label="Search" variant="outline">
          <SearchIcon />
        </IconButton>
      </Tooltip>
      <IconButton aria-label="Add">
        <PlusIcon />
      </IconButton>
      <IconButton aria-label="Delete" variant="ghost" color="danger">
        <TrashIcon />
      </IconButton>
      <IconButton aria-label="Add" size="lg" radius="rounded" variant="soft">
        <PlusIcon />
      </IconButton>
    </>
  );
}

export function ButtonGroupDemo() {
  return (
    <>
      <ButtonGroup aria-label="Pagination" variant="outline" color="neutral">
        <Button>Previous</Button>
        <Button>1</Button>
        <Button>2</Button>
        <Button>Next</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Save options">
        <Button>Save</Button>
        <IconButton aria-label="More options">
          <PlusIcon />
        </IconButton>
      </ButtonGroup>
      <ButtonGroup aria-label="Share" attached={false} variant="soft" size="sm">
        <Button>Copy link</Button>
        <Button>Email</Button>
      </ButtonGroup>
    </>
  );
}

export function ToggleGroupSingle() {
  const [range, setRange] = useState<string | null>('week');
  return (
    <ToggleGroup type="single" value={range} onValueChange={setRange} required aria-label="Range">
      <ToggleGroup.Item value="day">Day</ToggleGroup.Item>
      <ToggleGroup.Item value="week">Week</ToggleGroup.Item>
      <ToggleGroup.Item value="month">Month</ToggleGroup.Item>
    </ToggleGroup>
  );
}

export function ToggleGroupMultiple() {
  return (
    <ToggleGroup type="multiple" defaultValue={['bold']} aria-label="Formatting" color="neutral" variant="ghost" selectedVariant="soft">
      <ToggleGroup.Item value="bold" icon aria-label="Bold">
        <b>B</b>
      </ToggleGroup.Item>
      <ToggleGroup.Item value="italic" icon aria-label="Italic">
        <i>I</i>
      </ToggleGroup.Item>
      <ToggleGroup.Item value="underline" icon aria-label="Underline">
        <u>U</u>
      </ToggleGroup.Item>
    </ToggleGroup>
  );
}
