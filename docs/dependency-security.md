# Dependency upgrade evidence

The dependency repair keeps the Pages Router, React 18, and Tailwind 3 styling.
Next.js and its lint configuration are pinned to 15.5.27; Jest and its jsdom
environment are pinned to 30.5.2. Compatible transitive patch releases are
recorded in the lockfile, including Mongoose 8.24.5 and form-data 4.0.6.

PostCSS is pinned to 8.5.30 and overridden consistently within its existing
major version. Next 15 otherwise requests PostCSS 8.4.31 exactly. The override
was tested with the production CSS/build pipeline. Tailwind remains 3.4.19.
The lint command invokes ESLint directly rather than deprecated `next lint`.
The Node minimum reflects Next 15's requirement of at least 18.18.0; checks
for this slice ran on Node 24.19.0.

Official compatibility and security references:

- [Next 15: Pages Router on React 18](https://nextjs.org/blog/next-15)
- [August 2026 security release](https://nextjs.org/blog/august-2026-security-release):
  the patched maintenance release was 15.5.24; this upgrade uses 15.5.27.

## Audit results and remaining blocker

At the dependency check, the full npm audit changed from 63 findings
(2 critical, 52 high, 7 moderate, 2 low) to 28 findings
(0 critical, 7 high, 21 moderate). Production-only audit reported zero findings.
These are registry advisory results at check time, not a guarantee that the
application has no vulnerabilities.

The full-tree high-severity gate still fails. All seven high results propagate
from `braces@3.0.3`, whose latest published version has no patched release for
[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
The upstream status is tracked in
[micromatch/braces issue 84](https://github.com/micromatch/braces/issues/84).

Installed paths include:

- `tailwindcss@3.4.19 -> micromatch@4.0.8 -> braces@3.0.3`
- `tailwindcss@3.4.19 -> chokidar@3.6.0 -> braces@3.0.3`
- `tailwindcss@3.4.19 -> fast-glob@3.3.3 -> micromatch@4.0.8 -> braces@3.0.3`
- `eslint-config-next@15.5.27 -> @next/eslint-plugin-next@15.5.27 -> fast-glob@3.3.1 -> micromatch@4.0.8 -> braces@3.0.3`

The repair preserves the existing full audit gate and reports its failure. It
does not rename vulnerable packages, omit development dependencies from that
gate, suppress the advisory, or migrate the styling system to conceal it.

## Scoped verification

The dependency slice was applied to PR 1 source revision
`9ad4f9daa06595aaf17672eca7509de86f3ab521` in an isolated checkout. Clean
`npm ci` succeeded, all 58 existing Jest tests passed under Jest 30, and the
Next 15 production build passed. Lint executed successfully as a command but
reported the existing source formatting/unused-variable errors on that
unchanged source snapshot. The separate source lint and analytics repair must
be combined and checked before publishing an integrated result.
