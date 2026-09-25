import { generateCss } from './css';
import type { YarclShape } from './define';
import { setActiveConfig } from './runtime';

export { generateCss };

const STYLE_ID = 'yarcl-theme';

/** Options for {@link applyTheme}. */
export interface ApplyThemeOptions {
  /** Receives contrast warnings for the theme's colors. */
  onWarning?: (message: string) => void;
}

/**
 * Switches the whole app to another theme at runtime, without a rebuild.
 *
 * Injects the theme's generated CSS (replacing the build-time styles) and makes components read
 * their defaults (`defaults`, `components`, heading levels) from the theme, re-rendering them.
 * The theme must define the keys your app uses; bundled themes share the defaults' keys
 * (`ThemeContract`), so any of them can replace another.
 *
 * @example
 * ```ts
 * import { applyTheme } from '@yarcl/react/css';
 * import { themes } from '@yarcl/react/themes';
 *
 * applyTheme(themes.editorial);
 * ```
 */
export function applyTheme(theme: YarclShape, { onWarning }: ApplyThemeOptions = {}) {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
  }
  document.head.appendChild(style);
  style.textContent = generateCss(theme, onWarning);
  setActiveConfig(theme);
}

/** Removes a theme applied with {@link applyTheme} and returns to the build-time config and styles. */
export function resetTheme() {
  document.getElementById(STYLE_ID)?.remove();
  setActiveConfig(null);
}
