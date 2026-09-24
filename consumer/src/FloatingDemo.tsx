import { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Combobox,
  Field,
  HoverCard,
  IconButton,
  Inline,
  Link,
  Menu,
  Popover,
  Select,
  Stack,
  Text,
  Tooltip,
  type SelectOption,
} from 'yarcl';
import { PlusIcon, SearchIcon } from './icons';

type Plan = 'free' | 'pro' | 'team' | 'enterprise';

const plans: SelectOption<Plan>[] = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
  { value: 'enterprise', label: 'Enterprise', disabled: true },
];

const countries: SelectOption[] = [
  'Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Chile', 'Colombia', 'Denmark',
  'Finland', 'France', 'Germany', 'Ireland', 'Italy', 'Japan', 'Mexico', 'Netherlands', 'Norway',
  'Peru', 'Portugal', 'Spain', 'Sweden', 'Switzerland', 'United Kingdom', 'United States', 'Uruguay',
].map((name) => ({ value: name.toLowerCase().replace(/\s+/g, '-'), label: name }));

const frameworks: SelectOption[] = ['React', 'Preact', 'Solid', 'Svelte', 'Vue', 'Angular', 'Qwik'].map((name) => ({
  value: name,
  label: name,
}));

function useFakeSearch(query: string) {
  const [results, setResults] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      const q = query.trim().toLowerCase();
      setResults(countries.filter((c) => c.label.toLowerCase().startsWith(q)));
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);
  return { results, loading };
}

export function FloatingDemo() {
  const [plan, setPlan] = useState<Plan | null>('pro');
  const [country, setCountry] = useState<string | null>(null);
  const [framework, setFramework] = useState<string | null>(null);
  const [visited, setVisited] = useState<string[]>(['sweden']);
  const [query, setQuery] = useState('');
  const [log, setLog] = useState('Nothing selected yet');
  const search = useFakeSearch(query);

  return (
    <Stack>
      <Inline>
        <Tooltip content="Search">
          <IconButton aria-label="Search" variant="outline">
            <SearchIcon />
          </IconButton>
        </Tooltip>
        <Tooltip content="Add item" placement="right">
          <IconButton aria-label="Add item" variant="subtle">
            <PlusIcon />
          </IconButton>
        </Tooltip>

        <Popover>
          <Popover.Trigger>
            <Button variant="outline" color="neutral">
              Filters
            </Button>
          </Popover.Trigger>
          <Popover.Content>
            <Stack gap="tight">
              <Text textStyle="caption" muted>
                Show
              </Text>
              <Checkbox defaultChecked>Open</Checkbox>
              <Checkbox>Archived</Checkbox>
            </Stack>
          </Popover.Content>
        </Popover>

        <Menu>
          <Menu.Trigger>
            <Button variant="outline" color="neutral">
              Actions
            </Button>
          </Menu.Trigger>
          <Menu.Content>
            <Menu.Item onSelect={() => setLog('Rename')}>Rename</Menu.Item>
            <Menu.Item onSelect={() => setLog('Duplicate')}>Duplicate</Menu.Item>
            <Menu.Item disabled>Move</Menu.Item>
            <Menu.Separator />
            <Menu.Item color="danger" onSelect={() => setLog('Delete')}>
              Delete
            </Menu.Item>
          </Menu.Content>
        </Menu>

        <Text>
          Hover{' '}
          <HoverCard
            content={
              <Stack gap="tight">
                <Text textStyle="title">Ada Lovelace</Text>
                <Text textStyle="caption" muted>
                  Wrote the first published algorithm. <Link href="#">View profile</Link>
                </Text>
              </Stack>
            }
          >
            <Link href="#">@ada</Link>
          </HoverCard>
        </Text>
      </Inline>
      <Text textStyle="caption" muted data-testid="menu-log">
        Last action: {log}
      </Text>

      <Inline align="start" className="fields">
        <Field label="Plan" description={`Value: ${plan ?? 'none'}`}>
          <Select options={plans} value={plan} onValueChange={setPlan} placeholder="Choose a plan" />
        </Field>
        <Field label="Country" description={`Searchable select. Value: ${country ?? 'none'}`}>
          <Combobox options={countries} value={country} onValueChange={setCountry} placeholder="Search countries" />
        </Field>
        <Field label="Framework" description={`Typeahead, free text allowed. Value: ${framework ?? 'none'}`}>
          <Combobox options={frameworks} allowCustomValue onValueChange={setFramework} placeholder="Type anything" />
        </Field>
        <Field label="Async search" description="Results load after 500 ms">
          <Combobox
            options={search.results}
            filter={false}
            loading={search.loading}
            onInputValueChange={setQuery}
            emptyMessage="No countries found"
            placeholder="Search remotely"
          />
        </Field>
        <Field label="Countries visited" description={`Pick up to 4. Value: ${visited.join(', ') || 'none'}`}>
          <Combobox multiple options={countries} value={visited} onValueChange={setVisited} maxSelected={4} name="visited" placeholder="Add countries" />
        </Field>
        <Field label="Skills" description="Pick or type your own, then press Enter">
          <Combobox multiple allowCustomValue options={frameworks} defaultValue={['React']} placeholder="Add skills" />
        </Field>
      </Inline>
    </Stack>
  );
}
