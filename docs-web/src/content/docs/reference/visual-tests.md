---
title: Visual regression tests
description: Reproducible screenshots, explicit baseline updates and reviewing visual changes in pull requests.
sidebar:
  order: 4
---

The repository compares screenshots of the component demo and the full theme playground for every bundled theme, including the default design system. Each runs in light and dark mode at desktop and mobile widths.

The suite captures complete pages, centered dialogs, the component drawer and the playground's theme editor. The playground keeps its real CSS reset, so dialog placement regressions appear in both an explicit geometry assertion and the screenshot diff.

Every scene also checks for horizontal page overflow. Baseline updates cannot approve a page wider than its viewport.

## Run the comparisons

Run from the repository root with Docker available:

```sh
pnpm test:visual
```

The command builds the library, consumer demo and docs, then runs Playwright in a pinned Linux image. The image, browser version, fonts, viewport, locale, time zone and clock stay consistent. Screenshot capture disables animations and hides blinking carets without changing layout styles.

The demo's **Bundled themes** link opens the complete package showcase. Its URL selects the theme and scheme, for example `?page=themes&theme=bloom&scheme=dark`. The playground uses `/theme-playground/?theme=bloom&scheme=dark`.

Filter a run using Playwright's normal options:

```sh
pnpm test:visual --project=bloom-dark-desktop
pnpm test:visual --grep="dialog"
```

The suite derives its theme list from the package's `themes` export. Adding a bundled theme automatically adds test projects. Missing baselines fail, so the new appearance must be generated and reviewed.

## Review failures

Screenshots in `e2e/visual/baselines/` are the reviewed expectations. Normal runs compare them and never create or update them. A changed layout, missing asset, failed hydration or different image dimensions fails the test.

The local HTML report is `.visual/report/index.html`. Open it with:

```sh
pnpm exec playwright show-report .visual/report
```

For an image mismatch, the report includes the expected image, actual image and pixel diff. Failed tests also retain a browser trace. Inspect the cause before changing the baseline.

## Update baselines explicitly

After confirming an intended visual change, regenerate the affected images in the same pinned image:

```sh
pnpm test:visual:update --project=bloom-dark-desktop
```

Omit the filter to update all projects. Run the comparison command again, inspect the changed PNGs, then commit the images with the implementation. Reviewers can compare the images in the pull request's **Files changed** view.

An update accepts the currently rendered result. It does not replace checking the intended layout, dialogs, wrapping, clipping, focus indicators and both color schemes.

## Pull request checks

The `visual` CI job uses the same Playwright Linux image and runs comparisons with zero changed pixels allowed. It uploads the HTML report, actual images, diffs and traces as the `visual-regressions` artifact. Download it from the workflow run when a comparison fails.

CI does not update baselines. To approve a change, regenerate locally with the explicit update command and push the reviewed PNGs. A normal run with a missing baseline fails instead of silently accepting it.

When upgrading Playwright, update the pinned dependency, image in `test-utils/visual-test.mjs` and image in `.github/workflows/ci.yml` together. Regenerate and review baselines as part of that pull request because the browser or rendering environment may change.

The screenshot suite complements the existing browser tests, type contracts and accessibility audits. Run the regular checks as well:

```sh
pnpm typecheck
pnpm lint
pnpm build
pnpm size
pnpm test
pnpm docs:build
```
