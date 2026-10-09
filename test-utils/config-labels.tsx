import axe from 'axe-core';
import { afterEach, beforeEach, expect, inject, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import {
  Alert,
  AudioPlayer,
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumb,
  Button,
  Combobox,
  CommandPalette,
  DatePicker,
  Dialog,
  Drawer,
  FileDropzone,
  NumberInput,
  Pagination,
  Progress,
  Slider,
  Spinner,
  SplitButton,
  Table,
  Toaster,
  config,
  toast,
  useLabels,
  type ConfigLabels,
} from '@yarcl/react';
import { applyTheme, resetTheme } from '@yarcl/react/css';
import { page } from './page';

const translated: ConfigLabels = {
  ...config.labels,
  close: 'Cerrar',
  dismiss: 'Descartar',
  remove: 'Quitar',
  removeItem: (name) => `Quitar ${name}`,
  loading: 'Cargando',
  loadingResults: 'Buscando…',
  noResults: 'Sin resultados',
  selectedItems: 'Seleccionados',
  breadcrumb: 'Ruta',
  expandBreadcrumb: 'Mostrar toda la ruta',
  progress: 'Progreso',
  progressValue: (value, max) => `${value} de ${max} bloques`,
  increase: 'Aumentar',
  decrease: 'Reducir',
  chooseDate: 'Elegir fecha',
  previousMonth: 'Mes anterior',
  nextMonth: 'Mes siguiente',
  commandPalette: 'Comandos',
  searchCommands: 'Buscar comandos…',
  shortcutControl: 'Control traducido',
  shortcutAlt: 'Alternativa',
  shortcutShift: 'Mayúsculas',
  shortcutMeta: 'Sistema',
  pagination: 'Páginas',
  previousPage: 'Página anterior',
  nextPage: 'Página siguiente',
  page: (number) => `Página ${number}`,
  pageSummary: (number, count) => `Página ${number} de ${count}`,
  actions: 'Acciones',
  chooseAction: 'Elegir acción',
  avatarOverflow: (count) => `${count} personas más`,
  sliderMinimum: 'Mínimo',
  sliderMaximum: 'Máximo',
  audioLevel: 'Nivel de entrada',
  playAudio: 'Reproducir audio',
  pauseAudio: 'Pausar audio',
  seekAudio: 'Buscar posición',
  chooseFile: 'Elegir archivo',
  chooseFiles: 'Elegir archivos',
  replaceFile: 'Reemplazar archivo',
  dropFile: 'o arrastra un archivo aquí',
  dropFiles: 'o arrastra archivos aquí',
  dropReplacement: 'o arrastra un reemplazo aquí',
  currentImage: 'Imagen actual',
  currentImageName: 'imagen actual',
  selectedImage: 'imagen seleccionada',
  previewImage: (name) => `Vista previa de ${name}`,
  selectAllRows: 'Seleccionar todas las filas',
  notifications: 'Avisos traducidos',
};
const switchLanguage = () => applyTheme({ ...config, labels: translated });
const image = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";

/** Checks built-in text, live language changes, formatter arguments and instance overrides in both brands. */
export function testConfigLabels() {
  beforeEach(async () => {
    document.documentElement.style.colorScheme = inject('scheme');
    await page.mouse.move(0, 0);
  });
  afterEach(() => {
    toast.dismiss();
    resetTheme();
    vi.restoreAllMocks();
  });

  test('updates mounted controls and keeps focus while changing language', async () => {
    const dismissed = vi.fn();
    const screen = await render(
      <main className="yarcl-root">
        <Spinner />
        <Alert title="Notice" onDismiss={dismissed} />
        <Badge onRemove={() => {}}>Tag</Badge>
        <Progress value={4} max={8} showValue />
        <NumberInput aria-label="Amount" />
        <Slider.Range aria-label="Price" defaultValue={[20, 80]} />
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.SelectAllCell />
            </Table.Row>
          </Table.Head>
        </Table>
      </main>,
    );
    const close = screen.container.querySelector('.yarcl-alert-dismiss') as HTMLButtonElement;
    close.focus();
    switchLanguage();
    await expect.poll(() => close.getAttribute('aria-label')).toBe(translated.dismiss);
    expect(document.activeElement).toBe(close);
    expect(await page.getByRole('status', { name: translated.loading }).count()).toBe(1);
    expect(await page.getByRole('button', { name: translated.remove, exact: true }).count()).toBe(1);
    expect(await page.getByRole('button', { name: translated.increase, exact: true }).count()).toBe(1);
    expect(await page.getByRole('button', { name: translated.decrease, exact: true }).count()).toBe(1);
    expect(await page.getByRole('checkbox', { name: translated.selectAllRows }).count()).toBe(1);
    expect(await page.getByRole('slider', { name: `Price ${translated.sliderMinimum}` }).count()).toBe(1);
    expect(await page.getByRole('slider', { name: `Price ${translated.sliderMaximum}` }).count()).toBe(1);
    const progress = page.getByRole('progressbar', { name: translated.progress });
    expect(await progress.getAttribute('aria-valuetext')).toBe('4 de 8 bloques');
    expect(screen.container.querySelector('.yarcl-progress-value')?.textContent).toBe('4 de 8 bloques');
    await page.keyboard.press('Enter');
    expect(dismissed).toHaveBeenCalledTimes(1);
    resetTheme();
    await expect.poll(() => close.getAttribute('aria-label')).toBe(config.labels.dismiss);
  });

  test('instance copy, empty decorative labels and custom value formatters keep priority', async () => {
    const screen = await render(
      <main>
        <Spinner label="" />
        <Alert onDismiss={() => {}} dismissLabel="Hide notice" />
        <Badge onRemove={() => {}} removeLabel="Delete tag">
          Tag
        </Badge>
        <NumberInput aria-label="Count" incrementLabel="Add one" decrementLabel="Take one" />
        <Progress value={4} max={8} label="Storage" formatValue={(value) => `${value} items`} showValue />
        <Slider.Range aria-label="Hours" thumbLabels={['Opens', 'Closes']} defaultValue={[20, 80]} />
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.SelectAllCell aria-label="Select invoices" />
            </Table.Row>
          </Table.Head>
        </Table>
      </main>,
    );
    switchLanguage();
    await expect.poll(() => screen.container.querySelector('.yarcl-spinner')?.getAttribute('aria-label')).toBe('');
    for (const name of ['Hide notice', 'Delete tag', 'Add one', 'Take one']) {
      expect(await page.getByRole('button', { name, exact: true }).count()).toBe(1);
    }
    expect(await page.getByRole('checkbox', { name: 'Select invoices' }).count()).toBe(1);
    expect(await page.getByRole('slider', { name: 'Hours Opens' }).count()).toBe(1);
    expect(await page.getByRole('progressbar', { name: 'Storage' }).getAttribute('aria-valuetext')).toBe('4 items');
  });

  test.each([Dialog, Drawer])(
    'updates an open modal, honors its close override and retains native dismissal',
    async (Component) => {
      const changed = vi.fn();
      const screen = await render(
        <Component title="Panel" defaultOpen onOpenChange={changed}>
          Content
        </Component>,
      );
      await page.getByRole('dialog', { name: 'Panel' }).waitFor();
      switchLanguage();
      await page.getByRole('button', { name: translated.close, exact: true }).waitFor();
      await screen.rerender(
        <Component title="Panel" defaultOpen closeLabel="Close panel" onOpenChange={changed}>
          Content
        </Component>,
      );
      await page.getByRole('button', { name: 'Close panel', exact: true }).click();
      await expect.poll(() => screen.container.querySelector('dialog')?.open).toBe(false);
      expect(changed).toHaveBeenLastCalledWith(false);
    },
  );

  test('updates existing toasts and their region while retaining per-toast overrides', async () => {
    const screen = await render(<Toaster />);
    expect(screen.container.querySelector('section')?.getAttribute('aria-label')).toBe(config.labels.notifications);
    toast({ title: 'Saved', duration: 0 });
    toast({ title: 'Special', duration: 0, dismissLabel: 'Hide special' });
    await page.getByText('Saved', { exact: true }).waitFor();
    switchLanguage();
    await page.getByRole('region', { name: translated.notifications }).waitFor();
    await page.getByRole('button', { name: translated.dismiss, exact: true }).click();
    await expect.poll(() => page.getByText('Saved', { exact: true }).count()).toBe(0);
    expect(await page.getByRole('button', { name: 'Hide special', exact: true }).count()).toBe(1);
    await screen.rerender(<Toaster label="Activity" />);
    await page.getByRole('region', { name: 'Activity', exact: true }).waitFor();
  });

  test('formats numbered and compact pagination from the active catalog', async () => {
    const screen = await render(
      <main>
        <Pagination count={3} />
        <Pagination count={3} layout="compact" />
      </main>,
    );
    switchLanguage();
    await page.getByRole('button', { name: translated.page(2), exact: true }).click();
    expect(await page.getByRole('button', { name: translated.page(2), exact: true }).getAttribute('aria-current')).toBe(
      'page',
    );
    expect(screen.container.querySelector('.yarcl-pagination-summary')?.textContent).toBe(translated.pageSummary(1, 3));
    expect(
      [...screen.container.querySelectorAll('nav')].every(
        (nav) => nav.getAttribute('aria-label') === translated.pagination,
      ),
    ).toBe(true);
    expect(await page.getByRole('button', { name: translated.previousPage, exact: true }).count()).toBe(2);
    await screen.rerender(
      <Pagination
        count={3}
        layout="compact"
        aria-label="Invoices"
        previousLabel="Earlier"
        nextLabel="Later"
        summaryLabel={(page, count) => `${page}/${count}`}
      />,
    );
    expect(screen.container.querySelector('.yarcl-pagination-summary')?.textContent).toBe('1/3');
    expect(await page.getByRole('navigation', { name: 'Invoices' }).count()).toBe(1);
    expect(await page.getByRole('button', { name: 'Later' }).count()).toBe(1);
  });

  test('translates breadcrumb expansion, split controls and avatar counts', async () => {
    await render(
      <main>
        <Breadcrumb maxItems={2}>
          <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
          <Breadcrumb.Item href="/projects">Projects</Breadcrumb.Item>
          <Breadcrumb.Item href="/project">Project</Breadcrumb.Item>
          <Breadcrumb.Item>Settings</Breadcrumb.Item>
        </Breadcrumb>
        <SplitButton options={[]} />
        <AvatarGroup max={2} aria-label="Team">
          <Avatar name="Ada" />
          <Avatar name="Grace" />
          <Avatar name="Lin" />
        </AvatarGroup>
      </main>,
    );
    switchLanguage();
    await page.getByRole('navigation', { name: translated.breadcrumb }).waitFor();
    await page.getByRole('button', { name: translated.expandBreadcrumb }).click();
    expect(await page.getByRole('link', { name: 'Projects', exact: true }).count()).toBe(1);
    expect(await page.getByRole('group', { name: translated.actions }).count()).toBe(1);
    expect(await page.getByRole('button', { name: translated.chooseAction, exact: true }).count()).toBe(2);
    expect(await page.getByRole('img', { name: translated.avatarOverflow(1), exact: true }).count()).toBe(1);
  });

  test('updates an open calendar while partial overrides retain precedence', async () => {
    const screen = await render(
      <DatePicker
        aria-label="Date"
        defaultValue={new Date(2026, 8, 15)}
        labels={{ previousMonth: 'Earlier month', nextMonth: undefined }}
      />,
    );
    await page.getByRole('button', { name: 'Date', exact: true }).click();
    switchLanguage();
    await page.getByRole('dialog', { name: translated.chooseDate }).waitFor();
    expect(await page.getByRole('button', { name: 'Earlier month' }).count()).toBe(1);
    expect(await page.getByRole('button', { name: translated.nextMonth }).count()).toBe(1);
    await screen.rerender(
      <DatePicker
        aria-label="Date"
        defaultValue={new Date(2026, 8, 15)}
        labels={{ dialog: 'Calendar', previousMonth: 'Earlier month', nextMonth: 'Later month' }}
      />,
    );
    await page.getByRole('dialog', { name: 'Calendar', exact: true }).waitFor();
    await page.keyboard.press('Escape');
  });

  test.each([false, true])(
    'updates combobox loading and empty text, preserving null and ReactNode overrides (multiple: %s)',
    async (multiple) => {
      const mode = multiple ? { multiple: true as const } : {};
      const screen = await render(<Combobox {...mode} aria-label="Lookup" inputValue="missing" options={[]} loading />);
      await page.getByRole('combobox', { name: 'Lookup' }).focus();
      switchLanguage();
      await expect
        .poll(() => document.querySelector('.yarcl-listbox-message')?.textContent)
        .toBe(translated.loadingResults);
      await screen.rerender(<Combobox {...mode} aria-label="Lookup" inputValue="missing" options={[]} />);
      await expect.poll(() => document.querySelector('.yarcl-listbox-message')?.textContent).toBe(translated.noResults);
      await screen.rerender(
        <Combobox {...mode} aria-label="Lookup" inputValue="missing" options={[]} emptyMessage={null} />,
      );
      await expect.poll(() => document.querySelector('.yarcl-listbox-message')?.textContent).toBe('');
      await screen.rerender(
        <Combobox
          {...mode}
          aria-label="Lookup"
          inputValue="missing"
          options={[]}
          loading
          loadingMessage={<b>Waiting</b>}
        />,
      );
      await expect.poll(() => document.querySelector('.yarcl-listbox-message b')?.textContent).toBe('Waiting');
    },
  );

  test('translates chip list and remove names without losing instance copy', async () => {
    const options = [{ value: 'one', label: 'One' }];
    const screen = await render(<Combobox multiple aria-label="Tags" options={options} defaultValue={['one']} />);
    switchLanguage();
    await expect.poll(() => page.getByRole('list', { name: translated.selectedItems }).count()).toBe(1);
    expect(await page.getByRole('button', { name: translated.removeItem('One') }).count()).toBe(1);
    await screen.rerender(
      <Combobox
        multiple
        aria-label="Tags"
        options={options}
        defaultValue={['one']}
        selectedLabel="Chosen tags"
        removeLabel={(name) => `Delete ${name}`}
      />,
    );
    await expect.poll(() => page.getByRole('list', { name: 'Chosen tags' }).count()).toBe(1);
    await page.getByRole('button', { name: 'Delete One' }).click();
    await expect.poll(() => screen.container.querySelectorAll('.yarcl-badge').length).toBe(0);
  });

  test('updates command search, empty results and shortcut hints while keeping ARIA tokens', async () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('Linux');
    const chosen = vi.fn();
    const command = { id: 'open', label: 'Open file', shortcut: 'Ctrl+Alt+Shift+Meta+O', onSelect: chosen };
    const screen = await render(
      <CommandPalette
        defaultOpen
        shortcut="Ctrl+Alt+Shift+Meta+K"
        trigger={<Button>Open commands</Button>}
        commands={[command]}
      />,
    );
    switchLanguage();
    await page.getByRole('dialog', { name: translated.commandPalette }).waitFor();
    expect(screen.container.querySelector('input')?.getAttribute('placeholder')).toBe(translated.searchCommands);
    const hints = [...screen.container.querySelectorAll('kbd')].map((kbd) => kbd.textContent);
    expect(hints).toEqual([
      translated.shortcutControl,
      translated.shortcutAlt,
      translated.shortcutShift,
      translated.shortcutMeta,
      'O',
    ]);
    expect(screen.container.querySelector('button')?.getAttribute('aria-keyshortcuts')).toBe(
      'Control+Alt+Shift+Meta+K',
    );
    await page.getByRole('combobox', { name: translated.commandPalette }).fill('missing');
    await expect.poll(() => screen.container.querySelector('[role="status"]')?.textContent).toBe(translated.noResults);
    await screen.rerender(
      <CommandPalette
        defaultOpen
        shortcut=""
        commands={[]}
        label="Search site"
        placeholder="Type here"
        emptyMessage={<i>Nothing here</i>}
      />,
    );
    await page.getByRole('dialog', { name: 'Search site' }).waitFor();
    expect(screen.container.querySelector('input')?.getAttribute('placeholder')).toBe('Type here');
    expect(screen.container.querySelector('[role="status"] i')?.textContent).toBe('Nothing here');
  });

  test.each(['empty', 'local', 'remote', 'multiple'] as const)(
    'translates file picker copy in %s mode',
    async (mode) => {
      const file = new File(['notes'], 'notes.txt', { type: 'text/plain' });
      const screen = await render(
        <FileDropzone
          label="Documents"
          multiple={mode === 'multiple'}
          defaultValue={mode === 'local' ? file : undefined}
          previewUrl={mode === 'remote' ? image : undefined}
        />,
      );
      switchLanguage();
      const choice =
        mode === 'multiple'
          ? translated.chooseFiles
          : mode === 'empty'
            ? translated.chooseFile
            : translated.replaceFile;
      await page.getByRole('button', { name: choice, exact: true }).waitFor();
      const hint =
        mode === 'multiple'
          ? translated.dropFiles
          : mode === 'empty'
            ? translated.dropFile
            : translated.dropReplacement;
      expect(screen.container.querySelector('.yarcl-file-dropzone-hint')?.textContent).toBe(hint);
      if (mode === 'local')
        expect(await page.getByRole('button', { name: translated.removeItem(file.name) }).count()).toBe(1);
      if (mode === 'remote') {
        expect(screen.container.querySelector('img')?.getAttribute('alt')).toBe(
          translated.previewImage(translated.selectedImage),
        );
        expect(screen.container.querySelector('.yarcl-file-dropzone-current span')?.textContent).toBe(
          translated.currentImage,
        );
        expect(
          await page.getByRole('button', { name: translated.removeItem(translated.currentImageName) }).count(),
        ).toBe(1);
      }
      if (mode === 'multiple') {
        const input = screen.container.querySelector('input')!;
        const transfer = new DataTransfer();
        transfer.items.add(file);
        input.files = transfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        await page.getByRole('button', { name: translated.removeItem(file.name) }).waitFor();
        expect(screen.container.querySelector('.yarcl-file-dropzone-files button')?.textContent).toBe(
          translated.remove,
        );
      }
    },
  );

  test('file picker partial overrides and formatter arguments remain intact after a language change', async () => {
    const remove = vi.fn((name: string) => `Delete ${name}`);
    const preview = vi.fn((name: string) => `Thumbnail: ${name}`);
    const screen = await render(
      <FileDropzone
        label="Photo"
        previewUrl={image}
        previewName="cover.svg"
        labels={{ replaceFile: 'Browse', removeItem: remove, previewImage: preview, dropReplacement: undefined }}
      />,
    );
    switchLanguage();
    await page.getByRole('button', { name: 'Browse', exact: true }).waitFor();
    expect(screen.container.querySelector('.yarcl-file-dropzone-hint')?.textContent).toBe(translated.dropReplacement);
    expect(screen.container.querySelector('img')?.getAttribute('alt')).toBe('Thumbnail: cover.svg');
    expect(remove).toHaveBeenLastCalledWith('cover.svg');
    expect(preview).toHaveBeenLastCalledWith('cover.svg');
    await page.getByRole('button', { name: 'Delete cover.svg' }).click();
    await page.getByRole('button', { name: translated.chooseFile, exact: true }).waitFor();
  });

  test('updates audio controls and its input meter, preserving instance labels', async () => {
    const screen = await render(<AudioPlayer src="" level={0.4} />);
    switchLanguage();
    await page.getByRole('button', { name: translated.playAudio }).waitFor();
    expect(await page.getByRole('slider', { name: translated.seekAudio }).count()).toBe(1);
    expect(await page.getByRole('progressbar', { name: translated.audioLevel }).count()).toBe(1);
    const audio = screen.container.querySelector('audio')!;
    Object.defineProperty(audio, 'paused', { value: false, configurable: true });
    audio.dispatchEvent(new Event('play'));
    await page.getByRole('button', { name: translated.pauseAudio }).waitFor();
    await screen.rerender(
      <AudioPlayer
        src=""
        level={0.4}
        playLabel="Play recording"
        pauseLabel="Pause recording"
        seekLabel="Recording position"
        levelLabel="Microphone"
      />,
    );
    await page.getByRole('button', { name: 'Pause recording' }).waitFor();
    expect(await page.getByRole('progressbar', { name: 'Microphone' }).count()).toBe(1);
    expect(await page.getByRole('slider', { name: 'Recording position' }).count()).toBe(1);
  });

  test('exposes the active catalog to custom components and restores consumer-specific labels', async () => {
    function CustomStatus() {
      const labels = useLabels();
      return <span>{labels.notifications}</span>;
    }
    const screen = await render(<CustomStatus />);
    expect(screen.container.textContent).toBe(config.labels.notifications);
    switchLanguage();
    await expect.poll(() => screen.container.textContent).toBe(translated.notifications);
    resetTheme();
    await expect.poll(() => screen.container.textContent).toBe(config.labels.notifications);
  });

  test('translated controls pass an accessibility audit', async () => {
    switchLanguage();
    const screen = await render(
      <main className="yarcl-root">
        <h1>Settings</h1>
        <Spinner />
        <Alert title="Notice" onDismiss={() => {}} />
        <Badge onRemove={() => {}}>Tag</Badge>
        <NumberInput aria-label="Amount" />
        <Progress value={50} label="Storage" showValue />
        <Pagination count={3} />
        <FileDropzone label="Documents" />
        <AudioPlayer src="" level={0.4} />
      </main>,
    );
    const audit = await axe.run(screen.container, { rules: { region: { enabled: false } } });
    expect(audit.violations.map((violation) => violation.id)).toEqual([]);
  });
}
