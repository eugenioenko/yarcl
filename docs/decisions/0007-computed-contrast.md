# ADR 0007: Compute foreground and text colors for contrast

- Status: accepted
- Date: 2026-09-23

## Context

Consumers pick brand colors; they shouldn't also have to pick a readable text color for each one, per color scheme. axe audits found mid-tone colors (green, amber, red) failing AA as text on their own tints.

## Decision

For each color, per scheme, `generateCss` derives:

- `--yarcl-color-{k}-on`: the foreground for text on the solid color, black or white by contrast. An `on` override is allowed.
- `--yarcl-color-{k}-text`: the color used as text. It's the color itself if it reaches 4.5:1 against the background, the surface and the tints components use; otherwise it's mixed toward `neutrals.text` in small steps until it does. A `text` override is allowed.

Backgrounds and borders keep the exact brand color. Colored text (variants with `text: 'color'`, `Text`, `Link`, menu items) uses the `-text` shade.

## Consequences

- Brand colors render exactly where they're fills, and readably where they're text.
- Contrast math lives in `color.ts`; warnings go through the plugin and `applyTheme`'s `onWarning`, and never fail the build.
