/** Built-in component copy. Strings may be translated; formatters receive names, values or counts. */
export interface ConfigLabels {
  /** Close button in dialogs and drawers. */
  close: string;
  /** Dismiss button in alerts and toasts. */
  dismiss: string;
  /** Remove button on badges and files. */
  remove: string;
  /** Accessible name of a remove button for a named item. */
  removeItem: (name: string) => string;
  /** Accessible name of a loading spinner. */
  loading: string;
  /** Loading message in a combobox. */
  loadingResults: string;
  /** Empty results message in comboboxes and command palettes. */
  noResults: string;
  /** Accessible name of a multi-select chip list. */
  selectedItems: string;
  /** Accessible name of breadcrumb navigation. */
  breadcrumb: string;
  /** Accessible name of the breadcrumb expansion button. */
  expandBreadcrumb: string;
  /** Accessible name of an unnamed progress bar. */
  progress: string;
  /** Default visible and accessible formatting of a progress value. */
  progressValue: (value: number, max: number) => string;
  /** Increment button in NumberInput. */
  increase: string;
  /** Decrement button in NumberInput. */
  decrease: string;
  /** Accessible name of the date picker calendar. */
  chooseDate: string;
  /** Previous month button in DatePicker. */
  previousMonth: string;
  /** Next month button in DatePicker. */
  nextMonth: string;
  /** Accessible name of a command palette and its search input. */
  commandPalette: string;
  /** Placeholder in the command search input. */
  searchCommands: string;
  /** Visible Control modifier in non-Apple command shortcut hints. */
  shortcutControl: string;
  /** Visible Alt modifier in non-Apple command shortcut hints. */
  shortcutAlt: string;
  /** Visible Shift modifier in non-Apple command shortcut hints. */
  shortcutShift: string;
  /** Visible Meta modifier in non-Apple command shortcut hints. */
  shortcutMeta: string;
  /** Accessible name of pagination navigation. */
  pagination: string;
  /** Previous page button in Pagination. */
  previousPage: string;
  /** Next page button in Pagination. */
  nextPage: string;
  /** Accessible name of a numbered page button. */
  page: (page: number) => string;
  /** Summary in compact Pagination. */
  pageSummary: (page: number, count: number) => string;
  /** Accessible name of a split button group. */
  actions: string;
  /** Split button menu trigger and empty action placeholder. */
  chooseAction: string;
  /** Accessible name of the hidden avatar count. */
  avatarOverflow: (count: number) => string;
  /** Accessible name of the first range slider thumb. */
  sliderMinimum: string;
  /** Accessible name of the second range slider thumb. */
  sliderMaximum: string;
  /** Label of the audio input level meter. */
  audioLevel: string;
  /** Audio playback button. */
  playAudio: string;
  /** Audio pause button. */
  pauseAudio: string;
  /** Accessible name of the audio seek slider. */
  seekAudio: string;
  /** File picker button when no single file is selected. */
  chooseFile: string;
  /** File picker button in multiple mode. */
  chooseFiles: string;
  /** File picker button when a single file is present. */
  replaceFile: string;
  /** Drop hint for a single file. */
  dropFile: string;
  /** Drop hint for multiple files. */
  dropFiles: string;
  /** Drop hint for replacing a file. */
  dropReplacement: string;
  /** Displayed name of an unnamed remote image. */
  currentImage: string;
  /** Image name used by a remove button when no file name is supplied. */
  currentImageName: string;
  /** Image name used in preview alternative text when no name is supplied. */
  selectedImage: string;
  /** Alternative text of a file image preview. */
  previewImage: (name: string) => string;
  /** Accessible name of the table header selection checkbox. */
  selectAllRows: string;
  /** Accessible name of the toast region. */
  notifications: string;
}

/** Copy that can be overridden on a single file picker. */
export type FileDropzoneLabels = Pick<
  ConfigLabels,
  | 'chooseFile'
  | 'chooseFiles'
  | 'replaceFile'
  | 'dropFile'
  | 'dropFiles'
  | 'dropReplacement'
  | 'currentImage'
  | 'currentImageName'
  | 'selectedImage'
  | 'previewImage'
  | 'remove'
  | 'removeItem'
>;
