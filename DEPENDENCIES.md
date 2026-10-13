# Dependency verification

Checked 2026-10-13 against PR #2's recorded-analytics implementation.

`postcss-selector-parser` is overridden to the published **7.1.6** release, which fixes [GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf). Both Tailwind's direct parser and `postcss-nested` resolve to that release. This is a real dependency replacement; no audit entries are ignored. The override crosses the transitive 6.x range, so ordinary lint, all tests, the production CSS build and desktop/mobile browser rendering must be checked when changing it.

Validation commands:

```sh
npm ci
npm ls postcss-selector-parser --all
npm run lint
npm test -- --runInBand
npm run build
npm audit --omit=dev
npm audit
```

The production dependency audit reports zero vulnerabilities. The full audit still reports **7 high and 19 moderate** entries after this change (previously 7 high /21 moderate). These are not 26 independent flaws: npm reports affected dependency paths as well as the underlying package advisories.

Remaining roots:

- [braces GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm): affected <=3.0.3, no published patched version. npm registry latest is 3.0.3. Tailwind 3's watch/glob tooling and Next's lint plugin bring this chain in. Latest published Next lint plugin still uses fast-glob, which uses micromatch and braces; merely bumping it does not fix the alert.
- [sprintf-js GHSA-hp3w-g68c-fv3c](https://github.com/advisories/GHSA-hp3w-g68c-fv3c): affected <=1.1.3, no published patched version. npm registry latest is 1.1.3; Jest's coverage tooling brings this chain in.

The full audit gate is therefore still unmet. Keep that result visible rather than treating the production-only result as full dependency clearance. The current app does not pass visitor-provided glob patterns or format strings into these developer tools. This scope observation does not remove the advisories or certify an unpatched toolchain.
