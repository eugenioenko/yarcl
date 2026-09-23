# yarcl docs

Documentation site for yarcl, built with Astro and Starlight. The site is itself a yarcl consumer: `src/yarcl.config.ts` is its design system, and every component page renders live examples as React islands.

```sh
pnpm dev       # regenerates the API JSON, then starts Astro on :4321
pnpm build     # static site in dist/
```

| Path | What |
|---|---|
| `src/content/docs/` | pages: getting started, configuration guides, components, reference |
| `src/demos/` | live examples used by the pages, one module per component group |
| `src/components/Props.astro` | props tables generated from the library's JSDoc (TypeDoc JSON) |
| `src/components/Preview.astro` | the frame around live examples |
| `src/demos/playground.tsx` | the config playground on the landing page |

`pnpm api` writes `src/generated/api.json` for the props tables and the full TypeDoc HTML to `public/api/`. Both are generated and gitignored.
