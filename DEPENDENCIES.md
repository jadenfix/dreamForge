# Dependency verification

Checked 2026-10-13 against PR #2's recorded-analytics implementation. The prior full dependency audit had 7 high and 19 moderate findings; the migrated complete production and development tree has **zero findings**. No audit exclusions, severity filters above low, or ignored advisories are used.

Changes remove the actual vulnerable implementations:

- Tailwind 4.3.3 and its maintained PostCSS compiler replace Tailwind 3's chokidar/micromatch/braces chain. The existing JavaScript theme is loaded explicitly, class-based dark mode and the previous border default are retained. Both desktop/mobile routes and analytics controls are checked against the actual compiled CSS.
- ESLint 10.12.0 uses its official compatibility adapter with maintained React/Hooks/A11y/import and stylistic plugins. All 123 existing effective lint rule settings remain, including all 21 Next framework rules. The transparent local MIT Next lint fork changes only root discovery from fast-glob to native Node glob; see `tooling/next-eslint/README.md`. This fork has ongoing project maintenance responsibility.
- Jest 30.5.2 and all 68 existing tests remain. A scoped `@istanbuljs/load-nyc-config` override selects the published js-yaml 4.3.2 patch, removing its js-yaml 3 → argparse 1 → vulnerable sprintf-js chain. The loader already uses the supported `load` API. Real YAML versus JSON loader fixtures and actual coverage execution check compatibility across that transitive major update.
- Published PostCSS 8.5.30 and selector-parser 7.1.6 patches remain enforced.

Reproduce on Node 22.17+ or 24:

```sh
npm ci
npm run lint
npm test -- --runInBand
npm run test:tooling
npm test -- --runInBand --coverage
npm run build
npx playwright install chromium
npm run test:browser
npm audit --audit-level=low
```

The browser proof uses real local HTTP responses, not routed API mocks. It checks both routes at 1440/390 pixels, theme CSS, overflow, timeframe requests, exported JSON provenance, search and record details. Analytics without configured MongoDB are explicitly labelled sample/fallback data; this validates that lane and does not claim a hosted vision-provider or database session occurred.
